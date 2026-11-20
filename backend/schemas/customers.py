"""Customer Risk Profile & Intelligence schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class KnownDeviceItem(BaseModel):
    code: str
    platform: str
    model: str
    trust_status: str
    first_seen: str
    associated_wallets_count: int


class CustomerIntelligenceResponse(BaseModel):
    id: uuid.UUID
    code: str
    display_name: str
    persona: str
    kyc_level: str
    home_location: str
    opened_at: datetime
    
    # Risk Metrics
    overall_risk: float
    risk_level: str
    behavioral_stability_pct: int
    
    # Baselines
    normal_median_amount: float
    normal_p95_amount: float
    normal_hours: list[str]
    normal_frequency: float
    normal_daily_volume: float
    
    # Associated Entities
    wallets: list[dict[str, Any]]
    known_devices: list[KnownDeviceItem]
    known_locations: list[str]
    recent_alerts_count: int
    
    recent_transactions: list[dict[str, Any]]


class CustomerListItem(BaseModel):
    id: uuid.UUID
    code: str
    display_name: str
    persona: str
    kyc_level: str
    home_location: str
    opened_at: datetime
    wallet_code: str | None = None
    wallet_type: str | None = None
    wallet_status: str | None = None
    risk_score: float = 10.0
    risk_level: str = "low"
    recent_alerts_count: int = 0


class CustomerListResponse(BaseModel):
    items: list[CustomerListItem]
    total: int
    page: int
    page_size: int
    total_pages: int

