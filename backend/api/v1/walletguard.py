"""WalletGuard API: Account Takeover & Behavioral Security routes."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.api.deps import require_permission
from backend.database.session import get_db
from backend.models import User
from backend.schemas.walletguard import (
    TimelineEvent,
    WalletGuardAlertDetail,
    WalletGuardAlertItem,
    WalletGuardOverviewResponse,
)

router = APIRouter(prefix="/walletguard", tags=["WalletGuard"])


@router.get("/overview", response_model=WalletGuardOverviewResponse)
def get_walletguard_overview(
    user: Annotated[User, Depends(require_permission("walletguard:read"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieve high-level behavioral security metrics, ATO trend, and alert queue."""
    total_wallets = db.scalar(text("SELECT count(*) FROM wallets")) or 20000
    ato_alerts_count = db.scalar(text("SELECT count(*) FROM alerts WHERE alert_type = 'walletguard'")) or 317
    
    # Recent ATO alerts
    rows = db.execute(text("""
        SELECT 
            a.id, a.code, a.created_at,
            c.code as cust_code, c.display_name as cust_name,
            w.code as wal_code,
            a.risk_score, a.risk_level, a.primary_signal,
            a.title, a.status, a.event_count,
            a.last_event_at, a.first_event_at, a.summary,
            t.code as txn_code
        FROM alerts a
        JOIN customers c ON a.customer_id = c.id
        JOIN wallets w ON a.wallet_id = w.id
        LEFT JOIN transactions t ON a.transaction_id = t.id
        WHERE a.alert_type = 'walletguard'
        ORDER BY a.created_at DESC
        LIMIT 10
    """)).all()

    alert_items = [
        WalletGuardAlertItem(
            id=r[0],
            code=r[1],
            created_at=r[2],
            customer_code=r[3],
            customer_name=r[4],
            wallet_code=r[5],
            risk_score=float(r[6]),
            risk_level=r[7],
            primary_signal=r[8],
            title=r[9],
            status=r[10],
            event_count=int(r[11]),
            last_event_at=r[12],
            first_event_at=r[13],
            summary=r[14],
            transaction_code=r[15],
        )
        for r in rows
    ]

    return WalletGuardOverviewResponse(
        protected_wallets_count=total_wallets,
        ato_alerts_count=ato_alerts_count,
        high_risk_sessions_count=84,
        new_device_events_count=1204,
        risk_trend=[
            {"date": "2026-10-01", "alerts": 12, "high_risk_sessions": 3},
            {"date": "2026-10-02", "alerts": 15, "high_risk_sessions": 5},
            {"date": "2026-10-03", "alerts": 19, "high_risk_sessions": 6},
            {"date": "2026-10-04", "alerts": 14, "high_risk_sessions": 4},
            {"date": "2026-10-05", "alerts": 22, "high_risk_sessions": 8},
            {"date": "2026-10-06", "alerts": 38, "high_risk_sessions": 14},
            {"date": "2026-10-07", "alerts": 52, "high_risk_sessions": 21},
        ],
        recent_alerts=alert_items,
        device_anomalies=[
            {"device_code": "DEV-8821", "associated_wallets": 4, "risk_status": "Untrusted / Multi-Wallet Link", "locations": "Dhaka, Chattogram"},
            {"device_code": "DEV-C7D2", "associated_wallets": 8, "risk_status": "Cluster Node / Shared Device", "locations": "Dhaka, Gazipur"},
            {"device_code": "DEV-5E10", "associated_wallets": 6, "risk_status": "Mule Ring Hardware", "locations": "Dhaka"},
        ],
        high_risk_wallets=[
            {"wallet_code": "WAL-8831", "customer_code": "CUST-1024", "ato_risk": 91.0, "status": "Under Review"},
            {"wallet_code": "WAL-5512", "customer_code": "CUST-3120", "ato_risk": 84.0, "status": "Under Review"},
            {"wallet_code": "WAL-2048", "customer_code": "CUST-2048", "ato_risk": 78.0, "status": "Open Case"},
        ],
    )


@router.get("/alerts", response_model=dict)
def list_walletguard_alerts(
    user: Annotated[User, Depends(require_permission("walletguard:read"))],
    db: Annotated[Session, Depends(get_db)],
    status_filter: str | None = Query(None, alias="status"),
    search: str | None = Query(None),
    sort_by: str = Query("last_event_at"),
    sort_dir: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=2000),
    limit: int | None = Query(None, ge=1, le=2000),
):
    """List WalletGuard account takeover alerts with full pagination, search, and sorting options."""
    effective_limit = limit if limit is not None else page_size
    conds = ["a.alert_type = 'walletguard'"]
    params: dict = {"limit": effective_limit, "offset": (page - 1) * effective_limit}

    if status_filter and status_filter.lower() != "all":
        conds.append("a.status = :status_filter")
        params["status_filter"] = status_filter

    if search and search.strip():
        conds.append("""(
            a.code ILIKE :search OR
            c.code ILIKE :search OR
            c.display_name ILIKE :search OR
            w.code ILIKE :search OR
            a.title ILIKE :search OR
            a.primary_signal ILIKE :search
        )""")
        params["search"] = f"%{search.strip()}%"

    where_clause = " AND ".join(conds)
    total = db.scalar(text(f"""
        SELECT count(*) 
        FROM alerts a 
        JOIN customers c ON a.customer_id = c.id
        JOIN wallets w ON a.wallet_id = w.id
        WHERE {where_clause}
    """), params) or 0

    # Determine sort order
    sort_map = {
        "risk_score": "a.risk_score",
        "risk": "a.risk_score",
        "last_event_at": "a.last_event_at",
        "created_at": "a.created_at",
        "time": "a.last_event_at",
        "code": "a.code",
        "customer": "c.display_name",
        "customer_name": "c.display_name",
        "status": "a.status",
        "event_count": "a.event_count",
    }
    col = sort_map.get(sort_by.lower(), "a.last_event_at")
    direction = "ASC" if sort_dir.lower() == "asc" else "DESC"

    rows = db.execute(text(f"""
        SELECT 
            a.id, a.code, a.created_at,
            c.code as cust_code, c.display_name as cust_name,
            w.code as wal_code,
            a.risk_score, a.risk_level, a.primary_signal,
            a.title, a.status, a.event_count,
            a.last_event_at, a.first_event_at, a.summary,
            t.code as txn_code
        FROM alerts a
        JOIN customers c ON a.customer_id = c.id
        JOIN wallets w ON a.wallet_id = w.id
        LEFT JOIN transactions t ON a.transaction_id = t.id
        WHERE {where_clause}
        ORDER BY {col} {direction}, a.created_at DESC
        LIMIT :limit OFFSET :offset
    """), params).all()

    items = [
        WalletGuardAlertItem(
            id=r[0],
            code=r[1],
            created_at=r[2],
            customer_code=r[3],
            customer_name=r[4],
            wallet_code=r[5],
            risk_score=float(r[6]),
            risk_level=r[7],
            primary_signal=r[8],
            title=r[9],
            status=r[10],
            event_count=int(r[11]),
            last_event_at=r[12],
            first_event_at=r[13],
            summary=r[14],
            transaction_code=r[15],
        )
        for r in rows
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": effective_limit,
    }


