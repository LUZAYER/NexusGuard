"""Risk scoring, structured evidence, and model-governance tables."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, Float, ForeignKey, Index, Integer, Sequence, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from backend.models.base import Base, timestamp, uuid_pk

evidence_code_seq = Sequence("evidence_code_seq", start=1, metadata=Base.metadata)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(64), index=True)
    version: Mapped[str] = mapped_column(String(24))
    feature_version: Mapped[str] = mapped_column(String(24))
    algorithm: Mapped[str] = mapped_column(String(64))
    trained_at: Mapped[datetime] = timestamp()
    metrics: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    params: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    artifact_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    benchmark_label: Mapped[str] = mapped_column(String(64), default="Synthetic benchmark")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (Index("ix_model_versions_name_version", "name", "version", unique=True),)


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[uuid.UUID] = uuid_pk()
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), unique=True)
    transaction_risk: Mapped[float] = mapped_column(Float)
    behavior_risk: Mapped[float] = mapped_column(Float)
    ato_risk: Mapped[float] = mapped_column(Float)
    network_risk: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_risk: Mapped[float] = mapped_column(Float, index=True)
    risk_level: Mapped[str] = mapped_column(String(12), index=True)
    confidence: Mapped[float] = mapped_column(Float)
    primary_signal: Mapped[str | None] = mapped_column(String(64), nullable=True)
    engines_available: Mapped[list[str]] = mapped_column(JSONB, default=list)
    config_version: Mapped[str] = mapped_column(String(24))
    feature_version: Mapped[str] = mapped_column(String(24))
    scored_at: Mapped[datetime] = timestamp()

    __table_args__ = (Index("ix_risk_scores_ato", "ato_risk"),)


class RiskSignal(Base):
    """A raw detection emitted by a rule or model engine (feeds scoring and evidence)."""

    __tablename__ = "risk_signals"

    id: Mapped[uuid.UUID] = uuid_pk()
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), index=True)
    signal: Mapped[str] = mapped_column(String(64), index=True)
    category: Mapped[str] = mapped_column(String(24))
    severity: Mapped[str] = mapped_column(String(12))
    source: Mapped[str] = mapped_column(String(64))
    points: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = timestamp()


class Evidence(Base):
    """Structured evidence. One schema powers UI, reports, LLM context, audit and API."""

    __tablename__ = "evidence"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), index=True)
    signal: Mapped[str] = mapped_column(String(64))
    category: Mapped[str] = mapped_column(String(24))
    severity: Mapped[str] = mapped_column(String(12))
    source: Mapped[str] = mapped_column(String(64))
    value: Mapped[str | None] = mapped_column(String(128), nullable=True)
    baseline: Mapped[str | None] = mapped_column(String(128), nullable=True)
    explanation: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float)
    rank: Mapped[int] = mapped_column(Integer, default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = timestamp()


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id: Mapped[uuid.UUID] = uuid_pk()
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), index=True)
    model_version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("model_versions.id"), nullable=True
    )
    model_name: Mapped[str] = mapped_column(String(64))
    model_version: Mapped[str] = mapped_column(String(24))
    feature_version: Mapped[str] = mapped_column(String(24))
    prediction: Mapped[float] = mapped_column(Float)
    confidence: Mapped[float] = mapped_column(Float)
    details: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = timestamp()
