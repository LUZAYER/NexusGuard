"""Core financial-domain entities: customers, wallets, devices, sessions, transactions."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    Boolean,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.models.base import Base, timestamp, uuid_pk


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(64))
    division: Mapped[str] = mapped_column(String(64))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(96))
    persona: Mapped[str] = mapped_column(String(32), index=True)
    kyc_level: Mapped[str] = mapped_column(String(16), default="standard")
    home_location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("locations.id"))
    opened_at: Mapped[datetime] = timestamp(default_now=False)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=True)

    home_location: Mapped[Location] = relationship(lazy="joined")
    wallets: Mapped[list["Wallet"]] = relationship(back_populates="customer")


class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), index=True)
    wallet_type: Mapped[str] = mapped_column(String(16), index=True, default="customer")
    status: Mapped[str] = mapped_column(String(16), default="active")
    opened_at: Mapped[datetime] = timestamp(default_now=False)

    customer: Mapped[Customer] = relationship(back_populates="wallets", lazy="joined")


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    category: Mapped[str] = mapped_column(String(48))
    wallet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wallets.id"), unique=True)

    wallet: Mapped[Wallet] = relationship(lazy="joined")


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    platform: Mapped[str] = mapped_column(String(24))
    model_label: Mapped[str] = mapped_column(String(64))
    first_seen_at: Mapped[datetime] = timestamp(default_now=False)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = uuid_pk()
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"))
    wallet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wallets.id"))
    device_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("devices.id"), index=True)
    location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("locations.id"))
    started_at: Mapped[datetime] = timestamp(default_now=False)
    duration_seconds: Mapped[int] = mapped_column(Integer)
    auth_method: Mapped[str] = mapped_column(String(16), default="pin")
    failed_attempts: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        Index("ix_sessions_customer_started", "customer_id", "started_at"),
        Index("ix_sessions_wallet_started", "wallet_id", "started_at"),
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    occurred_at: Mapped[datetime] = timestamp(default_now=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"))
    wallet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wallets.id"))
    recipient_wallet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wallets.id"))
    merchant_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("merchants.id"), nullable=True)
    device_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("devices.id"))
    location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("locations.id"))
    session_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sessions.id"), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    currency: Mapped[str] = mapped_column(String(3), default="BDT")
    txn_type: Mapped[str] = mapped_column(String(24), index=True)
    status: Mapped[str] = mapped_column(String(16), default="completed", index=True)
    # Evaluation-only ground truth for injected synthetic scenarios. Never a model feature.
    ground_truth: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    customer: Mapped[Customer] = relationship(lazy="raise")
    wallet: Mapped[Wallet] = relationship(foreign_keys=[wallet_id], lazy="raise")
    recipient_wallet: Mapped[Wallet] = relationship(foreign_keys=[recipient_wallet_id], lazy="raise")
    device: Mapped[Device] = relationship(lazy="raise")
    location: Mapped[Location] = relationship(lazy="raise")

    __table_args__ = (
        Index("ix_transactions_occurred_at", "occurred_at"),
        Index("ix_transactions_wallet_time", "wallet_id", "occurred_at"),
        Index("ix_transactions_customer_time", "customer_id", "occurred_at"),
        Index("ix_transactions_recipient_time", "recipient_wallet_id", "occurred_at"),
        Index("ix_transactions_device", "device_id"),
        Index("ix_transactions_amount", "amount"),
    )


class CustomerBehaviorProfile(Base):
    __tablename__ = "customer_behavior_profiles"

    id: Mapped[uuid.UUID] = uuid_pk()
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), unique=True)
    profile: Mapped[dict[str, Any]] = mapped_column(JSONB)
    behavioral_confidence: Mapped[float] = mapped_column(Float)
    transaction_count: Mapped[int] = mapped_column(Integer, default=0)
    as_of: Mapped[datetime] = timestamp(default_now=False)
    computed_at: Mapped[datetime] = timestamp()
