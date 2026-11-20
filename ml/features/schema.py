"""Feature definitions shared by training and serving (one code path, one version)."""
from __future__ import annotations

FEATURE_VERSION = "fv1"

TXN_TYPE_CODES = {
    "wallet_transfer": 0, "merchant_payment": 1, "cash_out": 2,
    "cash_in": 3, "mobile_recharge": 4, "bill_payment": 5,
}
RECIPIENT_TYPE_CODES = {"customer": 0, "merchant": 1, "agent": 2, "biller": 3}

# Engine 1 - transaction risk (supervised, every risk pattern).
TRANSACTION_FEATURES = [
    "amount_log", "txn_type_code", "hour_sin", "hour_cos", "is_night", "hist_count", "baseline_ready",
    "amount_ratio_median", "amount_zlog", "amount_over_p95", "daily_volume_ratio", "hour_share",
    "velocity_10m", "velocity_1h", "velocity_24h", "distinct_recipients_1h",
    "is_new_recipient", "recipient_prior_count", "is_new_device", "device_age_h", "device_wallet_count",
    "device_txn_1h", "is_new_location", "location_age_h", "dist_from_anchor_km", "speed_kmh",
    "session_age_s", "session_failed", "recipient_fan_in_24h", "recipient_out_1h",
    "passthrough_ratio", "sender_in_24h_amount_log", "recipient_type_code",
]

# Engine 2 - behavioural anomaly (unsupervised deviation from the customer's own history).
BEHAVIOR_FEATURES = [
    "amount_zlog", "amount_ratio_log", "hour_share", "is_new_recipient", "is_new_device",
    "is_new_location", "dist_from_anchor_log", "velocity_1h", "daily_volume_ratio", "session_failed",
    "distinct_recipients_1h", "is_night",
]

# Engine 3 - WalletGuard account-takeover model (device / location / session / behaviour).
WALLETGUARD_FEATURES = [
    "amount_ratio_median", "amount_zlog", "amount_over_p95", "hour_share", "is_night", "hour_sin",
    "hour_cos", "is_new_device", "device_age_h", "device_global_age_h", "device_wallet_count",
    "is_new_location", "location_age_h", "dist_from_anchor_km", "speed_kmh", "session_age_s",
    "session_failed", "session_txn_index", "is_new_recipient", "recipient_prior_count",
    "velocity_10m", "velocity_1h", "distinct_recipients_1h", "daily_volume_ratio",
    "baseline_ready", "hist_count",
]

# Human-readable names used in explanations.
FEATURE_LABELS = {
    "amount_log": "Transaction amount", "txn_type_code": "Transaction type",
    "hour_sin": "Time of day", "hour_cos": "Time of day", "is_night": "Night-time activity",
    "hist_count": "Amount of prior history", "baseline_ready": "Established baseline",
    "amount_ratio_median": "Amount vs historical median", "amount_zlog": "Amount deviation",
    "amount_over_p95": "Amount vs historical 95th percentile", "daily_volume_ratio": "Daily volume deviation",
    "hour_share": "Typical transaction hours", "velocity_10m": "10-minute transaction velocity",
    "velocity_1h": "Hourly transaction velocity", "velocity_24h": "Daily transaction count",
    "distinct_recipients_1h": "Distinct recipients in the last hour", "is_new_recipient": "New recipient",
    "recipient_prior_count": "Prior transfers to recipient", "is_new_device": "New device",
    "device_age_h": "Device familiarity", "device_global_age_h": "Device registration recency",
    "device_wallet_count": "Wallets sharing the device", "device_txn_1h": "Device activity (1 hour)",
    "is_new_location": "New location", "location_age_h": "Location familiarity",
    "dist_from_anchor_km": "Distance from usual location", "speed_kmh": "Implied travel speed",
    "session_age_s": "Time from login to transaction", "session_failed": "Failed login attempts",
    "session_txn_index": "Transactions in session", "recipient_fan_in_24h": "Recipient inbound fan-in",
    "recipient_out_1h": "Recipient outbound activity", "passthrough_ratio": "Funds pass-through ratio",
    "sender_in_24h_amount_log": "Inbound funds in the last 24 hours", "recipient_type_code": "Recipient type",
    "amount_ratio_log": "Amount deviation", "dist_from_anchor_log": "Distance from usual location",
}
