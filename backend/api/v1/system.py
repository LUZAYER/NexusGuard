"""System health, statistics, and configuration management router."""
from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user, record_audit, require_permission
from backend.core.config import get_settings
from backend.database.session import get_db
from backend.models import (
    Alert,
    Case,
    Customer,
    Device,
    NetworkEdge,
    NetworkNode,
    SystemConfig,
    Transaction,
    User,
    Wallet,
)
from backend.schemas.system import HealthCheckResponse, SystemStatsResponse
from ml.config import ARTIFACT_DIR, default_config

router = APIRouter(prefix="/system", tags=["System & Infrastructure"])
START_TIME = time.time()


@router.get("/health", response_model=HealthCheckResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check across Postgres DB, ML artifacts, and Ollama LLM service."""
    # 1. DB check
    db_status = "HEALTHY"
    db_latency_ms = 0
    try:
        t0 = time.perf_counter()
        db.execute(text("SELECT 1"))
        db_latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    except Exception as exc:
        db_status = f"UNHEALTHY: {exc}"

    # 2. ML Artifacts check
    txn_art = (ARTIFACT_DIR / "transaction_risk" / "txn_model_v1.2.0.joblib").exists()
    anom_art = (ARTIFACT_DIR / "anomaly_detection" / "anomaly_model_v1.1.0.joblib").exists()
    wg_art = (ARTIFACT_DIR / "walletguard" / "walletguard_v1.0.0.joblib").exists()
    ml_healthy = txn_art and anom_art and wg_art
    ml_info = {
        "status": "HEALTHY" if ml_healthy else "DEGRADED",
        "artifacts_present": {
            "transaction_risk": txn_art,
            "anomaly_detection": anom_art,
            "walletguard": wg_art,
        },
    }

    # 3. Ollama service check
    settings = get_settings()
    ollama_status = "UNKNOWN"
    ollama_models = []
    try:
        resp = httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=1.5)
        if resp.status_code == 200:
            ollama_status = "HEALTHY"
            ollama_models = [m.get("name") for m in resp.json().get("models", [])]
        else:
            ollama_status = f"HTTP_{resp.status_code}"
    except Exception:
        ollama_status = "OFFLINE"

    overall_status = "HEALTHY" if (db_status == "HEALTHY" and ml_healthy) else "DEGRADED"

    return HealthCheckResponse(
        status=overall_status,
        timestamp=datetime.now(timezone.utc),
        version="1.0.0",
        database={
            "status": db_status,
            "latency_ms": db_latency_ms,
            "dialect": "PostgreSQL 16",
        },
        ml_models=ml_info,
        llm_service={
            "status": ollama_status,
            "endpoint": settings.ollama_base_url,
            "primary_model": settings.ollama_model,
            "fallback_model": settings.ollama_fallback_model,
            "available_models": ollama_models,
        },
    )


@router.get("/stats", response_model=SystemStatsResponse)
def get_system_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return platform dataset volume and graph scale statistics."""
    tx_count = db.scalar(select(func.count(Transaction.id))) or 0
    w_count = db.scalar(select(func.count(Wallet.id))) or 0
    c_count = db.scalar(select(func.count(Customer.id))) or 0
    d_count = db.scalar(select(func.count(Device.id))) or 0
    a_count = db.scalar(select(func.count(Alert.id))) or 0
    case_count = db.scalar(select(func.count(Case.id))) or 0
    node_count = db.scalar(select(func.count(NetworkNode.id))) or 0
    edge_count = db.scalar(select(func.count(NetworkEdge.id))) or 0

    # Approximate database size
    size_res = db.execute(
        text("SELECT pg_database_size(current_database()) / (1024 * 1024.0)")
    ).scalar() or 0.0

    return SystemStatsResponse(
        total_transactions=tx_count,
        total_wallets=w_count,
        total_customers=c_count,
        total_devices=d_count,
        total_alerts=a_count,
        total_cases=case_count,
        graph_nodes=node_count,
        graph_edges=edge_count,
        db_size_mb=round(float(size_res), 2),
    )


@router.get("/config")
def get_system_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve runtime risk engine weights and decision thresholds."""
    cfg = default_config()
    db_cfg = db.scalar(select(SystemConfig).where(SystemConfig.key == "risk_thresholds"))
    if db_cfg:
        return {"source": "database_override", "config": db_cfg.value, "version": db_cfg.version}
    return {"source": "default_yaml", "config": cfg, "version": 1}


@router.put("/config")
def update_system_config(
    new_config: dict[str, Any],
    current_user: User = Depends(require_permission("system:config")),
    db: Session = Depends(get_db),
):
    """Update risk engine thresholds or engine weights (requires admin permission)."""
    db_cfg = db.scalar(select(SystemConfig).where(SystemConfig.key == "risk_thresholds"))
    if not db_cfg:
        db_cfg = SystemConfig(
            key="risk_thresholds",
            value=new_config,
            version=1,
            updated_by_id=current_user.id,
        )
        db.add(db_cfg)
    else:
        db_cfg.value = new_config
        db_cfg.version += 1
        db_cfg.updated_by_id = current_user.id
        db_cfg.updated_at = datetime.now(timezone.utc)

    db.commit()

    record_audit(
        db=db,
        user=current_user,
        action="update_system_config",
        resource_type="system_config",
        resource_id="risk_thresholds",
        metadata={"new_version": db_cfg.version},
    )

    return {"status": "SUCCESS", "version": db_cfg.version, "config": db_cfg.value}


# -------------------------------------------------------------
# Database View & Schema Explorer
# -------------------------------------------------------------
@router.get("/database/overview")
def get_database_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all database tables, live row counts, and sizes on disk."""
    tables_sql = """
    SELECT 
        t.table_name,
        COALESCE(s.n_live_tup, 0) as row_count,
        pg_total_relation_size(quote_ident(t.table_name)) as size_bytes,
        pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name))) as size_pretty,
        (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
    FROM information_schema.tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    ORDER BY row_count DESC;
    """
    rows = db.execute(text(tables_sql)).all()

    total_size_mb = db.execute(
        text("SELECT round(pg_database_size(current_database()) / (1024 * 1024.0), 2)")
    ).scalar() or 0.0

    tables = [
        {
            "name": r[0],
            "row_count": int(r[1]),
            "size_bytes": int(r[2]),
            "size_pretty": str(r[3]),
            "column_count": int(r[4]),
        }
        for r in rows
    ]

    total_rows = sum(t["row_count"] for t in tables)

    return {
        "database": "sentinelflow",
        "engine": "PostgreSQL 16 (Alpine)",
        "host": "localhost:5433",
        "total_tables": len(tables),
        "total_rows": total_rows,
        "total_size_mb": float(total_size_mb),
        "tables": tables,
    }


@router.get("/database/tables/{table_name}")
def get_table_data(
    table_name: str,
    page: int = 1,
    page_size: int = 25,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve column schema and paginated rows from a specific database table."""
    import math

    # Validate table exists in public schema to prevent SQL injection
    table_check = db.execute(
        text("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = :t"),
        {"t": table_name},
    ).scalar()
    if not table_check:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' does not exist.")

    # Get column metadata
    col_sql = """
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = :t
    ORDER BY ordinal_position;
    """
    col_rows = db.execute(text(col_sql), {"t": table_name}).all()
    columns = [
        {"name": c[0], "type": c[1], "nullable": c[2] == "YES"}
        for c in col_rows
    ]

    # Get row count
    count_sql = f"SELECT count(*) FROM {table_name}"
    total = db.execute(text(count_sql)).scalar() or 0

    # Fetch rows
    offset = max(0, (page - 1) * page_size)
    data_sql = f"SELECT * FROM {table_name} LIMIT :limit OFFSET :offset"
    data_rows = db.execute(text(data_sql), {"limit": page_size, "offset": offset}).mappings().all()

    # Convert to JSON serializable objects
    rows = []
    for r in data_rows:
        row_dict = {}
        for k, v in r.items():
            if hasattr(v, "isoformat"):
                row_dict[k] = v.isoformat()
            elif isinstance(v, uuid.UUID):
                row_dict[k] = str(v)
            elif isinstance(v, Decimal):
                row_dict[k] = float(v)
            else:
                row_dict[k] = v
        rows.append(row_dict)

    return {
        "table_name": table_name,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total > 0 else 1,
        "columns": columns,
        "rows": rows,
    }


@router.post("/database/query")
def execute_readonly_query(
    payload: dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute a read-only SQL query on the database and return the results."""
    import re
    raw_query = payload.get("query", "").strip()
    if not raw_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    norm = raw_query.lower()
    first_word = norm.split()[0] if norm.split() else ""
    if first_word not in ["select", "explain", "with", "show"]:
        raise HTTPException(status_code=400, detail="Only read-only SELECT, EXPLAIN, or WITH queries are permitted.")

    disallowed = ["insert", "update", "delete", "drop", "alter", "truncate", "create", "grant", "revoke"]
    for kw in disallowed:
        if re.search(r'\b' + kw + r'\b', norm):
            raise HTTPException(status_code=400, detail=f"Forbidden statement keyword '{kw.upper()}' in read-only query.")

    t0 = time.perf_counter()
    try:
        res = db.execute(text(raw_query)).mappings().all()
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
        columns = list(res[0].keys()) if res else []
        rows = []
        for r in res[:200]:
            row_dict = {}
            for k, v in r.items():
                if hasattr(v, "isoformat"):
                    row_dict[k] = v.isoformat()
                elif isinstance(v, uuid.UUID):
                    row_dict[k] = str(v)
                elif isinstance(v, Decimal):
                    row_dict[k] = float(v)
                elif hasattr(v, "__str__") and not isinstance(v, (int, float, bool, list, dict, type(None))):
                    row_dict[k] = str(v)
                else:
                    row_dict[k] = v
            rows.append(row_dict)

        return {
            "status": "SUCCESS",
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "execution_time_ms": elapsed_ms,
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

