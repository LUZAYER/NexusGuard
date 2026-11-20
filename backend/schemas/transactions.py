"""Transaction listing, detail, evidence, and risk breakdown schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class TransactionListItem(BaseModel):
    id: uuid.UUID
    code: str
    occurred_at: datetime
    customer_code: str
    customer_name: str
    wallet_code: str
    recipient_wallet_code: str
    amount: float
    currency: str
    txn_type: str
    risk_score: float | None = None
    risk_level: str | None = "low"
    primary_signal: str | None = None
    status: str


class EvidenceItem(BaseModel):
    id: uuid.UUID
    code: str
    signal: str
    category: str
    severity: str
    source: str
    value: str | None = None
    baseline: str | None = None
    explanation: str
    confidence: float
    rank: int
    details: dict[str, Any] = {}


class RiskBreakdownItem(BaseModel):
    name: str
    key: str
    score: float
    weight: float
    risk_level: str
    signals: list[str] = []


class BehaviorMetricComparison(BaseModel):
    label: str
    historical_baseline: str
    current_value: str
    deviation: str
    is_anomalous: bool


class TransactionDetailResponse(BaseModel):
    id: uuid.UUID
    code: str
    occurred_at: datetime
    amount: float
    currency: str
    txn_type: str
    status: str
    
    # Parties
    customer_id: uuid.UUID
    customer_code: str
    customer_name: str
    customer_persona: str
    wallet_id: uuid.UUID | None = None
    wallet_code: str
    recipient_wallet_id: uuid.UUID | None = None
    recipient_wallet_code: str
    recipient_name: str | None = None
    
    # Device & Location
    device_code: str
    device_platform: str
    device_model: str
    device_is_new: bool
    location_name: str
    location_division: str
    location_is_new: bool
    
    # Risk Assessment
    overall_risk: float
    risk_level: str
    confidence: float
    primary_signal: str | None
    
    # Sub-Engine Scores
    transaction_risk: float
    behavior_risk: float
    ato_risk: float
    network_risk: float | None
    
    breakdown: list[RiskBreakdownItem]
    evidence: list[EvidenceItem]
    behavior_comparisons: list[BehaviorMetricComparison]
    
    # Ground truth (labeled demo scenarios only)
    is_demo_scenario: bool = False
    scenario_type: str | None = None
