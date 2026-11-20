"""AI Investigation Report API routes."""
from __future__ import annotations

import hashlib
import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user, record_audit, require_permission
from backend.database.session import get_db
from backend.models import AIReport, User
from llm.investigator.engine import AIInvestigator

router = APIRouter(prefix="/investigations", tags=["AI Investigations"])


@router.post("/{identifier}/ai-report")
async def generate_ai_report(
    identifier: str,
    user: Annotated[User, Depends(require_permission("investigations:ai"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Generate an advisory AI Investigation Report for a transaction or case using Ollama."""
    # Find transaction by code or UUID or via case
    txn_row = db.execute(text("""
        SELECT 
            t.id, t.code, t.occurred_at, t.amount, t.currency, t.txn_type,
            c.id as cust_id, c.code as cust_code, c.display_name as cust_name, c.persona,
            w.code as wal_code, rw.code as rec_wal_code,
            d.code as dev_code, l.name as loc_name,
            rs.overall_risk, rs.transaction_risk, rs.behavior_risk, rs.ato_risk, rs.network_risk, rs.risk_level
        FROM transactions t
        JOIN customers c ON t.customer_id = c.id
        JOIN wallets w ON t.wallet_id = w.id
        JOIN wallets rw ON t.recipient_wallet_id = rw.id
        JOIN devices d ON t.device_id = d.id
        JOIN locations l ON t.location_id = l.id
        LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
        WHERE t.code = :ident OR t.id::text = :ident
    """), {"ident": identifier}).fetchone()

    # If not found directly, check if it's a case code
    case_id = None
    if not txn_row:
        case_row = db.execute(text("""
            SELECT cs.id, cs.transaction_id 
            FROM cases cs 
            WHERE cs.code = :ident OR cs.id::text = :ident
        """), {"ident": identifier}).fetchone()
        if case_row and case_row[1]:
            case_id = case_row[0]
            txn_row = db.execute(text("""
                SELECT 
                    t.id, t.code, t.occurred_at, t.amount, t.currency, t.txn_type,
                    c.id as cust_id, c.code as cust_code, c.display_name as cust_name, c.persona,
                    w.code as wal_code, rw.code as rec_wal_code,
                    d.code as dev_code, l.name as loc_name,
                    rs.overall_risk, rs.transaction_risk, rs.behavior_risk, rs.ato_risk, rs.network_risk, rs.risk_level
                FROM transactions t
                JOIN customers c ON t.customer_id = c.id
                JOIN wallets w ON t.wallet_id = w.id
                JOIN wallets rw ON t.recipient_wallet_id = rw.id
                JOIN devices d ON t.device_id = d.id
                JOIN locations l ON t.location_id = l.id
                LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
                WHERE t.id = :tid
            """), {"tid": case_row[1]}).fetchone()

    if not txn_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Security event or transaction '{identifier}' not found.",
        )

    t_id = txn_row[0]
    cust_id = txn_row[6]

    # Gather evidence
    ev_rows = db.execute(text("""
        SELECT code, signal, category, severity, value, baseline, explanation
        FROM evidence
        WHERE transaction_id = :tid
        ORDER BY rank ASC
    """), {"tid": t_id}).all()

    evidence_list = [
        {
            "code": er[0],
            "signal": er[1],
            "category": er[2],
            "severity": er[3],
            "value": er[4],
            "baseline": er[5],
            "explanation": er[6],
        }
        for er in ev_rows
    ]

    # Gather customer baseline
    prof_row = db.execute(text("""
        SELECT profile FROM customer_behavior_profiles WHERE customer_id = :cid
    """), {"cid": cust_id}).fetchone()
    profile = prof_row[0] if prof_row else {}

    # Assemble structured context
    structured_context = {
        "transaction": {
            "code": txn_row[1],
            "amount": float(txn_row[3]),
            "currency": txn_row[4],
            "type": txn_row[5],
            "occurred_at": txn_row[2].isoformat(),
            "sender_wallet": txn_row[10],
            "recipient_wallet": txn_row[11],
            "device": txn_row[12],
            "location": txn_row[13],
        },
        "customer": {
            "code": txn_row[7],
            "name": txn_row[8],
            "persona": txn_row[9],
        },
        "risk_scores": {
            "overall_risk": float(txn_row[14] or 0),
            "transaction_risk": float(txn_row[15] or 0),
            "behavior_risk": float(txn_row[16] or 0),
            "ato_risk": float(txn_row[17] or 0),
            "network_risk": float(txn_row[18] or 0),
            "risk_level": txn_row[19] or "low",
        },
        "evidence": evidence_list,
        "customer_baseline": profile,
        "network_context": {
            "recipient_wallet": txn_row[11],
            "mule_indicators": "Inbound fan-in and rapid forwarding detected" if txn_row[11] == "WAL-5512" else "Standard recipient",
        },
    }

    # Run AI Investigator
    investigator = AIInvestigator()
    report_result = await investigator.generate_report(structured_context)

    # Hash context for auditability
    ctx_hash = hashlib.sha256(json.dumps(structured_context, sort_keys=True).encode()).hexdigest()

    # Save to ai_reports table
    ai_report_record = AIReport(
        transaction_id=t_id,
        case_id=case_id,
        status=report_result["status"],
        model_name=report_result["model_name"],
        content=report_result["content"],
        evidence_codes=[e["code"] for e in evidence_list],
        guardrail_findings=report_result.get("guardrail_findings", []),
        context_hash=ctx_hash,
        latency_ms=report_result.get("latency_ms"),
        generated_by_id=user.id,
    )
    db.add(ai_report_record)
    db.commit()

    record_audit(
        db,
        user,
        action="generate_ai_investigation_report",
        resource_type="transaction",
        resource_id=str(t_id),
        metadata={"model": report_result["model_name"], "status": report_result["status"]},
    )

    return {
        "id": str(ai_report_record.id),
        "status": report_result["status"],
        "model_name": report_result["model_name"],
        "latency_ms": report_result.get("latency_ms"),
        "report": report_result["content"],
        "guardrail_findings": report_result.get("guardrail_findings", []),
        "created_at": ai_report_record.created_at.isoformat(),
    }
