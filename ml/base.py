"""Common interface for all SentinelFlow risk models."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import pandas as pd


class RiskModel(ABC):
    """Abstract base class for risk and anomaly detection engines."""

    @abstractmethod
    def predict(self, features: pd.DataFrame) -> pd.DataFrame:
        """Compute risk predictions.
        
        Returns a DataFrame with at least:
        - score: float in range [0, 100]
        - confidence: float in range [0, 1.0]
        - risk_level: str ('low', 'moderate', 'high', 'critical')
        """
        pass

    @abstractmethod
    def explain(self, features: pd.DataFrame, top_k: int = 5) -> list[dict[str, Any]]:
        """Compute structured explanations for why predictions were made.
        
        Returns a list of dicts (one per row) containing top positive/negative contributors.
        """
        pass

    @abstractmethod
    def metadata(self) -> dict[str, Any]:
        """Return model metadata, version, algorithm, training timestamp, and metrics."""
        pass
