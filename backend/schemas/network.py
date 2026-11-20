"""Network Graph schemas."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    code: str | None = None
    label: str
    type: str  # customer, wallet, device, merchant, agent
    risk_score: float = 0.0
    metrics: dict[str, Any] = {}
    x: float | None = None
    y: float | None = None


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # sent_to, used_device, etc.
    weight: int = 1
    amount: float = 0.0
    amount_total: float = 0.0


class NetworkGraphResponse(BaseModel):
    center_entity: str
    depth: int
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    mule_cluster_detected: bool = False
    indicators: list[str] = []
