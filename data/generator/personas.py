"""Behavioural personas for synthetic customers. All identities are synthetic."""
from __future__ import annotations

from dataclasses import dataclass, field

# (centre hour, std dev in hours, mixture weight)
HourMix = list[tuple[float, float, float]]


@dataclass(frozen=True)
class Persona:
    name: str
    population_share: float          # share of the *retail* population
    rate_per_day: float              # mean transactions/day
    median_amount: float             # BDT, per-customer median is jittered around this
    amount_sigma: float              # log-space dispersion
    hours: HourMix
    type_probs: dict[str, float]
    recipient_pool: tuple[int, int]  # min/max number of established recipients
    new_recipient_prob: float
    extra_devices_prob: float = 0.2
    weekend_factor: float = 1.0
    notes: str = ""
    type_amount_factor: dict[str, float] = field(default_factory=dict)


TYPE_AMOUNT_FACTOR = {
    "wallet_transfer": 1.0,
    "merchant_payment": 0.7,
    "cash_out": 1.6,
    "cash_in": 1.8,
    "mobile_recharge": 0.15,
    "bill_payment": 1.8,
}

_RETAIL_TYPES = {
    "wallet_transfer": 0.36,
    "merchant_payment": 0.30,
    "cash_out": 0.12,
    "mobile_recharge": 0.12,
    "bill_payment": 0.10,
}

PERSONAS: dict[str, Persona] = {
    "dormant": Persona(
        "dormant", 0.52, 0.010, 600, 0.8, [(13, 5.0, 1.0)], _RETAIL_TYPES, (2, 4), 0.15,
        notes="Rarely transacts; baselines are thin so behavioural confidence is low.",
    ),
    "low_frequency": Persona(
        "low_frequency", 0.20, 0.085, 800, 0.8, [(19, 3.5, 0.7), (12, 2.5, 0.3)], _RETAIL_TYPES,
        (3, 7), 0.10,
    ),
    "student": Persona(
        "student", 0.06, 0.25, 350, 0.7, [(21, 2.2, 0.7), (14, 2.0, 0.3)],
        {"wallet_transfer": 0.40, "merchant_payment": 0.25, "cash_out": 0.05,
         "mobile_recharge": 0.25, "bill_payment": 0.05}, (4, 9), 0.10, 0.15,
    ),
    "employee": Persona(
        "employee", 0.08, 0.30, 1400, 0.75, [(13, 1.3, 0.35), (20, 2.0, 0.65)], _RETAIL_TYPES,
        (4, 10), 0.07, 0.2,
    ),
    "freelancer": Persona(
        "freelancer", 0.03, 0.30, 1800, 0.85, [(16, 3.0, 0.5), (23, 2.2, 0.5)], _RETAIL_TYPES,
        (5, 12), 0.10, 0.25,
    ),
    "small_business": Persona(
        "small_business", 0.04, 0.50, 2200, 0.85, [(12, 2.5, 0.6), (18, 2.0, 0.4)],
        {"wallet_transfer": 0.45, "merchant_payment": 0.20, "cash_out": 0.20,
         "mobile_recharge": 0.05, "bill_payment": 0.10}, (8, 20), 0.12, 0.3, 0.9,
    ),
    "high_frequency": Persona(
        "high_frequency", 0.01, 1.20, 900, 0.7, [(12, 3.5, 0.5), (20, 2.5, 0.5)], _RETAIL_TYPES,
        (10, 25), 0.08, 0.3,
    ),
}

# Customers that own merchant / agent wallets (they are part of the 20,000 customers).
MERCHANT_PERSONA = Persona(
    "merchant", 0.0, 0.06, 5000, 0.9, [(14, 3.0, 1.0)],
    {"wallet_transfer": 0.6, "cash_out": 0.3, "bill_payment": 0.1}, (4, 10), 0.05, 0.3,
)
AGENT_PERSONA = Persona(
    "agent", 0.0, 0.50, 3000, 0.8, [(13, 3.5, 1.0)], {"cash_in": 1.0}, (30, 80), 0.3, 0.3,
)

ALL_PERSONAS = {**PERSONAS, "merchant": MERCHANT_PERSONA, "agent": AGENT_PERSONA}

MERCHANT_CATEGORIES = [
    ("Grocery", 0.28), ("Restaurant", 0.16), ("Pharmacy", 0.08), ("Fashion", 0.08),
    ("Electronics", 0.06), ("Transport", 0.07), ("Education", 0.05), ("Utility", 0.06),
    ("Telecom", 0.03), ("Online Marketplace", 0.08), ("Services", 0.05),
]
BILLER_CATEGORIES = {"Utility", "Telecom"}
