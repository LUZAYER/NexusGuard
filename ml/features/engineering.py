"""Point-in-time feature engineering.

One vectorised code path is used for training (whole dataset) and serving (a customer's history
plus the cross-entity context of one transaction). Every feature for a transaction is computed
from information available *at that transaction's timestamp* (no look-ahead).
"""
from __future__ import annotations

import bisect
from dataclasses import asdict, dataclass
from typing import Any

import numpy as np
import pandas as pd

from data.generator.geo import haversine_km
from ml.features.schema import FEATURE_VERSION, RECIPIENT_TYPE_CODES, TXN_TYPE_CODES

LOCAL_UTC_OFFSET_S = 6 * 3600
KEY_SCALE = 10**10          # composite keys: entity_int * KEY_SCALE + epoch seconds
PAIR_SCALE = 10**7


@dataclass(frozen=True)
class PopulationStats:
    """Population priors used while an individual baseline is still thin. Saved with the models."""

    median: float = 1100.0
    p95: float = 9000.0
    log_mean: float = 7.0
    log_std: float = 1.3
    daily_floor: float = 300.0
    shrinkage: float = 3.0

    @classmethod
    def from_amounts(cls, amounts: pd.Series) -> "PopulationStats":
        logs = np.log(amounts.clip(lower=1.0))
        return cls(float(amounts.median()), float(amounts.quantile(0.95)), float(logs.mean()), float(logs.std()))

    def to_dict(self) -> dict[str, float]:
        return asdict(self)


REQUIRED_COLUMNS = [
    "txn_id", "ts", "wallet", "recipient_wallet", "device", "location", "session_id", "amount",
    "txn_type", "recipient_type", "session_started_at", "session_failed", "device_first_seen",
]


def _seconds(series: pd.Series) -> np.ndarray:
    ts = pd.to_datetime(series, utc=True)
    return ((ts - pd.Timestamp("1970-01-01", tz="UTC")).dt.total_seconds()).to_numpy(dtype=np.float64)


def _group_cumsum(values: np.ndarray, start_pos: np.ndarray) -> np.ndarray:
    """Inclusive cumulative sum restarting at each group (``start_pos`` = group start index per row)."""
    cs = np.cumsum(values, axis=0)
    base = cs[start_pos] - values[start_pos]
    return cs - base


def _group_starts(first_flag: np.ndarray) -> np.ndarray:
    idx = np.arange(len(first_flag))
    return np.maximum.accumulate(np.where(first_flag, idx, 0))


def _distinct_in_window(prev: np.ndarray, left: np.ndarray, right: np.ndarray, max_window: int = 120) -> np.ndarray:
    """Distinct-entity count over inclusive position windows [left, right].

    An element is the *first* of its entity inside the window iff its previous occurrence sits
    before ``left``. ``prev`` holds, per position, the position of the previous occurrence (or -1).
    """
    count = np.zeros(len(left), dtype=np.int32)
    for k in range(max_window):
        idx = right - k
        valid = (idx >= left) & (right >= left)
        if not valid.any():
            break
        safe = np.where(valid, idx, 0)
        count += (valid & (prev[safe] < left)).astype(np.int32)
    return count


def _prev_same_pair(pair_key: np.ndarray) -> np.ndarray:
    pos = pd.Series(np.arange(len(pair_key)))
    prev = pos.groupby(pair_key).shift(1)
    return prev.fillna(-1).to_numpy(dtype=np.int64)


def _window_sum(keys: np.ndarray, csum: np.ndarray, entity: np.ndarray, ts: np.ndarray, window: int):
    """Count and amount-sum of rows of ``entity`` in (ts-window, ts] on a (entity, time)-sorted array."""
    hi = np.searchsorted(keys, entity * KEY_SCALE + ts, side="right")
    lo = np.searchsorted(keys, entity * KEY_SCALE + ts - window, side="right")
    csum0 = np.concatenate([[0.0], csum])
    return (hi - lo), (csum0[hi] - csum0[lo])


