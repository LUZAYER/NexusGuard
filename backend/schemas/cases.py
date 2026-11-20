"""Investigation Case & Case Note schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class CaseNoteItem(BaseModel):
    id: uuid.UUID
    author_name: str
    author_email: str
    body: str
    created_at: datetime


class CreateCaseRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    priority: str = Field(default="high")
    customer_id: uuid.UUID | None = None
    wallet_id: uuid.UUID | None = None
    transaction_id: uuid.UUID | None = None
    alert_id: uuid.UUID | None = None
    initial_note: str | None = None


class UpdateCaseStatusRequest(BaseModel):
    status: str
    resolution: str | None = None
    resolution_note: str | None = None


class AddCaseNoteRequest(BaseModel):
    body: str = Field(min_length=2)


class CaseListItem(BaseModel):
    id: uuid.UUID
    code: str
    title: str
    priority: str
    risk_score: float
    status: str
    customer_code: str
    customer_name: str
    wallet_code: str
    assigned_to: str | None = None
    created_at: datetime
    updated_at: datetime


class CaseDetailResponse(BaseModel):
    id: uuid.UUID
    code: str
    title: str
    priority: str
    risk_score: float
    status: str
    customer_id: uuid.UUID
    customer_code: str
    customer_name: str
    wallet_id: uuid.UUID
    wallet_code: str
    transaction_id: uuid.UUID | None = None
    transaction_code: str | None = None
    alert_id: uuid.UUID | None = None
    alert_code: str | None = None
    
    assigned_to: str | None = None
    created_by: str | None = None
    created_at: datetime
    updated_at: datetime
    resolution: str | None = None
    resolution_note: str | None = None
    
    notes: list[CaseNoteItem] = []
    evidence: list[dict[str, Any]] = []
    ai_report: dict[str, Any] | None = None
