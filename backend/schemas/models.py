"""Model performance & governance schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ModelVersionItem(BaseModel):
    name: str
    version: str
    feature_version: str
    algorithm: str
    trained_at: datetime
    metrics: dict[str, Any]
    benchmark_label: str
    is_active: bool
