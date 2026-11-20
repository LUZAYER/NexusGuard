"""Dashboard KPI and summary analytics schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class MetricKPI(BaseModel):
    title: str
    value: str | int | float
    change_pct: float | None = None
    trend: str = "up"
    status: str = "neutral"


class RiskDistribution(BaseModel):
    low: int
    moderate: int
    high: int
    critical: int


class RiskActivityPoint(BaseModel):
    timestamp: str
    normal_count: int
    high_risk_count: int
    ato_count: int


class RecentHighRiskEvent(BaseModel):
    time: str
    transaction_code: str
    customer_code: str
    customer_name: str
    amount: float
    risk_score: float
    risk_level: str
    primary_signal: str
    status: str


class DashboardSummaryResponse(BaseModel):
    kpis: list[MetricKPI]
    risk_distribution: RiskDistribution
    risk_activity_trend: list[RiskActivityPoint]
    recent_events: list[RecentHighRiskEvent]
    walletguard_metrics: dict[str, Any]
    investigation_queue_summary: dict[str, Any]
