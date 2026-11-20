"""NEXUSGUARD Trust Intelligence Platform - FastAPI Backend Main Application."""
from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.v1.audit import router as audit_router
from backend.api.v1.auth import router as auth_router
from backend.api.v1.cases import router as cases_router
from backend.api.v1.customers import router as customers_router
from backend.api.v1.dashboard import router as dashboard_router
from backend.api.v1.demo import router as demo_router
from backend.api.v1.investigations import router as investigations_router
from backend.api.v1.models import router as models_router
from backend.api.v1.network import router as network_router
from backend.api.v1.reports import router as reports_router
from backend.api.v1.system import router as system_router
from backend.api.v1.transactions import router as transactions_router
from backend.api.v1.walletguard import router as walletguard_router
from backend.core.config import get_settings
from backend.core.exceptions import SentinelError
from backend.core.logging import configure_logging

configure_logging()
log = logging.getLogger("nexusguard.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting NEXUSGUARD Financial Crime Intelligence Platform API")
    settings = get_settings()
    log.info(f"Environment: {settings.environment} | Database: {settings.database_url}")
    yield
    log.info("Shutting down NEXUSGUARD API")


app = FastAPI(
    title="NEXUSGUARD Financial Crime Intelligence Platform API",
    version="1.0.0",
    description="Real-Time Trust Intelligence & WalletGuard Platform for Mobile Financial Services",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "Content-Disposition", "X-Report-Code"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """Add unique Request ID and compute execution latency."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    t0 = time.perf_counter()

    response = await call_next(request)

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = str(latency_ms)

    # Log non-health checks
    if not request.url.path.endswith("/health"):
        log.info(
            f"[{request_id[:8]}] {request.method} {request.url.path} -> {response.status_code} ({latency_ms}ms)"
        )
    return response


@app.exception_handler(SentinelError)
async def sentinel_exception_handler(request: Request, exc: SentinelError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.code,
            "message": exc.message,
            "details": exc.details,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "http_error",
            "message": exc.detail,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", None)
    log.error(f"Unhandled server exception [{req_id}]: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "internal_server_error",
            "message": "An internal server error occurred.",
            "request_id": req_id,
        },
    )


# Mount API V1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(dashboard_router, prefix=api_v1_prefix)
app.include_router(transactions_router, prefix=api_v1_prefix)
app.include_router(walletguard_router, prefix=api_v1_prefix)
app.include_router(customers_router, prefix=api_v1_prefix)
app.include_router(network_router, prefix=api_v1_prefix)
app.include_router(cases_router, prefix=api_v1_prefix)
app.include_router(investigations_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(models_router, prefix=api_v1_prefix)
app.include_router(audit_router, prefix=api_v1_prefix)
app.include_router(system_router, prefix=api_v1_prefix)
app.include_router(demo_router, prefix=api_v1_prefix)


@app.get("/")
def root():
    return {
        "service": "NEXUSGUARD Financial Crime Intelligence Platform API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/api/v1/system/health",
        "status": "OPERATIONAL",
    }
