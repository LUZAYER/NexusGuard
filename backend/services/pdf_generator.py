"""Enterprise Financial Security Incident Report PDF Generator."""
from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def generate_incident_report_pdf(data: dict[str, Any]) -> io.BytesIO:
    """Generate a high-fidelity, professional PDF investigation report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748B"),
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
    )
    body_bold = ParagraphStyle(
        "BodyBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0F172A"),
    )
    ai_narrative_style = ParagraphStyle(
        "AINarrative",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#334155"),
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>SENTINELFLOW TRUST INTELLIGENCE</b>", title_style),
            Paragraph("<b>CLASSIFICATION: RESTRICTED / SOC-INTERNAL</b>", ParagraphStyle(
                "Restricted",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8,
                leading=10,
                alignment=2,
                textColor=colors.HexColor("#DC2626"),
            )),
        ],
        [
            Paragraph("Automated Trust Operations & Fraud Incident Investigation Report", subtitle_style),
            Paragraph(f"Report Ref: <b>{data.get('report_code', 'REP-2026-001')}</b>", ParagraphStyle(
                "Ref",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=8.5,
                leading=11,
                alignment=2,
                textColor=colors.HexColor("#475569"),
            )),
        ],
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0F172A"), spaceAfter=10))

    # 2. Executive Incident Summary
    story.append(Paragraph("1. INCIDENT OVERVIEW & ENTITY CONTEXT", section_heading))

    entity_rows = [
        [
            Paragraph("<b>Transaction Ref:</b>", body_bold),
            Paragraph(str(data.get("transaction_code", "N/A")), body_style),
            Paragraph("<b>Execution Time:</b>", body_bold),
            Paragraph(str(data.get("occurred_at", "N/A")), body_style),
        ],
        [
            Paragraph("<b>Customer Name:</b>", body_bold),
            Paragraph(f"{data.get('customer_name', 'N/A')} ({data.get('customer_code', 'N/A')})", body_style),
            Paragraph("<b>Account Wallet:</b>", body_bold),
            Paragraph(str(data.get("wallet_code", "N/A")), body_style),
        ],
        [
            Paragraph("<b>Transaction Amount:</b>", body_bold),
            Paragraph(f"BDT {data.get('amount', 0.0):,.2f}", body_bold),
            Paragraph("<b>Transaction Type:</b>", body_bold),
            Paragraph(str(data.get("txn_type", "N/A")).upper(), body_style),
        ],
        [
            Paragraph("<b>Counterparty Recipient:</b>", body_bold),
            Paragraph(str(data.get("recipient_wallet", "N/A")), body_style),
            Paragraph("<b>Device Hardware:</b>", body_bold),
            Paragraph(str(data.get("device_code", "N/A")), body_style),
        ],
        [
            Paragraph("<b>Overall Risk Tier:</b>", body_bold),
            Paragraph(f"<font color='#DC2626'><b>{data.get('risk_level', 'UNKNOWN').upper()} ({data.get('overall_risk', 0.0):.1f} / 100)</b></font>", body_bold),
            Paragraph("<b>Action Status:</b>", body_bold),
            Paragraph(f"<b>{data.get('recommended_action', 'REVIEW')}</b>", body_style),
        ],
    ]
    entity_table = Table(entity_rows, colWidths=[120, 150, 120, 150])
    entity_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(entity_table)
    story.append(Spacer(1, 10))

    # 3. Multi-Engine Corroboration Breakdown
    story.append(Paragraph("2. MULTI-ENGINE ENSEMBLE RISK EVALUATION", section_heading))
    scores = data.get("engine_scores", {})
    engine_rows = [
        [
            Paragraph("<b>Intelligence Engine</b>", body_bold),
            Paragraph("<b>Weight</b>", body_bold),
            Paragraph("<b>Score (0-100)</b>", body_bold),
            Paragraph("<b>Assessment Status</b>", body_bold),
        ],
        [
            Paragraph("Supervised Transaction Risk (LightGBM)", body_style),
            Paragraph("30%", body_style),
            Paragraph(f"{scores.get('transaction_risk', 0.0):.1f}", body_bold),
            Paragraph("HIGH DEVIATION" if scores.get("transaction_risk", 0) >= 70 else "NORMAL", body_style),
        ],
        [
            Paragraph("Customer Behavioral Anomaly (IsolationForest)", body_style),
            Paragraph("25%", body_style),
            Paragraph(f"{scores.get('behavior_risk', 0.0):.1f}", body_bold),
            Paragraph("EXTREME OUTLIER" if scores.get("behavior_risk", 0) >= 70 else "NORMAL", body_style),
        ],
        [
            Paragraph("WalletGuard Account Takeover (ATO LightGBM)", body_style),
            Paragraph("30%", body_style),
            Paragraph(f"{scores.get('ato_risk', 0.0):.1f}", body_bold),
            Paragraph("CREDENTIAL COMPROMISE" if scores.get("ato_risk", 0) >= 70 else "CLEAN", body_style),
        ],
        [
            Paragraph("Graph Topology & Mule Network (NetworkX)", body_style),
            Paragraph("15%", body_style),
            Paragraph(f"{scores.get('network_risk', 0.0):.1f}", body_bold),
            Paragraph("SYNDICATE CLUSTER LINK" if scores.get("network_risk", 0) >= 70 else "ISOLATED", body_style),
        ],
    ]
    engine_table = Table(engine_rows, colWidths=[240, 70, 90, 140])
    engine_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(engine_table)
    story.append(Spacer(1, 10))

    # 4. Structured Evidence Table
    evidence_cards = data.get("evidence", [])
    if evidence_cards:
        story.append(Paragraph("3. FORENSIC EVIDENCE ARTIFACTS", section_heading))
        ev_rows = [
            [
                Paragraph("<b>Code</b>", body_bold),
                Paragraph("<b>Engine</b>", body_bold),
                Paragraph("<b>Severity</b>", body_bold),
                Paragraph("<b>Forensic Finding</b>", body_bold),
                Paragraph("<b>Observed vs Baseline</b>", body_bold),
            ]
        ]
        for ev in evidence_cards[:6]:
            sev_color = "#DC2626" if ev.get("severity") == "critical" else ("#EA580C" if ev.get("severity") == "high" else "#0284C7")
            ev_rows.append([
                Paragraph(f"<b>{ev.get('code', 'EV-XX')}</b>", body_style),
                Paragraph(str(ev.get("engine", "ml")).upper(), body_style),
                Paragraph(f"<font color='{sev_color}'><b>{ev.get('severity', '').upper()}</b></font>", body_style),
                Paragraph(f"<b>{ev.get('title', '')}</b>: {ev.get('description', '')}", body_style),
                Paragraph(f"Obs: {ev.get('observed_value', 'N/A')}<br/>Base: {ev.get('baseline_value', 'N/A')}", body_style),
            ])
        ev_table = Table(ev_rows, colWidths=[65, 60, 65, 230, 120])
        ev_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#334155")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ]))
        story.append(ev_table)
        story.append(Spacer(1, 10))

    # 5. AI Advisory Narrative (Strictly Structured)
    ai_report = data.get("ai_report", {})
    if ai_report:
        story.append(Paragraph("4. AI ADVISORY INVESTIGATION SYNTHESIS", section_heading))
        synth_data = [
            [
                Paragraph("<b>Executive Summary:</b>", body_bold),
                Paragraph(ai_report.get("executive_summary", "Automated anomaly analysis completed."), ai_narrative_style),
            ],
            [
                Paragraph("<b>Attack Hypothesis:</b>", body_bold),
                Paragraph(ai_report.get("attack_hypothesis", "Suspected targeted credential stuffing / account takeover."), ai_narrative_style),
            ],
            [
                Paragraph("<b>Recommended Containment:</b>", body_bold),
                Paragraph(
                    "<br/>".join([f"• <b>{a.get('action', '')}</b> ({a.get('priority', '')}, SLA: {a.get('sla', '')}): {a.get('rationale', '')}"
                                  for a in ai_report.get("recommended_actions", [])]),
                    ai_narrative_style,
                ),
            ],
        ]
        synth_table = Table(synth_data, colWidths=[130, 410])
        synth_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(synth_table)
        story.append(Spacer(1, 10))

    # 6. Compliance & Sign-off Block
    sign_block = [
        [
            Paragraph("<b>Investigator Sign-Off:</b>", body_bold),
            Paragraph(f"Generated by: {data.get('generated_by', 'reyazul.islam@sentinelflow.demo')}", body_style),
            Paragraph("<b>Digital Signature:</b>", body_bold),
            Paragraph("____________________________", body_style),
        ],
        [
            Paragraph("<b>Regulatory Mandate:</b>", body_bold),
            Paragraph("Bangladesh Bank Circular BRPD/2026/04 / BTRC Cyber Compliance", body_style),
            Paragraph("<b>Integrity Hash (SHA-256):</b>", body_bold),
            Paragraph(f"<font size='6.5'>{data.get('context_hash', '8f4a13c9e7829b3d4f1025a7b6c891e4')[:32]}...</font>", body_style),
        ],
    ]
    sign_table = Table(sign_block, colWidths=[120, 160, 120, 140])
    sign_table.setStyle(TableStyle([
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("LINEABOVE", (0, 0), (-1, 0), 1, colors.HexColor("#94A3B8")),
    ]))
    story.append(Spacer(1, 8))
    story.append(KeepTogether(sign_table))

    doc.build(story)
    buffer.seek(0)
    return buffer
