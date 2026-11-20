"""Audit log schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuditLogItem(BaseModel):
    id: uuid.UUID
    occurred_at: datetime
    actor_email: str
    action: str
    resource_type: str
    resource_id: str
    metadata: dict[str, Any]
    ip_address: str | None = None


class AuditLogListResponse(BaseModel):
    items: list[AuditLogItem]
    total: int
    page: int
    limit: int
