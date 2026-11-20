"""Transactions API: Listing with enterprise filters, detail with evidence and behavioral comparisons."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user, record_audit, require_permission
from backend.database.session import get_db
from backend.models import Transaction, User
from backend.schemas.transactions import (
    BehaviorMetricComparison,
    EvidenceItem,
    RiskBreakdownItem,
    TransactionDetailResponse,
    TransactionListItem,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=dict)
def list_transactions(
    user: Annotated[User, Depends(require_permission("transactions:read"))],
    db: Annotated[Session, Depends(get_db)],
    search: str | None = None,
    risk_level: str | None = None,
    txn_type: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    min_amount: float | None = None,
    max_amount: float | None = None,
    customer_code: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    limit: int | None = Query(None, ge=1, le=100),
    sort_by: str = Query("occurred_at"),
    sort_dir: str = Query("desc"),
):
    """Retrieve paginated transactions with enterprise filter, search, and sorting capabilities."""
    effective_limit = limit if limit is not None else page_size
    conditions = ["1=1"]
    params: dict = {
        "limit": effective_limit,
        "offset": (page - 1) * effective_limit,
    }

    if search:
        conditions.append("""(
            t.code ILIKE :search OR 
            c.code ILIKE :search OR 
            c.display_name ILIKE :search OR 
            w.code ILIKE :search OR 
            d.code ILIKE :search OR 
            rw.code ILIKE :search
        )""")
        params["search"] = f"%{search}%"

    if risk_level:
        conditions.append("rs.risk_level = :risk_level")
        params["risk_level"] = risk_level.lower()

    if txn_type:
        conditions.append("t.txn_type = :txn_type")
        params["txn_type"] = txn_type

    if status_filter:
        conditions.append("t.status = :status_filter")
        params["status_filter"] = status_filter

    if min_amount is not None:
        conditions.append("t.amount >= :min_amount")
        params["min_amount"] = min_amount

    if max_amount is not None:
        conditions.append("t.amount <= :max_amount")
        params["max_amount"] = max_amount

    if customer_code:
        conditions.append("c.code = :customer_code")
        params["customer_code"] = customer_code

    where_clause = " AND ".join(conditions)

    count_sql = f"""
        SELECT count(*)
        FROM transactions t
        LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
        JOIN customers c ON t.customer_id = c.id
        JOIN wallets w ON t.wallet_id = w.id
        JOIN wallets rw ON t.recipient_wallet_id = rw.id
        JOIN devices d ON t.device_id = d.id
        WHERE {where_clause}
    """
    total = db.scalar(text(count_sql), params) or 0

    sort_map = {
        "occurred_at": "t.occurred_at",
        "time": "t.occurred_at",
        "amount": "t.amount",
        "risk_score": "COALESCE(rs.overall_risk, 0.0)",
        "risk": "COALESCE(rs.overall_risk, 0.0)",
        "overall_risk": "COALESCE(rs.overall_risk, 0.0)",
        "code": "t.code",
        "status": "t.status",
        "txn_type": "t.txn_type",
        "type": "t.txn_type",
        "customer": "c.display_name",
        "customer_name": "c.display_name",
    }
    order_col = sort_map.get(sort_by.lower(), "t.occurred_at")
    order_dir = "ASC" if sort_dir.lower() == "asc" else "DESC"

    query_sql = f"""
        SELECT 
            t.id,
            t.code,
            t.occurred_at,
            c.code as cust_code,
            c.display_name as cust_name,
            w.code as wallet_code,
            rw.code as rec_wallet_code,
            t.amount,
            t.currency,
            t.txn_type,
            rs.overall_risk,
            COALESCE(rs.risk_level, 'low') as r_level,
            rs.primary_signal,
            t.status
        FROM transactions t
        LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
        JOIN customers c ON t.customer_id = c.id
        JOIN wallets w ON t.wallet_id = w.id
        JOIN wallets rw ON t.recipient_wallet_id = rw.id
        JOIN devices d ON t.device_id = d.id
        WHERE {where_clause}
        ORDER BY {order_col} {order_dir}, t.occurred_at DESC
        LIMIT :limit OFFSET :offset
    """

    rows = db.execute(text(query_sql), params).all()

    items = [
        TransactionListItem(
            id=r[0],
            code=r[1],
            occurred_at=r[2],
            customer_code=r[3],
            customer_name=r[4],
            wallet_code=r[5],
            recipient_wallet_code=r[6],
            amount=float(r[7]),
            currency=r[8],
            txn_type=r[9],
            risk_score=float(r[10]) if r[10] is not None else None,
            risk_level=r[11],
            primary_signal=r[12],
            status=r[13],
        )
        for r in rows
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
    }


@router.get("/{identifier}", response_model=TransactionDetailResponse)
def get_transaction_detail(
    identifier: str,
    user: Annotated[User, Depends(require_permission("transactions:read"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieve full transaction investigation details, evidence cards, and behavioral comparison."""
    # Find by code or UUID
    txn_row = db.execute(text("""
        SELECT 
            t.id, t.code, t.occurred_at, t.amount, t.currency, t.txn_type, t.status,
            c.id as cust_id, c.code as cust_code, c.display_name as cust_name, c.persona as cust_persona,
            w.id as wallet_id, w.code as wallet_code, rw.id as rec_wallet_id, rw.code as rec_wallet_code,
            d.code as dev_code, d.platform as dev_platform, d.model_label as dev_model,
            l.name as loc_name, l.division as loc_division,
            rs.overall_risk, rs.risk_level, rs.confidence, rs.primary_signal,
            rs.transaction_risk, rs.behavior_risk, rs.ato_risk, rs.network_risk,
            t.ground_truth
        FROM transactions t
        JOIN customers c ON t.customer_id = c.id
        JOIN wallets w ON t.wallet_id = w.id
        JOIN wallets rw ON t.recipient_wallet_id = rw.id
        JOIN devices d ON t.device_id = d.id
        JOIN locations l ON t.location_id = l.id
        LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
        WHERE t.code = :ident OR t.id::text = :ident
    """), {"ident": identifier}).fetchone()

    if not txn_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction '{identifier}' not found.",
        )

    t_id = txn_row[0]
    cust_id = txn_row[7]

    # Get structured evidence
    evidence_rows = db.execute(text("""
        SELECT id, code, signal, category, severity, source, value, baseline, explanation, confidence, rank, details
        FROM evidence
        WHERE transaction_id = :t_id
        ORDER BY rank ASC
    """), {"t_id": t_id}).all()

    evidence_items = [
        EvidenceItem(
            id=er[0],
            code=er[1],
            signal=er[2],
            category=er[3],
            severity=er[4],
            source=er[5],
            value=er[6],
            baseline=er[7],
            explanation=er[8],
            confidence=float(er[9]),
            rank=int(er[10]),
            details=er[11] or {},
        )
        for er in evidence_rows
    ]

    # Get Customer Behavioral Profile
    prof_row = db.execute(text("""
        SELECT profile, behavioral_confidence
        FROM customer_behavior_profiles
        WHERE customer_id = :cust_id
    """), {"cust_id": cust_id}).fetchone()

    prof_data = prof_row[0] if prof_row else {}
    med_amt = prof_data.get("normal_transaction_amount", {}).get("median", 1350.0)
    norm_hours = ", ".join(prof_data.get("normal_transaction_hours", ["18:00 - 23:00"]))
    known_devices = prof_data.get("known_devices", ["DEV-88A1"])
    known_recipients = prof_data.get("known_recipients", [])

    curr_amt = float(txn_row[3])
    curr_hour = txn_row[2].strftime("%H:%M")
    curr_dev = txn_row[15]

    ratio = curr_amt / max(med_amt, 1.0)
    is_new_dev = curr_dev not in known_devices

    # Build behavioral comparison cards (Task.md Section 32)
    behavior_comparisons = [
        BehaviorMetricComparison(
            label="Transaction Amount",
            historical_baseline=f"৳{med_amt:,.0f} median",
            current_value=f"৳{curr_amt:,.0f}",
            deviation=f"{ratio:.1f}× higher",
            is_anomalous=ratio >= 3.0,
        ),
        BehaviorMetricComparison(
            label="Transaction Time",
            historical_baseline=norm_hours,
            current_value=curr_hour,
            deviation="Outside normal window" if (txn_row[2].hour < 6) else "Normal window",
            is_anomalous=txn_row[2].hour < 6,
        ),
        BehaviorMetricComparison(
            label="Device Fingerprint",
            historical_baseline=", ".join(known_devices[:2]),
            current_value=str(curr_dev),
            deviation="NEW UNSEEN DEVICE" if is_new_dev else "Established Device",
            is_anomalous=is_new_dev,
        ),
        BehaviorMetricComparison(
            label="Recipient Relationship",
            historical_baseline=f"{len(known_recipients)} known recipients",
            current_value=str(txn_row[14]),
            deviation="First transaction with recipient" if txn_row[14] not in known_recipients else "Known Recipient",
            is_anomalous=txn_row[14] not in known_recipients,
        ),
    ]

    # Breakdown items
    txn_score = float(txn_row[24] or 0)
    beh_score = float(txn_row[25] or 0)
    ato_score = float(txn_row[26] or 0)
    net_score = float(txn_row[27] or 0)

    breakdown = [
        RiskBreakdownItem(
            name="Transaction Risk",
            key="transaction_risk",
            score=txn_score,
            weight=0.30,
            risk_level="critical" if txn_score >= 75 else "high" if txn_score >= 50 else "moderate",
            signals=["amount_deviation", "new_recipient", "velocity_burst"],
        ),
        RiskBreakdownItem(
            name="Behavioral Risk",
            key="behavior_risk",
            score=beh_score,
            weight=0.25,
            risk_level="critical" if beh_score >= 75 else "high" if beh_score >= 50 else "moderate",
            signals=["isolation_forest_outlier", "temporal_deviation"],
        ),
        RiskBreakdownItem(
            name="WalletGuard ATO",
            key="ato_risk",
            score=ato_score,
            weight=0.30,
            risk_level="critical" if ato_score >= 75 else "high" if ato_score >= 50 else "moderate",
            signals=["new_device", "unusual_time", "session_novelty"],
        ),
        RiskBreakdownItem(
            name="Network Risk",
            key="network_risk",
            score=net_score,
            weight=0.15,
            risk_level="critical" if net_score >= 75 else "high" if net_score >= 50 else "moderate",
            signals=["high_fan_in", "mule_wallet_pattern"],
        ),
    ]

    record_audit(
        db,
        user,
        action="view_transaction_detail",
        resource_type="transaction",
        resource_id=str(t_id),
        metadata={"code": txn_row[1]},
    )

    gt = txn_row[28]
    is_demo = bool(isinstance(gt, dict) and gt.get("scenario_label"))

    return TransactionDetailResponse(
        id=t_id,
        code=txn_row[1],
        occurred_at=txn_row[2],
        amount=curr_amt,
        currency=txn_row[4],
        txn_type=txn_row[5],
        status=txn_row[6],
        customer_id=cust_id,
        customer_code=txn_row[8],
        customer_name=txn_row[9],
        customer_persona=txn_row[10],
        wallet_id=txn_row[11],
        wallet_code=txn_row[12],
        recipient_wallet_id=txn_row[13],
        recipient_wallet_code=txn_row[14],
        device_code=curr_dev,
        device_platform=txn_row[16],
        device_model=txn_row[17],
        device_is_new=is_new_dev,
        location_name=txn_row[18],
        location_division=txn_row[19],
        location_is_new=False,
        overall_risk=float(txn_row[20] or 0),
        risk_level=txn_row[21] or "low",
        confidence=float(txn_row[22] or 0.9),
        primary_signal=txn_row[23],
        transaction_risk=float(txn_row[24] or 0),
        behavior_risk=float(txn_row[25] or 0),
        ato_risk=float(txn_row[26] or 0),
        network_risk=float(txn_row[27]) if txn_row[27] is not None else None,
        breakdown=breakdown,
        evidence=evidence_items,
        behavior_comparisons=behavior_comparisons,
        is_demo_scenario=is_demo,
        scenario_type=gt.get("scenario_type") if isinstance(gt, dict) else None,
    )
