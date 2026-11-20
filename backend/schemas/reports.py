"""Investigation Report Export schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class ExportReportRequest(BaseModel):
    transaction_code: str | None = None
    case_code: str | None = None
    format: Literal["pdf", "json"] = "pdf"
    include_evidence: bool = True
    include_timeline: bool = True
    include_network: bool = True


class ReportMetadataResponse(BaseModel):
    id: uuid.UUID
    code: str
    case_code: str | None = None
    transaction_code: str | None = None
    generated_at: datetime
    generated_by: str
    format: str
