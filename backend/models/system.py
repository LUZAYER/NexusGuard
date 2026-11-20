"""Network intelligence graph and platform audit/system tables."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from backend.models.base import Base, timestamp, uuid_pk


class NetworkNode(Base):
    __tablename__ = "network_nodes"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(32), index=True)
    node_type: Mapped[str] = mapped_column(String(16), index=True)
    label: Mapped[str] = mapped_column(String(128))
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    metrics: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    computed_at: Mapped[datetime] = timestamp()

    __table_args__ = (UniqueConstraint("code", "node_type", name="uq_network_nodes_code_type"),)


class NetworkEdge(Base):
    __tablename__ = "network_edges"

    id: Mapped[uuid.UUID] = uuid_pk()
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("network_nodes.id"), index=True)
    target_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("network_nodes.id"), index=True)
    edge_type: Mapped[str] = mapped_column(String(24), index=True)
    weight: Mapped[int] = mapped_column(Integer, default=1)
    amount_total: Mapped[float] = mapped_column(Float, default=0.0)
    first_seen_at: Mapped[datetime | None] = timestamp(default_now=False, nullable=True)
    last_seen_at: Mapped[datetime | None] = timestamp(default_now=False, nullable=True)

    __table_args__ = (
        UniqueConstraint("source_id", "target_id", "edge_type", name="uq_network_edges_triple"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = uuid_pk()
    occurred_at: Mapped[datetime] = timestamp()
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    actor_email: Mapped[str] = mapped_column(String(255), default="system")
    action: Mapped[str] = mapped_column(String(64), index=True)
    resource_type: Mapped[str] = mapped_column(String(48), index=True)
    resource_id: Mapped[str] = mapped_column(String(64), default="")
    audit_metadata: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    session_ref: Mapped[str | None] = mapped_column(String(64), nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(32), nullable=True)

    __table_args__ = (
        Index("ix_audit_logs_time", "occurred_at"),
        Index("ix_audit_logs_resource", "resource_type", "resource_id"),
    )


class SystemEvent(Base):
    __tablename__ = "system_events"

    id: Mapped[uuid.UUID] = uuid_pk()
    occurred_at: Mapped[datetime] = timestamp()
    level: Mapped[str] = mapped_column(String(12))
    component: Mapped[str] = mapped_column(String(48), index=True)
    message: Mapped[str] = mapped_column(Text)
    details: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)


class SystemConfig(Base):
    """Versioned runtime overrides of config/risk.yaml, edited by administrators."""

    __tablename__ = "system_config"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[dict[str, Any]] = mapped_column(JSONB)
    version: Mapped[int] = mapped_column(Integer, default=1)
    updated_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    updated_at: Mapped[datetime] = timestamp()
