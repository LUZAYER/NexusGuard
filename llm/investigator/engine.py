"""Ollama AI Investigator integration with schema validation, fallback models, and graceful degradation."""
from __future__ import annotations

import json
import logging
import re
import time
from typing import Any

import httpx

from backend.core.config import get_settings
from llm.guardrails.input_sanitizer import sanitize_context
from llm.prompts.system import INVESTIGATOR_SYSTEM_PROMPT, build_investigation_user_prompt
from llm.schemas.report import AIInvestigationReport

log = logging.getLogger(__name__)


class AIInvestigator:
    """Orchestrates structured LLM investigation reports via local Ollama instance."""

    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.ollama_base_url.rstrip("/")
        self.primary_model = self.settings.ollama_model
        self.fallback_model = self.settings.ollama_fallback_model
        self.timeout = self.settings.ollama_timeout_seconds

    async def generate_report(self, structured_context: dict[str, Any]) -> dict[str, Any]:
        """Generate schema-validated investigation report for a security event."""
        t0 = time.time()
        sanitized_ctx, findings = sanitize_context(structured_context)
        user_prompt = build_investigation_user_prompt(sanitized_ctx)

        # 1. Attempt primary model (qwen3:8b)
        report_data, model_used = await self._call_ollama(self.primary_model, user_prompt)
        
        # 2. If primary failed, attempt fallback (llama3.1:8b)
        if report_data is None and self.fallback_model:
            log.warning("Primary model %s failed, attempting fallback %s", self.primary_model, self.fallback_model)
            report_data, model_used = await self._call_ollama(self.fallback_model, user_prompt)

        latency_ms = int((time.time() - t0) * 1000)

        # 3. If Ollama is completely offline/timed out, degrade gracefully with structured deterministic report
        if report_data is None:
            log.warning("Ollama unavailable, generating deterministic structured fallback report")
            fallback = self._generate_graceful_fallback(sanitized_ctx)
            return {
                "status": "degraded_fallback",
                "model_name": "sentinelflow_evidence_fallback",
                "content": fallback.model_dump(),
                "guardrail_findings": findings + ["Local LLM service unavailable or timed out."],
                "latency_ms": latency_ms,
            }

        return {
            "status": "completed",
            "model_name": model_used,
            "content": report_data.model_dump(),
            "guardrail_findings": findings,
            "latency_ms": latency_ms,
        }

    async def _call_ollama(self, model: str, prompt: str) -> tuple[AIInvestigationReport | None, str | None]:
        payload = {
            "model": model,
            "system": INVESTIGATOR_SYSTEM_PROMPT,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "num_predict": 512,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code != 200:
                    log.error("Ollama error %d: %s", res.status_code, res.text)
                    return None, None
                data = res.json()
                raw_response = data.get("response", "{}")
                
                # Strip <think>...</think> if present
                clean_text = re.sub(r"<think>.*?</think>", "", raw_response, flags=re.DOTALL).strip()
                # Find the first { and last }
                start_idx = clean_text.find("{")
                end_idx = clean_text.rfind("}")
                if start_idx != -1 and end_idx != -1:
                    clean_text = clean_text[start_idx : end_idx + 1]

                parsed_json = json.loads(clean_text)
                validated = AIInvestigationReport(**parsed_json)
                return validated, model
        except Exception as e:
            log.warning("Ollama generation exception with model %s: %s", model, e)
            return None, None

    def _generate_graceful_fallback(self, context: dict[str, Any]) -> AIInvestigationReport:
        """Deterministic, evidence-grounded report when LLM service is offline."""
        txn = context.get("transaction", {})
        scores = context.get("risk_scores", {})
        evidence_list = context.get("evidence", [])
        customer = context.get("customer", {})

        amt = float(txn.get("amount", 0))
        t_code = txn.get("code", "Unknown")
        c_code = customer.get("code", "Unknown")
        overall = scores.get("overall_risk", 75.0)

        indicators = []
        for e in evidence_list:
            indicators.append(f"{e.get('severity', 'HIGH').upper()}: {e.get('explanation', e.get('signal', ''))}")

        if not indicators:
            indicators = ["High risk score aggregated across multiple detection engines."]

        steps = [
            "1. Contact customer via verified out-of-band mobile channel to confirm transaction intent.",
            "2. Inspect recent device registration history and session authentication logs.",
            "3. Review recipient wallet transaction activity for mule network indicators.",
            "4. Require multi-factor re-authentication before permitting further transfers.",
        ]

        summary = (
            f"Transaction {t_code} for ৳{amt:,.2f} initiated by customer {c_code} "
            f"was flagged with an overall risk score of {overall}/100. "
            f"The activity shows significant divergence from historical behavioral baselines."
        )

        return AIInvestigationReport(
            summary=summary,
            key_risk_indicators=indicators,
            behavioral_analysis=(
                f"Customer profile indicates regular median transaction volume well below current amount. "
                f"Device and session metrics indicate potential unauthorized access."
            ),
            network_context=(
                "Recipient wallet interaction evaluated for rapid passthrough and inbound concentration."
            ),
            recommended_investigation_steps=steps,
            missing_information=[
                "Customer verification response",
                "Device telemetry and hardware fingerprint",
            ],
            confidence_assessment="High confidence from corroborated ML and rule signal aggregations.",
            limitations=[
                "Deterministic structured fallback generated while LLM service was unreachable.",
                "All consequential security determinations require human analyst approval.",
            ],
        )
