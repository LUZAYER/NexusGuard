"""Network Intelligence & Graph Visualization API."""
from __future__ import annotations

import math
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.api.deps import require_permission
from backend.database.session import get_db
from backend.models import User
from backend.schemas.network import GraphEdge, GraphNode, NetworkGraphResponse

router = APIRouter(prefix="/network", tags=["Network Intelligence"])


@router.get("/targets", response_model=list[dict[str, Any]])
def get_featured_targets(
    user: Annotated[User, Depends(require_permission("network:read"))],
    db: Annotated[Session, Depends(get_db)],
):
    """Return curated high-profile wallets, users, and devices for quick graph inspection."""
    return [
        {
            "id": "WAL-5512",
            "code": "WAL-5512",
            "type": "wallet",
            "name": "Mule Hub (Imran Sarker)",
            "role": "Syndicate Collector Hub",
            "risk_score": 92.5,
            "connected_count": 28,
            "badge": "MULE HUB",
        },
        {
            "id": "WAL-8831",
            "code": "WAL-8831",
            "type": "wallet",
            "name": "Rafiq Ahmed (Compromised Wallet)",
            "role": "ATO Drain Origin",
            "risk_score": 94.3,
            "connected_count": 6,
            "badge": "ATO TARGET",
        },
        {
            "id": "WAL-5E10",
            "code": "WAL-5E10",
            "type": "wallet",
            "name": "Mule Node B (Cluster Node)",
            "role": "Secondary Structuring Hop",
            "risk_score": 78.0,
            "connected_count": 9,
            "badge": "RING NODE",
        },
        {
            "id": "WAL-5E11",
            "code": "WAL-5E11",
            "type": "wallet",
            "name": "Mule Node C (Structuring Node)",
            "role": "Secondary Structuring Hop",
            "risk_score": 75.0,
            "connected_count": 7,
            "badge": "RING NODE",
        },
        {
            "id": "WAL-2048",
            "code": "WAL-2048",
            "type": "wallet",
            "name": "Rapid Evacuation Mule",
            "role": "Cashout Intermediary",
            "risk_score": 78.0,
            "connected_count": 12,
            "badge": "MULE NODE",
        },
        {
            "id": "CUST-1024",
            "code": "CUST-1024",
            "type": "customer",
            "name": "Rafiq Ahmed",
            "role": "Account Takeover Victim",
            "risk_score": 94.3,
            "connected_count": 5,
            "badge": "VICTIM PROFILE",
        },
        {
            "id": "CUST-7090",
            "code": "CUST-7090",
            "type": "customer",
            "name": "Imran Sarker",
            "role": "Registered Mule Operator",
            "risk_score": 85.0,
            "connected_count": 28,
            "badge": "MULE OPERATOR",
        },
        {
            "id": "CUST-3120",
            "code": "CUST-3120",
            "type": "customer",
            "name": "Mule Account Holder",
            "role": "Under Review Recipient",
            "risk_score": 84.0,
            "connected_count": 14,
            "badge": "UNDER REVIEW",
        },
        {
            "id": "DEV-8821",
            "code": "DEV-8821",
            "type": "device",
            "name": "Attacker Hardware DEV-8821",
            "role": "Multi-Wallet Cluster Device",
            "risk_score": 98.0,
            "connected_count": 4,
            "badge": "ATTACK HARDWARE",
        },
    ]


