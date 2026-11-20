"""Prompt injection defense and input sanitization guardrails."""
from __future__ import annotations

import re
from typing import Any

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"system\s+prompt", re.IGNORECASE),
    re.compile(r"you\s+are\s+now", re.IGNORECASE),
    re.compile(r"execute\s+command", re.IGNORECASE),
    re.compile(r"freeze\s+wallet", re.IGNORECASE),
    re.compile(r"approve\s+transaction", re.IGNORECASE),
    re.compile(r"sql\s+injection", re.IGNORECASE),
    re.compile(r"<script", re.IGNORECASE),
]


def sanitize_context(context: dict[str, Any], max_bytes: int = 65_536) -> tuple[dict[str, Any], list[str]]:
    """Inspect and sanitize structured context before passing to LLM.
    
    Returns:
    - sanitized_context: clean dict
    - findings: list of detected suspicious patterns / defense events
    """
    findings: list[str] = []

    def _clean_value(val: Any) -> Any:
        if isinstance(val, str):
            for pat in INJECTION_PATTERNS:
                if pat.search(val):
                    findings.append(f"Prompt injection pattern detected and neutralized: '{pat.pattern}'")
                    return "[FILTERED_SUSPICIOUS_INPUT]"
            return val
        elif isinstance(val, dict):
            return {k: _clean_value(v) for k, v in val.items()}
        elif isinstance(val, list):
            return [_clean_value(v) for v in val]
        return val

    sanitized = _clean_value(context)
    return sanitized, findings
