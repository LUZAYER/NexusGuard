"""Assemble the synthetic dataset (entities, sessions, transactions) as DataFrames."""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd

from data.generator import baseline, geo, scenarios
from data.generator.baseline import DAY_S, World

NAMESPACE = uuid.UUID("5e17b3f0-0a11-4c44-9c11-5e17f10a0001")
LOCAL_UTC_OFFSET_H = 6          # Asia/Dhaka (UTC+6), no DST
RESERVED_TXN_CODE = "TXN-982173"
FIRST_TXN_NUMBER = 800_000


def det_uuid(kind: str, key: str) -> uuid.UUID:
    """Deterministic UUID so seeding is reproducible."""
    return uuid.uuid5(NAMESPACE, f"{kind}:{key}")


@dataclass
class Dataset:
    seed: int
    start_local: datetime
    days: int
    locations: pd.DataFrame
    customers: pd.DataFrame
    wallets: pd.DataFrame
    merchants: pd.DataFrame
    devices: pd.DataFrame
    sessions: pd.DataFrame
    transactions: pd.DataFrame
    demo: dict


def _utc(start_local: datetime, seconds: float | pd.Series):
    base = (start_local - timedelta(hours=LOCAL_UTC_OFFSET_H)).replace(tzinfo=timezone.utc)
    if isinstance(seconds, pd.Series):
        return pd.to_datetime(base) + pd.to_timedelta(seconds, unit="s")
    return base + timedelta(seconds=float(seconds))


def generate_dataset(
    *,
    seed: int = 20261007,
    as_of_local: datetime = datetime(2026, 10, 7, 23, 59, 59),
    days: int = 120,
    n_customers: int = 20_000,
    n_merchants: int = 2_000,
    n_agents: int = 150,
    target_baseline_txns: int = 205_000,
    n_ato: int = 300,
    n_mule: int = 80,
    n_velocity: int = 150,
    n_behavior: int = 400,
    n_device: int = 40,
) -> Dataset:
    rng = np.random.default_rng(seed)
    start_local = datetime(as_of_local.year, as_of_local.month, as_of_local.day) - timedelta(days=days - 1)

    world = baseline.build_world(rng, n_customers=n_customers, n_merchants=n_merchants,
                                 n_agents=n_agents, days=days)
    baseline.generate_baseline(world, target_total=target_baseline_txns)
    state = scenarios.inject_all(world, n_ato=n_ato, n_mule=n_mule, n_velocity=n_velocity,
                                 n_behavior=n_behavior, n_device=n_device)
    return _assemble(world, state, seed, start_local)


