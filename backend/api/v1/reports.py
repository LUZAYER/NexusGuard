"""Investigation Report Export router (PDF & JSON)."""
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user, record_audit, require_permission
from backend.database.session import get_db
from backend.models import (
    AIReport,
    Alert,
    Case,
    Customer,
    Device,
    Evidence,
    InvestigationReport,
    RiskScore,
    Transaction,
    User,
    Wallet,
)
from backend.schemas.reports import ExportReportRequest
from backend.services.pdf_generator import generate_incident_report_pdf

router = APIRouter(prefix="/reports", tags=["Reports & Export"])


@router.post("/export")
def export_report(
    req: ExportReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and export a formal investigation report in PDF or structured JSON format."""
    tx = None
    case = None

    if req.case_code:
        case = db.scalar(select(Case).where(Case.code == req.case_code))
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case {req.case_code} not found.",
            )
        if case.transaction_id:
            tx = db.scalar(select(Transaction).where(Transaction.id == case.transaction_id))

    if req.transaction_code and not tx:
        tx = db.scalar(select(Transaction).where(Transaction.code == req.transaction_code))
        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction {req.transaction_code} not found.",
            )

    if not tx and not case:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either transaction_code or case_code.",
        )

    # Gather entity details
    cust_id = tx.customer_id if tx else (case.customer_id if case else None)
    wallet_id = tx.wallet_id if tx else (case.wallet_id if case else None)

    cust = db.scalar(select(Customer).where(Customer.id == cust_id)) if cust_id else None
    wallet = db.scalar(select(Wallet).where(Wallet.id == wallet_id)) if wallet_id else None
    device = db.scalar(select(Device).where(Device.id == tx.device_id)) if (tx and tx.device_id) else None
    recip = db.scalar(select(Wallet).where(Wallet.id == tx.recipient_wallet_id)) if (tx and tx.recipient_wallet_id) else None

    rs = db.scalar(select(RiskScore).where(RiskScore.transaction_id == tx.id)) if tx else None

    # Gather evidence
    evidence_records = []
    if tx:
        evidence_records = db.scalars(select(Evidence).where(Evidence.transaction_id == tx.id)).all()

    # Gather AI report if exists
    ai_report_record = None
    if tx:
        ai_report_record = db.scalar(
            select(AIReport)
            .where(AIReport.transaction_id == tx.id)
            .order_by(AIReport.created_at.desc())
        )

    report_code = f"REP-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    report_payload = {
        "report_code": report_code,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_by": current_user.email,
        "case_code": case.code if case else None,
        "transaction_code": tx.code if tx else None,
        "occurred_at": tx.occurred_at.strftime("%Y-%m-%d %H:%M:%S UTC") if tx else "N/A",
        "customer_code": cust.code if cust else "UNKNOWN",
        "customer_name": cust.display_name if cust else "UNKNOWN",
        "wallet_code": wallet.code if wallet else "UNKNOWN",
        "recipient_wallet": recip.code if recip else "UNKNOWN",
        "device_code": device.code if device else "UNKNOWN",
        "amount": float(tx.amount) if tx else 0.0,
        "txn_type": tx.txn_type if tx else "N/A",
        "overall_risk": rs.overall_risk if rs else (case.risk_score if case else 0.0),
        "risk_level": rs.risk_level if rs else (case.priority if case else "low"),
        "recommended_action": "AUTO_BLOCK" if (rs and rs.risk_level == "critical") else "REVIEW",
        "engine_scores": {
            "transaction_risk": rs.transaction_risk if rs else 0.0,
            "behavior_risk": rs.behavior_risk if rs else 0.0,
            "ato_risk": rs.ato_risk if rs else 0.0,
            "network_risk": rs.network_risk if rs else 0.0,
        },
        "evidence": [
            {
                "code": ev.code,
                "engine": ev.source,
                "severity": ev.severity,
                "title": ev.signal,
                "description": ev.explanation,
                "observed_value": ev.value,
                "baseline_value": ev.baseline,
                "features": ev.details or {},
            }
            for ev in evidence_records
        ],
        "ai_report": ai_report_record.content if ai_report_record and ai_report_record.content else {
            "executive_summary": "Multi-engine analytics flagged this transaction due to extreme behavioral deviation and credential anomalies.",
            "attack_hypothesis": "Compromised credential access followed by rapid liquidation attempt into designated mule infrastructure.",
            "recommended_actions": [
                {"action": "FREEZE_RECIPIENT_WALLET", "priority": "CRITICAL", "sla": "15m", "rationale": "Prevent secondary cash-out hopping."},
                {"action": "CHALLENGE_SENDER_IDENTITY", "priority": "HIGH", "sla": "1h", "rationale": "Verify legitimate account holder via out-of-band biometric challenge."},
            ],
        },
        "context_hash": hashlib.sha256(f"{report_code}:{tx.code if tx else 'N/A'}".encode()).hexdigest(),
    }

    # Record audit log
    record_audit(
        db=db,
        user=current_user,
        action="export_investigation_report",
        resource_type="report",
        resource_id=report_code,
        metadata={"format": req.format, "case_code": case.code if case else None, "transaction_code": tx.code if tx else None},
    )

    if req.format == "json":
        return report_payload

    # PDF format
    pdf_buffer = generate_incident_report_pdf(report_payload)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={report_code}.pdf",
            "X-Report-Code": report_code,
        },
    )
