"""Transparent, configurable multi-engine risk aggregation."""
from __future__ import annotations

from typing import Any

from ml.config import default_config, risk_level


def aggregate_risk_scores(
    scores: dict[str, float | None],
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Aggregate individual engine risk scores into a unified 0-100 overall risk score.
    
    Expected keys in `scores`:
    - 'transaction_risk': float (0-100) or None
    - 'behavior_risk': float (0-100) or None
    - 'ato_risk': float (0-100) or None
    - 'network_risk': float (0-100) or None
    """
    cfg = config or default_config()
    weights_cfg = cfg.get("risk", {})
    corroboration_cfg = weights_cfg.get("corroboration", {})

    weight_map = {
        "transaction_risk": float(weights_cfg.get("transaction_weight", 0.30)),
        "behavior_risk": float(weights_cfg.get("behavior_weight", 0.25)),
        "ato_risk": float(weights_cfg.get("ato_weight", 0.30)),
        "network_risk": float(weights_cfg.get("network_weight", 0.15)),
    }

    # Identify available engines
    available = {k: float(v) for k, v in scores.items() if v is not None and k in weight_map}
    if not available:
        return {
            "overall_risk": 0.0,
            "risk_level": "low",
            "confidence": 0.50,
            "engines_available": [],
            "breakdown": {},
        }

    # Re-normalize weights if some engines are missing
    total_avail_weight = sum(weight_map[k] for k in available)
    if total_avail_weight <= 0:
        total_avail_weight = 1.0

    normalized_weights = {k: weight_map[k] / total_avail_weight for k in available}

    # Base weighted sum
    base_score = sum(normalized_weights[k] * available[k] for k in available)

    # Corroboration uplift: multiple independent engines in agreement on high risk (>75)
    engine_high_threshold = float(corroboration_cfg.get("engine_high_threshold", 75))
    bonus_per_engine = float(corroboration_cfg.get("bonus_per_additional_engine", 2.0))
    max_bonus = float(corroboration_cfg.get("max_bonus", 8.0))

    high_engines = [k for k, s in available.items() if s >= engine_high_threshold]
    corroboration_bonus = 0.0
    if len(high_engines) >= 2:
        corroboration_bonus = min((len(high_engines) - 1) * bonus_per_engine, max_bonus)

    final_score = min(max(base_score + corroboration_bonus, 0.0), 100.0)
    final_score = round(final_score, 1)

    # Primary signal: engine with the maximum risk contribution
    contributions = {k: normalized_weights[k] * available[k] for k in available}
    primary_engine = max(contributions, key=contributions.get)

    confidence = min(0.85 + (len(available) / 4.0) * 0.10 + (final_score / 100.0) * 0.04, 0.98)

    return {
        "overall_risk": final_score,
        "risk_level": risk_level(final_score, cfg),
        "confidence": round(confidence, 2),
        "primary_signal": primary_engine,
        "engines_available": list(available.keys()),
        "breakdown": {k: round(v, 1) for k, v in available.items()},
        "weights": {k: round(w, 3) for k, w in normalized_weights.items()},
        "corroboration_bonus": corroboration_bonus,
    }