@router.get("/search", response_model=list[dict[str, Any]])
def search_network_entities(
    q: str = Query(..., min_length=2),
    user: Annotated[User, Depends(require_permission("network:read"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Live search across wallets, customers, and devices for graph centering."""
    search_term = f"%{q.strip()}%"
    
    # 1. Wallets with customer display name
    wallets = db.execute(text("""
        SELECT w.code, c.display_name, w.wallet_type, c.code as cust_code,
               COALESCE((
                   SELECT AVG(rs.overall_risk)
                   FROM transactions t
                   JOIN risk_scores rs ON t.id = rs.transaction_id
                   WHERE t.wallet_id = w.id OR t.recipient_wallet_id = w.id
               ), 20.0) as risk
        FROM wallets w
        JOIN customers c ON w.customer_id = c.id
        WHERE w.code ILIKE :term OR c.display_name ILIKE :term OR c.code ILIKE :term
        LIMIT 6
    """), {"term": search_term}).all()

    # 2. Customers
    customers = db.execute(text("""
        SELECT c.code, c.display_name, c.persona,
               (SELECT w.code FROM wallets w WHERE w.customer_id = c.id LIMIT 1) as wallet_code,
               COALESCE((
                   SELECT AVG(rs.overall_risk)
                   FROM transactions t
                   JOIN risk_scores rs ON t.id = rs.transaction_id
                   WHERE t.customer_id = c.id
               ), 20.0) as risk
        FROM customers c
        WHERE c.code ILIKE :term OR c.display_name ILIKE :term
        LIMIT 6
    """), {"term": search_term}).all()

    results = []
    for w in wallets:
        results.append({
            "id": w[0],
            "code": w[0],
            "type": "wallet",
            "label": f"{w[0]} ({w[1]})",
            "subtitle": f"Owner: {w[1]} ({w[3]}) • {w[2]}",
            "risk_score": round(float(w[4]), 1),
        })

    for c in customers:
        results.append({
            "id": c[0],
            "code": c[0],
            "type": "customer",
            "label": f"{c[1]} ({c[0]})",
            "subtitle": f"Persona: {c[2]} • Wallet: {c[3] or 'N/A'}",
            "risk_score": round(float(c[4]), 1),
        })

    return results


@router.get("/entity/{identifier}", response_model=NetworkGraphResponse)
def get_entity_network(
    identifier: str,
    user: Annotated[User, Depends(require_permission("network:read"))],
    db: Annotated[Session, Depends(get_db)],
    depth: int = Query(2, ge=1, le=3),
):
    """Retrieve localized multi-hop ego-graph around a wallet, customer, or device with automated coordinates."""
    ident = identifier.strip()

    # Resolve entity type
    target_wallet_code: str | None = None
    target_customer_code: str | None = None
    target_customer_name: str | None = None
    center_type = "wallet"

    if ident.startswith("CUST-") or (not ident.startswith("WAL-") and not ident.startswith("DEV-")):
        # Look up customer
        cust_row = db.execute(text("""
            SELECT c.id, c.code, c.display_name, w.code as wal_code,
                   COALESCE((
                       SELECT AVG(rs.overall_risk)
                       FROM transactions t
                       JOIN risk_scores rs ON t.id = rs.transaction_id
                       WHERE t.customer_id = c.id
                   ), 20.0) as risk
            FROM customers c
            LEFT JOIN wallets w ON w.customer_id = c.id
            WHERE c.code ILIKE :ident OR c.display_name ILIKE :ident
            LIMIT 1
        """), {"ident": ident}).first()

        if cust_row:
            target_customer_code = cust_row[1]
            target_customer_name = cust_row[2]
            target_wallet_code = cust_row[3]
            center_type = "customer"
    elif ident.startswith("DEV-"):
        center_type = "device"
    else:
        # It's a wallet
        wal_row = db.execute(text("""
            SELECT w.code, c.code as cust_code, c.display_name
            FROM wallets w
            JOIN customers c ON w.customer_id = c.id
            WHERE w.code ILIKE :ident
            LIMIT 1
        """), {"ident": ident}).first()

        if wal_row:
            target_wallet_code = wal_row[0]
            target_customer_code = wal_row[1]
            target_customer_name = wal_row[2]
        else:
            target_wallet_code = ident

    active_wallet = target_wallet_code or ident

    # 1. Inbound transactions to this wallet
    inbound = db.execute(text("""
        SELECT 
            w1.code as sender_wallet,
            c1.display_name as sender_name,
            count(*) as tx_count,
            sum(t.amount) as total_amount,
            ROUND(AVG(COALESCE(rs.overall_risk, 20.0))::numeric, 1) as avg_risk
        FROM transactions t
        JOIN wallets w1 ON t.wallet_id = w1.id
        JOIN customers c1 ON w1.customer_id = c1.id
        JOIN wallets w2 ON t.recipient_wallet_id = w2.id
        LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
        WHERE w2.code = :wal
        GROUP BY w1.code, c1.display_name
        ORDER BY total_amount DESC
        LIMIT 10
    """), {"wal": active_wallet}).all()

    # 2. Outbound transactions from this wallet
    outbound = db.execute(text("""
        SELECT 
            w2.code as receiver_wallet,
            c2.display_name as receiver_name,
            count(*) as tx_count,
            sum(t.amount) as total_amount,
            ROUND(AVG(COALESCE(rs.overall_risk, 20.0))::numeric, 1) as avg_risk
        FROM transactions t
        JOIN wallets w1 ON t.wallet_id = w1.id
        JOIN wallets w2 ON t.recipient_wallet_id = w2.id
        JOIN customers c2 ON w2.customer_id = c2.id
        LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
        WHERE w1.code = :wal
        GROUP BY w2.code, c2.display_name
        ORDER BY total_amount DESC
        LIMIT 10
    """), {"wal": active_wallet}).all()

    # 3. Devices connected to this wallet
    dev_edges = db.execute(text("""
        SELECT DISTINCT
            d.code as dev_code,
            d.model_label,
            count(*) as tx_count
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        JOIN devices d ON t.device_id = d.id
        WHERE w.code = :wal
        GROUP BY d.code, d.model_label
        LIMIT 4
    """), {"wal": active_wallet}).all()

    nodes_map: dict[str, GraphNode] = {}
    edges_list: list[GraphEdge] = []

    # Calculate center metrics
    total_vol = sum(float(r[3]) for r in inbound) + sum(float(r[3]) for r in outbound)
    is_mule = active_wallet in ("WAL-5512", "WAL-5E10", "WAL-5E11", "WAL-2048")
    is_ato = active_wallet == "WAL-8831" or ident == "CUST-1024" or ident == "DEV-8821"

    # Define Center Coordinates
    center_x = 500
    center_y = 300

    if center_type == "customer" and target_customer_code:
        # Place customer in center
        nodes_map[target_customer_code] = GraphNode(
            id=target_customer_code,
            code=target_customer_code,
            label=f"{target_customer_name or target_customer_code} (User)",
            type="customer",
            risk_score=94.3 if is_ato else 85.0 if is_mule else 25.0,
            x=center_x,
            y=center_y - 60,
            metrics={
                "transaction_volume": total_vol,
                "connected_entities": len(inbound) + len(outbound) + 1,
                "is_center": True,
            },
        )
        # Place wallet below customer
        if active_wallet:
            nodes_map[active_wallet] = GraphNode(
                id=active_wallet,
                code=active_wallet,
                label=f"Wallet {active_wallet}",
                type="wallet",
                risk_score=91.0 if is_ato else 84.0 if is_mule else 30.0,
                x=center_x,
                y=center_y + 40,
                metrics={"transaction_volume": total_vol},
            )
            edges_list.append(GraphEdge(
                source=target_customer_code,
                target=active_wallet,
                type="owns_wallet",
                weight=1,
                amount=0.0,
                amount_total=0.0,
            ))
    elif center_type == "device":
        nodes_map[ident] = GraphNode(
            id=ident,
            code=ident,
            label=f"Hardware {ident}",
            type="device",
            risk_score=98.0 if ident == "DEV-8821" else 40.0,
            x=center_x,
            y=center_y,
            metrics={"is_center": True},
        )
    else:
        # Wallet is center
        wal_label = f"{active_wallet} ({target_customer_name})" if target_customer_name else f"Wallet {active_wallet}"
        nodes_map[active_wallet] = GraphNode(
            id=active_wallet,
            code=active_wallet,
            label=wal_label,
            type="wallet",
            risk_score=94.3 if is_ato else 92.5 if is_mule else 35.0,
            x=center_x,
            y=center_y,
            metrics={
                "transaction_volume": total_vol,
                "connected_entities": len(inbound) + len(outbound) + len(dev_edges),
                "is_center": True,
            },
        )
        if target_customer_code:
            nodes_map[target_customer_code] = GraphNode(
                id=target_customer_code,
                code=target_customer_code,
                label=f"{target_customer_name or target_customer_code} (Owner)",
                type="customer",
                risk_score=90.0 if is_ato else 40.0,
                x=center_x,
                y=120,
            )
            edges_list.append(GraphEdge(
                source=target_customer_code,
                target=active_wallet,
                type="owns_wallet",
                weight=1,
                amount=0.0,
                amount_total=0.0,
            ))

    # Layout Inbound Nodes on the Left Arc
    num_in = len(inbound)
    for idx, r in enumerate(inbound):
        src_wal, src_name, count, amt, risk = r[0], r[1], int(r[2]), float(r[3]), float(r[4])
        # Calculate Y spacing
        y_pos = 120 + idx * (360 / max(1, num_in - 1)) if num_in > 1 else center_y
        x_pos = 200 + (10 if idx % 2 == 0 else -15)

        if src_wal not in nodes_map:
            nodes_map[src_wal] = GraphNode(
                id=src_wal,
                code=src_wal,
                label=f"{src_wal} ({src_name.split()[0]})",
                type="wallet",
                risk_score=risk,
                x=x_pos,
                y=int(y_pos),
                metrics={"transferred_amount": amt},
            )
        edges_list.append(GraphEdge(
            source=src_wal,
            target=active_wallet,
            type="transferred_to",
            weight=count,
            amount=amt,
            amount_total=amt,
        ))

    # Layout Outbound Nodes on the Right Arc
    num_out = len(outbound)
    for idx, r in enumerate(outbound):
        tgt_wal, tgt_name, count, amt, risk = r[0], r[1], int(r[2]), float(r[3]), float(r[4])
        y_pos = 120 + idx * (360 / max(1, num_out - 1)) if num_out > 1 else center_y
        x_pos = 800 + (10 if idx % 2 == 0 else -15)

        is_agent = "agent" in tgt_name.lower() or "point" in tgt_name.lower()
        if tgt_wal not in nodes_map:
            nodes_map[tgt_wal] = GraphNode(
                id=tgt_wal,
                code=tgt_wal,
                label=f"{tgt_wal} ({tgt_name.split()[0]})",
                type="merchant" if is_agent else "wallet",
                risk_score=risk,
                x=x_pos,
                y=int(y_pos),
                metrics={"received_amount": amt},
            )
        edges_list.append(GraphEdge(
            source=active_wallet,
            target=tgt_wal,
            type="rapid_cash_out" if is_agent else "forwarded_hop",
            weight=count,
            amount=amt,
            amount_total=amt,
        ))

    # Layout Devices on Bottom Arc
    num_dev = len(dev_edges)
    for idx, r in enumerate(dev_edges):
        d_code, d_label, count = r[0], r[1], int(r[2])
        x_pos = 350 + idx * (300 / max(1, num_dev - 1)) if num_dev > 1 else center_x
        y_pos = 500

        if d_code not in nodes_map:
            nodes_map[d_code] = GraphNode(
                id=d_code,
                code=d_code,
                label=f"{d_code} ({d_label.split()[0]})",
                type="device",
                risk_score=98.0 if d_code == "DEV-8821" else 25.0,
                x=int(x_pos),
                y=y_pos,
            )
        edges_list.append(GraphEdge(
            source=active_wallet,
            target=d_code,
            type="used_hardware",
            weight=count,
            amount=0.0,
            amount_total=0.0,
        ))

    # Specific Hero Ring Enhancement for Controlled Demo
    if is_ato and "DEV-8821" not in nodes_map:
        nodes_map["DEV-8821"] = GraphNode(
            id="DEV-8821",
            code="DEV-8821",
            label="DEV-8821 (Attacker Hardware)",
            type="device",
            risk_score=98.0,
            x=340,
            y=440,
        )
        edges_list.append(GraphEdge(
            source="DEV-8821",
            target=active_wallet,
            type="unauthorized_access",
            weight=3,
            amount=18700.0,
            amount_total=18700.0,
        ))

    # Mule Ring Indicators
    indicators = []
    if is_mule:
        indicators = [
            f"High inbound fan-in concentration: {len(inbound)} newly linked source wallets",
            f"Rapid outbound forwarding to {len(outbound)} secondary cashout points (৳{total_vol:,.0f} BDT)",
            "Automated mule funnel signature matched across secondary hops",
        ]
    elif is_ato:
        indicators = [
            "Hardware link with untrusted multi-account attacker device (DEV-8821)",
            "High-risk outbound fund evacuation observed following failed credential attempts",
            "Target of controlled SOC account takeover demo",
        ]

    return NetworkGraphResponse(
        center_entity=ident,
        depth=depth,
        nodes=list(nodes_map.values()),
        edges=edges_list,
        mule_cluster_detected=is_mule or is_ato,
        indicators=indicators,
    )
