"""Domain exceptions mapped to structured API errors."""
from __future__ import annotations


class SentinelError(Exception):
    status_code = 500
    code = "internal_error"

    def __init__(self, message: str, *, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class NotFoundError(SentinelError):
    status_code = 404
    code = "not_found"


class ValidationFailure(SentinelError):
    status_code = 422
    code = "validation_failed"


class AuthenticationError(SentinelError):
    status_code = 401
    code = "authentication_required"


class PermissionDenied(SentinelError):
    status_code = 403
    code = "permission_denied"


class ConflictError(SentinelError):
    status_code = 409
    code = "conflict"


class ServiceUnavailable(SentinelError):
    status_code = 503
    code = "service_unavailable"