def _assemble(world: World, state, seed: int, start_local: datetime) -> Dataset:
    rng = world.rng
    cust = world.customers

    # ---- locations -------------------------------------------------------------------------
    locations = pd.DataFrame(
        [{"code": c, "name": n, "division": d, "latitude": la, "longitude": lo}
         for c, n, d, la, lo, _ in geo.LOCATIONS]
    )

    # ---- customers / wallets / merchants -----------------------------------------------------
    customers = pd.DataFrame({
        "code": [c.code for c in cust],
        "display_name": [c.name for c in cust],
        "persona": [c.persona for c in cust],
        "kyc_level": [c.kyc_level for c in cust],
        "home_location": [c.home_loc for c in cust],
        "opened_at": [_utc(start_local, c.opened_at_s) for c in cust],
    })
    wallets = pd.DataFrame({
        "code": [f"WAL-{c.wallet_num}" for c in cust],
        "customer": [c.code for c in cust],
        "wallet_type": [c.wallet_type for c in cust],
        "opened_at": [_utc(start_local, c.opened_at_s) for c in cust],
    })
    merchants = pd.DataFrame([
        {"code": m["code"], "name": m["name"], "category": m["category"],
         "wallet": f"WAL-{cust[i].wallet_num}"}
        for i, m in world.merchants.items()
    ])

    # ---- devices -------------------------------------------------------------------------------
    devices = pd.DataFrame([
        {"code": d["code"], "platform": d["platform"], "model_label": d["model_label"],
         "first_seen_at": _utc(start_local, d["first_seen_s"])}
        for d in world.devices.values()
    ])

    # ---- transactions -----------------------------------------------------------------------
    tx = pd.DataFrame(world.txns).sort_values(["t", "customer"], kind="stable").reset_index(drop=True)
    tx["amount"] = tx["amount"].round(2)
    wallet_code = np.array([f"WAL-{c.wallet_num}" for c in cust])
    cust_code = np.array([c.code for c in cust])
    mer_code = np.array([world.merchants[i]["code"] if i in world.merchants else None for i in range(len(cust))],
                        dtype=object)
    tx["customer_code"] = cust_code[tx["customer"]]
    tx["wallet_code"] = wallet_code[tx["wallet"]]
    tx["recipient_wallet_code"] = wallet_code[tx["recipient"]]
    tx["merchant_code"] = np.where(tx["merchant"] >= 0, mer_code[tx["merchant"].clip(lower=0)], None)

    codes = [""] * len(tx)
    n = FIRST_TXN_NUMBER
    reserved_row = None
    for i, gt in enumerate(tx["gt"]):
        if isinstance(gt, dict) and gt.get("scenario_label") == "F" and gt.get("step") == 1 \
                and gt.get("scenario_type") == "account_takeover":
            reserved_row = i
    for i in range(len(tx)):
        if i == reserved_row:
            codes[i] = RESERVED_TXN_CODE
            continue
        if f"TXN-{n}" == RESERVED_TXN_CODE:
            n += 1
        codes[i] = f"TXN-{n}"
        n += 1
    tx["code"] = codes
    tx["occurred_at"] = _utc(start_local, tx["t"])

    # ---- sessions ---------------------------------------------------------------------------
    tx = tx.sort_values(["customer", "t"], kind="stable").reset_index(drop=True)
    prev_c, prev_t = tx["customer"].shift(), tx["t"].shift()
    new_group = (
        (tx["customer"] != prev_c) | ((tx["t"] - prev_t) > 1200)
        | (tx["device"] != tx["device"].shift()) | (tx["location"] != tx["location"].shift())
    )
    tx["session_idx"] = new_group.cumsum() - 1
    anomalous = tx["gt"].map(lambda g: bool(isinstance(g, dict) and g.get("is_anomalous")))
    grp = tx.groupby("session_idx")
    sess = grp.agg(
        customer=("customer", "first"), device=("device", "first"), location=("location", "first"),
        first_t=("t", "min"), last_t=("t", "max"), failed=("failed", "max"), lead=("lead_s", "first"),
    )
    sess["anom"] = anomalous.groupby(tx["session_idx"]).max()
    lead = sess["lead"].astype(float)
    lead = lead.where(lead.notna(), pd.Series(rng.uniform(20, 200, len(sess)), index=sess.index))
    sess["started_s"] = sess["first_t"] - lead
    sess["duration_seconds"] = (sess["last_t"] - sess["started_s"] + rng.uniform(10, 90, len(sess))).round().astype(int)
    noise = rng.poisson(0.04, len(sess))
    sess["failed_attempts"] = np.where(sess["anom"], sess["failed"], np.maximum(sess["failed"], noise)).astype(int)
    sessions = pd.DataFrame({
        "idx": sess.index,
        "customer": cust_code[sess["customer"]],
        "wallet": wallet_code[sess["customer"]],
        "device": sess["device"], "location": sess["location"],
        "started_at": _utc(start_local, sess["started_s"]),
        "duration_seconds": sess["duration_seconds"].values,
        "auth_method": rng.choice(["pin", "biometric", "otp"], len(sess), p=[0.55, 0.35, 0.10]),
        "failed_attempts": sess["failed_attempts"].values,
    })
    tx = tx.sort_values(["t", "customer"], kind="stable").reset_index(drop=True)

    transactions = pd.DataFrame({
        "code": tx["code"], "occurred_at": tx["occurred_at"],
        "customer": tx["customer_code"], "wallet": tx["wallet_code"],
        "recipient_wallet": tx["recipient_wallet_code"], "merchant": tx["merchant_code"],
        "device": tx["device"], "location": tx["location"], "session_idx": tx["session_idx"],
        "amount": tx["amount"], "txn_type": tx["type"], "ground_truth": tx["gt"],
    })

    demo = {k: v for k, v in state.demo.items()}
    demo_codes: dict[str, list[str]] = {}
    code_by_key = {(r["customer"], r["t"]): r["code"] for _, r in tx.iterrows()
                   if isinstance(r["gt"], dict) and r["gt"].get("scenario_label") in ("A", "B", "C", "D", "E", "F")}
    for label, d in demo.items():
        rows = d.get("rows") or [d["row"]]
        demo_codes[label] = [code_by_key[(r["customer"], r["t"])] for r in rows if (r["customer"], r["t"]) in code_by_key]
    return Dataset(
        seed=seed, start_local=start_local, days=world.days, locations=locations, customers=customers,
        wallets=wallets, merchants=merchants, devices=devices, sessions=sessions,
        transactions=transactions, demo=demo_codes,
    )
