"""Demo scenarios runner router."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user
from backend.database.session import get_db
from backend.models import (
    Alert,
    Customer,
    Device,
    Evidence,
    RiskScore,
    Transaction,
    User,
    Wallet,
)
from backend.schemas.demo import (
    DemoScenarioDetail,
    TriggerDemoRequest,
    TriggerDemoResponse,
)

router = APIRouter(prefix="/demo", tags=["Demo Scenarios"])

SCENARIOS_META = {
    "A": {
        "id": "scenario-a",
        "label": "Scenario A",
        "title": "Baseline Legitimate Transaction",
        "description": "Standard evening peer-to-peer transfer by a loyal customer on their registered device and typical location.",
        "category": "Baseline Normal",
        "customer_code": "CUST-1024",
        "customer_name": "Rafiq Ahmed",
        "transaction_code": "TXN-1010657",
        "wallet_code": "WAL-1024",
        "device_code": "DEV-88A1",
        "expected_signals": ["None (Normal behavioral baseline)"],
        "expected_risk_band": "LOW (< 20.0)",
        "key_findings": [
            "Transaction amount ৳1,300 aligns with historical median (৳1,350)",
            "Executed from primary registered Android smartphone (DEV-88A1)",
            "Known recurrent recipient wallet",
            "Zero authentication anomalies or velocity spikes",
        ],
    },
    "B": {
        "id": "scenario-b",
        "label": "Scenario B",
        "title": "Clean Account Takeover (ATO) & Off-Hours Drain",
        "description": "Unfamiliar device logging in from a distant geographic region at 03:40 AM with prior failed PIN attempts, liquidating wallet balance.",
        "category": "Account Takeover",
        "customer_code": "CUST-3310",
        "customer_name": "Shahin Chowdhury",
        "transaction_code": "TXN-1011109",
        "wallet_code": "WAL-3310",
        "device_code": "DEV-NEW-B",
        "expected_signals": ["new_device", "failed_logins_24h", "far_location", "off_hours"],
        "expected_risk_band": "CRITICAL (> 80.0)",
        "key_findings": [
            "Device first seen 4 hours prior to transaction",
            "2 failed PIN attempts preceding successful authorization",
            "Transferred ৳22,890 to unassociated counterparty",
            "Severe behavioral deviation from typical daytime profile",
        ],
    },
    "C": {
        "id": "scenario-c",
        "label": "Scenario C",
        "title": "Mule Wallet Structuring & Rapid Agent Cash-Out",
        "description": "Stolen or funneled funds received into an intermediary mule wallet are drained via rapid sequential cash-outs at physical agent outlets.",
        "category": "Mule Funneling",
        "customer_code": "CUST-7090",
        "customer_name": "Imran Sarker",
        "transaction_code": "TXN-1011093",
        "wallet_code": "WAL-5512",
        "device_code": "DEV-5E10",
        "expected_signals": ["rapid_drain", "mule_cash_out", "unusual_agent_volume"],
        "expected_risk_band": "HIGH (> 50.0)",
        "key_findings": [
            "Intermediary wallet WAL-5512 received aggregate funds minutes earlier",
            "Immediate sequential cash-outs (৳21,000, ৳17,500, ৳13,800)",
            "Turnaround holding time under 25 minutes (pass-through > 90%)",
            "Physical agent point-of-sale in high-risk distribution cluster",
        ],
    },
    "D": {
        "id": "scenario-d",
        "label": "Scenario D",
        "title": "High-Frequency Velocity Smurfing Attack",
        "description": "Automated burst of micro-transfers executed within minutes to evade single-transaction reporting thresholds.",
        "category": "Velocity Smurfing",
        "customer_code": "CUST-2048",
        "customer_name": "Habib Khan",
        "transaction_code": "TXN-1009853",
        "wallet_code": "WAL-2048",
        "device_code": "DEV-VEL-D",
        "expected_signals": ["high_velocity_10m", "rapid_burst", "structuring_pattern"],
        "expected_risk_band": "ELEVATED BURST",
        "key_findings": [
            "10 outbound transfers initiated within a 4-minute window",
            "Uniform structured amounts below threshold limits",
            "Velocity engine score spikes to 95.0",
            "Automated scripting or compromised API key pattern",
        ],
    },
    "E": {
        "id": "scenario-e",
        "label": "Scenario E",
        "title": "Suspicious Device Sharing & Syndicated Ring",
        "description": "A single hardware device ID observed operating across 8 distinctly owned customer wallets in disparate geographic zones.",
        "category": "Syndicate / Device Sharing",
        "customer_code": "CUST-5393",
        "customer_name": "Ritu Majumder",
        "transaction_code": "TXN-1009907",
        "wallet_code": "WAL-5393",
        "device_code": "DEV-C7D2",
        "expected_signals": ["device_shared_wallets", "graph_cluster", "syndicate_link"],
        "expected_risk_band": "MODERATE / SYNDICATE",
        "key_findings": [
            "Hardware device DEV-C7D2 linked to 8 distinct wallet credentials",
            "Network topology engine identifies high-density bipartite cluster",
            "Repeated authentication switches within brief intervals",
            "Indicative of fraudulent call center or syndicate operation",
        ],
    },
    "F": {
        "id": "scenario-f",
        "label": "Scenario F",
        "title": "Hero Scenario: Combined Attack on CUST-1024",
        "description": "Targeted Account Takeover on Rafiq Ahmed: 3 failed PIN attempts, attacker device DEV-8821, 02:13 AM transfer of ৳18,700 to mule wallet WAL-5512.",
        "category": "Multi-Engine Hero Attack",
        "customer_code": "CUST-1024",
        "customer_name": "Rafiq Ahmed",
        "transaction_code": "TXN-982173",
        "wallet_code": "WAL-1024",
        "device_code": "DEV-8821",
        "expected_signals": [
            "amount_deviation_13x",
            "new_device_attacker_pool",
            "off_hours_02am",
            "failed_logins_spike",
            "known_mule_recipient",
        ],
        "expected_risk_band": "CRITICAL (94.3)",
        "key_findings": [
            "Amount ৳18,700 is 13.8x customer median (৳1,350)",
            "Originates from attacker hardware DEV-8821 registered 15 min prior",
            "Executed at 02:13 AM (customer normal window 18:00 - 23:00)",
            "3 consecutive failed authentication attempts in preceding session",
            "Recipient WAL-5512 is identified mule in 6-node laundering ring",
            "4 corroborating engines trigger full system critical alert",
        ],
    },
}


@router.get("/scenarios", response_model=list[DemoScenarioDetail])
def list_demo_scenarios(current_user: User = Depends(get_current_user)):
    """List pre-configured test scenarios A through F for interactive evaluation."""
    return [DemoScenarioDetail(**s) for s in SCENARIOS_META.values()]


@router.post("/trigger", response_model=TriggerDemoResponse)
def trigger_demo_scenario(
    req: TriggerDemoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger or inspect a demo scenario, retrieving live scoring and structured evidence."""
    # Find matching scenario key
    key = req.scenario_id.upper().replace("SCENARIO-", "")
    if key not in SCENARIOS_META:
        # Try matching by id
        for k, v in SCENARIOS_META.items():
            if v["id"] == req.scenario_id.lower():
                key = k
                break
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scenario '{req.scenario_id}' not found. Available: A, B, C, D, E, F.",
            )

    meta = SCENARIOS_META[key]
    tx_code = meta["transaction_code"]

    tx = db.scalar(select(Transaction).where(Transaction.code == tx_code))
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction {tx_code} for scenario {key} not found.",
        )

    cust = db.scalar(select(Customer).where(Customer.id == tx.customer_id))
    wallet = db.scalar(select(Wallet).where(Wallet.id == tx.wallet_id))
    rs = db.scalar(select(RiskScore).where(RiskScore.transaction_id == tx.id))
    alert = db.scalar(select(Alert).where(Alert.transaction_id == tx.id))

    evidence_records = db.scalars(
        select(Evidence).where(Evidence.transaction_id == tx.id)
    ).all()

    evidence_cards = [
        {
            "code": ev.code,
            "engine": ev.source,
            "severity": ev.severity,
            "title": ev.signal,
            "description": ev.explanation,
            "weight": ev.confidence,
            "observed_value": ev.value,
            "baseline_value": ev.baseline,
            "features": ev.details or {},
        }
        for ev in evidence_records
    ]

    action = "APPROVE"
    if rs and rs.risk_level == "critical":
        action = "AUTO_BLOCK"
    elif rs and rs.risk_level == "high":
        action = "STEP_UP_CHALLENGE"
    elif rs and rs.risk_level == "moderate":
        action = "QUEUE_ANALYST_REVIEW"

    engine_scores = {
        "transaction_risk": rs.transaction_risk if rs else 0.0,
        "behavior_risk": rs.behavior_risk if rs else 0.0,
        "ato_risk": rs.ato_risk if rs else 0.0,
        "network_risk": rs.network_risk if rs else 0.0,
    }

    corroboration_count = sum(1 for s in engine_scores.values() if s >= 70.0)

    return TriggerDemoResponse(
        scenario_id=meta["id"],
        label=meta["label"],
        title=meta["title"],
        transaction_code=tx.code,
        customer_code=cust.code if cust else "UNKNOWN",
        wallet_code=wallet.code if wallet else "UNKNOWN",
        amount=float(tx.amount),
        risk_score=rs.overall_risk if rs else 0.0,
        risk_level=rs.risk_level if rs else "low",
        action_recommended=action,
        corroboration_count=corroboration_count,
        engine_scores=engine_scores,
        evidence_cards=evidence_cards,
        alert_code=alert.code if alert else None,
    )