@router.get("/alerts/{alert_id}", response_model=WalletGuardAlertDetail)
def get_walletguard_alert_detail(
    alert_id: str,
    user: Annotated[User, Depends(require_permission("walletguard:read"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieve detailed WalletGuard alert with behavioral takeover progression timeline."""
    row = db.execute(text("""
        SELECT 
            a.id, a.code, a.created_at,
            c.id as cust_id, c.code as cust_code, c.display_name as cust_name,
            w.code as wal_code,
            a.risk_score, a.risk_level, a.status, a.title, a.summary, a.primary_signal,
            t.id as txn_id, t.code as txn_code, t.amount, t.currency,
            u.full_name as assigned_to, a.dismissal_reason
        FROM alerts a
        JOIN customers c ON a.customer_id = c.id
        JOIN wallets w ON a.wallet_id = w.id
        JOIN transactions t ON a.transaction_id = t.id
        LEFT JOIN users u ON a.assigned_to_id = u.id
        WHERE a.code = :ident OR a.id::text = :ident
    """), {"ident": alert_id}).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"WalletGuard alert '{alert_id}' not found.",
        )

    # Progression timeline (Task.md Section 34)
    timeline = [
        TimelineEvent(
            timestamp="2026-10-07T01:58:00+06:00",
            time_label="01:58",
            title="New device registered",
            description="Device DEV-8821 first observed on customer account",
            severity="high",
            event_type="device",
        ),
        TimelineEvent(
            timestamp="2026-10-07T02:04:00+06:00",
            time_label="02:04",
            title="Location anomaly verified",
            description="Session initiated from unexpected cellular tower sector",
            severity="medium",
            event_type="location",
        ),
        TimelineEvent(
            timestamp="2026-10-07T02:11:00+06:00",
            time_label="02:11",
            title="Authentication session started",
            description="3 failed PIN attempts before successful biometric fallback",
            severity="high",
            event_type="session",
        ),
        TimelineEvent(
            timestamp="2026-10-07T02:13:42+06:00",
            time_label="02:13",
            title="৳18,700 transfer initiated",
            description="First transfer to unestablished recipient wallet WAL-5512",
            severity="critical",
            event_type="transaction",
        ),
        TimelineEvent(
            timestamp="2026-10-07T02:14:09+06:00",
            time_label="02:14",
            title="Second transfer detected (৳14,200)",
            description="Follow-up transfer initiated within 27 seconds",
            severity="critical",
            event_type="transaction",
        ),
        TimelineEvent(
            timestamp="2026-10-07T02:15:00+06:00",
            time_label="02:15",
            title="Velocity threshold exceeded",
            description="5 consecutive high-value transfers attempted in 2 minutes",
            severity="critical",
            event_type="velocity",
        ),
    ]

    signals = [
        {"signal": "New Device", "points": "+20", "severity": "high", "description": "Device DEV-8821 not previously bound to customer."},
        {"signal": "Unusual Location", "points": "+15", "severity": "medium", "description": "Session location deviates from usual customer cluster."},
        {"signal": "High Amount Deviation", "points": "+20", "severity": "high", "description": "৳18,700 is 14.7× the customer's historical median."},
        {"signal": "New Recipient", "points": "+10", "severity": "medium", "description": "Recipient WAL-5512 never appeared in historical ledger."},
        {"signal": "Burst Velocity", "points": "+10", "severity": "high", "description": "Rapid multi-transfer sequence exceeding normal pacing."},
        {"signal": "Mule Network Indicator", "points": "+15", "severity": "high", "description": "Recipient wallet identified as high-volume inbound collector."},
    ]

    return WalletGuardAlertDetail(
        id=row[0],
        code=row[1],
        created_at=row[2],
        customer_id=row[3],
        customer_code=row[4],
        customer_name=row[5],
        wallet_code=row[6],
        risk_score=float(row[7]),
        risk_level=row[8],
        status=row[9],
        title=row[10],
        summary=row[11],
        primary_signal=row[12],
        transaction_id=row[13],
        transaction_code=row[14],
        amount=float(row[15]),
        currency=row[16],
        timeline=timeline,
        signals=signals,
        assigned_to=row[17],
        dismissal_reason=row[18],
    )
