"""Role-based access control definitions (single source of truth for seeding and enforcement)."""
from __future__ import annotations

from backend.models.enums import Role

PERMISSIONS: dict[str, str] = {
    "dashboard:read": "View risk operations overview",
    "transactions:read": "Inspect transactions and their evidence",
    "transactions:analyze": "Re-run the risk pipeline for a transaction",
    "alerts:read": "View alerts",
    "alerts:write": "Assign, acknowledge, escalate, resolve or dismiss alerts",
    "cases:read": "View investigation cases",
    "cases:write": "Create and update cases and add notes",
    "customers:read": "View customer intelligence and behavioural profiles",
    "wallets:read": "View wallet risk",
    "walletguard:read": "View WalletGuard alerts and account-security analytics",
    "devices:read": "View device intelligence",
    "network:read": "Inspect the network intelligence graph",
    "investigations:ai": "Generate AI investigation reports",
    "reports:read": "View investigation reports",
    "reports:generate": "Generate and export investigation reports",
    "models:read": "View model performance and versions",
    "config:read": "View risk configuration",
    "config:write": "Change risk thresholds and model weights",
    "users:manage": "Manage users and roles",
    "audit:read": "Inspect audit logs",
    "system:read": "View system health",
    "demo:read": "Use controlled demo scenarios",
}

_ANALYST_BASE = {
    "dashboard:read", "transactions:read", "alerts:read", "alerts:write", "cases:read", "cases:write",
    "customers:read", "wallets:read", "walletguard:read", "devices:read", "network:read",
    "investigations:ai", "reports:read", "reports:generate", "models:read", "demo:read",
}

ROLE_DEFINITIONS: dict[str, dict] = {
    Role.FRAUD_ANALYST: {
        "display_name": "Fraud Analyst",
        "description": "Inspect alerts, investigate transactions, wallets and networks, add notes.",
        "permissions": _ANALYST_BASE | {"transactions:analyze"},
    },
    Role.SECURITY_ANALYST: {
        "display_name": "Security Analyst",
        "description": "WalletGuard alerts, device and session analysis, account takeover patterns.",
        "permissions": _ANALYST_BASE | {"transactions:analyze", "system:read"},
    },
    Role.OPS_MANAGER: {
        "display_name": "Operations Manager",
        "description": "Risk overview, alert volume, investigation status and operational KPIs.",
        "permissions": {
            "dashboard:read", "transactions:read", "alerts:read", "cases:read", "walletguard:read",
            "reports:read", "models:read", "system:read", "demo:read",
        },
    },
    Role.ADMIN: {
        "display_name": "Administrator",
        "description": "Users, thresholds, model weights, audit logs and system configuration.",
        "permissions": set(PERMISSIONS),
    },
}

SEED_USERS = [
    ("reyazul.islam@sentinelflow.demo", "Reyazul Islam", Role.ADMIN),
    ("sadia.jannat@sentinelflow.demo", "Sadia Jannat", Role.FRAUD_ANALYST),
    ("rafi.mahmud@sentinelflow.demo", "Rafi Mahmud", Role.FRAUD_ANALYST),
    ("security@sentinelflow.demo", "Imran Chowdhury", Role.SECURITY_ANALYST),
    ("manager@sentinelflow.demo", "Farzana Karim", Role.OPS_MANAGER),
    ("admin@sentinelflow.demo", "Tariq Hossain", Role.ADMIN),
]
