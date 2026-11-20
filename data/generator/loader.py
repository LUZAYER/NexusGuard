"""Bulk-load a synthetic dataset into PostgreSQL using COPY (fast, reproducible UUIDs)."""
from __future__ import annotations

import json
import logging
from collections.abc import Iterable, Sequence

import numpy as np
import pandas as pd
from sqlalchemy import Engine, text

from data.generator.build import Dataset, det_uuid

log = logging.getLogger(__name__)

DATA_TABLES = [
    "ai_reports", "investigation_reports", "case_notes", "cases", "alert_transactions", "alerts",
    "evidence", "risk_signals", "model_predictions", "risk_scores", "customer_behavior_profiles",
    "network_edges", "network_nodes", "transactions", "sessions", "merchants", "wallets", "devices",
    "customers", "locations",
]


def _json_default(obj):
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, (np.bool_,)):
        return bool(obj)
    if isinstance(obj, (pd.Timestamp,)):
        return obj.isoformat()
    return str(obj)


def dumps(value) -> str | None:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None
    return json.dumps(value, default=_json_default)


def copy_rows(engine: Engine, table: str, columns: Sequence[str], rows: Iterable[Sequence]) -> int:
    count = 0
    with engine.begin() as conn:
        raw = conn.connection.driver_connection
        with raw.cursor() as cur:
            with cur.copy(f"COPY {table} ({', '.join(columns)}) FROM STDIN") as cp:
                for row in rows:
                    cp.write_row(row)
                    count += 1
    return count


def reset_data(engine: Engine) -> None:
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE " + ", ".join(DATA_TABLES) + " RESTART IDENTITY CASCADE"))
        for seq in ("alert_code_seq", "case_code_seq", "report_code_seq", "evidence_code_seq"):
            conn.execute(text(f"ALTER SEQUENCE {seq} RESTART WITH 1"))


def load_dataset(engine: Engine, ds: Dataset) -> dict[str, int]:
    reset_data(engine)
    counts: dict[str, int] = {}

    counts["locations"] = copy_rows(
        engine, "locations", ["id", "code", "name", "division", "latitude", "longitude"],
        ((det_uuid("loc", r.code), r.code, r.name, r.division, r.latitude, r.longitude)
         for r in ds.locations.itertuples()),
    )
    counts["customers"] = copy_rows(
        engine, "customers",
        ["id", "code", "display_name", "persona", "kyc_level", "home_location_id", "opened_at", "is_synthetic"],
        ((det_uuid("cust", r.code), r.code, r.display_name, r.persona, r.kyc_level,
          det_uuid("loc", r.home_location), r.opened_at, True) for r in ds.customers.itertuples()),
    )
    counts["wallets"] = copy_rows(
        engine, "wallets", ["id", "code", "customer_id", "wallet_type", "status", "opened_at"],
        ((det_uuid("wal", r.code), r.code, det_uuid("cust", r.customer), r.wallet_type, "active", r.opened_at)
         for r in ds.wallets.itertuples()),
    )
    counts["merchants"] = copy_rows(
        engine, "merchants", ["id", "code", "name", "category", "wallet_id"],
        ((det_uuid("mer", r.code), r.code, r.name, r.category, det_uuid("wal", r.wallet))
         for r in ds.merchants.itertuples()),
    )
    counts["devices"] = copy_rows(
        engine, "devices", ["id", "code", "platform", "model_label", "first_seen_at"],
        ((det_uuid("dev", r.code), r.code, r.platform, r.model_label, r.first_seen_at)
         for r in ds.devices.itertuples()),
    )
    counts["sessions"] = copy_rows(
        engine, "sessions",
        ["id", "customer_id", "wallet_id", "device_id", "location_id", "started_at",
         "duration_seconds", "auth_method", "failed_attempts"],
        ((det_uuid("ses", str(r.idx)), det_uuid("cust", r.customer), det_uuid("wal", r.wallet),
          det_uuid("dev", r.device), det_uuid("loc", r.location), r.started_at,
          int(r.duration_seconds), r.auth_method, int(r.failed_attempts))
         for r in ds.sessions.itertuples()),
    )
    tx = ds.transactions
    counts["transactions"] = copy_rows(
        engine, "transactions",
        ["id", "code", "occurred_at", "customer_id", "wallet_id", "recipient_wallet_id", "merchant_id",
         "device_id", "location_id", "session_id", "amount", "currency", "txn_type", "status", "ground_truth"],
        ((det_uuid("txn", r.code), r.code, r.occurred_at, det_uuid("cust", r.customer),
          det_uuid("wal", r.wallet), det_uuid("wal", r.recipient_wallet),
          det_uuid("mer", r.merchant) if isinstance(r.merchant, str) else None,
          det_uuid("dev", r.device), det_uuid("loc", r.location), det_uuid("ses", str(r.session_idx)),
          float(r.amount), "BDT", r.txn_type, "completed", dumps(r.ground_truth))
         for r in tx.itertuples()),
    )
    log.info("loaded dataset", extra={"counts": counts})
    return counts
