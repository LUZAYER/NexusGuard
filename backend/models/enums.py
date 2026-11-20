"""Shared enumerations (stored as plain strings; validated at the schema layer)."""
from __future__ import annotations

from enum import StrEnum


class RiskLevel(StrEnum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class Severity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SignalCategory(StrEnum):
    TRANSACTION = "transaction"
    BEHAVIOR = "behavior"
    WALLETGUARD = "walletguard"
    NETWORK = "network"
    MODEL = "model"


class AlertStatus(StrEnum):
    NEW = "new"
    ACKNOWLEDGED = "acknowledged"
    INVESTIGATING = "investigating"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class AlertType(StrEnum):
    TRANSACTION = "transaction"
    WALLETGUARD = "walletguard"


class CaseStatus(StrEnum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class CasePriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TransactionStatus(StrEnum):
    COMPLETED = "completed"
    FLAGGED = "flagged"
    UNDER_REVIEW = "under_review"
    CLEARED = "cleared"


class WalletType(StrEnum):
    CUSTOMER = "customer"
    MERCHANT = "merchant"
    AGENT = "agent"
    BILLER = "biller"


class TxnType(StrEnum):
    WALLET_TRANSFER = "wallet_transfer"
    MERCHANT_PAYMENT = "merchant_payment"
    CASH_OUT = "cash_out"
    CASH_IN = "cash_in"
    MOBILE_RECHARGE = "mobile_recharge"
    BILL_PAYMENT = "bill_payment"


class NodeType(StrEnum):
    CUSTOMER = "customer"
    WALLET = "wallet"
    DEVICE = "device"
    MERCHANT = "merchant"
    AGENT = "agent"


class EdgeType(StrEnum):
    SENT_TO = "sent_to"
    RECEIVED_FROM = "received_from"
    USED_DEVICE = "used_device"
    ACCESSED_FROM = "accessed_from"
    PAID_MERCHANT = "paid_merchant"
    ASSOCIATED_WITH = "associated_with"


class AIReportStatus(StrEnum):
    COMPLETED = "completed"
    UNAVAILABLE = "unavailable"
    REJECTED = "rejected"


class Role(StrEnum):
    FRAUD_ANALYST = "fraud_analyst"
    SECURITY_ANALYST = "security_analyst"
    OPS_MANAGER = "ops_manager"
    ADMIN = "admin"
