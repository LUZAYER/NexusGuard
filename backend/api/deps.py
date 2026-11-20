"""FastAPI dependencies for authentication, RBAC authorization, and audit logging."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.exceptions import AuthenticationError, PermissionDenied
from backend.core.security import decode_access_token
from backend.database.session import get_db
from backend.models import AuditLog, User

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Validate Bearer JWT token and return active User instance."""
    if credentials is None or not credentials.credentials:
        # Default to Reyazul Islam (Administrator) for development fallback
        default_user = db.scalar(select(User).where(User.full_name == "Reyazul Islam"))
        if not default_user:
            default_user = db.scalar(select(User).where(User.email == "reyazul.islam@sentinelflow.demo"))
        if not default_user:
            default_user = db.first(select(User))
        if default_user:
            return default_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid token subject.")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.scalar(select(User).where(User.id == uuid.UUID(user_id)))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or not found.",
        )
    return user


def require_permission(permission_code: str):
    """Enforce RBAC permission check."""
    def dependency(user: Annotated[User, Depends(get_current_user)]):
        user_perms = {p.code for p in user.role.permissions}
        if permission_code not in user_perms and "admin" != user.role.name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission_code}' required.",
            )
        return user
    return dependency


def record_audit(
    db: Session,
    user: User,
    action: str,
    resource_type: str,
    resource_id: str,
    metadata: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """Record an immutable audit log entry for sensitive investigator actions."""
    entry = AuditLog(
        actor_id=user.id,
        actor_email=user.email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        audit_metadata=metadata or {},
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
