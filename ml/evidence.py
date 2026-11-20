"""Evidence Engine: Generates structured, explainable evidence cards for investigation."""
from __future__ import annotations

from typing import Any

import pandas as pd


def generate_evidence_cards(
    row: pd.Series | dict[str, Any],
    profile: dict[str, Any] | None = None,
    txn_meta: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Synthesize structured evidence cards comparing event against baseline and thresholds."""
    cards = []
    r = dict(row)
    prof = profile or {}
    meta = txn_meta or {}

    rank = 1

    # 1. New Device
    if r.get("is_new_device", 0) == 1:
        dev_code = str(meta.get("device_code", r.get("device", "Unknown")))
        known_devs = prof.get("known_devices", ["None recorded"])
        baseline_str = ", ".join(known_devs) if isinstance(known_devs, list) else str(known_devs)
        cards.append({
            "signal": "new_device",
            "category": "walletguard",
            "severity": "high",
            "source": "WalletGuard ATO Engine",
            "value": dev_code,
            "baseline": baseline_str,
            "explanation": f"Device {dev_code} has not previously been associated with this customer profile.",
            "confidence": 0.97,
            "rank": rank,
            "details": {
                "device_code": dev_code,
                "first_seen_hours_ago": float(r.get("device_age_h", 0)),
                "shared_wallets": int(r.get("device_wallet_count", 1)),
            },
        })
        rank += 1

    # 2. Amount Deviation
    ratio = float(r.get("amount_ratio_median", 1.0))
    current_amt = float(meta.get("amount", r.get("amount", 0.0)))
    hist_median = float(r.get("hist_median", prof.get("normal_transaction_amount", {}).get("median", 1350.0)))
    if ratio >= 3.0:
        severity = "critical" if ratio >= 10.0 else "high"
        cards.append({
            "signal": "amount_deviation",
            "category": "behavior",
            "severity": severity,
            "source": "Behavioral Anomaly Engine",
            "value": f"৳{current_amt:,.0f}",
            "baseline": f"৳{hist_median:,.0f} median",
            "explanation": f"Transaction amount ৳{current_amt:,.0f} is {ratio:.1f}× the customer's historical median.",
            "confidence": 0.95,
            "rank": rank,
            "details": {
                "current_amount": current_amt,
                "historical_median": hist_median,
                "deviation_ratio": round(ratio, 2),
                "z_score": round(float(r.get("amount_zlog", 0)), 2),
            },
        })
        rank += 1

    # 3. Unusual Time
    if r.get("is_night", 0) == 1 and r.get("hour_share", 0.5) < 0.15:
        curr_hour_f = float(r.get("local_hour", 2.2))
        h_int = int(curr_hour_f)
        m_int = int((curr_hour_f - h_int) * 60)
        curr_time_str = f"{h_int:02d}:{m_int:02d}"
        normal_hours = prof.get("normal_transaction_hours", ["18:00 - 23:00"])
        norm_str = ", ".join(normal_hours) if isinstance(normal_hours, list) else str(normal_hours)
        cards.append({
            "signal": "unusual_time",
            "category": "walletguard",
            "severity": "medium",
            "source": "WalletGuard Behavioral Engine",
            "value": curr_time_str,
            "baseline": norm_str,
            "explanation": f"Customer normally transacts during {norm_str}. Current transaction occurred at {curr_time_str}.",
            "confidence": 0.92,
            "rank": rank,
            "details": {
                "current_time": curr_time_str,
                "historical_window": norm_str,
                "hour_frequency_share": round(float(r.get("hour_share", 0)), 3),
            },
        })
        rank += 1

    # 4. New Recipient
    if r.get("is_new_recipient", 0) == 1:
        rec_code = str(meta.get("recipient_wallet_code", r.get("recipient_wallet", "Unknown")))
        cards.append({
            "signal": "new_recipient",
            "category": "transaction",
            "severity": "high",
            "source": "Transaction Risk Engine",
            "value": rec_code,
            "baseline": f"{len(prof.get('known_recipients', []))} established recipients",
            "explanation": f"Recipient wallet {rec_code} has not previously appeared in the customer's transaction history.",
            "confidence": 0.94,
            "rank": rank,
            "details": {
                "recipient_code": rec_code,
                "prior_transfers": 0,
            },
        })
        rank += 1

    # 5. High Velocity
    v10 = float(r.get("velocity_10m", 1.0))
    if v10 >= 3:
        severity = "critical" if v10 >= 5 else "high"
        cards.append({
            "signal": "high_velocity",
            "category": "walletguard",
            "severity": severity,
            "source": "WalletGuard Session Intelligence",
            "value": f"{int(v10)} transfers / 10m",
            "baseline": "1 transfer / day normal avg",
            "explanation": f"Rapid velocity burst: {int(v10)} transactions attempted within 10 minutes.",
            "confidence": 0.96,
            "rank": rank,
            "details": {
                "velocity_10m": int(v10),
                "velocity_1h": int(r.get("velocity_1h", v10)),
            },
        })
        rank += 1

    # 6. New Location
    if r.get("is_new_location", 0) == 1:
        loc_code = str(meta.get("location_name", r.get("location", "Unknown")))
        known_locs = prof.get("known_locations", ["Dhaka"])
        base_loc = ", ".join(known_locs) if isinstance(known_locs, list) else str(known_locs)
        cards.append({
            "signal": "new_location",
            "category": "walletguard",
            "severity": "medium",
            "source": "Device & Location Intelligence",
            "value": loc_code,
            "baseline": base_loc,
            "explanation": f"Activity recorded in {loc_code}, outside established customer territory ({base_loc}).",
            "confidence": 0.90,
            "rank": rank,
            "details": {
                "current_location": loc_code,
                "known_locations": known_locs,
            },
        })
        rank += 1

    # 7. Network / Mule Concentration
    fan_in = float(r.get("recipient_fan_in_24h", 0))
    if fan_in >= 6:
        cards.append({
            "signal": "suspicious_network",
            "category": "network",
            "severity": "high" if fan_in >= 12 else "medium",
            "source": "Network Intelligence Engine",
            "value": f"{int(fan_in)} inbound wallets",
            "baseline": "< 3 normal inbound",
            "explanation": f"Recipient wallet exhibits high fan-in concentration ({int(fan_in)} unique senders within 24 hours), consistent with mule collection activity.",
            "confidence": 0.91,
            "rank": rank,
            "details": {
                "inbound_wallet_count": int(fan_in),
                "passthrough_ratio": round(float(r.get("passthrough_ratio", 0)), 2),
            },
        })
        rank += 1

    return cards
