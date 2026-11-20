"""Audit logs query and compliance router."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user, require_permission
from backend.database.session import get_db
from backend.models import AuditLog, User
from backend.schemas.audit import AuditLogItem, AuditLogListResponse

router = APIRouter(prefix="/audit", tags=["Audit & Compliance"])


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 25,
    action: str | None = None,
    resource_type: str | None = None,
    actor_email: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve immutable audit trail with filtering and pagination."""
    query = select(AuditLog)

    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if actor_email:
        query = query.where(AuditLog.actor_email.ilike(f"%{actor_email}%"))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    items = (
        db.scalars(
            query.order_by(desc(AuditLog.occurred_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        .all()
    )

    return AuditLogListResponse(
        items=[
            AuditLogItem(
                id=log.id,
                occurred_at=log.occurred_at,
                actor_email=log.actor_email,
                action=log.action,
                resource_type=log.resource_type,
                resource_id=log.resource_id,
                metadata=log.audit_metadata or {},
                ip_address=log.ip_address,
            )
            for log in items
        ],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/actions", response_model=list[str])
def get_audit_actions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List distinct audit action categories for filtering."""
    actions = db.scalars(
        select(AuditLog.action).distinct().order_by(AuditLog.action)
    ).all()
    return list(actions)
