"""Case Management & Investigator Notes API."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user, record_audit, require_permission
from backend.database.session import get_db
from backend.models import Case, CaseNote, User
from backend.schemas.cases import (
    AddCaseNoteRequest,
    CaseDetailResponse,
    CaseListItem,
    CaseNoteItem,
    CreateCaseRequest,
    UpdateCaseStatusRequest,
)

router = APIRouter(prefix="/cases", tags=["Case Management"])


@router.get("", response_model=dict)
def list_cases(
    user: Annotated[User, Depends(require_permission("cases:read"))],
    db: Annotated[Session, Depends(get_db)],
    status_filter: str | None = Query(None, alias="status"),
    priority: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
):
    """List investigation cases with status and priority filtering."""
    conds = ["1=1"]
    params: dict = {"limit": page_size, "offset": (page - 1) * page_size}

    if status_filter:
        conds.append("cs.status = :status_filter")
        params["status_filter"] = status_filter

    if priority:
        conds.append("cs.priority = :priority")
        params["priority"] = priority

    where_clause = " AND ".join(conds)
    total = db.scalar(text(f"SELECT count(*) FROM cases cs WHERE {where_clause}"), params) or 0

    rows = db.execute(text(f"""
        SELECT 
            cs.id, cs.code, cs.title, cs.priority, cs.risk_score, cs.status,
            c.code as cust_code, c.display_name as cust_name,
            w.code as wal_code,
            u.full_name as assigned_to,
            cs.created_at, cs.updated_at
        FROM cases cs
        JOIN customers c ON cs.customer_id = c.id
        JOIN wallets w ON cs.wallet_id = w.id
        LEFT JOIN users u ON cs.assigned_to_id = u.id
        WHERE {where_clause}
        ORDER BY cs.updated_at DESC
        LIMIT :limit OFFSET :offset
    """), params).all()

    items = [
        CaseListItem(
            id=r[0],
            code=r[1],
            title=r[2],
            priority=r[3],
            risk_score=float(r[4]),
            status=r[5],
            customer_code=r[6],
            customer_name=r[7],
            wallet_code=r[8],
            assigned_to=r[9],
            created_at=r[10],
            updated_at=r[11],
        )
        for r in rows
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", response_model=CaseListItem, status_code=status.HTTP_201_CREATED)
def create_case(
    req: CreateCaseRequest,
    current_user: Annotated[User, Depends(require_permission("cases:write"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new investigation case from an alert or transaction."""
    case_count = db.scalar(text("SELECT count(*) FROM cases")) or 0
    case_code = f"CASE-{case_count + 1:04d}"

    # Determine risk score, customer_id and wallet_id from transaction if available
    risk_score = 85.0
    cust_id = req.customer_id
    wal_id = req.wallet_id

    if req.transaction_id:
        t_row = db.execute(
            text("SELECT customer_id, wallet_id FROM transactions WHERE id = :tid"),
            {"tid": req.transaction_id},
        ).fetchone()
        if t_row:
            cust_id = t_row[0]
            wal_id = t_row[1]

        rs = db.scalar(
            text("SELECT overall_risk FROM risk_scores WHERE transaction_id = :tid"),
            {"tid": req.transaction_id},
        )
        if rs is not None:
            risk_score = float(rs)

    elif req.alert_id:
        a_row = db.execute(
            text("SELECT customer_id, wallet_id, risk_score FROM alerts WHERE id = :aid"),
            {"aid": req.alert_id},
        ).fetchone()
        if a_row:
            cust_id = a_row[0]
            wal_id = a_row[1]
            risk_score = float(a_row[2])

    # Fallback to customer first wallet if wal_id not found
    if not wal_id and cust_id:
        first_w = db.scalar(
            text("SELECT id FROM wallets WHERE customer_id = :cid ORDER BY opened_at ASC LIMIT 1"),
            {"cid": cust_id},
        )
        if first_w:
            wal_id = first_w

    if not cust_id or not wal_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid customer_id and wallet_id could not be resolved.",
        )

    new_case = Case(
        code=case_code,
        title=req.title,
        priority=req.priority,
        risk_score=risk_score,
        status="open",
        customer_id=cust_id,
        wallet_id=wal_id,
        transaction_id=req.transaction_id,
        alert_id=req.alert_id,
        assigned_to_id=current_user.id,
        created_by_id=current_user.id,
    )
    db.add(new_case)
    db.flush()

    if req.initial_note:
        note = CaseNote(
            case_id=new_case.id,
            author_id=current_user.id,
            body=req.initial_note,
        )
        db.add(note)

    # Link alert status if applicable
    if req.alert_id:
        db.execute(text("UPDATE alerts SET status = 'investigating' WHERE id = :aid"), {"aid": req.alert_id})

    db.commit()

    record_audit(
        db,
        current_user,
        action="create_case",
        resource_type="case",
        resource_id=str(new_case.id),
        metadata={"code": case_code, "title": req.title},
    )

    cust = db.execute(text("SELECT code, display_name FROM customers WHERE id = :cid"), {"cid": cust_id}).fetchone()
    wal = db.execute(text("SELECT code FROM wallets WHERE id = :wid"), {"wid": wal_id}).fetchone()

    return CaseListItem(
        id=new_case.id,
        code=case_code,
        title=new_case.title,
        priority=new_case.priority,
        risk_score=new_case.risk_score,
        status=new_case.status,
        customer_code=cust[0] if cust else "CUST-UNKNOWN",
        customer_name=cust[1] if cust else "Unknown Customer",
        wallet_code=wal[0] if wal else "WAL-UNKNOWN",
        assigned_to=current_user.full_name,
        created_at=new_case.created_at,
        updated_at=new_case.updated_at,
    )


