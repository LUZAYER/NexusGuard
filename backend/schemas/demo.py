"""Demo scenarios runner schemas."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class DemoScenarioDetail(BaseModel):
    id: str
    label: str
    title: str
    description: str
    category: str
    customer_code: str
    customer_name: str
    transaction_code: str | None = None
    wallet_code: str
    device_code: str | None = None
    expected_signals: list[str]
    expected_risk_band: str
    key_findings: list[str]


class TriggerDemoRequest(BaseModel):
    scenario_id: str


class TriggerDemoResponse(BaseModel):
    scenario_id: str
    label: str
    title: str
    transaction_code: str
    customer_code: str
    wallet_code: str
    amount: float
    risk_score: float
    risk_level: str
    action_recommended: str
    corroboration_count: int
    engine_scores: dict[str, float]
    evidence_cards: list[dict[str, Any]]
    alert_code: str | None = None
