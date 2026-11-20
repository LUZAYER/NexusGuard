"""Auth and User Pydantic schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: "UserSummary"


class UserSummary(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    permissions: list[str] = []


class UserListItem(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    role_display_name: str
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None = None
    permissions: list[str] = []


class CreateUserRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "fraud_analyst"


TokenResponse.model_rebuild()

