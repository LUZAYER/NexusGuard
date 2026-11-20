"""ORM models. Importing this package registers every table on Base.metadata."""
from backend.models.base import Base
from backend.models.entities import (
    Customer,
    CustomerBehaviorProfile,
    Device,
    Location,
    Merchant,
    Session,
    Transaction,
    Wallet,
)
from backend.models.identity import Permission, RoleModel, User, role_permissions
from backend.models.risk import (
    Evidence,
    ModelPrediction,
    ModelVersion,
    RiskScore,
    RiskSignal,
)
from backend.models.system import (
    AuditLog,
    NetworkEdge,
    NetworkNode,
    SystemConfig,
    SystemEvent,
)
from backend.models.workflow import (
    AIReport,
    Alert,
    Case,
    CaseNote,
    InvestigationReport,
    alert_transactions,
)

__all__ = [name for name in dir() if not name.startswith('_')]