@router.get("/{identifier}", response_model=CaseDetailResponse)
def get_case_detail(
    identifier: str,
    user: Annotated[User, Depends(require_permission("cases:read"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieve full investigation case details, investigator notes, evidence, and AI reports."""
    row = db.execute(text("""
        SELECT 
            cs.id, cs.code, cs.title, cs.priority, cs.risk_score, cs.status,
            c.id as cust_id, c.code as cust_code, c.display_name as cust_name,
            w.id as wal_id, w.code as wal_code,
            t.id as txn_id, t.code as txn_code,
            a.id as alert_id, a.code as alert_code,
            u_assign.full_name as assigned_to,
            u_create.full_name as created_by,
            cs.created_at, cs.updated_at, cs.resolution, cs.resolution_note
        FROM cases cs
        JOIN customers c ON cs.customer_id = c.id
        JOIN wallets w ON cs.wallet_id = w.id
        LEFT JOIN transactions t ON cs.transaction_id = t.id
        LEFT JOIN alerts a ON cs.alert_id = a.id
        LEFT JOIN users u_assign ON cs.assigned_to_id = u_assign.id
        LEFT JOIN users u_create ON cs.created_by_id = u_create.id
        WHERE cs.code = :ident OR cs.id::text = :ident
    """), {"ident": identifier}).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{identifier}' not found.",
        )

    case_id = row[0]
    txn_id = row[11]

    # Notes
    note_rows = db.execute(text("""
        SELECT cn.id, u.full_name, u.email, cn.body, cn.created_at
        FROM case_notes cn
        JOIN users u ON cn.author_id = u.id
        WHERE cn.case_id = :cid
        ORDER BY cn.created_at ASC
    """), {"cid": case_id}).all()

    notes = [
        CaseNoteItem(
            id=nr[0],
            author_name=nr[1],
            author_email=nr[2],
            body=nr[3],
            created_at=nr[4],
        )
        for nr in note_rows
    ]

    # Evidence
    evidence_items = []
    if txn_id:
        ev_rows = db.execute(text("""
            SELECT code, signal, category, severity, value, baseline, explanation, confidence, rank
            FROM evidence
            WHERE transaction_id = :tid
            ORDER BY rank ASC
        """), {"tid": txn_id}).all()
        evidence_items = [
            {
                "code": er[0],
                "signal": er[1],
                "category": er[2],
                "severity": er[3],
                "value": er[4],
                "baseline": er[5],
                "explanation": er[6],
                "confidence": float(er[7]),
                "rank": er[8],
            }
            for er in ev_rows
        ]

    # Attached AI report
    ai_report = None
    if txn_id:
        rep_row = db.execute(text("""
            SELECT content, status, model_name, created_at
            FROM ai_reports
            WHERE transaction_id = :tid OR case_id = :cid
            ORDER BY created_at DESC
            LIMIT 1
        """), {"tid": txn_id, "cid": case_id}).fetchone()
        if rep_row:
            ai_report = {
                "status": rep_row[1],
                "model_name": rep_row[2],
                "content": rep_row[0],
                "created_at": rep_row[3].isoformat(),
            }

    return CaseDetailResponse(
        id=case_id,
        code=row[1],
        title=row[2],
        priority=row[3],
        risk_score=float(row[4]),
        status=row[5],
        customer_id=row[6],
        customer_code=row[7],
        customer_name=row[8],
        wallet_id=row[9],
        wallet_code=row[10],
        transaction_id=txn_id,
        transaction_code=row[12],
        alert_id=row[13],
        alert_code=row[14],
        assigned_to=row[15],
        created_by=row[16],
        created_at=row[17],
        updated_at=row[18],
        resolution=row[19],
        resolution_note=row[20],
        notes=notes,
        evidence=evidence_items,
        ai_report=ai_report,
    )


@router.patch("/{case_id}/status")
def update_case_status(
    case_id: str,
    req: UpdateCaseStatusRequest,
    current_user: Annotated[User, Depends(require_permission("cases:write"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Transition case status (OPEN, IN_REVIEW, ESCALATED, RESOLVED, CLOSED) with audit."""
    case = db.scalar(text("SELECT id FROM cases WHERE code = :ident OR id::text = :ident"), {"ident": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    resolved_at = datetime.now(timezone.utc) if req.status in ("resolved", "closed") else None

    db.execute(text("""
        UPDATE cases 
        SET status = :status, resolution = :res, resolution_note = :note, resolved_at = :res_at, updated_at = NOW()
        WHERE code = :ident OR id::text = :ident
    """), {
        "status": req.status,
        "res": req.resolution,
        "note": req.resolution_note,
        "res_at": resolved_at,
        "ident": case_id,
    })
    db.commit()

    record_audit(
        db,
        current_user,
        action="update_case_status",
        resource_type="case",
        resource_id=case_id,
        metadata={"new_status": req.status, "resolution": req.resolution},
    )

    return {"status": "success", "case_id": case_id, "new_status": req.status}


@router.post("/{case_id}/notes", response_model=CaseNoteItem)
def add_case_note(
    case_id: str,
    req: AddCaseNoteRequest,
    current_user: Annotated[User, Depends(require_permission("cases:write"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Add investigator observation note to an existing case."""
    row = db.execute(text("SELECT id FROM cases WHERE code = :ident OR id::text = :ident"), {"ident": case_id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Case not found.")

    real_case_id = row[0]

    note = CaseNote(
        case_id=real_case_id,
        author_id=current_user.id,
        body=req.body,
    )
    db.add(note)
    db.execute(text("UPDATE cases SET updated_at = NOW() WHERE id = :cid"), {"cid": real_case_id})
    db.commit()

    record_audit(
        db,
        current_user,
        action="add_case_note",
        resource_type="case",
        resource_id=str(real_case_id),
    )

    return CaseNoteItem(
        id=note.id,
        author_name=current_user.full_name,
        author_email=current_user.email,
        body=note.body,
        created_at=note.created_at,
    )
