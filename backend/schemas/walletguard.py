"""WalletGuard ATO intelligence, alert queue, and timeline schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class TimelineEvent(BaseModel):
    timestamp: str
    time_label: str
    title: str
    description: str
    severity: str
    event_type: str


class WalletGuardAlertItem(BaseModel):
    id: uuid.UUID
    code: str
    created_at: datetime
    last_event_at: datetime | None = None
    first_event_at: datetime | None = None
    customer_code: str
    customer_name: str
    wallet_code: str
    transaction_code: str | None = None
    risk_score: float
    risk_level: str
    primary_signal: str | None
    title: str
    summary: str | None = None
    status: str
    event_count: int


class WalletGuardAlertDetail(BaseModel):
    id: uuid.UUID
    code: str
    created_at: datetime
    customer_id: uuid.UUID
    customer_code: str
    customer_name: str
    wallet_code: str
    risk_score: float
    risk_level: str
    status: str
    title: str
    summary: str
    primary_signal: str | None
    
    # Associated transaction
    transaction_id: uuid.UUID
    transaction_code: str
    amount: float
    currency: str
    
    # Timeline
    timeline: list[TimelineEvent]
    
    # Contributing Signals
    signals: list[dict[str, Any]]
    
    assigned_to: str | None = None
    dismissal_reason: str | None = None


class WalletGuardOverviewResponse(BaseModel):
    protected_wallets_count: int
    ato_alerts_count: int
    high_risk_sessions_count: int
    new_device_events_count: int
    risk_trend: list[dict[str, Any]]
    recent_alerts: list[WalletGuardAlertItem]
    device_anomalies: list[dict[str, Any]]
    high_risk_wallets: list[dict[str, Any]]
