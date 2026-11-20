"""System and Health check schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class HealthCheckResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    database: dict[str, Any]
    ml_models: dict[str, Any]
    llm_service: dict[str, Any]


class SystemStatsResponse(BaseModel):
    total_transactions: int
    total_wallets: int
    total_customers: int
    total_devices: int
    total_alerts: int
    total_cases: int
    graph_nodes: int
    graph_edges: int
    db_size_mb: float


class UpdateConfigResponse(BaseModel):
    key: str
    version: int
    updated_at: datetime
    value: dict[str, Any]