def compute_features(
    df: pd.DataFrame,
    coords: dict[str, tuple[float, float]],
    config: dict[str, Any],
    pop: PopulationStats | None = None,
) -> pd.DataFrame:
    """Compute the full feature table; returns one row per input row, in input order."""
    pop = pop or PopulationStats()
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Feature input is missing columns: {missing}")
    nov = config["novelty"]
    min_hist = int(nov["min_history_for_baseline"])
    night_hours = set(nov["night_hours"])
    n = len(df)
    if n == 0:
        return pd.DataFrame(columns=["txn_id"])

    d = df.reset_index(drop=True)
    ts_all = _seconds(d["ts"]).astype(np.int64)
    amount_all = d["amount"].to_numpy(dtype=np.float64)

    codes, _ = pd.factorize(pd.concat([d["wallet"], d["recipient_wallet"]], ignore_index=True))
    w_all, r_all = codes[:n].astype(np.int64), codes[n:].astype(np.int64)
    dev_all = pd.factorize(d["device"])[0].astype(np.int64)
    loc_all = d["location"].to_numpy(dtype=object)
    row_ids = np.arange(n)

    # ---- order A: by sender wallet, then time -----------------------------------------------------
    oA = np.lexsort((row_ids, ts_all, w_all))
    invA = np.empty(n, dtype=np.int64)
    invA[oA] = row_ids
    ts = ts_all[oA]
    w = w_all[oA]
    r = r_all[oA]
    amt = amount_all[oA]
    dev = dev_all[oA]
    pos = row_ids
    first = np.r_[True, w[1:] != w[:-1]]
    start = _group_starts(first)
    hist_count = pos - start

    local_ts = ts + LOCAL_UTC_OFFSET_S
    hour_f = (local_ts % 86400) / 3600.0
    hour_i = hour_f.astype(int) % 24
    day = local_ts // 86400
    is_night = np.isin(hour_i, list(night_hours)).astype(np.int8)

    # ---- amount baselines (prior history only) -------------------------------------------------
    med = np.full(n, np.nan)
    p95 = np.full(n, np.nan)
    sl: list[float] = []
    for i in range(n):
        if first[i]:
            sl = []
        m = len(sl)
        if m:
            med[i] = sl[m // 2] if m % 2 else 0.5 * (sl[m // 2 - 1] + sl[m // 2])
            p95[i] = sl[min(int(0.95 * (m - 1) + 0.5), m - 1)]
        bisect.insort(sl, amt[i])
    logs = np.log(np.clip(amt, 1.0, None))
    cs1 = _group_cumsum(logs, start) - logs
    cs2 = _group_cumsum(logs**2, start) - logs**2
    cnt = np.maximum(hist_count, 1)
    mean_l = np.where(hist_count > 0, cs1 / cnt, pop.log_mean)
    var_l = np.where(hist_count > 1, np.maximum(cs2 / cnt - mean_l**2, 0.0), pop.log_std**2)
    k = pop.shrinkage
    mean_eff = (hist_count * mean_l + k * pop.log_mean) / (hist_count + k)
    var_eff = (hist_count * var_l + k * pop.log_std**2) / (hist_count + k)
    std_eff = np.maximum(np.sqrt(var_eff), 0.35)
    use_own = hist_count >= 3
    med_eff = np.where(use_own, med, pop.median)
    p95_eff = np.where(use_own, p95, pop.p95)
    amount_ratio = amt / np.maximum(med_eff, 50.0)
    amount_over_p95 = amt / np.maximum(p95_eff, 50.0)
    amount_z = (logs - mean_eff) / std_eff

    # ---- typical hours (prior circular hour histogram) -----------------------------------------
    H = np.zeros((n, 24), dtype=np.float32)
    H[pos, hour_i] = 1.0
    prior_h = _group_cumsum(H, start) - H
    window = prior_h[pos, (hour_i - 1) % 24] + prior_h[pos, hour_i] + prior_h[pos, (hour_i + 1) % 24]
    hour_share = np.where(hist_count >= 3, window / np.maximum(hist_count, 1), 0.3)
    del H, prior_h

    # ---- daily volume -------------------------------------------------------------------------
    newday = first | np.r_[True, day[1:] != day[:-1]]
    dstart = _group_starts(newday)
    day_sum = _group_cumsum(amt, dstart)
    cum_all = _group_cumsum(amt, start)
    days_before = _group_cumsum(newday.astype(np.float64), start) - 1.0
    before_today = cum_all - day_sum
    avg_daily = np.where(days_before > 0, before_today / np.maximum(days_before, 1), np.nan)
    daily_ratio = np.where(days_before > 0, day_sum / np.maximum(avg_daily, pop.daily_floor), 1.0)

    # ---- sender velocity -----------------------------------------------------------------------
    keysA = w * KEY_SCALE + ts
    lefts = {W: np.searchsorted(keysA, keysA - W, side="left") for W in (600, 3600, 86400)}
    v10, v1h, v24 = (pos - lefts[W] + 1 for W in (600, 3600, 86400))
    pairA = w * PAIR_SCALE + r
    prevA = _prev_same_pair(pairA)
    distinct_rec_1h = _distinct_in_window(prevA, lefts[3600], pos)

    # ---- novelty: recipient / device / location (first interaction with this sender) ----------
    def pair_age(entity: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        pair = w * PAIR_SCALE + entity
        s = pd.Series(ts)
        first_ts = s.groupby(pair).transform("min").to_numpy()
        prior = pd.Series(pos).groupby(pair).cumcount().to_numpy()
        return (ts - first_ts) / 3600.0, prior

    rec_age, rec_prior = pair_age(r)
    dev_age, _ = pair_age(dev)
    loc_codes = pd.factorize(loc_all[oA])[0].astype(np.int64)
    loc_age, loc_prior = pair_age(loc_codes)
    ready = hist_count >= min_hist
    applicable = (d["txn_type"].to_numpy(dtype=object)[oA] != "cash_in")
    is_new_rec = ((rec_age <= nov["recipient_window_hours"]) & ready & applicable).astype(np.int8)
    is_new_dev = ((dev_age <= nov["device_window_hours"]) & ready).astype(np.int8)
    is_new_loc = ((loc_age <= nov["location_window_hours"]) & ready).astype(np.int8)

    dev_first_seen = d["device_first_seen"]
    dev_global_age = (
        (ts_all - _seconds(dev_first_seen.fillna(pd.Timestamp("2000-01-01", tz="UTC")))) / 3600.0
    )[oA]
    dev_global_age = np.clip(dev_global_age, 0, 24 * 365)

    # ---- device sharing (point-in-time) ----------------------------------------------------------
    pair_dw = pd.DataFrame({"dev": dev, "w": w, "ts": ts}).groupby(["dev", "w"], as_index=False)["ts"].min()
    pair_keys = np.sort(pair_dw["dev"].to_numpy(dtype=np.int64) * KEY_SCALE + pair_dw["ts"].to_numpy(dtype=np.int64))
    dev_wallets = (np.searchsorted(pair_keys, dev * KEY_SCALE + ts, side="right")
                   - np.searchsorted(pair_keys, dev * KEY_SCALE, side="left"))
    oD = np.lexsort((pos, ts, dev))
    keysD = (dev * KEY_SCALE + ts)[oD]
    cntD, _ = _window_sum(keysD, amt[oD], dev, ts, 3600)
    dev_txn_1h = cntD

    # ---- geography -------------------------------------------------------------------------------
    lat = pd.Series(loc_all[oA]).map(lambda c: coords.get(c, (np.nan, np.nan))[0]).to_numpy(dtype=float)
    lon = pd.Series(loc_all[oA]).map(lambda c: coords.get(c, (np.nan, np.nan))[1]).to_numpy(dtype=float)
    a_lat = pd.Series(lat).groupby(w).transform("first").to_numpy()
    a_lon = pd.Series(lon).groupby(w).transform("first").to_numpy()
    dist_anchor = np.nan_to_num(haversine_km(lat, lon, a_lat, a_lon))
    p_lat = pd.Series(lat).groupby(w).shift(1).to_numpy()
    p_lon = pd.Series(lon).groupby(w).shift(1).to_numpy()
    p_ts = pd.Series(ts.astype(float)).groupby(w).shift(1).to_numpy()
    dist_prev = np.nan_to_num(haversine_km(lat, lon, p_lat, p_lon))
    dt_h = np.nan_to_num((ts - p_ts) / 3600.0, nan=1e6)
    speed = np.where(dist_prev > 0, dist_prev / np.maximum(dt_h, 0.05), 0.0)
    speed = np.clip(speed, 0, 3000)

    # ---- session ---------------------------------------------------------------------------------
    sess_start = _seconds(d["session_started_at"].fillna(d["ts"]))[oA]
    session_age = np.clip(ts - sess_start, 0, 86400)
    session_failed = d["session_failed"].fillna(0).to_numpy(dtype=float)[oA]
    sess_ids = d["session_id"].astype(str).to_numpy()[oA]
    session_idx = pd.Series(pos).groupby(sess_ids).cumcount().to_numpy()

    # ---- recipient / sender network context (point-in-time) ----------------------------------
    oB = np.lexsort((pos, ts, r))
    keysB = (r * KEY_SCALE + ts)[oB]
    amtB = amt[oB]
    csumB = np.cumsum(amtB)
    posB = np.arange(n)
    wB = w[oB]
    rB = r[oB]
    prevB = _prev_same_pair(rB * PAIR_SCALE + wB)
    leftB24 = np.searchsorted(keysB, keysB - 86400, side="left")
    fan_in_B = _distinct_in_window(prevB, leftB24, posB)
    invB = np.empty(n, dtype=np.int64)
    invB[oB] = posB
    fan_in = fan_in_B[invB]

    csumA = np.cumsum(amt)
    out_cnt_1h, _ = _window_sum(keysA, csumA, r, ts, 3600)          # recipient's own outbound activity
    _, out_amt_24h = _window_sum(keysA, csumA, w, ts, 86400)        # sender outbound (incl. current)
    _, in_amt_24h = _window_sum(keysB, csumB, w, ts, 86400)         # sender inbound
    passthrough = np.where(in_amt_24h > 0, np.clip(out_amt_24h / np.maximum(in_amt_24h, 1.0), 0, 5.0), 0.0)

    type_code = d["txn_type"].map(TXN_TYPE_CODES).fillna(0).to_numpy()[oA]
    rtype_code = d["recipient_type"].map(RECIPIENT_TYPE_CODES).fillna(0).to_numpy()[oA]

    out = pd.DataFrame({
        "amount_log": np.log1p(amt),
        "txn_type_code": type_code,
        "hour_sin": np.sin(2 * np.pi * hour_f / 24), "hour_cos": np.cos(2 * np.pi * hour_f / 24),
        "is_night": is_night,
        "hist_count": hist_count,
        "baseline_ready": ready.astype(np.int8),
        "amount_ratio_median": amount_ratio,
        "amount_ratio_log": np.log(np.maximum(amount_ratio, 0.05)),
        "amount_zlog": amount_z,
        "amount_over_p95": amount_over_p95,
        "daily_volume_ratio": daily_ratio,
        "hour_share": hour_share,
        "velocity_10m": v10, "velocity_1h": v1h, "velocity_24h": v24,
        "distinct_recipients_1h": distinct_rec_1h,
        "is_new_recipient": is_new_rec,
        "recipient_prior_count": rec_prior,
        "recipient_age_h": rec_age,
        "is_new_device": is_new_dev,
        "device_age_h": dev_age,
        "device_global_age_h": dev_global_age,
        "device_wallet_count": dev_wallets,
        "device_txn_1h": dev_txn_1h,
        "is_new_location": is_new_loc,
        "location_age_h": loc_age,
        "dist_from_anchor_km": dist_anchor,
        "dist_from_anchor_log": np.log1p(dist_anchor),
        "speed_kmh": speed,
        "dist_prev_km": dist_prev,
        "session_age_s": session_age,
        "session_failed": session_failed,
        "session_txn_index": session_idx,
        "recipient_fan_in_24h": fan_in,
        "recipient_out_1h": out_cnt_1h,
        "passthrough_ratio": passthrough,
        "sender_in_24h_amount_log": np.log1p(in_amt_24h),
        "recipient_type_code": rtype_code,
        # descriptive columns (not model inputs) used by signals and evidence
        "local_hour": hour_f,
        "hist_median": med_eff,
        "hist_p95": p95_eff,
        "sender_in_24h_amount": in_amt_24h,
        "sender_out_24h_amount": out_amt_24h,
    })
    out = out.iloc[invA].reset_index(drop=True)
    out.insert(0, "txn_id", d["txn_id"].to_numpy())
    out.attrs["feature_version"] = FEATURE_VERSION
    return out
