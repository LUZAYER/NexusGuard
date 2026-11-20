"""Pydantic schema for structured AI investigation report."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AIInvestigationReport(BaseModel):
    """Structured report schema validated against LLM outputs."""

    summary: str = Field(
        description="High-level narrative summary of the incident and risk profile."
    )
    key_risk_indicators: list[str] = Field(
        description="Bulleted primary risk indicators drawn strictly from evidence."
    )
    behavioral_analysis: str = Field(
        description="Comparison of current activity against historical customer baseline."
    )
    network_context: str = Field(
        description="Topological and recipient network context, mule risk, or device sharing."
    )
    recommended_investigation_steps: list[str] = Field(
        description="Actionable, prioritized investigation steps for the human analyst."
    )
    missing_information: list[str] = Field(
        default_factory=list,
        description="Information gaps or data points needed before final determination."
    )
    confidence_assessment: str = Field(
        default="High confidence based on multiple corroborated behavioral and device signals.",
        description="Analyst-facing assessment of model confidence and data limitations."
    )
    limitations: list[str] = Field(
        default_factory=lambda: [
            "AI findings are advisory and based on synthetic demo observations.",
            "Decision authority remains strictly with the human investigator.",
        ],
        description="Explicit limitations and caveats."
    )
    advisory_notice: str = (
        "Generated from structured SentinelFlow evidence. "
        "AI output is advisory and does not make financial or account decisions."
    )
