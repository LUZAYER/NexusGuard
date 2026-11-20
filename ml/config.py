"""Risk configuration loader shared by the ML pipeline, backend and data tooling.

Defaults live in ``config/risk.yaml``. Runtime overrides (set by administrators and stored in
the database) are deep-merged on top of those defaults by ``merge_config``.
"""
from __future__ import annotations

import copy
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG_PATH = REPO_ROOT / "config" / "risk.yaml"
ARTIFACT_DIR = REPO_ROOT / "ml" / "artifacts"

ENGINE_WEIGHT_KEYS = ("transaction_weight", "behavior_weight", "ato_weight", "network_weight")


class ConfigError(ValueError):
    """Raised when a risk configuration is structurally invalid."""


@lru_cache(maxsize=1)
def _load_default() -> dict[str, Any]:
    with DEFAULT_CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def default_config() -> dict[str, Any]:
    """Return a fresh deep copy of the packaged default configuration."""
    return copy.deepcopy(_load_default())


def merge_config(base: dict[str, Any], overrides: dict[str, Any] | None) -> dict[str, Any]:
    """Deep-merge ``overrides`` into a copy of ``base``."""
    merged = copy.deepcopy(base)
    for key, value in (overrides or {}).items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = merge_config(merged[key], value)
        else:
            merged[key] = value
    return merged


def validate_config(config: dict[str, Any]) -> None:
    """Validate invariants that scoring relies on. Raises ``ConfigError``."""
    risk = config.get("risk", {})
    weights = [float(risk.get(k, -1)) for k in ENGINE_WEIGHT_KEYS]
    if any(w < 0 for w in weights):
        raise ConfigError("All engine weights must be present and non-negative.")
    if abs(sum(weights) - 1.0) > 0.001:
        raise ConfigError(f"Engine weights must sum to 1.0 (got {sum(weights):.3f}).")
    levels = config.get("levels", {})
    ordered = [levels.get(k) for k in ("low", "moderate", "high", "critical")]
    if None in ordered or ordered != sorted(ordered) or ordered[0] != 0 or ordered[-1] > 100:
        raise ConfigError("Risk levels must be ascending, start at 0 and not exceed 100.")
    wg = config.get("walletguard", {})
    if abs(float(wg.get("model_weight", 0)) + float(wg.get("rules_weight", 0)) - 1.0) > 0.001:
        raise ConfigError("WalletGuard model_weight + rules_weight must equal 1.0.")


def risk_level(score: float, config: dict[str, Any]) -> str:
    """Map a 0-100 score onto the SentinelFlow taxonomy (LOW/MODERATE/HIGH/CRITICAL)."""
    levels = config["levels"]
    if score >= levels["critical"]:
        return "critical"
    if score >= levels["high"]:
        return "high"
    if score >= levels["moderate"]:
        return "moderate"
    return "low"
