/**
 * NEXUSGUARD & SentinelFlow Unified Trust Intelligence & AgentOps API Client.
 * Designed with seamless offline/resilient fallback so all buttons, modals,
 * and investigation workflows function immediately without external server dependencies.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api/v1" : "http://127.0.0.1:8000/api/v1");

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

// --------------------------------------------------------------------------
// IN-MEMORY / LOCALSTORAGE MOCK DATABASE ENGINE
// --------------------------------------------------------------------------

interface MockDB {
  transactions: any[];
  cases: any[];
  alerts: any[];
  auditLogs: any[];
  systemUsers: any[];
  customers: any[];
}

function getInitialDB(): MockDB {
  const transactions = [
  {
    "id": "TXN-982173",
    "transaction_code": "TXN-982173",
    "customer_code": "CUST-10492",
    "customer_name": "Arif Hossain",
    "sender_wallet": "01711-982173",
    "recipient_wallet": "01912-882104",
    "amount": 18700,
    "amount_bdt": 18700,
    "payment_type": "CASH_OUT",
    "device_id": "DEV-8821",
    "location": "Sylhet, BD",
    "occurred_at": "2026-11-20T17:45:00.000Z",
    "risk_score": 94.3,
    "risk_level": "critical",
    "status": "HELD_FOR_REVIEW",
    "action_taken": "HOLD_REVIEW",
    "is_hero": true,
    "engine_scores": {
      "transaction_risk": 86,
      "behavioral_anomaly": 94,
      "account_takeover": 91,
      "network_intelligence": 78
    },
    "signals": [
      {
        "code": "NEW_DEVICE",
        "name": "New Device Pairing",
        "severity": "high"
      },
      {
        "code": "AMOUNT_DEVIATION",
        "name": "Unusual Amount (+1408%)",
        "severity": "critical"
      },
      {
        "code": "VELOCITY_SPIKE",
        "name": "Velocity Spike (5 tx / 2 min)",
        "severity": "critical"
      },
      {
        "code": "TIME_ANOMALY",
        "name": "Unusual Hour (02:13 AM)",
        "severity": "high"
      },
      {
        "code": "MULE_CLUSTER",
        "name": "Downstream Mule Ring Hops",
        "severity": "high"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-88 (Dhaka)",
      "current_device": "DEV-8821 (Sylhet)",
      "typical_hours": "17:00\u201323:00",
      "current_hour": "02:13 AM",
      "historical_average_bdt": 1240,
      "current_transaction_bdt": 18700,
      "amount_deviation_pct": 1408,
      "typical_daily_velocity": 4.2,
      "current_velocity_per_hour": 11.0,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "new_device",
        "severity": "high",
        "source": "walletguard_ato_model",
        "evidence": "Device DEV-8821 has not previously been associated with customer CUST-10492."
      },
      {
        "signal": "amount_deviation",
        "severity": "critical",
        "source": "behavioral_anomaly_model",
        "evidence": "Transaction amount (\u09f318,700) is +1408% above customer historical median (\u09f31,240)."
      },
      {
        "signal": "time_deviation",
        "severity": "high",
        "source": "behavioral_anomaly_model",
        "evidence": "Transaction occurred at 02:13 AM outside standard activity window (17:00\u201323:00)."
      },
      {
        "signal": "mule_connection",
        "severity": "high",
        "source": "scamshield_network_engine",
        "evidence": "Recipient wallet 01912-882104 has 7 downstream fan-out connections to known mule cash-out nodes."
      },
      {
        "signal": "velocity_spike",
        "severity": "critical",
        "source": "transaction_risk_model",
        "evidence": "5 consecutive cash-out transactions attempted within a 120-second window."
      }
    ],
    "ai_report": {
      "summary_en": "The transaction presents elevated risk because it significantly deviates from customer CUST-10492 historical baseline. Originating from an unfamiliar device (DEV-8821) in Sylhet at 02:13 AM, the \u09f318,700 cashout represents a 14.1x deviation over typical amounts. Connected graph analysis indicates recipient 01912-882104 actively routes funds to a rapid-liquidation syndicate.",
      "summary_bn": "\u098f\u0987 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u099f\u09bf \u0985\u09a4\u09cd\u09af\u09a8\u09cd\u09a4 \u099d\u09c1\u0981\u0995\u09bf\u09aa\u09c2\u09b0\u09cd\u09a3 \u0995\u09be\u09b0\u09a3 \u098f\u099f\u09bf \u0997\u09cd\u09b0\u09be\u09b9\u0995 CUST-10492-\u098f\u09b0 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7\u09b0 \u0986\u099a\u09b0\u09a3\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b8\u09be\u0982\u0998\u09b0\u09cd\u09b7\u09bf\u0995\u0964 \u09ad\u09cb\u09b0 \u09e6\u09e8:\u09e7\u09e9 \u09ae\u09bf\u09a8\u09bf\u099f\u09c7 \u09b8\u09bf\u09b2\u09c7\u099f \u09a5\u09c7\u0995\u09c7 \u098f\u0995\u099f\u09bf \u0985\u09aa\u09b0\u09bf\u099a\u09bf\u09a4 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 (DEV-8821) \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09f3\u09e7\u09ee,\u09ed\u09e6\u09e6 \u0995\u09cd\u09af\u09be\u09b6\u0986\u0989\u099f \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7, \u09af\u09be \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u0997\u09dc\u09c7\u09b0 \u099a\u09c7\u09af\u09bc\u09c7 \u09e7\u09ea \u0997\u09c1\u09a3\u09c7\u09b0\u0993 \u09ac\u09c7\u09b6\u09bf\u0964 \u09a8\u09c7\u099f\u0993\u09af\u09bc\u09be\u09b0\u09cd\u0995 \u0997\u09cd\u09b0\u09be\u09ab \u09ac\u09bf\u09b6\u09cd\u09b2\u09c7\u09b7\u09a3\u09c7 \u09a6\u09c7\u0996\u09be \u0997\u09c7\u099b\u09c7 \u09aa\u09cd\u09b0\u09be\u09aa\u0995 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u099f\u09bf \u098f\u0995\u099f\u09bf \u09b8\u0995\u09cd\u09b0\u09bf\u09af\u09bc \u09ae\u09be\u09a8\u09bf \u09ae\u09bf\u0989\u09b2 \u09b8\u09bf\u09a8\u09cd\u09a1\u09bf\u0995\u09c7\u099f\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b8\u0982\u09af\u09c1\u0995\u09cd\u09a4\u0964",
      "recommended_action": "HUMAN_REVIEW_REQUIRED",
      "recommendation_text": "Do not automatically block funds. Initiate step-up biometric or SMS OTP confirmation with the verified account holder."
    }
  },
  {
    "id": "TXN-912241",
    "transaction_code": "TXN-912241",
    "customer_code": "CUST-88124",
    "customer_name": "Sadia Sultana",
    "sender_wallet": "01819-223145",
    "recipient_wallet": "01712-441290",
    "amount": 45000,
    "amount_bdt": 45000,
    "payment_type": "P2P",
    "device_id": "DEV-4412",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T14:47:30.000Z",
    "risk_score": 88.4,
    "risk_level": "high",
    "status": "UNDER_REVIEW",
    "action_taken": "STEP_UP",
    "engine_scores": {
      "transaction_risk": 83,
      "behavioral_anomaly": 86,
      "account_takeover": 61,
      "network_intelligence": 53
    },
    "signals": [
      {
        "code": "LARGE_VALUE",
        "name": "High Value Structuring",
        "severity": "high"
      },
      {
        "code": "LAYER_HOP",
        "name": "3-Hop Layering Pattern",
        "severity": "high"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-12",
      "current_device": "DEV-4412",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 11250,
      "current_transaction_bdt": 45000,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "UNUSUAL_ENTITY"
    },
    "evidence": [
      {
        "signal": "large_value",
        "severity": "high",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Rapid high-value P2P transfer structured just below regulatory reporting thresholds."
      }
    ],
    "ai_report": {
      "summary_en": "Rapid high-value P2P transfer structured just below regulatory reporting thresholds.",
      "summary_bn": "\u09a8\u09bf\u09af\u09bc\u09ae\u09ae\u09be\u09ab\u09bf\u0995 \u09b0\u09bf\u09aa\u09cb\u09b0\u09cd\u099f\u09bf\u0982 \u09b8\u09c0\u09ae\u09be \u098f\u09dc\u09be\u09a4\u09c7 \u09a6\u09cd\u09b0\u09c1\u09a4 \u0989\u099a\u09cd\u099a\u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u0995\u09be\u09a0\u09be\u09ae\u09cb \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "STEP_UP",
      "recommendation_text": "Engine flagged transaction with risk score 88.4 due to High Value Structuring."
    }
  },
  {
    "id": "TXN-773194",
    "transaction_code": "TXN-773194",
    "customer_code": "CUST-66291",
    "customer_name": "Mehedi Hasan",
    "sender_wallet": "01612-998811",
    "recipient_wallet": "01511-224466",
    "amount": 24500,
    "amount_bdt": 24500,
    "payment_type": "CASH_OUT",
    "device_id": "DEV-5581",
    "location": "Rajshahi, BD",
    "occurred_at": "2026-11-20T13:28:30.000Z",
    "risk_score": 82.0,
    "risk_level": "high",
    "status": "HELD_FOR_REVIEW",
    "action_taken": "HOLD_REVIEW",
    "engine_scores": {
      "transaction_risk": 77,
      "behavioral_anomaly": 80,
      "account_takeover": 73,
      "network_intelligence": 49
    },
    "signals": [
      {
        "code": "SIM_SWAP",
        "name": "Recent SIM Replacement Window",
        "severity": "high"
      },
      {
        "code": "OFF_HOURS",
        "name": "Off-Hours Liquidation",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-81",
      "current_device": "DEV-5581",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 6125,
      "current_transaction_bdt": 24500,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "UNUSUAL_ENTITY"
    },
    "evidence": [
      {
        "signal": "sim_swap",
        "severity": "high",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Cash-out initiated 84 minutes following carrier SIM replacement event."
      }
    ],
    "ai_report": {
      "summary_en": "Cash-out initiated 84 minutes following carrier SIM replacement event.",
      "summary_bn": "\u099f\u09c7\u09b2\u09bf\u0995\u09ae \u09b8\u09bf\u09ae \u09aa\u09cd\u09b0\u09a4\u09bf\u09b8\u09cd\u09a5\u09be\u09aa\u09a8\u09c7\u09b0 \u09ae\u09be\u09a4\u09cd\u09b0 \u09ee\u09ea \u09ae\u09bf\u09a8\u09bf\u099f\u09c7\u09b0 \u09ae\u09be\u09a5\u09be\u09df \u0995\u09cd\u09af\u09be\u09b6\u0986\u0989\u099f \u09b6\u09c1\u09b0\u09c1 \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "HOLD_REVIEW",
      "recommendation_text": "Engine flagged transaction with risk score 82.0 due to Recent SIM Replacement Window."
    }
  },
  {
    "id": "TXN-554109",
    "transaction_code": "TXN-554109",
    "customer_code": "CUST-44102",
    "customer_name": "Kamrul Islam",
    "sender_wallet": "01934-556677",
    "recipient_wallet": "01811-998800",
    "amount": 24900,
    "amount_bdt": 24900,
    "payment_type": "P2P",
    "device_id": "DEV-7102",
    "location": "Barisal, BD",
    "occurred_at": "2026-11-20T13:17:30.000Z",
    "risk_score": 92.6,
    "risk_level": "critical",
    "status": "BLOCKED",
    "action_taken": "AUTO_BLOCK",
    "engine_scores": {
      "transaction_risk": 87,
      "behavioral_anomaly": 90,
      "account_takeover": 64,
      "network_intelligence": 87
    },
    "signals": [
      {
        "code": "SMURF_BURST",
        "name": "Micro-Smurfing Burst (8x)",
        "severity": "critical"
      },
      {
        "code": "THRESHOLD_EVASION",
        "name": "\u09f325k Evasion Pattern",
        "severity": "critical"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-02",
      "current_device": "DEV-7102",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 6225,
      "current_transaction_bdt": 24900,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "FLAGGED_ENTITY"
    },
    "evidence": [
      {
        "signal": "smurf_burst",
        "severity": "critical",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Series of 8 rapid P2P transfers structured at \u09f324,900 to circumvent BFIU threshold."
      }
    ],
    "ai_report": {
      "summary_en": "Series of 8 rapid P2P transfers structured at \u09f324,900 to circumvent BFIU threshold.",
      "summary_bn": "\u09ac\u09bf\u098f\u09ab\u0986\u0987\u0987\u0989 \u09b8\u09c0\u09ae\u09be \u09ab\u09be\u0981\u0995\u09bf \u09a6\u09bf\u09a4\u09c7 \u09f3\u09e8\u09ea,\u09ef\u09e6\u09e6 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09ee\u099f\u09bf \u09a6\u09cd\u09b0\u09c1\u09a4 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09a7\u09be\u09b0\u09be \u09b6\u09a8\u09be\u0995\u09cd\u09a4\u0964",
      "recommended_action": "AUTO_BLOCK",
      "recommendation_text": "Engine flagged transaction with risk score 92.6 due to Micro-Smurfing Burst (8x)."
    }
  },
  {
    "id": "TXN-881290",
    "transaction_code": "TXN-881290",
    "customer_code": "CUST-30491",
    "customer_name": "Bilkis Begum",
    "sender_wallet": "01776-990011",
    "recipient_wallet": "01922-334411",
    "amount": 48500,
    "amount_bdt": 48500,
    "payment_type": "REMITTANCE_INBOUND",
    "device_id": "DEV-9912",
    "location": "Comilla, BD",
    "occurred_at": "2026-11-20T16:19:30.000Z",
    "risk_score": 89.1,
    "risk_level": "high",
    "status": "HELD_FOR_REVIEW",
    "action_taken": "HOLD_REVIEW",
    "engine_scores": {
      "transaction_risk": 84,
      "behavioral_anomaly": 87,
      "account_takeover": 62,
      "network_intelligence": 53
    },
    "signals": [
      {
        "code": "REMIT_ANOMALY",
        "name": "Cross-Border Gateway Mismatch",
        "severity": "high"
      },
      {
        "code": "NID_DISCREPANCY",
        "name": "Beneficiary NID Hash Mismatch",
        "severity": "high"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-12",
      "current_device": "DEV-9912",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 12125,
      "current_transaction_bdt": 48500,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "UNUSUAL_ENTITY"
    },
    "evidence": [
      {
        "signal": "remit_anomaly",
        "severity": "high",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Incoming remittance routing flagged for international originator mismatch against central NID registry."
      }
    ],
    "ai_report": {
      "summary_en": "Incoming remittance routing flagged for international originator mismatch against central NID registry.",
      "summary_bn": "\u0986\u09a8\u09cd\u09a4\u09b0\u09cd\u099c\u09be\u09a4\u09bf\u0995 \u09aa\u09cd\u09b0\u09c7\u09b0\u0995 \u09a4\u09a5\u09cd\u09af\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u0995\u09c7\u09a8\u09cd\u09a6\u09cd\u09b0\u09c0\u09df \u099c\u09be\u09a4\u09c0\u09df \u09aa\u09b0\u09bf\u099a\u09df\u09aa\u09a4\u09cd\u09b0 \u09a1\u09c7\u099f\u09be\u09ac\u09c7\u09b8\u09c7\u09b0 \u0985\u09b8\u09be\u09ae\u099e\u09cd\u099c\u09b8\u09cd\u09af \u09b6\u09a8\u09be\u0995\u09cd\u09a4\u0964",
      "recommended_action": "HOLD_REVIEW",
      "recommendation_text": "Engine flagged transaction with risk score 89.1 due to Cross-Border Gateway Mismatch."
    }
  },
  {
    "id": "TXN-664192",
    "transaction_code": "TXN-664192",
    "customer_code": "CUST-88124",
    "customer_name": "Sadia Sultana",
    "sender_wallet": "01819-223145",
    "recipient_wallet": "MERCH-094",
    "amount": 38000,
    "amount_bdt": 38000,
    "payment_type": "QR_PAYMENT",
    "device_id": "DEV-6201",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T15:44:30.000Z",
    "risk_score": 91.2,
    "risk_level": "critical",
    "status": "UNDER_REVIEW",
    "action_taken": "INVESTIGATE",
    "engine_scores": {
      "transaction_risk": 86,
      "behavioral_anomaly": 89,
      "account_takeover": 63,
      "network_intelligence": 86
    },
    "signals": [
      {
        "code": "ROGUE_QR",
        "name": "Rogue Merchant Circular Wash",
        "severity": "critical"
      },
      {
        "code": "KICKBACK_LOOP",
        "name": "Automated Kickback Loop",
        "severity": "high"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-01",
      "current_device": "DEV-6201",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 9500,
      "current_transaction_bdt": 38000,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "FLAGGED_ENTITY"
    },
    "evidence": [
      {
        "signal": "rogue_qr",
        "severity": "critical",
        "source": "nexusguard_neural_pipeline",
        "evidence": "High velocity QR transactions routed through dormant merchant POS terminal with immediate 95% cash-back fan-out."
      }
    ],
    "ai_report": {
      "summary_en": "High velocity QR transactions routed through dormant merchant POS terminal with immediate 95% cash-back fan-out.",
      "summary_bn": "\u09b8\u09c1\u09aa\u09cd\u09a4 \u09ae\u09be\u09b0\u09cd\u099a\u09c7\u09a8\u09cd\u099f \u09aa\u09bf\u0993\u098f\u09b8 \u099f\u09be\u09b0\u09cd\u09ae\u09bf\u09a8\u09be\u09b2\u09c7\u09b0 \u09ae\u09be\u09a7\u09cd\u09af\u09ae\u09c7 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u0995\u09bf\u0989\u0986\u09b0 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u0993 \u09ef\u09eb% \u09a8\u0997\u09a6 \u09ab\u09c7\u09b0\u09a4 \u09aa\u09cd\u09b0\u09ac\u09be\u09b9\u0964",
      "recommended_action": "INVESTIGATE",
      "recommendation_text": "Engine flagged transaction with risk score 91.2 due to Rogue Merchant Circular Wash."
    }
  },
  {
    "id": "TXN-441902",
    "transaction_code": "TXN-441902",
    "customer_code": "CUST-26491",
    "customer_name": "Moniruzzaman",
    "sender_wallet": "01954-778899",
    "recipient_wallet": "01711-002288",
    "amount": 49200,
    "amount_bdt": 49200,
    "payment_type": "CASH_OUT",
    "device_id": "DEV-3312",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T17:25:30.000Z",
    "risk_score": 95.8,
    "risk_level": "critical",
    "status": "BLOCKED",
    "action_taken": "AUTO_BLOCK",
    "engine_scores": {
      "transaction_risk": 91,
      "behavioral_anomaly": 93,
      "account_takeover": 86,
      "network_intelligence": 91
    },
    "signals": [
      {
        "code": "DORMANT_WAKE",
        "name": "Dormant Wallet Liquidation (190d)",
        "severity": "critical"
      },
      {
        "code": "GEO_JUMP",
        "name": "Impossible Velocity Geo-Jump",
        "severity": "critical"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-12",
      "current_device": "DEV-3312",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 12300,
      "current_transaction_bdt": 49200,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "FLAGGED_ENTITY"
    },
    "evidence": [
      {
        "signal": "dormant_wake",
        "severity": "critical",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Dormant account inactive for 190 days suddenly attempted maximum single cash-out from new IP."
      }
    ],
    "ai_report": {
      "summary_en": "Dormant account inactive for 190 days suddenly attempted maximum single cash-out from new IP.",
      "summary_bn": "\u09e7\u09ef\u09e6 \u09a6\u09bf\u09a8 \u09a8\u09bf\u09b7\u09cd\u0995\u09cd\u09b0\u09bf\u09af\u09bc \u09a5\u09be\u0995\u09be \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09a5\u09c7\u0995\u09c7 \u09b9\u09a0\u09be\u09ce \u09a8\u09a4\u09c1\u09a8 \u0986\u0987\u09aa\u09bf \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u0995\u09cd\u09af\u09be\u09b6\u0986\u0989\u099f \u099a\u09c7\u09b7\u09cd\u099f\u09be\u0964",
      "recommended_action": "AUTO_BLOCK",
      "recommendation_text": "Engine flagged transaction with risk score 95.8 due to Dormant Wallet Liquidation (190d)."
    }
  },
  {
    "id": "TXN-331890",
    "transaction_code": "TXN-331890",
    "customer_code": "CUST-12490",
    "customer_name": "Ashikur Rahman",
    "sender_wallet": "01677-001122",
    "recipient_wallet": "01819-771122",
    "amount": 19800,
    "amount_bdt": 19800,
    "payment_type": "CASH_OUT",
    "device_id": "DEV-4488",
    "location": "Bogra, BD",
    "occurred_at": "2026-11-20T14:10:30.000Z",
    "risk_score": 93.4,
    "risk_level": "critical",
    "status": "HELD_FOR_REVIEW",
    "action_taken": "HOLD_REVIEW",
    "engine_scores": {
      "transaction_risk": 88,
      "behavioral_anomaly": 91,
      "account_takeover": 84,
      "network_intelligence": 88
    },
    "signals": [
      {
        "code": "EMULATOR_DETECT",
        "name": "Rooted Hardware Emulator",
        "severity": "critical"
      },
      {
        "code": "HOOK_DETECTED",
        "name": "Frida Instrumentation Framework",
        "severity": "critical"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-88",
      "current_device": "DEV-4488",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 4950,
      "current_transaction_bdt": 19800,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "FLAGGED_ENTITY"
    },
    "evidence": [
      {
        "signal": "emulator_detect",
        "severity": "critical",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Transaction originated from rooted Android virtual machine with active Frida instrumentation hooked into biometrics."
      }
    ],
    "ai_report": {
      "summary_en": "Transaction originated from rooted Android virtual machine with active Frida instrumentation hooked into biometrics.",
      "summary_bn": "\u09b0\u09c1\u099f\u09c7\u09a1 \u09ad\u09be\u09b0\u09cd\u099a\u09c1\u09df\u09be\u09b2 \u09ae\u09c7\u09b6\u09bf\u09a8 \u0993 \u09ab\u09cd\u09b0\u09bf\u09a1\u09be \u0987\u09a8\u09b8\u09cd\u099f\u09cd\u09b0\u09c1\u09ae\u09c7\u09a8\u09cd\u099f\u09c7\u09b6\u09a8 \u09ab\u09cd\u09b0\u09c7\u09ae\u0993\u09df\u09be\u09b0\u09cd\u0995 \u09a6\u09bf\u09df\u09c7 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u09ac\u09be\u0987\u09aa\u09be\u09b8 \u099a\u09c7\u09b7\u09cd\u099f\u09be\u0964",
      "recommended_action": "HOLD_REVIEW",
      "recommendation_text": "Engine flagged transaction with risk score 93.4 due to Rooted Hardware Emulator."
    }
  },
  {
    "id": "TXN-229041",
    "transaction_code": "TXN-229041",
    "customer_code": "CUST-28310",
    "customer_name": "Shahadat Hossain",
    "sender_wallet": "01665-889900",
    "recipient_wallet": "01912-332211",
    "amount": 75000,
    "amount_bdt": 75000,
    "payment_type": "SEND_MONEY",
    "device_id": "DEV-1190",
    "location": "Rangpur, BD",
    "occurred_at": "2026-11-20T12:20:30.000Z",
    "risk_score": 96.1,
    "risk_level": "critical",
    "status": "BLOCKED",
    "action_taken": "AUTO_BLOCK",
    "engine_scores": {
      "transaction_risk": 91,
      "behavioral_anomaly": 94,
      "account_takeover": 67,
      "network_intelligence": 91
    },
    "signals": [
      {
        "code": "MULE_FANOUT",
        "name": "Syndicate Fan-out Hub",
        "severity": "critical"
      },
      {
        "code": "CHAIN_VELOCITY",
        "name": "Instantaneous Passthrough (<12s)",
        "severity": "critical"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-90",
      "current_device": "DEV-1190",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 18750,
      "current_transaction_bdt": 75000,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "FLAGGED_ENTITY"
    },
    "evidence": [
      {
        "signal": "mule_fanout",
        "severity": "critical",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Syndicate intermediary hub receiving bulk credits and fanning out to 12 mule nodes in under 12 seconds."
      }
    ],
    "ai_report": {
      "summary_en": "Syndicate intermediary hub receiving bulk credits and fanning out to 12 mule nodes in under 12 seconds.",
      "summary_bn": "\u09b8\u09bf\u09a8\u09cd\u09a1\u09bf\u0995\u09c7\u099f \u09ae\u09a7\u09cd\u09af\u09b8\u09cd\u09a5\u09a4\u09be\u0995\u09be\u09b0\u09c0 \u09a8\u09cb\u09a1 \u09af\u09be \u09e7\u09e8 \u09b8\u09c7\u0995\u09c7\u09a8\u09cd\u09a1\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09e7\u09e8\u099f\u09bf \u09aa\u09c3\u09a5\u0995 \u09ae\u09bf\u0989\u09b2 \u0993\u09df\u09be\u09b2\u09c7\u099f\u09c7 \u09a4\u09b9\u09ac\u09bf\u09b2 \u099b\u09dc\u09bf\u09df\u09c7 \u09a6\u09c7\u09df\u0964",
      "recommended_action": "AUTO_BLOCK",
      "recommendation_text": "Engine flagged transaction with risk score 96.1 due to Syndicate Fan-out Hub."
    }
  },
  {
    "id": "TXN-118832",
    "transaction_code": "TXN-118832",
    "customer_code": "CUST-34891",
    "customer_name": "Shamim Reza",
    "sender_wallet": "01998-112233",
    "recipient_wallet": "AGENT-882",
    "amount": 98000,
    "amount_bdt": 98000,
    "payment_type": "CASH_OUT",
    "device_id": "DEV-9921",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T12:15:30.000Z",
    "risk_score": 97.4,
    "risk_level": "critical",
    "status": "BLOCKED",
    "action_taken": "AUTO_BLOCK",
    "engine_scores": {
      "transaction_risk": 92,
      "behavioral_anomaly": 95,
      "account_takeover": 87,
      "network_intelligence": 92
    },
    "signals": [
      {
        "code": "PORT_ANOMALY",
        "name": "Container Terminal Smuggling Link",
        "severity": "critical"
      },
      {
        "code": "BLACKLIST_AGENT",
        "name": "High-Risk Tier Agent Terminal",
        "severity": "critical"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-21",
      "current_device": "DEV-9921",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 24500,
      "current_transaction_bdt": 98000,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "FLAGGED_ENTITY"
    },
    "evidence": [
      {
        "signal": "port_anomaly",
        "severity": "critical",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Maritime port liquidation pattern matched against high-risk container terminal financial crime syndicate."
      }
    ],
    "ai_report": {
      "summary_en": "Maritime port liquidation pattern matched against high-risk container terminal financial crime syndicate.",
      "summary_bn": "\u099a\u099f\u09cd\u099f\u0997\u09cd\u09b0\u09be\u09ae \u09ac\u09a8\u09cd\u09a6\u09b0 \u098f\u09b2\u09be\u0995\u09be\u09df \u0989\u099a\u09cd\u099a \u099d\u09c1\u0981\u0995\u09bf\u09aa\u09c2\u09b0\u09cd\u09a3 \u098f\u099c\u09c7\u09a8\u09cd\u099f \u099f\u09be\u09b0\u09cd\u09ae\u09bf\u09a8\u09be\u09b2 \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09ac\u09dc \u0985\u0982\u0995\u09c7\u09b0 \u09a8\u0997\u09a6 \u0989\u09a4\u09cd\u09a4\u09cb\u09b2\u09a8\u09c7\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be\u0964",
      "recommended_action": "AUTO_BLOCK",
      "recommendation_text": "Engine flagged transaction with risk score 97.4 due to Container Terminal Smuggling Link."
    }
  },
  {
    "id": "TXN-774412",
    "transaction_code": "TXN-774412",
    "customer_code": "CUST-22319",
    "customer_name": "Naimur Rahman",
    "sender_wallet": "01732-556677",
    "recipient_wallet": "01823-119933",
    "amount": 31500,
    "amount_bdt": 31500,
    "payment_type": "P2P",
    "device_id": "DEV-3321",
    "location": "Rajshahi, BD",
    "occurred_at": "2026-11-20T11:31:30.000Z",
    "risk_score": 78.5,
    "risk_level": "high",
    "status": "UNDER_REVIEW",
    "action_taken": "STEP_UP",
    "engine_scores": {
      "transaction_risk": 74,
      "behavioral_anomaly": 76,
      "account_takeover": 54,
      "network_intelligence": 47
    },
    "signals": [
      {
        "code": "UNUSUAL_RECIPIENT",
        "name": "Cross-District High Velocity",
        "severity": "high"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-21",
      "current_device": "DEV-3321",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 7875,
      "current_transaction_bdt": 31500,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "UNUSUAL_ENTITY"
    },
    "evidence": [
      {
        "signal": "unusual_recipient",
        "severity": "high",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Cross-district P2P transfer to newly activated wallet exhibiting abnormal transaction frequency."
      }
    ],
    "ai_report": {
      "summary_en": "Cross-district P2P transfer to newly activated wallet exhibiting abnormal transaction frequency.",
      "summary_bn": "\u09a8\u09a4\u09c1\u09a8 \u09b8\u0995\u09cd\u09b0\u09bf\u09af\u09bc \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u0986\u09a8\u09cd\u09a4\u0983\u099c\u09c7\u09b2\u09be \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0 \u09af\u09be\u09a4\u09c7 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7\u09b0 \u09aa\u09c1\u09a8\u09b0\u09be\u09ac\u09c3\u09a4\u09cd\u09a4\u09bf \u09a6\u09c7\u0996\u09be \u0997\u09c7\u099b\u09c7\u0964",
      "recommended_action": "STEP_UP",
      "recommendation_text": "Engine flagged transaction with risk score 78.5 due to Cross-District High Velocity."
    }
  },
  {
    "id": "TXN-661298",
    "transaction_code": "TXN-661298",
    "customer_code": "CUST-18290",
    "customer_name": "Rashedul Karim",
    "sender_wallet": "01910-334455",
    "recipient_wallet": "01612-445588",
    "amount": 52000,
    "amount_bdt": 52000,
    "payment_type": "SEND_MONEY",
    "device_id": "DEV-7714",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T12:16:30.000Z",
    "risk_score": 74.2,
    "risk_level": "high",
    "status": "UNDER_REVIEW",
    "action_taken": "STEP_UP",
    "engine_scores": {
      "transaction_risk": 70,
      "behavioral_anomaly": 72,
      "account_takeover": 51,
      "network_intelligence": 44
    },
    "signals": [
      {
        "code": "DEVIATION_VOLUME",
        "name": "Weekly Volume Exceeded (320%)",
        "severity": "high"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Android-14",
      "current_device": "DEV-7714",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "14:22",
      "historical_average_bdt": 13000,
      "current_transaction_bdt": 52000,
      "amount_deviation_pct": 300,
      "typical_daily_velocity": 3.5,
      "current_velocity_per_hour": 7.2,
      "recipient_relationship": "UNUSUAL_ENTITY"
    },
    "evidence": [
      {
        "signal": "deviation_volume",
        "severity": "high",
        "source": "nexusguard_neural_pipeline",
        "evidence": "Sudden 3.2x surge in daily turnover compared to 90-day moving average."
      }
    ],
    "ai_report": {
      "summary_en": "Sudden 3.2x surge in daily turnover compared to 90-day moving average.",
      "summary_bn": "\u09ef\u09e6 \u09a6\u09bf\u09a8\u09c7\u09b0 \u0997\u09dc \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7\u09b0 \u09a4\u09c1\u09b2\u09a8\u09be\u09df \u09a6\u09c8\u09a8\u09a8\u09cd\u09a6\u09bf\u09a8 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7 \u09b9\u09a0\u09be\u09ce \u09e9.\u09e8 \u0997\u09c1\u09a3 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09ac\u09c3\u09a6\u09cd\u09a7\u09bf\u0964",
      "recommended_action": "STEP_UP",
      "recommendation_text": "Engine flagged transaction with risk score 74.2 due to Weekly Volume Exceeded (320%)."
    }
  },
  {
    "id": "TXN-NOR-1000",
    "transaction_code": "TXN-NOR-1000",
    "customer_code": "CUST-33910",
    "customer_name": "Tanvir Hasan",
    "sender_wallet": "01911-334102",
    "recipient_wallet": "MERCH-SHWAPNO-01",
    "amount": 2340,
    "amount_bdt": 2340,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2000",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T13:56:30.000Z",
    "risk_score": 4.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 4,
      "behavioral_anomaly": 3,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-3910",
      "current_device": "DEV-2000",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 2340,
      "current_transaction_bdt": 2340,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Grocery & Household Purchase at Shwapno Superstore. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Shwapno Superstore-\u098f Grocery & Household Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1001",
    "transaction_code": "TXN-NOR-1001",
    "customer_code": "CUST-11928",
    "customer_name": "Nusrat Jahan",
    "sender_wallet": "01722-114477",
    "recipient_wallet": "MERCH-AGORA-04",
    "amount": 4175,
    "amount_bdt": 4175,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2017",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T18:35:58.000Z",
    "risk_score": 6.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 5,
      "behavioral_anomaly": 5,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-1928",
      "current_device": "DEV-2017",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 4175,
      "current_transaction_bdt": 4175,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Weekend Family Grocery at Agora Superstore. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Agora Superstore-\u098f Weekend Family Grocery-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1002",
    "transaction_code": "TXN-NOR-1002",
    "customer_code": "CUST-77182",
    "customer_name": "Fahim Chowdhury",
    "sender_wallet": "01744-778899",
    "recipient_wallet": "MERCH-PATHAO-99",
    "amount": 370,
    "amount_bdt": 370,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2034",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T12:17:33.000Z",
    "risk_score": 8.1,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 7,
      "behavioral_anomaly": 6,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-7182",
      "current_device": "DEV-2034",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 370,
      "current_transaction_bdt": 370,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Commute Rideshare Trip at Pathao Rides & Food. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Pathao Rides & Food-\u098f Commute Rideshare Trip-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1003",
    "transaction_code": "TXN-NOR-1003",
    "customer_code": "CUST-99201",
    "customer_name": "Tasnim Rahman",
    "sender_wallet": "01855-889900",
    "recipient_wallet": "MERCH-CHALDAL-12",
    "amount": 1965,
    "amount_bdt": 1965,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2051",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T16:17:41.000Z",
    "risk_score": 9.9,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 8,
      "behavioral_anomaly": 7,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-9201",
      "current_device": "DEV-2051",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1965,
      "current_transaction_bdt": 1965,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Weekly Fresh Produce at Chaldal Grocery Delivery. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Chaldal Grocery Delivery-\u098f Weekly Fresh Produce-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1004",
    "transaction_code": "TXN-NOR-1004",
    "customer_code": "CUST-10334",
    "customer_name": "Anika Tabassum",
    "sender_wallet": "01966-990011",
    "recipient_wallet": "MERCH-AARONG-02",
    "amount": 3550,
    "amount_bdt": 3550,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2068",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T08:55:27.000Z",
    "risk_score": 11.7,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 10,
      "behavioral_anomaly": 9,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-0334",
      "current_device": "DEV-2068",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 3550,
      "current_transaction_bdt": 3550,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Apparel & Lifestyle Purchase at Aarong Retail Gulshan. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Aarong Retail Gulshan-\u098f Apparel & Lifestyle Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1005",
    "transaction_code": "TXN-NOR-1005",
    "customer_code": "CUST-14820",
    "customer_name": "Sumaiya Islam",
    "sender_wallet": "01788-112233",
    "recipient_wallet": "MERCH-DESCO-00",
    "amount": 2125,
    "amount_bdt": 2125,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2085",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T18:11:27.000Z",
    "risk_score": 13.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 12,
      "behavioral_anomaly": 10,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-4820",
      "current_device": "DEV-2085",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 2125,
      "current_transaction_bdt": 2125,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Prepaid Electricity Recharge at DESCO Prepaid Utility. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "DESCO Prepaid Utility-\u098f Prepaid Electricity Recharge-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1006",
    "transaction_code": "TXN-NOR-1006",
    "customer_code": "CUST-16733",
    "customer_name": "Mahmudul Hasan",
    "sender_wallet": "01899-223344",
    "recipient_wallet": "MERCH-DPDC-01",
    "amount": 1600,
    "amount_bdt": 1600,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2102",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T11:25:31.000Z",
    "risk_score": 15.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 13,
      "behavioral_anomaly": 12,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-6733",
      "current_device": "DEV-2102",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1600,
      "current_transaction_bdt": 1600,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Monthly Power Utility at DPDC Postpaid Electricity. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "DPDC Postpaid Electricity-\u098f Monthly Power Utility-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1007",
    "transaction_code": "TXN-NOR-1007",
    "customer_code": "CUST-20194",
    "customer_name": "Jannatul Ferdous",
    "sender_wallet": "01521-445566",
    "recipient_wallet": "MERCH-WASA-03",
    "amount": 1015,
    "amount_bdt": 1015,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2119",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T09:24:56.000Z",
    "risk_score": 17.1,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 15,
      "behavioral_anomaly": 13,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-0194",
      "current_device": "DEV-2119",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1015,
      "current_transaction_bdt": 1015,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Monthly Water Utility at Dhaka WASA Water Bill. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Dhaka WASA Water Bill-\u098f Monthly Water Utility-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1008",
    "transaction_code": "TXN-NOR-1008",
    "customer_code": "CUST-24108",
    "customer_name": "Sabina Yasmin",
    "sender_wallet": "01843-667788",
    "recipient_wallet": "MERCH-TITAS-02",
    "amount": 1280,
    "amount_bdt": 1280,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2136",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T13:47:16.000Z",
    "risk_score": 18.9,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 17,
      "behavioral_anomaly": 15,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-4108",
      "current_device": "DEV-2136",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1280,
      "current_transaction_bdt": 1280,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Monthly Household Gas at Titas Gas Prepaid. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Titas Gas Prepaid-\u098f Monthly Household Gas-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1009",
    "transaction_code": "TXN-NOR-1009",
    "customer_code": "CUST-32104",
    "customer_name": "Tariqul Islam",
    "sender_wallet": "01887-001122",
    "recipient_wallet": "MERCH-ROBI-TOPUP",
    "amount": 425,
    "amount_bdt": 425,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2153",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T17:47:22.000Z",
    "risk_score": 20.7,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 18,
      "behavioral_anomaly": 16,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-2104",
      "current_device": "DEV-2153",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 425,
      "current_transaction_bdt": 425,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Mobile Recharge at Robi Axiata Airtime. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Robi Axiata Airtime-\u098f Mobile Recharge-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1010",
    "transaction_code": "TXN-NOR-1010",
    "customer_code": "CUST-36209",
    "customer_name": "Shirin Akter",
    "sender_wallet": "01539-223344",
    "recipient_wallet": "MERCH-GP-FLEXI",
    "amount": 750,
    "amount_bdt": 750,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2170",
    "location": "Sylhet, BD",
    "occurred_at": "2026-11-20T13:52:25.000Z",
    "risk_score": 22.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 20,
      "behavioral_anomaly": 18,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-6209",
      "current_device": "DEV-2170",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 750,
      "current_transaction_bdt": 750,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Prepaid Mobile Internet Bundle at Grameenphone Flexiload. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Grameenphone Flexiload-\u098f Prepaid Mobile Internet Bundle-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1011",
    "transaction_code": "TXN-NOR-1011",
    "customer_code": "CUST-33910",
    "customer_name": "Tanvir Hasan",
    "sender_wallet": "01911-334102",
    "recipient_wallet": "MERCH-DARAZ-PAY",
    "amount": 1925,
    "amount_bdt": 1925,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2187",
    "location": "Rajshahi, BD",
    "occurred_at": "2026-11-20T13:44:32.000Z",
    "risk_score": 24.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 21,
      "behavioral_anomaly": 19,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-3910",
      "current_device": "DEV-2187",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1925,
      "current_transaction_bdt": 1925,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for E-Commerce Gadget Order at Daraz Bangladesh Online. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Daraz Bangladesh Online-\u098f E-Commerce Gadget Order-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1012",
    "transaction_code": "TXN-NOR-1012",
    "customer_code": "CUST-11928",
    "customer_name": "Nusrat Jahan",
    "sender_wallet": "01722-114477",
    "recipient_wallet": "MERCH-UNIV-FEES",
    "amount": 14800,
    "amount_bdt": 14800,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2204",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T12:19:11.000Z",
    "risk_score": 4.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 4,
      "behavioral_anomaly": 3,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-1928",
      "current_device": "DEV-2204",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 14800,
      "current_transaction_bdt": 14800,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Semester Tuition Payment at Dhaka University Tuition. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Dhaka University Tuition-\u098f Semester Tuition Payment-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1013",
    "transaction_code": "TXN-NOR-1013",
    "customer_code": "CUST-77182",
    "customer_name": "Fahim Chowdhury",
    "sender_wallet": "01744-778899",
    "recipient_wallet": "MERCH-HEALTH-MED",
    "amount": 4525,
    "amount_bdt": 4525,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2221",
    "location": "Khulna, BD",
    "occurred_at": "2026-11-20T09:44:26.000Z",
    "risk_score": 6.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 5,
      "behavioral_anomaly": 5,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-7182",
      "current_device": "DEV-2221",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 4525,
      "current_transaction_bdt": 4525,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Outpatient Consultation at Labaid Diagnostic Center. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Labaid Diagnostic Center-\u098f Outpatient Consultation-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1014",
    "transaction_code": "TXN-NOR-1014",
    "customer_code": "CUST-99201",
    "customer_name": "Tasnim Rahman",
    "sender_wallet": "01855-889900",
    "recipient_wallet": "MERCH-SWEET-MEAT",
    "amount": 1030,
    "amount_bdt": 1030,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2238",
    "location": "Barisal, BD",
    "occurred_at": "2026-11-20T12:13:38.000Z",
    "risk_score": 8.1,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 7,
      "behavioral_anomaly": 6,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-9201",
      "current_device": "DEV-2238",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1030,
      "current_transaction_bdt": 1030,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Traditional Bakery Purchase at Bonoful Sweets & Bakery. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Bonoful Sweets & Bakery-\u098f Traditional Bakery Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1015",
    "transaction_code": "TXN-NOR-1015",
    "customer_code": "CUST-10334",
    "customer_name": "Anika Tabassum",
    "sender_wallet": "01966-990011",
    "recipient_wallet": "MERCH-SHWAPNO-01",
    "amount": 2715,
    "amount_bdt": 2715,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2255",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T08:12:14.000Z",
    "risk_score": 9.9,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 8,
      "behavioral_anomaly": 7,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-0334",
      "current_device": "DEV-2255",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 2715,
      "current_transaction_bdt": 2715,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Grocery & Household Purchase at Shwapno Superstore. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Shwapno Superstore-\u098f Grocery & Household Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1016",
    "transaction_code": "TXN-NOR-1016",
    "customer_code": "CUST-14820",
    "customer_name": "Sumaiya Islam",
    "sender_wallet": "01788-112233",
    "recipient_wallet": "MERCH-AGORA-04",
    "amount": 4550,
    "amount_bdt": 4550,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2272",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T08:13:13.000Z",
    "risk_score": 11.7,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 10,
      "behavioral_anomaly": 9,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-4820",
      "current_device": "DEV-2272",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 4550,
      "current_transaction_bdt": 4550,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Weekend Family Grocery at Agora Superstore. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Agora Superstore-\u098f Weekend Family Grocery-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1017",
    "transaction_code": "TXN-NOR-1017",
    "customer_code": "CUST-16733",
    "customer_name": "Mahmudul Hasan",
    "sender_wallet": "01899-223344",
    "recipient_wallet": "MERCH-PATHAO-99",
    "amount": 745,
    "amount_bdt": 745,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2289",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T17:20:35.000Z",
    "risk_score": 13.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 12,
      "behavioral_anomaly": 10,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-6733",
      "current_device": "DEV-2289",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 745,
      "current_transaction_bdt": 745,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Commute Rideshare Trip at Pathao Rides & Food. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Pathao Rides & Food-\u098f Commute Rideshare Trip-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1018",
    "transaction_code": "TXN-NOR-1018",
    "customer_code": "CUST-20194",
    "customer_name": "Jannatul Ferdous",
    "sender_wallet": "01521-445566",
    "recipient_wallet": "MERCH-CHALDAL-12",
    "amount": 2340,
    "amount_bdt": 2340,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2306",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T09:24:19.000Z",
    "risk_score": 15.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 13,
      "behavioral_anomaly": 12,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-0194",
      "current_device": "DEV-2306",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 2340,
      "current_transaction_bdt": 2340,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Weekly Fresh Produce at Chaldal Grocery Delivery. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Chaldal Grocery Delivery-\u098f Weekly Fresh Produce-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1019",
    "transaction_code": "TXN-NOR-1019",
    "customer_code": "CUST-24108",
    "customer_name": "Sabina Yasmin",
    "sender_wallet": "01843-667788",
    "recipient_wallet": "MERCH-AARONG-02",
    "amount": 3925,
    "amount_bdt": 3925,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2323",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T17:56:42.000Z",
    "risk_score": 17.1,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 15,
      "behavioral_anomaly": 13,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-4108",
      "current_device": "DEV-2323",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 3925,
      "current_transaction_bdt": 3925,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Apparel & Lifestyle Purchase at Aarong Retail Gulshan. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Aarong Retail Gulshan-\u098f Apparel & Lifestyle Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1020",
    "transaction_code": "TXN-NOR-1020",
    "customer_code": "CUST-32104",
    "customer_name": "Tariqul Islam",
    "sender_wallet": "01887-001122",
    "recipient_wallet": "MERCH-DESCO-00",
    "amount": 2500,
    "amount_bdt": 2500,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2340",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T12:44:23.000Z",
    "risk_score": 18.9,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 17,
      "behavioral_anomaly": 15,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-2104",
      "current_device": "DEV-2340",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 2500,
      "current_transaction_bdt": 2500,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Prepaid Electricity Recharge at DESCO Prepaid Utility. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "DESCO Prepaid Utility-\u098f Prepaid Electricity Recharge-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1021",
    "transaction_code": "TXN-NOR-1021",
    "customer_code": "CUST-36209",
    "customer_name": "Shirin Akter",
    "sender_wallet": "01539-223344",
    "recipient_wallet": "MERCH-DPDC-01",
    "amount": 1975,
    "amount_bdt": 1975,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2357",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T16:37:17.000Z",
    "risk_score": 20.7,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 18,
      "behavioral_anomaly": 16,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-6209",
      "current_device": "DEV-2357",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1975,
      "current_transaction_bdt": 1975,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Monthly Power Utility at DPDC Postpaid Electricity. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "DPDC Postpaid Electricity-\u098f Monthly Power Utility-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1022",
    "transaction_code": "TXN-NOR-1022",
    "customer_code": "CUST-33910",
    "customer_name": "Tanvir Hasan",
    "sender_wallet": "01911-334102",
    "recipient_wallet": "MERCH-WASA-03",
    "amount": 1390,
    "amount_bdt": 1390,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2374",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T16:45:23.000Z",
    "risk_score": 22.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 20,
      "behavioral_anomaly": 18,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-3910",
      "current_device": "DEV-2374",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1390,
      "current_transaction_bdt": 1390,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Monthly Water Utility at Dhaka WASA Water Bill. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Dhaka WASA Water Bill-\u098f Monthly Water Utility-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1023",
    "transaction_code": "TXN-NOR-1023",
    "customer_code": "CUST-11928",
    "customer_name": "Nusrat Jahan",
    "sender_wallet": "01722-114477",
    "recipient_wallet": "MERCH-TITAS-02",
    "amount": 1655,
    "amount_bdt": 1655,
    "payment_type": "UTILITY_BILL",
    "device_id": "DEV-2391",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T11:19:32.000Z",
    "risk_score": 24.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 21,
      "behavioral_anomaly": 19,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-1928",
      "current_device": "DEV-2391",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1655,
      "current_transaction_bdt": 1655,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Monthly Household Gas at Titas Gas Prepaid. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Titas Gas Prepaid-\u098f Monthly Household Gas-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1024",
    "transaction_code": "TXN-NOR-1024",
    "customer_code": "CUST-77182",
    "customer_name": "Fahim Chowdhury",
    "sender_wallet": "01744-778899",
    "recipient_wallet": "MERCH-ROBI-TOPUP",
    "amount": 800,
    "amount_bdt": 800,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2408",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T12:38:26.000Z",
    "risk_score": 4.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 4,
      "behavioral_anomaly": 3,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-7182",
      "current_device": "DEV-2408",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 800,
      "current_transaction_bdt": 800,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Mobile Recharge at Robi Axiata Airtime. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Robi Axiata Airtime-\u098f Mobile Recharge-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1025",
    "transaction_code": "TXN-NOR-1025",
    "customer_code": "CUST-99201",
    "customer_name": "Tasnim Rahman",
    "sender_wallet": "01855-889900",
    "recipient_wallet": "MERCH-GP-FLEXI",
    "amount": 1125,
    "amount_bdt": 1125,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2425",
    "location": "Sylhet, BD",
    "occurred_at": "2026-11-20T16:18:20.000Z",
    "risk_score": 6.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 5,
      "behavioral_anomaly": 5,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-9201",
      "current_device": "DEV-2425",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1125,
      "current_transaction_bdt": 1125,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Prepaid Mobile Internet Bundle at Grameenphone Flexiload. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Grameenphone Flexiload-\u098f Prepaid Mobile Internet Bundle-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1026",
    "transaction_code": "TXN-NOR-1026",
    "customer_code": "CUST-10334",
    "customer_name": "Anika Tabassum",
    "sender_wallet": "01966-990011",
    "recipient_wallet": "MERCH-DARAZ-PAY",
    "amount": 2300,
    "amount_bdt": 2300,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2442",
    "location": "Rajshahi, BD",
    "occurred_at": "2026-11-20T16:36:29.000Z",
    "risk_score": 8.1,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 7,
      "behavioral_anomaly": 6,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-0334",
      "current_device": "DEV-2442",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 2300,
      "current_transaction_bdt": 2300,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for E-Commerce Gadget Order at Daraz Bangladesh Online. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Daraz Bangladesh Online-\u098f E-Commerce Gadget Order-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1027",
    "transaction_code": "TXN-NOR-1027",
    "customer_code": "CUST-14820",
    "customer_name": "Sumaiya Islam",
    "sender_wallet": "01788-112233",
    "recipient_wallet": "MERCH-UNIV-FEES",
    "amount": 15175,
    "amount_bdt": 15175,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2459",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T08:55:18.000Z",
    "risk_score": 9.9,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 8,
      "behavioral_anomaly": 7,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-4820",
      "current_device": "DEV-2459",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 15175,
      "current_transaction_bdt": 15175,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Semester Tuition Payment at Dhaka University Tuition. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Dhaka University Tuition-\u098f Semester Tuition Payment-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1028",
    "transaction_code": "TXN-NOR-1028",
    "customer_code": "CUST-16733",
    "customer_name": "Mahmudul Hasan",
    "sender_wallet": "01899-223344",
    "recipient_wallet": "MERCH-HEALTH-MED",
    "amount": 4900,
    "amount_bdt": 4900,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2476",
    "location": "Khulna, BD",
    "occurred_at": "2026-11-20T14:51:19.000Z",
    "risk_score": 11.7,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 10,
      "behavioral_anomaly": 9,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-6733",
      "current_device": "DEV-2476",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 4900,
      "current_transaction_bdt": 4900,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Outpatient Consultation at Labaid Diagnostic Center. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Labaid Diagnostic Center-\u098f Outpatient Consultation-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1029",
    "transaction_code": "TXN-NOR-1029",
    "customer_code": "CUST-20194",
    "customer_name": "Jannatul Ferdous",
    "sender_wallet": "01521-445566",
    "recipient_wallet": "MERCH-SWEET-MEAT",
    "amount": 1405,
    "amount_bdt": 1405,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2493",
    "location": "Barisal, BD",
    "occurred_at": "2026-11-20T17:19:22.000Z",
    "risk_score": 13.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 12,
      "behavioral_anomaly": 10,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-0194",
      "current_device": "DEV-2493",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1405,
      "current_transaction_bdt": 1405,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Traditional Bakery Purchase at Bonoful Sweets & Bakery. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Bonoful Sweets & Bakery-\u098f Traditional Bakery Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1030",
    "transaction_code": "TXN-NOR-1030",
    "customer_code": "CUST-24108",
    "customer_name": "Sabina Yasmin",
    "sender_wallet": "01843-667788",
    "recipient_wallet": "MERCH-SHWAPNO-01",
    "amount": 3090,
    "amount_bdt": 3090,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2510",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T10:49:46.000Z",
    "risk_score": 15.3,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 13,
      "behavioral_anomaly": 12,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-4108",
      "current_device": "DEV-2510",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 3090,
      "current_transaction_bdt": 3090,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Grocery & Household Purchase at Shwapno Superstore. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Shwapno Superstore-\u098f Grocery & Household Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1031",
    "transaction_code": "TXN-NOR-1031",
    "customer_code": "CUST-32104",
    "customer_name": "Tariqul Islam",
    "sender_wallet": "01887-001122",
    "recipient_wallet": "MERCH-AGORA-04",
    "amount": 4925,
    "amount_bdt": 4925,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2527",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T16:38:43.000Z",
    "risk_score": 17.1,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 15,
      "behavioral_anomaly": 13,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-2104",
      "current_device": "DEV-2527",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 4925,
      "current_transaction_bdt": 4925,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Weekend Family Grocery at Agora Superstore. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Agora Superstore-\u098f Weekend Family Grocery-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1032",
    "transaction_code": "TXN-NOR-1032",
    "customer_code": "CUST-36209",
    "customer_name": "Shirin Akter",
    "sender_wallet": "01539-223344",
    "recipient_wallet": "MERCH-PATHAO-99",
    "amount": 1120,
    "amount_bdt": 1120,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2544",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T14:13:11.000Z",
    "risk_score": 18.9,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 17,
      "behavioral_anomaly": 15,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-6209",
      "current_device": "DEV-2544",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 1120,
      "current_transaction_bdt": 1120,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Commute Rideshare Trip at Pathao Rides & Food. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Pathao Rides & Food-\u098f Commute Rideshare Trip-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1033",
    "transaction_code": "TXN-NOR-1033",
    "customer_code": "CUST-33910",
    "customer_name": "Tanvir Hasan",
    "sender_wallet": "01911-334102",
    "recipient_wallet": "MERCH-CHALDAL-12",
    "amount": 2715,
    "amount_bdt": 2715,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2561",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T13:19:38.000Z",
    "risk_score": 20.7,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 18,
      "behavioral_anomaly": 16,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-3910",
      "current_device": "DEV-2561",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 2715,
      "current_transaction_bdt": 2715,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Weekly Fresh Produce at Chaldal Grocery Delivery. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Chaldal Grocery Delivery-\u098f Weekly Fresh Produce-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-NOR-1034",
    "transaction_code": "TXN-NOR-1034",
    "customer_code": "CUST-11928",
    "customer_name": "Nusrat Jahan",
    "sender_wallet": "01722-114477",
    "recipient_wallet": "MERCH-AARONG-02",
    "amount": 4300,
    "amount_bdt": 4300,
    "payment_type": "MERCHANT_PAY",
    "device_id": "DEV-2578",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T08:24:21.000Z",
    "risk_score": 22.5,
    "risk_level": "low",
    "status": "APPROVED",
    "action_taken": "APPROVE",
    "engine_scores": {
      "transaction_risk": 20,
      "behavioral_anomaly": 18,
      "account_takeover": 5,
      "network_intelligence": 6
    },
    "signals": [],
    "behavioral_profile": {
      "typical_device": "Device-1928",
      "current_device": "DEV-2578",
      "typical_hours": "08:00\u201322:00",
      "current_hour": "15:30",
      "historical_average_bdt": 4300,
      "current_transaction_bdt": 4300,
      "amount_deviation_pct": 0,
      "typical_daily_velocity": 4.1,
      "current_velocity_per_hour": 1.2,
      "recipient_relationship": "VERIFIED_MERCHANT"
    },
    "evidence": [],
    "ai_report": {
      "summary_en": "Verified benign transaction for Apparel & Lifestyle Purchase at Aarong Retail Gulshan. Behavioral biometrics match authorized customer profile.",
      "summary_bn": "Aarong Retail Gulshan-\u098f Apparel & Lifestyle Purchase-\u098f\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u0964 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u0993 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u09ab\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964",
      "recommended_action": "APPROVE",
      "recommendation_text": "Zero risk signals tripped. Instant automatic processing authorized."
    }
  },
  {
    "id": "TXN-MOD-2000",
    "transaction_code": "TXN-MOD-2000",
    "customer_code": "CUST-99201",
    "customer_name": "Tasnim Rahman",
    "sender_wallet": "01855-889900",
    "recipient_wallet": "01713-109536",
    "amount": 6500,
    "amount_bdt": 6500,
    "payment_type": "P2P",
    "device_id": "DEV-5000",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T13:54:17.000Z",
    "risk_score": 28.0,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 29,
      "behavioral_anomaly": 26,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-9201",
      "current_device": "DEV-5000",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 3900,
      "current_transaction_bdt": 6500,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f36,500 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f36,500 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2001",
    "transaction_code": "TXN-MOD-2001",
    "customer_code": "CUST-10334",
    "customer_name": "Anika Tabassum",
    "sender_wallet": "01966-990011",
    "recipient_wallet": "01745-108928",
    "amount": 7450,
    "amount_bdt": 7450,
    "payment_type": "P2P",
    "device_id": "DEV-5023",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T11:33:43.000Z",
    "risk_score": 31.4,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 32,
      "behavioral_anomaly": 29,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-0334",
      "current_device": "DEV-5023",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 4470,
      "current_transaction_bdt": 7450,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f37,450 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f37,450 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2002",
    "transaction_code": "TXN-MOD-2002",
    "customer_code": "CUST-14820",
    "customer_name": "Sumaiya Islam",
    "sender_wallet": "01788-112233",
    "recipient_wallet": "01799-935612",
    "amount": 8400,
    "amount_bdt": 8400,
    "payment_type": "P2P",
    "device_id": "DEV-5046",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T14:23:37.000Z",
    "risk_score": 34.8,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 36,
      "behavioral_anomaly": 33,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-4820",
      "current_device": "DEV-5046",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 5040,
      "current_transaction_bdt": 8400,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f38,400 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f38,400 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2003",
    "transaction_code": "TXN-MOD-2003",
    "customer_code": "CUST-16733",
    "customer_name": "Mahmudul Hasan",
    "sender_wallet": "01899-223344",
    "recipient_wallet": "01786-567901",
    "amount": 9350,
    "amount_bdt": 9350,
    "payment_type": "P2P",
    "device_id": "DEV-5069",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T15:48:18.000Z",
    "risk_score": 38.2,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 40,
      "behavioral_anomaly": 36,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-6733",
      "current_device": "DEV-5069",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 5610,
      "current_transaction_bdt": 9350,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f39,350 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f39,350 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2004",
    "transaction_code": "TXN-MOD-2004",
    "customer_code": "CUST-20194",
    "customer_name": "Jannatul Ferdous",
    "sender_wallet": "01521-445566",
    "recipient_wallet": "01718-102627",
    "amount": 10300,
    "amount_bdt": 10300,
    "payment_type": "P2P",
    "device_id": "DEV-5092",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T17:36:37.000Z",
    "risk_score": 41.6,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 43,
      "behavioral_anomaly": 39,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-0194",
      "current_device": "DEV-5092",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 6180,
      "current_transaction_bdt": 10300,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f310,300 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f310,300 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2005",
    "transaction_code": "TXN-MOD-2005",
    "customer_code": "CUST-24108",
    "customer_name": "Sabina Yasmin",
    "sender_wallet": "01843-667788",
    "recipient_wallet": "01711-293263",
    "amount": 11250,
    "amount_bdt": 11250,
    "payment_type": "P2P",
    "device_id": "DEV-5115",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T12:40:37.000Z",
    "risk_score": 45.0,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 47,
      "behavioral_anomaly": 42,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-4108",
      "current_device": "DEV-5115",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 6750,
      "current_transaction_bdt": 11250,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f311,250 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f311,250 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2006",
    "transaction_code": "TXN-MOD-2006",
    "customer_code": "CUST-32104",
    "customer_name": "Tariqul Islam",
    "sender_wallet": "01887-001122",
    "recipient_wallet": "01748-421116",
    "amount": 12200,
    "amount_bdt": 12200,
    "payment_type": "P2P",
    "device_id": "DEV-5138",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T13:49:18.000Z",
    "risk_score": 48.4,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 50,
      "behavioral_anomaly": 45,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-2104",
      "current_device": "DEV-5138",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 7320,
      "current_transaction_bdt": 12200,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f312,200 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f312,200 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2007",
    "transaction_code": "TXN-MOD-2007",
    "customer_code": "CUST-36209",
    "customer_name": "Shirin Akter",
    "sender_wallet": "01539-223344",
    "recipient_wallet": "01737-839121",
    "amount": 13150,
    "amount_bdt": 13150,
    "payment_type": "P2P",
    "device_id": "DEV-5161",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T14:42:32.000Z",
    "risk_score": 51.8,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 54,
      "behavioral_anomaly": 49,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-6209",
      "current_device": "DEV-5161",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 7890,
      "current_transaction_bdt": 13150,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f313,150 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f313,150 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2008",
    "transaction_code": "TXN-MOD-2008",
    "customer_code": "CUST-33910",
    "customer_name": "Tanvir Hasan",
    "sender_wallet": "01911-334102",
    "recipient_wallet": "01755-698842",
    "amount": 14100,
    "amount_bdt": 14100,
    "payment_type": "P2P",
    "device_id": "DEV-5184",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T17:56:31.000Z",
    "risk_score": 28.0,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 29,
      "behavioral_anomaly": 26,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-3910",
      "current_device": "DEV-5184",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 8460,
      "current_transaction_bdt": 14100,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f314,100 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f314,100 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2009",
    "transaction_code": "TXN-MOD-2009",
    "customer_code": "CUST-11928",
    "customer_name": "Nusrat Jahan",
    "sender_wallet": "01722-114477",
    "recipient_wallet": "01731-117868",
    "amount": 15050,
    "amount_bdt": 15050,
    "payment_type": "P2P",
    "device_id": "DEV-5207",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T14:48:56.000Z",
    "risk_score": 31.4,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 32,
      "behavioral_anomaly": 29,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-1928",
      "current_device": "DEV-5207",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 9030,
      "current_transaction_bdt": 15050,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f315,050 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f315,050 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2010",
    "transaction_code": "TXN-MOD-2010",
    "customer_code": "CUST-77182",
    "customer_name": "Fahim Chowdhury",
    "sender_wallet": "01744-778899",
    "recipient_wallet": "01795-589605",
    "amount": 16000,
    "amount_bdt": 16000,
    "payment_type": "P2P",
    "device_id": "DEV-5230",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T15:43:18.000Z",
    "risk_score": 34.8,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 36,
      "behavioral_anomaly": 33,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-7182",
      "current_device": "DEV-5230",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 9600,
      "current_transaction_bdt": 16000,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f316,000 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f316,000 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2011",
    "transaction_code": "TXN-MOD-2011",
    "customer_code": "CUST-99201",
    "customer_name": "Tasnim Rahman",
    "sender_wallet": "01855-889900",
    "recipient_wallet": "01726-815163",
    "amount": 16950,
    "amount_bdt": 16950,
    "payment_type": "P2P",
    "device_id": "DEV-5253",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T12:11:34.000Z",
    "risk_score": 38.2,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 40,
      "behavioral_anomaly": 36,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-9201",
      "current_device": "DEV-5253",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 10170,
      "current_transaction_bdt": 16950,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f316,950 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f316,950 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2012",
    "transaction_code": "TXN-MOD-2012",
    "customer_code": "CUST-10334",
    "customer_name": "Anika Tabassum",
    "sender_wallet": "01966-990011",
    "recipient_wallet": "01718-326648",
    "amount": 17900,
    "amount_bdt": 17900,
    "payment_type": "P2P",
    "device_id": "DEV-5276",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T16:44:18.000Z",
    "risk_score": 41.6,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 43,
      "behavioral_anomaly": 39,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-0334",
      "current_device": "DEV-5276",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 10740,
      "current_transaction_bdt": 17900,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f317,900 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f317,900 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2013",
    "transaction_code": "TXN-MOD-2013",
    "customer_code": "CUST-14820",
    "customer_name": "Sumaiya Islam",
    "sender_wallet": "01788-112233",
    "recipient_wallet": "01763-975618",
    "amount": 18850,
    "amount_bdt": 18850,
    "payment_type": "P2P",
    "device_id": "DEV-5299",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T12:56:22.000Z",
    "risk_score": 45.0,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 47,
      "behavioral_anomaly": 42,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-4820",
      "current_device": "DEV-5299",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 11310,
      "current_transaction_bdt": 18850,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f318,850 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f318,850 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2014",
    "transaction_code": "TXN-MOD-2014",
    "customer_code": "CUST-16733",
    "customer_name": "Mahmudul Hasan",
    "sender_wallet": "01899-223344",
    "recipient_wallet": "01777-922703",
    "amount": 19800,
    "amount_bdt": 19800,
    "payment_type": "P2P",
    "device_id": "DEV-5322",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T14:29:55.000Z",
    "risk_score": 48.4,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 50,
      "behavioral_anomaly": 45,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-6733",
      "current_device": "DEV-5322",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 11880,
      "current_transaction_bdt": 19800,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f319,800 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f319,800 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2015",
    "transaction_code": "TXN-MOD-2015",
    "customer_code": "CUST-20194",
    "customer_name": "Jannatul Ferdous",
    "sender_wallet": "01521-445566",
    "recipient_wallet": "01758-215090",
    "amount": 20750,
    "amount_bdt": 20750,
    "payment_type": "P2P",
    "device_id": "DEV-5345",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T14:29:52.000Z",
    "risk_score": 51.8,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 54,
      "behavioral_anomaly": 49,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-0194",
      "current_device": "DEV-5345",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 12450,
      "current_transaction_bdt": 20750,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f320,750 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f320,750 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2016",
    "transaction_code": "TXN-MOD-2016",
    "customer_code": "CUST-24108",
    "customer_name": "Sabina Yasmin",
    "sender_wallet": "01843-667788",
    "recipient_wallet": "01767-795540",
    "amount": 21700,
    "amount_bdt": 21700,
    "payment_type": "P2P",
    "device_id": "DEV-5368",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T17:31:18.000Z",
    "risk_score": 28.0,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 29,
      "behavioral_anomaly": 26,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-4108",
      "current_device": "DEV-5368",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 13020,
      "current_transaction_bdt": 21700,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f321,700 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f321,700 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2017",
    "transaction_code": "TXN-MOD-2017",
    "customer_code": "CUST-32104",
    "customer_name": "Tariqul Islam",
    "sender_wallet": "01887-001122",
    "recipient_wallet": "01766-130432",
    "amount": 22650,
    "amount_bdt": 22650,
    "payment_type": "P2P",
    "device_id": "DEV-5391",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T17:29:57.000Z",
    "risk_score": 31.4,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 32,
      "behavioral_anomaly": 29,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-2104",
      "current_device": "DEV-5391",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 13590,
      "current_transaction_bdt": 22650,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f322,650 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f322,650 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2018",
    "transaction_code": "TXN-MOD-2018",
    "customer_code": "CUST-36209",
    "customer_name": "Shirin Akter",
    "sender_wallet": "01539-223344",
    "recipient_wallet": "01710-135477",
    "amount": 23600,
    "amount_bdt": 23600,
    "payment_type": "P2P",
    "device_id": "DEV-5414",
    "location": "Dhaka, BD",
    "occurred_at": "2026-11-20T17:58:55.000Z",
    "risk_score": 34.8,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 36,
      "behavioral_anomaly": 33,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-6209",
      "current_device": "DEV-5414",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 14160,
      "current_transaction_bdt": 23600,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f323,600 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f323,600 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  },
  {
    "id": "TXN-MOD-2019",
    "transaction_code": "TXN-MOD-2019",
    "customer_code": "CUST-33910",
    "customer_name": "Tanvir Hasan",
    "sender_wallet": "01911-334102",
    "recipient_wallet": "01722-501358",
    "amount": 24550,
    "amount_bdt": 24550,
    "payment_type": "P2P",
    "device_id": "DEV-5437",
    "location": "Chittagong, BD",
    "occurred_at": "2026-11-20T11:15:30.000Z",
    "risk_score": 38.2,
    "risk_level": "medium",
    "status": "APPROVED",
    "action_taken": "MONITOR",
    "engine_scores": {
      "transaction_risk": 40,
      "behavioral_anomaly": 36,
      "account_takeover": 22,
      "network_intelligence": 18
    },
    "signals": [
      {
        "code": "FIRST_TIME_PEER",
        "name": "First-Time Recipient Transfer",
        "severity": "medium"
      }
    ],
    "behavioral_profile": {
      "typical_device": "Device-3910",
      "current_device": "DEV-5437",
      "typical_hours": "09:00\u201321:00",
      "current_hour": "16:45",
      "historical_average_bdt": 14730,
      "current_transaction_bdt": 24550,
      "amount_deviation_pct": 66,
      "typical_daily_velocity": 3.8,
      "current_velocity_per_hour": 2.1,
      "recipient_relationship": "NEW_RECIPIENT"
    },
    "evidence": [
      {
        "signal": "first_time_peer",
        "severity": "medium",
        "source": "behavioral_anomaly_model",
        "evidence": "Customer transferring to new wallet for first time."
      }
    ],
    "ai_report": {
      "summary_en": "P2P transfer of \u09f324,550 to unfamiliar wallet. Amount falls within acceptable secondary tolerance threshold.",
      "summary_bn": "\u09f324,550 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09a8\u09a4\u09c1\u09a8 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0\u0964 \u0997\u09cd\u09b0\u09b9\u09a3\u09af\u09cb\u0997\u09cd\u09af \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09b8\u09b9\u09a8\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a5\u09be\u0995\u09be\u09df \u09b8\u09a4\u09b0\u09cd\u0995 \u09a8\u099c\u09b0\u09a6\u09be\u09b0\u09bf\u09a4\u09c7 \u09b0\u09be\u0996\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      "recommended_action": "MONITOR",
      "recommendation_text": "Approved with passive graph telemetry tracking."
    }
  }
];
  const cases = [
  {
    "id": "CASE-0001",
    "code": "CASE-0001",
    "title": "Critical ATO & Rapid Mule Liquidation (TXN-982173)",
    "priority": "CRITICAL",
    "status": "OPEN",
    "transaction_code": "TXN-982173",
    "assigned_analyst": "Sadia Jannat",
    "risk_score": 94.3,
    "created_at": "2026-11-20T17:45:00.000Z",
    "updated_at": "2026-11-20T17:55:00.000Z",
    "transaction": {
      "id": "TXN-982173",
      "transaction_code": "TXN-982173",
      "customer_code": "CUST-10492",
      "customer_name": "Arif Hossain",
      "sender_wallet": "01711-982173",
      "recipient_wallet": "01912-882104",
      "amount": 18700,
      "amount_bdt": 18700,
      "payment_type": "CASH_OUT",
      "device_id": "DEV-8821",
      "location": "Sylhet, BD",
      "occurred_at": "2026-11-20T17:45:00.000Z",
      "risk_score": 94.3,
      "risk_level": "critical",
      "status": "HELD_FOR_REVIEW",
      "action_taken": "HOLD_REVIEW",
      "is_hero": true,
      "engine_scores": {
        "transaction_risk": 86,
        "behavioral_anomaly": 94,
        "account_takeover": 91,
        "network_intelligence": 78
      },
      "signals": [
        {
          "code": "NEW_DEVICE",
          "name": "New Device Pairing",
          "severity": "high"
        },
        {
          "code": "AMOUNT_DEVIATION",
          "name": "Unusual Amount (+1408%)",
          "severity": "critical"
        },
        {
          "code": "VELOCITY_SPIKE",
          "name": "Velocity Spike (5 tx / 2 min)",
          "severity": "critical"
        },
        {
          "code": "TIME_ANOMALY",
          "name": "Unusual Hour (02:13 AM)",
          "severity": "high"
        },
        {
          "code": "MULE_CLUSTER",
          "name": "Downstream Mule Ring Hops",
          "severity": "high"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-88 (Dhaka)",
        "current_device": "DEV-8821 (Sylhet)",
        "typical_hours": "17:00\u201323:00",
        "current_hour": "02:13 AM",
        "historical_average_bdt": 1240,
        "current_transaction_bdt": 18700,
        "amount_deviation_pct": 1408,
        "typical_daily_velocity": 4.2,
        "current_velocity_per_hour": 11.0,
        "recipient_relationship": "NEW_RECIPIENT"
      },
      "evidence": [
        {
          "signal": "new_device",
          "severity": "high",
          "source": "walletguard_ato_model",
          "evidence": "Device DEV-8821 has not previously been associated with customer CUST-10492."
        },
        {
          "signal": "amount_deviation",
          "severity": "critical",
          "source": "behavioral_anomaly_model",
          "evidence": "Transaction amount (\u09f318,700) is +1408% above customer historical median (\u09f31,240)."
        },
        {
          "signal": "time_deviation",
          "severity": "high",
          "source": "behavioral_anomaly_model",
          "evidence": "Transaction occurred at 02:13 AM outside standard activity window (17:00\u201323:00)."
        },
        {
          "signal": "mule_connection",
          "severity": "high",
          "source": "scamshield_network_engine",
          "evidence": "Recipient wallet 01912-882104 has 7 downstream fan-out connections to known mule cash-out nodes."
        },
        {
          "signal": "velocity_spike",
          "severity": "critical",
          "source": "transaction_risk_model",
          "evidence": "5 consecutive cash-out transactions attempted within a 120-second window."
        }
      ],
      "ai_report": {
        "summary_en": "The transaction presents elevated risk because it significantly deviates from customer CUST-10492 historical baseline. Originating from an unfamiliar device (DEV-8821) in Sylhet at 02:13 AM, the \u09f318,700 cashout represents a 14.1x deviation over typical amounts. Connected graph analysis indicates recipient 01912-882104 actively routes funds to a rapid-liquidation syndicate.",
        "summary_bn": "\u098f\u0987 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u099f\u09bf \u0985\u09a4\u09cd\u09af\u09a8\u09cd\u09a4 \u099d\u09c1\u0981\u0995\u09bf\u09aa\u09c2\u09b0\u09cd\u09a3 \u0995\u09be\u09b0\u09a3 \u098f\u099f\u09bf \u0997\u09cd\u09b0\u09be\u09b9\u0995 CUST-10492-\u098f\u09b0 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7\u09b0 \u0986\u099a\u09b0\u09a3\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b8\u09be\u0982\u0998\u09b0\u09cd\u09b7\u09bf\u0995\u0964 \u09ad\u09cb\u09b0 \u09e6\u09e8:\u09e7\u09e9 \u09ae\u09bf\u09a8\u09bf\u099f\u09c7 \u09b8\u09bf\u09b2\u09c7\u099f \u09a5\u09c7\u0995\u09c7 \u098f\u0995\u099f\u09bf \u0985\u09aa\u09b0\u09bf\u099a\u09bf\u09a4 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 (DEV-8821) \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09f3\u09e7\u09ee,\u09ed\u09e6\u09e6 \u0995\u09cd\u09af\u09be\u09b6\u0986\u0989\u099f \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7, \u09af\u09be \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u0997\u09dc\u09c7\u09b0 \u099a\u09c7\u09af\u09bc\u09c7 \u09e7\u09ea \u0997\u09c1\u09a3\u09c7\u09b0\u0993 \u09ac\u09c7\u09b6\u09bf\u0964 \u09a8\u09c7\u099f\u0993\u09af\u09bc\u09be\u09b0\u09cd\u0995 \u0997\u09cd\u09b0\u09be\u09ab \u09ac\u09bf\u09b6\u09cd\u09b2\u09c7\u09b7\u09a3\u09c7 \u09a6\u09c7\u0996\u09be \u0997\u09c7\u099b\u09c7 \u09aa\u09cd\u09b0\u09be\u09aa\u0995 \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u099f\u09bf \u098f\u0995\u099f\u09bf \u09b8\u0995\u09cd\u09b0\u09bf\u09af\u09bc \u09ae\u09be\u09a8\u09bf \u09ae\u09bf\u0989\u09b2 \u09b8\u09bf\u09a8\u09cd\u09a1\u09bf\u0995\u09c7\u099f\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b8\u0982\u09af\u09c1\u0995\u09cd\u09a4\u0964",
        "recommended_action": "HUMAN_REVIEW_REQUIRED",
        "recommendation_text": "Do not automatically block funds. Initiate step-up biometric or SMS OTP confirmation with the verified account holder."
      }
    },
    "notes": [
      {
        "id": "note_1",
        "author": "System (ML Engine)",
        "created_at": "2026-11-20T17:45:10.000Z",
        "body": "Automated case opened: Overall risk 94.3 exceeded critical threshold (80.0). Tripped rules: NEW_DEVICE, TIME_ANOMALY, VELOCITY_SPIKE."
      },
      {
        "id": "note_2",
        "author": "Sadia Jannat",
        "created_at": "2026-11-20T17:52:00.000Z",
        "body": "Investigated recipient wallet 01912-882104 on network graph. Confirmed 7 fan-out connections. Recommending Step-Up verification & temporary hold on destination node."
      }
    ]
  },
  {
    "id": "CASE-0002",
    "code": "CASE-0002",
    "title": "Syndicated Circular Layering Ring (TXN-912241)",
    "priority": "HIGH",
    "status": "UNDER_INVESTIGATION",
    "transaction_code": "TXN-912241",
    "assigned_analyst": "Mohammad Badol",
    "risk_score": 88.4,
    "created_at": "2026-11-20T16:30:00.000Z",
    "updated_at": "2026-11-20T17:15:00.000Z",
    "transaction": {
      "id": "TXN-912241",
      "transaction_code": "TXN-912241",
      "customer_code": "CUST-88124",
      "customer_name": "Sadia Sultana",
      "sender_wallet": "01819-223145",
      "recipient_wallet": "01712-441290",
      "amount": 45000,
      "amount_bdt": 45000,
      "payment_type": "P2P",
      "device_id": "DEV-4412",
      "location": "Dhaka, BD",
      "occurred_at": "2026-11-20T14:47:30.000Z",
      "risk_score": 88.4,
      "risk_level": "high",
      "status": "UNDER_REVIEW",
      "action_taken": "STEP_UP",
      "engine_scores": {
        "transaction_risk": 83,
        "behavioral_anomaly": 86,
        "account_takeover": 61,
        "network_intelligence": 53
      },
      "signals": [
        {
          "code": "LARGE_VALUE",
          "name": "High Value Structuring",
          "severity": "high"
        },
        {
          "code": "LAYER_HOP",
          "name": "3-Hop Layering Pattern",
          "severity": "high"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-12",
        "current_device": "DEV-4412",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 11250,
        "current_transaction_bdt": 45000,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "UNUSUAL_ENTITY"
      },
      "evidence": [
        {
          "signal": "large_value",
          "severity": "high",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Rapid high-value P2P transfer structured just below regulatory reporting thresholds."
        }
      ],
      "ai_report": {
        "summary_en": "Rapid high-value P2P transfer structured just below regulatory reporting thresholds.",
        "summary_bn": "\u09a8\u09bf\u09af\u09bc\u09ae\u09ae\u09be\u09ab\u09bf\u0995 \u09b0\u09bf\u09aa\u09cb\u09b0\u09cd\u099f\u09bf\u0982 \u09b8\u09c0\u09ae\u09be \u098f\u09dc\u09be\u09a4\u09c7 \u09a6\u09cd\u09b0\u09c1\u09a4 \u0989\u099a\u09cd\u099a\u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u0995\u09be\u09a0\u09be\u09ae\u09cb \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
        "recommended_action": "STEP_UP",
        "recommendation_text": "Engine flagged transaction with risk score 88.4 due to High Value Structuring."
      }
    },
    "notes": [
      {
        "id": "note_201",
        "author": "Mohammad Badol",
        "created_at": "2026-11-20T16:45:00.000Z",
        "body": "Network graph analysis isolated 3-hop cyclic layering pattern. Graph neural network scored cluster centrality at 0.892."
      }
    ]
  },
  {
    "id": "CASE-0003",
    "code": "CASE-0003",
    "title": "SIM-Swap Structuring & Cashout Surge (TXN-773194)",
    "priority": "HIGH",
    "status": "UNDER_INVESTIGATION",
    "transaction_code": "TXN-773194",
    "assigned_analyst": "Rafi Mahmud",
    "risk_score": 82.0,
    "created_at": "2026-11-20T15:20:00.000Z",
    "updated_at": "2026-11-20T16:00:00.000Z",
    "transaction": {
      "id": "TXN-773194",
      "transaction_code": "TXN-773194",
      "customer_code": "CUST-66291",
      "customer_name": "Mehedi Hasan",
      "sender_wallet": "01612-998811",
      "recipient_wallet": "01511-224466",
      "amount": 24500,
      "amount_bdt": 24500,
      "payment_type": "CASH_OUT",
      "device_id": "DEV-5581",
      "location": "Rajshahi, BD",
      "occurred_at": "2026-11-20T13:28:30.000Z",
      "risk_score": 82.0,
      "risk_level": "high",
      "status": "HELD_FOR_REVIEW",
      "action_taken": "HOLD_REVIEW",
      "engine_scores": {
        "transaction_risk": 77,
        "behavioral_anomaly": 80,
        "account_takeover": 73,
        "network_intelligence": 49
      },
      "signals": [
        {
          "code": "SIM_SWAP",
          "name": "Recent SIM Replacement Window",
          "severity": "high"
        },
        {
          "code": "OFF_HOURS",
          "name": "Off-Hours Liquidation",
          "severity": "medium"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-81",
        "current_device": "DEV-5581",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 6125,
        "current_transaction_bdt": 24500,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "UNUSUAL_ENTITY"
      },
      "evidence": [
        {
          "signal": "sim_swap",
          "severity": "high",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Cash-out initiated 84 minutes following carrier SIM replacement event."
        }
      ],
      "ai_report": {
        "summary_en": "Cash-out initiated 84 minutes following carrier SIM replacement event.",
        "summary_bn": "\u099f\u09c7\u09b2\u09bf\u0995\u09ae \u09b8\u09bf\u09ae \u09aa\u09cd\u09b0\u09a4\u09bf\u09b8\u09cd\u09a5\u09be\u09aa\u09a8\u09c7\u09b0 \u09ae\u09be\u09a4\u09cd\u09b0 \u09ee\u09ea \u09ae\u09bf\u09a8\u09bf\u099f\u09c7\u09b0 \u09ae\u09be\u09a5\u09be\u09df \u0995\u09cd\u09af\u09be\u09b6\u0986\u0989\u099f \u09b6\u09c1\u09b0\u09c1 \u09b9\u09df\u09c7\u099b\u09c7\u0964",
        "recommended_action": "HOLD_REVIEW",
        "recommendation_text": "Engine flagged transaction with risk score 82.0 due to Recent SIM Replacement Window."
      }
    },
    "notes": [
      {
        "id": "note_301",
        "author": "Rafi Mahmud",
        "created_at": "2026-11-20T15:35:00.000Z",
        "body": "Telco API webhook verified SIM replacement occurred 84m prior to \u09f324,500 cashout. Initiated outbound callback verification."
      }
    ]
  },
  {
    "id": "CASE-0004",
    "code": "CASE-0004",
    "title": "Dormant High-Balance Wallet Awakening (TXN-441902)",
    "priority": "CRITICAL",
    "status": "OPEN",
    "transaction_code": "TXN-441902",
    "assigned_analyst": "Reyazul Islam",
    "risk_score": 95.8,
    "created_at": "2026-11-20T14:10:00.000Z",
    "updated_at": "2026-11-20T14:50:00.000Z",
    "transaction": {
      "id": "TXN-441902",
      "transaction_code": "TXN-441902",
      "customer_code": "CUST-26491",
      "customer_name": "Moniruzzaman",
      "sender_wallet": "01954-778899",
      "recipient_wallet": "01711-002288",
      "amount": 49200,
      "amount_bdt": 49200,
      "payment_type": "CASH_OUT",
      "device_id": "DEV-3312",
      "location": "Dhaka, BD",
      "occurred_at": "2026-11-20T17:25:30.000Z",
      "risk_score": 95.8,
      "risk_level": "critical",
      "status": "BLOCKED",
      "action_taken": "AUTO_BLOCK",
      "engine_scores": {
        "transaction_risk": 91,
        "behavioral_anomaly": 93,
        "account_takeover": 86,
        "network_intelligence": 91
      },
      "signals": [
        {
          "code": "DORMANT_WAKE",
          "name": "Dormant Wallet Liquidation (190d)",
          "severity": "critical"
        },
        {
          "code": "GEO_JUMP",
          "name": "Impossible Velocity Geo-Jump",
          "severity": "critical"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-12",
        "current_device": "DEV-3312",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 12300,
        "current_transaction_bdt": 49200,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "FLAGGED_ENTITY"
      },
      "evidence": [
        {
          "signal": "dormant_wake",
          "severity": "critical",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Dormant account inactive for 190 days suddenly attempted maximum single cash-out from new IP."
        }
      ],
      "ai_report": {
        "summary_en": "Dormant account inactive for 190 days suddenly attempted maximum single cash-out from new IP.",
        "summary_bn": "\u09e7\u09ef\u09e6 \u09a6\u09bf\u09a8 \u09a8\u09bf\u09b7\u09cd\u0995\u09cd\u09b0\u09bf\u09af\u09bc \u09a5\u09be\u0995\u09be \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09a5\u09c7\u0995\u09c7 \u09b9\u09a0\u09be\u09ce \u09a8\u09a4\u09c1\u09a8 \u0986\u0987\u09aa\u09bf \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u0995\u09cd\u09af\u09be\u09b6\u0986\u0989\u099f \u099a\u09c7\u09b7\u09cd\u099f\u09be\u0964",
        "recommended_action": "AUTO_BLOCK",
        "recommendation_text": "Engine flagged transaction with risk score 95.8 due to Dormant Wallet Liquidation (190d)."
      }
    },
    "notes": [
      {
        "id": "note_401",
        "author": "Reyazul Islam",
        "created_at": "2026-11-20T14:30:00.000Z",
        "body": "Executive freeze authorized. Wallet was dormant 190 days before sudden maximum single limit cash-out attempt."
      }
    ]
  },
  {
    "id": "CASE-0005",
    "code": "CASE-0005",
    "title": "Rogue Merchant Circular QR Kickback (TXN-664192)",
    "priority": "CRITICAL",
    "status": "UNDER_INVESTIGATION",
    "transaction_code": "TXN-664192",
    "assigned_analyst": "Sadia Jannat",
    "risk_score": 91.2,
    "created_at": "2026-11-20T13:40:00.000Z",
    "updated_at": "2026-11-20T14:20:00.000Z",
    "transaction": {
      "id": "TXN-664192",
      "transaction_code": "TXN-664192",
      "customer_code": "CUST-88124",
      "customer_name": "Sadia Sultana",
      "sender_wallet": "01819-223145",
      "recipient_wallet": "MERCH-094",
      "amount": 38000,
      "amount_bdt": 38000,
      "payment_type": "QR_PAYMENT",
      "device_id": "DEV-6201",
      "location": "Dhaka, BD",
      "occurred_at": "2026-11-20T15:44:30.000Z",
      "risk_score": 91.2,
      "risk_level": "critical",
      "status": "UNDER_REVIEW",
      "action_taken": "INVESTIGATE",
      "engine_scores": {
        "transaction_risk": 86,
        "behavioral_anomaly": 89,
        "account_takeover": 63,
        "network_intelligence": 86
      },
      "signals": [
        {
          "code": "ROGUE_QR",
          "name": "Rogue Merchant Circular Wash",
          "severity": "critical"
        },
        {
          "code": "KICKBACK_LOOP",
          "name": "Automated Kickback Loop",
          "severity": "high"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-01",
        "current_device": "DEV-6201",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 9500,
        "current_transaction_bdt": 38000,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "FLAGGED_ENTITY"
      },
      "evidence": [
        {
          "signal": "rogue_qr",
          "severity": "critical",
          "source": "nexusguard_neural_pipeline",
          "evidence": "High velocity QR transactions routed through dormant merchant POS terminal with immediate 95% cash-back fan-out."
        }
      ],
      "ai_report": {
        "summary_en": "High velocity QR transactions routed through dormant merchant POS terminal with immediate 95% cash-back fan-out.",
        "summary_bn": "\u09b8\u09c1\u09aa\u09cd\u09a4 \u09ae\u09be\u09b0\u09cd\u099a\u09c7\u09a8\u09cd\u099f \u09aa\u09bf\u0993\u098f\u09b8 \u099f\u09be\u09b0\u09cd\u09ae\u09bf\u09a8\u09be\u09b2\u09c7\u09b0 \u09ae\u09be\u09a7\u09cd\u09af\u09ae\u09c7 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u0995\u09bf\u0989\u0986\u09b0 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u0993 \u09ef\u09eb% \u09a8\u0997\u09a6 \u09ab\u09c7\u09b0\u09a4 \u09aa\u09cd\u09b0\u09ac\u09be\u09b9\u0964",
        "recommended_action": "INVESTIGATE",
        "recommendation_text": "Engine flagged transaction with risk score 91.2 due to Rogue Merchant Circular Wash."
      }
    },
    "notes": [
      {
        "id": "note_501",
        "author": "Sadia Jannat",
        "created_at": "2026-11-20T14:00:00.000Z",
        "body": "MERCH-094 QR terminal flagged for 14 rapid micro-credits followed by immediate 95% cash-back fan-out to 3 mule nodes."
      }
    ]
  },
  {
    "id": "CASE-0006",
    "code": "CASE-0006",
    "title": "Micro-Smurfing Burst & Threshold Evasion (TXN-554109)",
    "priority": "CRITICAL",
    "status": "OPEN",
    "transaction_code": "TXN-554109",
    "assigned_analyst": "Mohammad Badol",
    "risk_score": 92.6,
    "created_at": "2026-11-20T13:00:00.000Z",
    "updated_at": "2026-11-20T13:30:00.000Z",
    "transaction": {
      "id": "TXN-554109",
      "transaction_code": "TXN-554109",
      "customer_code": "CUST-44102",
      "customer_name": "Kamrul Islam",
      "sender_wallet": "01934-556677",
      "recipient_wallet": "01811-998800",
      "amount": 24900,
      "amount_bdt": 24900,
      "payment_type": "P2P",
      "device_id": "DEV-7102",
      "location": "Barisal, BD",
      "occurred_at": "2026-11-20T13:17:30.000Z",
      "risk_score": 92.6,
      "risk_level": "critical",
      "status": "BLOCKED",
      "action_taken": "AUTO_BLOCK",
      "engine_scores": {
        "transaction_risk": 87,
        "behavioral_anomaly": 90,
        "account_takeover": 64,
        "network_intelligence": 87
      },
      "signals": [
        {
          "code": "SMURF_BURST",
          "name": "Micro-Smurfing Burst (8x)",
          "severity": "critical"
        },
        {
          "code": "THRESHOLD_EVASION",
          "name": "\u09f325k Evasion Pattern",
          "severity": "critical"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-02",
        "current_device": "DEV-7102",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 6225,
        "current_transaction_bdt": 24900,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "FLAGGED_ENTITY"
      },
      "evidence": [
        {
          "signal": "smurf_burst",
          "severity": "critical",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Series of 8 rapid P2P transfers structured at \u09f324,900 to circumvent BFIU threshold."
        }
      ],
      "ai_report": {
        "summary_en": "Series of 8 rapid P2P transfers structured at \u09f324,900 to circumvent BFIU threshold.",
        "summary_bn": "\u09ac\u09bf\u098f\u09ab\u0986\u0987\u0987\u0989 \u09b8\u09c0\u09ae\u09be \u09ab\u09be\u0981\u0995\u09bf \u09a6\u09bf\u09a4\u09c7 \u09f3\u09e8\u09ea,\u09ef\u09e6\u09e6 \u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u09ee\u099f\u09bf \u09a6\u09cd\u09b0\u09c1\u09a4 \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09a7\u09be\u09b0\u09be \u09b6\u09a8\u09be\u0995\u09cd\u09a4\u0964",
        "recommended_action": "AUTO_BLOCK",
        "recommendation_text": "Engine flagged transaction with risk score 92.6 due to Micro-Smurfing Burst (8x)."
      }
    },
    "notes": [
      {
        "id": "note_601",
        "author": "Mohammad Badol",
        "created_at": "2026-11-20T13:15:00.000Z",
        "body": "Pattern analysis detected 8 transfers at exactly \u09f324,900 to evade BFIU \u09f325,000 regulatory reporting threshold."
      }
    ]
  },
  {
    "id": "CASE-0007",
    "code": "CASE-0007",
    "title": "Cross-District High Velocity P2P Cluster (TXN-774412)",
    "priority": "HIGH",
    "status": "OPEN",
    "transaction_code": "TXN-774412",
    "assigned_analyst": "Rafi Mahmud",
    "risk_score": 78.5,
    "created_at": "2026-11-20T12:15:00.000Z",
    "updated_at": "2026-11-20T12:45:00.000Z",
    "transaction": {
      "id": "TXN-774412",
      "transaction_code": "TXN-774412",
      "customer_code": "CUST-22319",
      "customer_name": "Naimur Rahman",
      "sender_wallet": "01732-556677",
      "recipient_wallet": "01823-119933",
      "amount": 31500,
      "amount_bdt": 31500,
      "payment_type": "P2P",
      "device_id": "DEV-3321",
      "location": "Rajshahi, BD",
      "occurred_at": "2026-11-20T11:31:30.000Z",
      "risk_score": 78.5,
      "risk_level": "high",
      "status": "UNDER_REVIEW",
      "action_taken": "STEP_UP",
      "engine_scores": {
        "transaction_risk": 74,
        "behavioral_anomaly": 76,
        "account_takeover": 54,
        "network_intelligence": 47
      },
      "signals": [
        {
          "code": "UNUSUAL_RECIPIENT",
          "name": "Cross-District High Velocity",
          "severity": "high"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-21",
        "current_device": "DEV-3321",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 7875,
        "current_transaction_bdt": 31500,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "UNUSUAL_ENTITY"
      },
      "evidence": [
        {
          "signal": "unusual_recipient",
          "severity": "high",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Cross-district P2P transfer to newly activated wallet exhibiting abnormal transaction frequency."
        }
      ],
      "ai_report": {
        "summary_en": "Cross-district P2P transfer to newly activated wallet exhibiting abnormal transaction frequency.",
        "summary_bn": "\u09a8\u09a4\u09c1\u09a8 \u09b8\u0995\u09cd\u09b0\u09bf\u09af\u09bc \u0993\u09af\u09bc\u09be\u09b2\u09c7\u099f\u09c7 \u0986\u09a8\u09cd\u09a4\u0983\u099c\u09c7\u09b2\u09be \u09aa\u09bf\u099f\u09c1\u09aa\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0 \u09af\u09be\u09a4\u09c7 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7\u09b0 \u09aa\u09c1\u09a8\u09b0\u09be\u09ac\u09c3\u09a4\u09cd\u09a4\u09bf \u09a6\u09c7\u0996\u09be \u0997\u09c7\u099b\u09c7\u0964",
        "recommended_action": "STEP_UP",
        "recommendation_text": "Engine flagged transaction with risk score 78.5 due to Cross-District High Velocity."
      }
    },
    "notes": [
      {
        "id": "note_701",
        "author": "Rafi Mahmud",
        "created_at": "2026-11-20T12:30:00.000Z",
        "body": "Rajshahi to Chittagong rapid transfer chain tripped velocity limit rules. Placed on high-surveillance queue."
      }
    ]
  },
  {
    "id": "CASE-0008",
    "code": "CASE-0008",
    "title": "Off-Hours Hardware Emulator Spoofing (TXN-331890)",
    "priority": "CRITICAL",
    "status": "OPEN",
    "transaction_code": "TXN-331890",
    "assigned_analyst": "Reyazul Islam",
    "risk_score": 93.4,
    "created_at": "2026-11-20T11:50:00.000Z",
    "updated_at": "2026-11-20T12:20:00.000Z",
    "transaction": {
      "id": "TXN-331890",
      "transaction_code": "TXN-331890",
      "customer_code": "CUST-12490",
      "customer_name": "Ashikur Rahman",
      "sender_wallet": "01677-001122",
      "recipient_wallet": "01819-771122",
      "amount": 19800,
      "amount_bdt": 19800,
      "payment_type": "CASH_OUT",
      "device_id": "DEV-4488",
      "location": "Bogra, BD",
      "occurred_at": "2026-11-20T14:10:30.000Z",
      "risk_score": 93.4,
      "risk_level": "critical",
      "status": "HELD_FOR_REVIEW",
      "action_taken": "HOLD_REVIEW",
      "engine_scores": {
        "transaction_risk": 88,
        "behavioral_anomaly": 91,
        "account_takeover": 84,
        "network_intelligence": 88
      },
      "signals": [
        {
          "code": "EMULATOR_DETECT",
          "name": "Rooted Hardware Emulator",
          "severity": "critical"
        },
        {
          "code": "HOOK_DETECTED",
          "name": "Frida Instrumentation Framework",
          "severity": "critical"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-88",
        "current_device": "DEV-4488",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 4950,
        "current_transaction_bdt": 19800,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "FLAGGED_ENTITY"
      },
      "evidence": [
        {
          "signal": "emulator_detect",
          "severity": "critical",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Transaction originated from rooted Android virtual machine with active Frida instrumentation hooked into biometrics."
        }
      ],
      "ai_report": {
        "summary_en": "Transaction originated from rooted Android virtual machine with active Frida instrumentation hooked into biometrics.",
        "summary_bn": "\u09b0\u09c1\u099f\u09c7\u09a1 \u09ad\u09be\u09b0\u09cd\u099a\u09c1\u09df\u09be\u09b2 \u09ae\u09c7\u09b6\u09bf\u09a8 \u0993 \u09ab\u09cd\u09b0\u09bf\u09a1\u09be \u0987\u09a8\u09b8\u09cd\u099f\u09cd\u09b0\u09c1\u09ae\u09c7\u09a8\u09cd\u099f\u09c7\u09b6\u09a8 \u09ab\u09cd\u09b0\u09c7\u09ae\u0993\u09df\u09be\u09b0\u09cd\u0995 \u09a6\u09bf\u09df\u09c7 \u09ac\u09be\u09af\u09bc\u09cb\u09ae\u09c7\u099f\u09cd\u09b0\u09bf\u0995 \u09ac\u09be\u0987\u09aa\u09be\u09b8 \u099a\u09c7\u09b7\u09cd\u099f\u09be\u0964",
        "recommended_action": "HOLD_REVIEW",
        "recommendation_text": "Engine flagged transaction with risk score 93.4 due to Rooted Hardware Emulator."
      }
    },
    "notes": [
      {
        "id": "note_801",
        "author": "Reyazul Islam",
        "created_at": "2026-11-20T12:05:00.000Z",
        "body": "Rooted Android emulator detected via Frida hook inspection. Device hardware signature blacklisted across the cluster."
      }
    ]
  },
  {
    "id": "CASE-0009",
    "code": "CASE-0009",
    "title": "International Remittance Hash Discrepancy (TXN-881290)",
    "priority": "HIGH",
    "status": "UNDER_INVESTIGATION",
    "transaction_code": "TXN-881290",
    "assigned_analyst": "Sadia Jannat",
    "risk_score": 89.1,
    "created_at": "2026-11-20T11:00:00.000Z",
    "updated_at": "2026-11-20T11:35:00.000Z",
    "transaction": {
      "id": "TXN-881290",
      "transaction_code": "TXN-881290",
      "customer_code": "CUST-30491",
      "customer_name": "Bilkis Begum",
      "sender_wallet": "01776-990011",
      "recipient_wallet": "01922-334411",
      "amount": 48500,
      "amount_bdt": 48500,
      "payment_type": "REMITTANCE_INBOUND",
      "device_id": "DEV-9912",
      "location": "Comilla, BD",
      "occurred_at": "2026-11-20T16:19:30.000Z",
      "risk_score": 89.1,
      "risk_level": "high",
      "status": "HELD_FOR_REVIEW",
      "action_taken": "HOLD_REVIEW",
      "engine_scores": {
        "transaction_risk": 84,
        "behavioral_anomaly": 87,
        "account_takeover": 62,
        "network_intelligence": 53
      },
      "signals": [
        {
          "code": "REMIT_ANOMALY",
          "name": "Cross-Border Gateway Mismatch",
          "severity": "high"
        },
        {
          "code": "NID_DISCREPANCY",
          "name": "Beneficiary NID Hash Mismatch",
          "severity": "high"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-12",
        "current_device": "DEV-9912",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 12125,
        "current_transaction_bdt": 48500,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "UNUSUAL_ENTITY"
      },
      "evidence": [
        {
          "signal": "remit_anomaly",
          "severity": "high",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Incoming remittance routing flagged for international originator mismatch against central NID registry."
        }
      ],
      "ai_report": {
        "summary_en": "Incoming remittance routing flagged for international originator mismatch against central NID registry.",
        "summary_bn": "\u0986\u09a8\u09cd\u09a4\u09b0\u09cd\u099c\u09be\u09a4\u09bf\u0995 \u09aa\u09cd\u09b0\u09c7\u09b0\u0995 \u09a4\u09a5\u09cd\u09af\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u0995\u09c7\u09a8\u09cd\u09a6\u09cd\u09b0\u09c0\u09df \u099c\u09be\u09a4\u09c0\u09df \u09aa\u09b0\u09bf\u099a\u09df\u09aa\u09a4\u09cd\u09b0 \u09a1\u09c7\u099f\u09be\u09ac\u09c7\u09b8\u09c7\u09b0 \u0985\u09b8\u09be\u09ae\u099e\u09cd\u099c\u09b8\u09cd\u09af \u09b6\u09a8\u09be\u0995\u09cd\u09a4\u0964",
        "recommended_action": "HOLD_REVIEW",
        "recommendation_text": "Engine flagged transaction with risk score 89.1 due to Cross-Border Gateway Mismatch."
      }
    },
    "notes": [
      {
        "id": "note_901",
        "author": "Sadia Jannat",
        "created_at": "2026-11-20T11:20:00.000Z",
        "body": "UAE gateway payload beneficiary NID does not match central Election Commission database. Drafting SAR notice."
      }
    ]
  },
  {
    "id": "CASE-0010",
    "code": "CASE-0010",
    "title": "Syndicate 12-Node Rapid Passthrough Hub (TXN-229041)",
    "priority": "CRITICAL",
    "status": "OPEN",
    "transaction_code": "TXN-229041",
    "assigned_analyst": "Mohammad Badol",
    "risk_score": 96.1,
    "created_at": "2026-11-20T10:15:00.000Z",
    "updated_at": "2026-11-20T10:45:00.000Z",
    "transaction": {
      "id": "TXN-229041",
      "transaction_code": "TXN-229041",
      "customer_code": "CUST-28310",
      "customer_name": "Shahadat Hossain",
      "sender_wallet": "01665-889900",
      "recipient_wallet": "01912-332211",
      "amount": 75000,
      "amount_bdt": 75000,
      "payment_type": "SEND_MONEY",
      "device_id": "DEV-1190",
      "location": "Rangpur, BD",
      "occurred_at": "2026-11-20T12:20:30.000Z",
      "risk_score": 96.1,
      "risk_level": "critical",
      "status": "BLOCKED",
      "action_taken": "AUTO_BLOCK",
      "engine_scores": {
        "transaction_risk": 91,
        "behavioral_anomaly": 94,
        "account_takeover": 67,
        "network_intelligence": 91
      },
      "signals": [
        {
          "code": "MULE_FANOUT",
          "name": "Syndicate Fan-out Hub",
          "severity": "critical"
        },
        {
          "code": "CHAIN_VELOCITY",
          "name": "Instantaneous Passthrough (<12s)",
          "severity": "critical"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-90",
        "current_device": "DEV-1190",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 18750,
        "current_transaction_bdt": 75000,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "FLAGGED_ENTITY"
      },
      "evidence": [
        {
          "signal": "mule_fanout",
          "severity": "critical",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Syndicate intermediary hub receiving bulk credits and fanning out to 12 mule nodes in under 12 seconds."
        }
      ],
      "ai_report": {
        "summary_en": "Syndicate intermediary hub receiving bulk credits and fanning out to 12 mule nodes in under 12 seconds.",
        "summary_bn": "\u09b8\u09bf\u09a8\u09cd\u09a1\u09bf\u0995\u09c7\u099f \u09ae\u09a7\u09cd\u09af\u09b8\u09cd\u09a5\u09a4\u09be\u0995\u09be\u09b0\u09c0 \u09a8\u09cb\u09a1 \u09af\u09be \u09e7\u09e8 \u09b8\u09c7\u0995\u09c7\u09a8\u09cd\u09a1\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09e7\u09e8\u099f\u09bf \u09aa\u09c3\u09a5\u0995 \u09ae\u09bf\u0989\u09b2 \u0993\u09df\u09be\u09b2\u09c7\u099f\u09c7 \u09a4\u09b9\u09ac\u09bf\u09b2 \u099b\u09dc\u09bf\u09df\u09c7 \u09a6\u09c7\u09df\u0964",
        "recommended_action": "AUTO_BLOCK",
        "recommendation_text": "Engine flagged transaction with risk score 96.1 due to Syndicate Fan-out Hub."
      }
    },
    "notes": [
      {
        "id": "note_1001",
        "author": "Mohammad Badol",
        "created_at": "2026-11-20T10:30:00.000Z",
        "body": "Rangpur regional syndicate node identified with 12 outgoing edges completed within 12 seconds."
      }
    ]
  },
  {
    "id": "CASE-0011",
    "code": "CASE-0011",
    "title": "320% Turnover Weekly Velocity Anomaly (TXN-661298)",
    "priority": "HIGH",
    "status": "UNDER_INVESTIGATION",
    "transaction_code": "TXN-661298",
    "assigned_analyst": "Rafi Mahmud",
    "risk_score": 74.2,
    "created_at": "2026-11-20T09:40:00.000Z",
    "updated_at": "2026-11-20T10:10:00.000Z",
    "transaction": {
      "id": "TXN-661298",
      "transaction_code": "TXN-661298",
      "customer_code": "CUST-18290",
      "customer_name": "Rashedul Karim",
      "sender_wallet": "01910-334455",
      "recipient_wallet": "01612-445588",
      "amount": 52000,
      "amount_bdt": 52000,
      "payment_type": "SEND_MONEY",
      "device_id": "DEV-7714",
      "location": "Chittagong, BD",
      "occurred_at": "2026-11-20T12:16:30.000Z",
      "risk_score": 74.2,
      "risk_level": "high",
      "status": "UNDER_REVIEW",
      "action_taken": "STEP_UP",
      "engine_scores": {
        "transaction_risk": 70,
        "behavioral_anomaly": 72,
        "account_takeover": 51,
        "network_intelligence": 44
      },
      "signals": [
        {
          "code": "DEVIATION_VOLUME",
          "name": "Weekly Volume Exceeded (320%)",
          "severity": "high"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-14",
        "current_device": "DEV-7714",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 13000,
        "current_transaction_bdt": 52000,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "UNUSUAL_ENTITY"
      },
      "evidence": [
        {
          "signal": "deviation_volume",
          "severity": "high",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Sudden 3.2x surge in daily turnover compared to 90-day moving average."
        }
      ],
      "ai_report": {
        "summary_en": "Sudden 3.2x surge in daily turnover compared to 90-day moving average.",
        "summary_bn": "\u09ef\u09e6 \u09a6\u09bf\u09a8\u09c7\u09b0 \u0997\u09dc \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7\u09b0 \u09a4\u09c1\u09b2\u09a8\u09be\u09df \u09a6\u09c8\u09a8\u09a8\u09cd\u09a6\u09bf\u09a8 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7 \u09b9\u09a0\u09be\u09ce \u09e9.\u09e8 \u0997\u09c1\u09a3 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09ac\u09c3\u09a6\u09cd\u09a7\u09bf\u0964",
        "recommended_action": "STEP_UP",
        "recommendation_text": "Engine flagged transaction with risk score 74.2 due to Weekly Volume Exceeded (320%)."
      }
    },
    "notes": [
      {
        "id": "note_1101",
        "author": "Rafi Mahmud",
        "created_at": "2026-11-20T09:55:00.000Z",
        "body": "Turnover spike in retail textile account. Requesting trade license verification before clearing."
      }
    ]
  },
  {
    "id": "CASE-0012",
    "code": "CASE-0012",
    "title": "High-Value Port Terminal Liquidation (TXN-118832)",
    "priority": "CRITICAL",
    "status": "OPEN",
    "transaction_code": "TXN-118832",
    "assigned_analyst": "Reyazul Islam",
    "risk_score": 97.4,
    "created_at": "2026-11-20T09:00:00.000Z",
    "updated_at": "2026-11-20T09:30:00.000Z",
    "transaction": {
      "id": "TXN-118832",
      "transaction_code": "TXN-118832",
      "customer_code": "CUST-34891",
      "customer_name": "Shamim Reza",
      "sender_wallet": "01998-112233",
      "recipient_wallet": "AGENT-882",
      "amount": 98000,
      "amount_bdt": 98000,
      "payment_type": "CASH_OUT",
      "device_id": "DEV-9921",
      "location": "Chittagong, BD",
      "occurred_at": "2026-11-20T12:15:30.000Z",
      "risk_score": 97.4,
      "risk_level": "critical",
      "status": "BLOCKED",
      "action_taken": "AUTO_BLOCK",
      "engine_scores": {
        "transaction_risk": 92,
        "behavioral_anomaly": 95,
        "account_takeover": 87,
        "network_intelligence": 92
      },
      "signals": [
        {
          "code": "PORT_ANOMALY",
          "name": "Container Terminal Smuggling Link",
          "severity": "critical"
        },
        {
          "code": "BLACKLIST_AGENT",
          "name": "High-Risk Tier Agent Terminal",
          "severity": "critical"
        }
      ],
      "behavioral_profile": {
        "typical_device": "Android-21",
        "current_device": "DEV-9921",
        "typical_hours": "09:00\u201321:00",
        "current_hour": "14:22",
        "historical_average_bdt": 24500,
        "current_transaction_bdt": 98000,
        "amount_deviation_pct": 300,
        "typical_daily_velocity": 3.5,
        "current_velocity_per_hour": 7.2,
        "recipient_relationship": "FLAGGED_ENTITY"
      },
      "evidence": [
        {
          "signal": "port_anomaly",
          "severity": "critical",
          "source": "nexusguard_neural_pipeline",
          "evidence": "Maritime port liquidation pattern matched against high-risk container terminal financial crime syndicate."
        }
      ],
      "ai_report": {
        "summary_en": "Maritime port liquidation pattern matched against high-risk container terminal financial crime syndicate.",
        "summary_bn": "\u099a\u099f\u09cd\u099f\u0997\u09cd\u09b0\u09be\u09ae \u09ac\u09a8\u09cd\u09a6\u09b0 \u098f\u09b2\u09be\u0995\u09be\u09df \u0989\u099a\u09cd\u099a \u099d\u09c1\u0981\u0995\u09bf\u09aa\u09c2\u09b0\u09cd\u09a3 \u098f\u099c\u09c7\u09a8\u09cd\u099f \u099f\u09be\u09b0\u09cd\u09ae\u09bf\u09a8\u09be\u09b2 \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09ac\u09dc \u0985\u0982\u0995\u09c7\u09b0 \u09a8\u0997\u09a6 \u0989\u09a4\u09cd\u09a4\u09cb\u09b2\u09a8\u09c7\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be\u0964",
        "recommended_action": "AUTO_BLOCK",
        "recommendation_text": "Engine flagged transaction with risk score 97.4 due to Container Terminal Smuggling Link."
      }
    },
    "notes": [
      {
        "id": "note_1201",
        "author": "Reyazul Islam",
        "created_at": "2026-11-20T09:15:00.000Z",
        "body": "Critical agent terminal liquidation in Chittagong port zone. Full account freeze executed and BFIU intelligence memo logged."
      }
    ]
  }
];
  const alerts = [
  {
    "id": "alt_01",
    "code": "ATO-ALERT-9821",
    "customer_code": "CUST-10492",
    "wallet_number": "01711-982173",
    "rule_name": "Unrecognized Device Liquidation Cashout",
    "risk_score": 94.3,
    "risk_level": "critical",
    "status": "active",
    "created_at": "2026-11-20T17:45:00.000Z",
    "metadata": {
      "device": "DEV-8821",
      "ip_geo": "Sylhet",
      "hour": "02:13 AM"
    }
  },
  {
    "id": "alt_02",
    "code": "SIM-ALERT-7731",
    "customer_code": "CUST-66291",
    "wallet_number": "01612-998811",
    "rule_name": "Post-SIM Swap Velocity Surge",
    "risk_score": 82.0,
    "risk_level": "high",
    "status": "acknowledged",
    "created_at": "2026-11-20T15:20:00.000Z",
    "metadata": {
      "swap_delta_hours": 1.4,
      "amount": 24500
    }
  },
  {
    "id": "alt_03",
    "code": "SMURF-ALERT-5541",
    "customer_code": "CUST-44102",
    "wallet_number": "01934-556677",
    "rule_name": "Rapid Micro-Smurfing Burst (8x)",
    "risk_score": 92.6,
    "risk_level": "critical",
    "status": "active",
    "created_at": "2026-11-20T13:00:00.000Z",
    "metadata": {
      "burst_count": 8,
      "sub_threshold_bdt": 24900
    }
  },
  {
    "id": "alt_04",
    "code": "REMIT-ALERT-8812",
    "customer_code": "CUST-30491",
    "wallet_number": "01776-990011",
    "rule_name": "International Gateway Hash Mismatch",
    "risk_score": 89.1,
    "risk_level": "high",
    "status": "acknowledged",
    "created_at": "2026-11-20T11:00:00.000Z",
    "metadata": {
      "gateway": "UAE_FIN_HUB",
      "expected_hash": "e3b0c442..."
    }
  },
  {
    "id": "alt_05",
    "code": "QR-ALERT-6641",
    "customer_code": "CUST-88124",
    "wallet_number": "01819-223145",
    "rule_name": "Dormant QR Terminal Kickback Loop",
    "risk_score": 91.2,
    "risk_level": "critical",
    "status": "active",
    "created_at": "2026-11-20T13:40:00.000Z",
    "metadata": {
      "terminal": "MERCH-094",
      "cashback_ratio": 0.95
    }
  },
  {
    "id": "alt_06",
    "code": "DORM-ALERT-4419",
    "customer_code": "CUST-26491",
    "wallet_number": "01954-778899",
    "rule_name": "Dormant 190-Day Account Awakening",
    "risk_score": 95.8,
    "risk_level": "critical",
    "status": "active",
    "created_at": "2026-11-20T14:10:00.000Z",
    "metadata": {
      "dormant_days": 190,
      "amount": 49200
    }
  },
  {
    "id": "alt_07",
    "code": "EMUL-ALERT-3318",
    "customer_code": "CUST-12490",
    "wallet_number": "01677-001122",
    "rule_name": "Rooted Emulator Frida Framework Hook",
    "risk_score": 93.4,
    "risk_level": "critical",
    "status": "active",
    "created_at": "2026-11-20T11:50:00.000Z",
    "metadata": {
      "hook": "frida-gadget-v16",
      "device": "DEV-4488"
    }
  },
  {
    "id": "alt_08",
    "code": "FAN-ALERT-2290",
    "customer_code": "CUST-28310",
    "wallet_number": "01665-889900",
    "rule_name": "Instantaneous Passthrough Fan-out (12x)",
    "risk_score": 96.1,
    "risk_level": "critical",
    "status": "active",
    "created_at": "2026-11-20T10:15:00.000Z",
    "metadata": {
      "fan_nodes": 12,
      "execution_secs": 11.4
    }
  },
  {
    "id": "alt_09",
    "code": "PORT-ALERT-1188",
    "customer_code": "CUST-34891",
    "wallet_number": "01998-112233",
    "rule_name": "Maritime Port Terminal Syndicate Link",
    "risk_score": 97.4,
    "risk_level": "critical",
    "status": "active",
    "created_at": "2026-11-20T09:00:00.000Z",
    "metadata": {
      "agent": "AGENT-882",
      "zone": "Chittagong Port"
    }
  },
  {
    "id": "alt_10",
    "code": "GEO-ALERT-7744",
    "customer_code": "CUST-22319",
    "wallet_number": "01732-556677",
    "rule_name": "Rajshahi-Chittagong Impossible Velocity",
    "risk_score": 78.5,
    "risk_level": "high",
    "status": "resolved",
    "created_at": "2026-11-20T12:15:00.000Z",
    "metadata": {
      "distance_km": 420,
      "delta_mins": 8
    }
  },
  {
    "id": "alt_11",
    "code": "VEL-ALERT-6612",
    "customer_code": "CUST-18290",
    "wallet_number": "01910-334455",
    "rule_name": "Daily Turnover Spike (320% Above Baseline)",
    "risk_score": 74.2,
    "risk_level": "high",
    "status": "acknowledged",
    "created_at": "2026-11-20T09:40:00.000Z",
    "metadata": {
      "baseline_bdt": 16000,
      "actual_bdt": 52000
    }
  },
  {
    "id": "alt_12",
    "code": "PIN-ALERT-1049",
    "customer_code": "CUST-10492",
    "wallet_number": "01711-982173",
    "rule_name": "Repeated PIN Verification Failures (3x)",
    "risk_score": 86.0,
    "risk_level": "high",
    "status": "active",
    "created_at": "2026-11-20T17:42:00.000Z",
    "metadata": {
      "failures": 3,
      "channel": "USSD_GATEWAY"
    }
  },
  {
    "id": "alt_13",
    "code": "DEV-ALERT-5512",
    "customer_code": "CUST-88124",
    "wallet_number": "01819-223145",
    "rule_name": "Device Fingerprint Cloned Across 4 SIMs",
    "risk_score": 88.9,
    "risk_level": "high",
    "status": "acknowledged",
    "created_at": "2026-11-20T16:10:00.000Z",
    "metadata": {
      "fingerprint": "fp_8829_bd",
      "wallets": 4
    }
  },
  {
    "id": "alt_14",
    "code": "NID-ALERT-2204",
    "customer_code": "CUST-22041",
    "wallet_number": "01823-445566",
    "rule_name": "Facial Biometric Confidence Below Tolerance",
    "risk_score": 68.2,
    "risk_level": "medium",
    "status": "resolved",
    "created_at": "2026-11-20T14:30:00.000Z",
    "metadata": {
      "match_pct": 74.1,
      "threshold": 85.0
    }
  },
  {
    "id": "alt_15",
    "code": "BURST-ALERT-1482",
    "customer_code": "CUST-14820",
    "wallet_number": "01788-112233",
    "rule_name": "Nighttime Rapid Consecutive Inquiries",
    "risk_score": 62.4,
    "risk_level": "medium",
    "status": "resolved",
    "created_at": "2026-11-20T03:15:00.000Z",
    "metadata": {
      "inquiries": 7,
      "hour": "03:15 AM"
    }
  },
  {
    "id": "alt_16",
    "code": "AML-ALERT-3210",
    "customer_code": "CUST-32104",
    "wallet_number": "01887-001122",
    "rule_name": "Watchlist Sanctions Fuzzy Match Check",
    "risk_score": 58.7,
    "risk_level": "medium",
    "status": "resolved",
    "created_at": "2026-11-20T08:20:00.000Z",
    "metadata": {
      "score": 0.62,
      "list": "UN_SANCTIONS_BD"
    }
  }
];
  const auditLogs = [
  {
    "id": "log_8124",
    "sequence": 8124,
    "action": "DECISION_HOLD_REVIEW",
    "actor_email": "sadia.jannat@nexusguard.io",
    "target_id": "TXN-982173",
    "timestamp": "2026-11-20T17:00:15.000Z",
    "prev_hash": "3a8f4c12bb4901f4...6677",
    "current_hash": "3a8f4c12a9f0b155...cdef",
    "verified": true,
    "details": "Analyst stepped up verification following WalletGuard ATO alert."
  },
  {
    "id": "log_8123",
    "sequence": 8123,
    "action": "CIRCUIT_BREAKER_TRIPPED",
    "actor_email": "system@nexusguard.ai",
    "target_id": "AGENT-LOOP-42",
    "timestamp": "2026-11-20T17:07:15.000Z",
    "prev_hash": "3a8f4c12a9f0b155...cdef",
    "current_hash": "3a8f4c128c83d017...cdef",
    "verified": true,
    "details": "Terminated recursive agent tool invocation loop at iteration 15."
  },
  {
    "id": "log_8122",
    "sequence": 8122,
    "action": "PROMPT_GUARD_QUARANTINE",
    "actor_email": "system@nexusguard.ai",
    "target_id": "MEMO-INJECTION-99",
    "timestamp": "2026-11-20T17:14:15.000Z",
    "prev_hash": "3a8f4c128c83d017...cdef",
    "current_hash": "3a8f4c12b4aec1f4...cdef",
    "verified": true,
    "details": "Quarantined adversarial system instruction in transaction memo field."
  },
  {
    "id": "log_8121",
    "sequence": 8121,
    "action": "ACCOUNT_FROZEN",
    "actor_email": "reyazul.islam@nexusguard.io",
    "target_id": "CUST-26491",
    "timestamp": "2026-11-20T16:21:15.000Z",
    "prev_hash": "3a8f4c12b4aec1f4...cdef",
    "current_hash": "3a8f4c12fe480370...cdef",
    "verified": true,
    "details": "Executive emergency freeze on dormant awakening wallet TXN-441902."
  },
  {
    "id": "log_8120",
    "sequence": 8120,
    "action": "SAR_FILED",
    "actor_email": "sadia.jannat@nexusguard.io",
    "target_id": "SAR-2026-0881",
    "timestamp": "2026-11-20T16:28:15.000Z",
    "prev_hash": "3a8f4c12fe480370...cdef",
    "current_hash": "3a8f4c12a3e87055...cdef",
    "verified": true,
    "details": "Suspicious Activity Report submitted to Bangladesh Financial Intelligence Unit (BFIU)."
  },
  {
    "id": "log_8119",
    "sequence": 8119,
    "action": "GRAPH_NODE_TAGGED",
    "actor_email": "mohammad.badol@nexusguard.io",
    "target_id": "WAL-5512",
    "timestamp": "2026-11-20T15:35:15.000Z",
    "prev_hash": "3a8f4c12a3e87055...cdef",
    "current_hash": "3a8f4c12d3b25393...cdef",
    "verified": true,
    "details": "Flagged node as Syndicate Aggregator on ScyllaDB graph topology."
  },
  {
    "id": "log_8118",
    "sequence": 8118,
    "action": "RULE_SHADOW_DEPLOYED",
    "actor_email": "rafi.mahmud@nexusguard.io",
    "target_id": "RULE-SMURF-25K",
    "timestamp": "2026-11-20T15:42:15.000Z",
    "prev_hash": "3a8f4c12d3b25393...cdef",
    "current_hash": "3a8f4c1250a187f4...cdef",
    "verified": true,
    "details": "Shadow backtest initiated against 500,000 historical transactions."
  },
  {
    "id": "log_8117",
    "sequence": 8117,
    "action": "BIOMETRIC_STEP_UP",
    "actor_email": "system@nexusguard.ai",
    "target_id": "CUST-10492",
    "timestamp": "2026-11-20T15:49:15.000Z",
    "prev_hash": "3a8f4c1250a187f4...cdef",
    "current_hash": "3a8f4c12c56c02fc...cdef",
    "verified": true,
    "details": "Automated SMS OTP & Liveness challenge dispatched to registered mobile."
  },
  {
    "id": "log_8116",
    "sequence": 8116,
    "action": "EMULATOR_DEVICE_BANNED",
    "actor_email": "reyazul.islam@nexusguard.io",
    "target_id": "DEV-4488",
    "timestamp": "2026-11-20T14:56:15.000Z",
    "prev_hash": "3a8f4c12c56c02fc...cdef",
    "current_hash": "3a8f4c126deb3755...cdef",
    "verified": true,
    "details": "Hardware fingerprint blacklisted across edge firewall nodes."
  },
  {
    "id": "log_8115",
    "sequence": 8115,
    "action": "MODEL_RECALIBRATED",
    "actor_email": "mohammad.badol@nexusguard.io",
    "target_id": "MODEL-LGBM-V2",
    "timestamp": "2026-11-20T14:03:15.000Z",
    "prev_hash": "3a8f4c126deb3755...cdef",
    "current_hash": "3a8f4c12d6abd11f...cdef",
    "verified": true,
    "details": "LightGBM drift compensation weights deployed to production pipeline."
  },
  {
    "id": "log_8114",
    "sequence": 8114,
    "action": "MANUAL_UNFREEZE",
    "actor_email": "reyazul.islam@nexusguard.io",
    "target_id": "CUST-22041",
    "timestamp": "2026-11-20T13:10:15.000Z",
    "prev_hash": "3a8f4c12d6abd11f...cdef",
    "current_hash": "3a8f4c121b5147f4...cdef",
    "verified": true,
    "details": "Unblocked account following video biometric re-verification."
  },
  {
    "id": "log_8113",
    "sequence": 8113,
    "action": "PORT_INTERCEPT_CONFIRMED",
    "actor_email": "rafi.mahmud@nexusguard.io",
    "target_id": "TXN-118832",
    "timestamp": "2026-11-20T13:17:15.000Z",
    "prev_hash": "3a8f4c121b5147f4...cdef",
    "current_hash": "3a8f4c12fbe50078...cdef",
    "verified": true,
    "details": "Port terminal cashout intercept confirmed with branch compliance manager."
  },
  {
    "id": "log_8112",
    "sequence": 8112,
    "action": "API_KEY_REVOKED",
    "actor_email": "reyazul.islam@nexusguard.io",
    "target_id": "KEY-DEV-SEC-09",
    "timestamp": "2026-11-20T13:24:15.000Z",
    "prev_hash": "3a8f4c12fbe50078...cdef",
    "current_hash": "3a8f4c120888f855...cdef",
    "verified": true,
    "details": "Compromised partner webhook API token immediately revoked."
  },
  {
    "id": "log_8111",
    "sequence": 8111,
    "action": "TELCO_SIM_SYNC",
    "actor_email": "system@nexusguard.ai",
    "target_id": "CUST-66291",
    "timestamp": "2026-11-20T12:31:15.000Z",
    "prev_hash": "3a8f4c120888f855...cdef",
    "current_hash": "3a8f4c130eaf509b...cdef",
    "verified": true,
    "details": "Grameenphone SIM lifecycle state synced: SWAP_EVENT_CONFIRMED."
  },
  {
    "id": "log_8110",
    "sequence": 8110,
    "action": "SHAP_EXPLANATION_CACHED",
    "actor_email": "mohammad.badol@nexusguard.io",
    "target_id": "TXN-982173",
    "timestamp": "2026-11-20T12:38:15.000Z",
    "prev_hash": "3a8f4c130eaf509b...cdef",
    "current_hash": "3a8f4c12164e09f4...cdef",
    "verified": true,
    "details": "Computed TreeSHAP feature attributions cached into Redis index."
  },
  {
    "id": "log_8109",
    "sequence": 8109,
    "action": "CASE_ESCALATED",
    "actor_email": "sadia.jannat@nexusguard.io",
    "target_id": "CASE-0005",
    "timestamp": "2026-11-20T11:45:15.000Z",
    "prev_hash": "3a8f4c12164e09f4...cdef",
    "current_hash": "3a8f4c133dd503e4...cdef",
    "verified": true,
    "details": "Escalated rogue merchant QR syndicate dossier to Chief Risk Officer."
  },
  {
    "id": "log_8108",
    "sequence": 8108,
    "action": "GATEWAY_MISMATCH_LOGGED",
    "actor_email": "rafi.mahmud@nexusguard.io",
    "target_id": "TXN-881290",
    "timestamp": "2026-11-20T11:52:15.000Z",
    "prev_hash": "3a8f4c133dd503e4...cdef",
    "current_hash": "3a8f4c120381b955...cdef",
    "verified": true,
    "details": "Logged cross-border payload discrepancy with central foreign exchange desk."
  },
  {
    "id": "log_8107",
    "sequence": 8107,
    "action": "AGENT_SESSION_TERMINATED",
    "actor_email": "system@nexusguard.ai",
    "target_id": "SESS-ATO-09",
    "timestamp": "2026-11-20T11:59:15.000Z",
    "prev_hash": "3a8f4c120381b955...cdef",
    "current_hash": "3a8f4c13528fd207...cdef",
    "verified": true,
    "details": "Autonomous investigative agent session completed in 3.4 seconds."
  },
  {
    "id": "log_8106",
    "sequence": 8106,
    "action": "DATABASE_BACKUP_COMPLETED",
    "actor_email": "system@nexusguard.ai",
    "target_id": "DB-SNAPSHOT-8104",
    "timestamp": "2026-11-20T10:06:15.000Z",
    "prev_hash": "3a8f4c13528fd207...cdef",
    "current_hash": "3a8f4c123147c9f4...cdef",
    "verified": true,
    "details": "Cryptographic ledger state snapshot mirrored to secondary cold storage."
  },
  {
    "id": "log_8105",
    "sequence": 8105,
    "action": "SYSTEM_AUDIT_VERIFIED",
    "actor_email": "reyazul.islam@nexusguard.io",
    "target_id": "LEDGER-VERIFY",
    "timestamp": "2026-11-20T10:13:15.000Z",
    "prev_hash": "3a8f4c123147c9f4...cdef",
    "current_hash": "3a8f4c1347c60560...cdef",
    "verified": true,
    "details": "Completed daily SHA-256 chain validation across all 8,104 audit blocks."
  }
];
  const systemUsers = [
  {
    "id": "usr_reyazul_001",
    "email": "reyazul.islam@nexusguard.io",
    "full_name": "Reyazul Islam",
    "role": "admin",
    "role_display_name": "Chief Risk Officer & Lead Forensic Architect",
    "is_active": true,
    "last_login": "Just now",
    "created_at": "2026-01-15",
    "avatar": "RI"
  },
  {
    "id": "usr_sadia_002",
    "email": "sadia.jannat@nexusguard.io",
    "full_name": "Sadia Jannat",
    "role": "lead_investigator",
    "role_display_name": "Senior AML Forensic Investigator & SAR Lead",
    "is_active": true,
    "last_login": "5m ago",
    "created_at": "2026-02-01",
    "avatar": "SJ"
  },
  {
    "id": "usr_badol_003",
    "email": "mohammad.badol@nexusguard.io",
    "full_name": "Mohammad Badol",
    "role": "ml_graph_engineer",
    "role_display_name": "Principal ML & Graph Threat Intelligence Engineer",
    "is_active": true,
    "last_login": "12m ago",
    "created_at": "2026-02-15",
    "avatar": "MB"
  },
  {
    "id": "usr_rafi_004",
    "email": "rafi.mahmud@nexusguard.io",
    "full_name": "Rafi Mahmud",
    "role": "risk_ops_analyst",
    "role_display_name": "Risk Operations Specialist & Compliance Auditor",
    "is_active": true,
    "last_login": "25m ago",
    "created_at": "2026-03-01",
    "avatar": "RM"
  }
];
  const customers = [
  {
    "id": "CUST-10492",
    "code": "CUST-10492",
    "name": "Arif Hossain",
    "phone": "+880 1711-982173",
    "nid": "1980261000000",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "Salaried Professional",
    "risk_rating": "CRITICAL_ATO_SUSPECT",
    "city": "Sylhet",
    "total_transactions": 342,
    "monthly_volume_bdt": 85000,
    "created_at": "2025-01-15"
  },
  {
    "id": "CUST-88124",
    "code": "CUST-88124",
    "name": "Sadia Sultana",
    "phone": "+880 1819-223145",
    "nid": "1981261000491",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Small Business Merchant",
    "risk_rating": "HIGH",
    "city": "Dhaka",
    "total_transactions": 894,
    "monthly_volume_bdt": 240000,
    "created_at": "2025-02-15"
  },
  {
    "id": "CUST-33910",
    "code": "CUST-33910",
    "name": "Tanvir Hasan",
    "phone": "+880 1911-334102",
    "nid": "1982261000982",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-1",
    "persona": "Student",
    "risk_rating": "LOW",
    "city": "Chittagong",
    "total_transactions": 142,
    "monthly_volume_bdt": 28000,
    "created_at": "2025-03-15"
  },
  {
    "id": "CUST-66291",
    "code": "CUST-66291",
    "name": "Mehedi Hasan",
    "phone": "+880 1612-998811",
    "nid": "1983261001473",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Electronics Retailer",
    "risk_rating": "HIGH",
    "city": "Rajshahi",
    "total_transactions": 512,
    "monthly_volume_bdt": 190000,
    "created_at": "2025-04-15"
  },
  {
    "id": "CUST-11928",
    "code": "CUST-11928",
    "name": "Nusrat Jahan",
    "phone": "+880 1722-114477",
    "nid": "1984261001964",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "Corporate Executive",
    "risk_rating": "LOW",
    "city": "Dhaka",
    "total_transactions": 420,
    "monthly_volume_bdt": 115000,
    "created_at": "2025-05-15"
  },
  {
    "id": "CUST-22041",
    "code": "CUST-22041",
    "name": "Farhana Akter",
    "phone": "+880 1823-445566",
    "nid": "1985261002455",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "E-Commerce Boutique Owner",
    "risk_rating": "MEDIUM",
    "city": "Khulna",
    "total_transactions": 670,
    "monthly_volume_bdt": 160000,
    "created_at": "2025-06-15"
  },
  {
    "id": "CUST-44102",
    "code": "CUST-44102",
    "name": "Kamrul Islam",
    "phone": "+880 1934-556677",
    "nid": "1986261002946",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Remittance Beneficiary",
    "risk_rating": "HIGH",
    "city": "Barisal",
    "total_transactions": 380,
    "monthly_volume_bdt": 130000,
    "created_at": "2025-07-15"
  },
  {
    "id": "CUST-55913",
    "code": "CUST-55913",
    "name": "Shakil Ahmed",
    "phone": "+880 1511-667788",
    "nid": "1987261003437",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Rideshare Fleet Operator",
    "risk_rating": "MEDIUM",
    "city": "Rangpur",
    "total_transactions": 980,
    "monthly_volume_bdt": 210000,
    "created_at": "2025-08-15"
  },
  {
    "id": "CUST-77182",
    "code": "CUST-77182",
    "name": "Fahim Chowdhury",
    "phone": "+880 1744-778899",
    "nid": "1988261003928",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "Software Engineer",
    "risk_rating": "LOW",
    "city": "Comilla",
    "total_transactions": 310,
    "monthly_volume_bdt": 95000,
    "created_at": "2025-09-15"
  },
  {
    "id": "CUST-99201",
    "code": "CUST-99201",
    "name": "Tasnim Rahman",
    "phone": "+880 1855-889900",
    "nid": "1989261004419",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Freelance Graphic Designer",
    "risk_rating": "LOW",
    "city": "Dhaka",
    "total_transactions": 290,
    "monthly_volume_bdt": 78000,
    "created_at": "2025-10-15"
  },
  {
    "id": "CUST-10334",
    "code": "CUST-10334",
    "name": "Anika Tabassum",
    "phone": "+880 1966-990011",
    "nid": "1990261004910",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "University Lecturer",
    "risk_rating": "LOW",
    "city": "Mymensingh",
    "total_transactions": 240,
    "monthly_volume_bdt": 68000,
    "created_at": "2025-11-15"
  },
  {
    "id": "CUST-12490",
    "code": "CUST-12490",
    "name": "Ashikur Rahman",
    "phone": "+880 1677-001122",
    "nid": "1991261005401",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Agri-Inputs Distributor",
    "risk_rating": "HIGH",
    "city": "Bogra",
    "total_transactions": 760,
    "monthly_volume_bdt": 310000,
    "created_at": "2025-12-15"
  },
  {
    "id": "CUST-14820",
    "code": "CUST-14820",
    "name": "Sumaiya Islam",
    "phone": "+880 1788-112233",
    "nid": "1992261005892",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "Hospital Physician",
    "risk_rating": "LOW",
    "city": "Cox's Bazar",
    "total_transactions": 390,
    "monthly_volume_bdt": 140000,
    "created_at": "2025-01-15"
  },
  {
    "id": "CUST-16733",
    "code": "CUST-16733",
    "name": "Mahmudul Hasan",
    "phone": "+880 1899-223344",
    "nid": "1993261006383",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "Civil Engineer",
    "risk_rating": "LOW",
    "city": "Dhaka",
    "total_transactions": 480,
    "monthly_volume_bdt": 125000,
    "created_at": "2025-02-15"
  },
  {
    "id": "CUST-18290",
    "code": "CUST-18290",
    "name": "Rashedul Karim",
    "phone": "+880 1910-334455",
    "nid": "1994261006874",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "Textile Exporter",
    "risk_rating": "MEDIUM",
    "city": "Chittagong",
    "total_transactions": 1120,
    "monthly_volume_bdt": 480000,
    "created_at": "2025-03-15"
  },
  {
    "id": "CUST-20194",
    "code": "CUST-20194",
    "name": "Jannatul Ferdous",
    "phone": "+880 1521-445566",
    "nid": "1995261007365",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Secondary School Teacher",
    "risk_rating": "LOW",
    "city": "Sylhet",
    "total_transactions": 210,
    "monthly_volume_bdt": 52000,
    "created_at": "2025-04-15"
  },
  {
    "id": "CUST-22319",
    "code": "CUST-22319",
    "name": "Naimur Rahman",
    "phone": "+880 1732-556677",
    "nid": "1996261007856",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Pharmacy Owner",
    "risk_rating": "MEDIUM",
    "city": "Rajshahi",
    "total_transactions": 840,
    "monthly_volume_bdt": 220000,
    "created_at": "2025-05-15"
  },
  {
    "id": "CUST-24108",
    "code": "CUST-24108",
    "name": "Sabina Yasmin",
    "phone": "+880 1843-667788",
    "nid": "1997261008347",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Catering Entrepreneur",
    "risk_rating": "LOW",
    "city": "Khulna",
    "total_transactions": 360,
    "monthly_volume_bdt": 92000,
    "created_at": "2025-06-15"
  },
  {
    "id": "CUST-26491",
    "code": "CUST-26491",
    "name": "Moniruzzaman",
    "phone": "+880 1954-778899",
    "nid": "1998261008838",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-3 (Full)",
    "persona": "Retired Bank Auditor",
    "risk_rating": "LOW",
    "city": "Dhaka",
    "total_transactions": 190,
    "monthly_volume_bdt": 45000,
    "created_at": "2025-07-15"
  },
  {
    "id": "CUST-28310",
    "code": "CUST-28310",
    "name": "Shahadat Hossain",
    "phone": "+880 1665-889900",
    "nid": "1999261009329",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Fertilizer Wholesaler",
    "risk_rating": "HIGH",
    "city": "Rangpur",
    "total_transactions": 920,
    "monthly_volume_bdt": 380000,
    "created_at": "2025-08-15"
  },
  {
    "id": "CUST-30491",
    "code": "CUST-30491",
    "name": "Bilkis Begum",
    "phone": "+880 1776-990011",
    "nid": "1980261009820",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-1",
    "persona": "Overseas Remittance Receiver",
    "risk_rating": "MEDIUM",
    "city": "Comilla",
    "total_transactions": 160,
    "monthly_volume_bdt": 85000,
    "created_at": "2025-09-15"
  },
  {
    "id": "CUST-32104",
    "code": "CUST-32104",
    "name": "Tariqul Islam",
    "phone": "+880 1887-001122",
    "nid": "1981261010311",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Garment Merchandiser",
    "risk_rating": "LOW",
    "city": "Dhaka",
    "total_transactions": 540,
    "monthly_volume_bdt": 165000,
    "created_at": "2025-10-15"
  },
  {
    "id": "CUST-34891",
    "code": "CUST-34891",
    "name": "Shamim Reza",
    "phone": "+880 1998-112233",
    "nid": "1982261010802",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-2",
    "persona": "Container Freight Agent",
    "risk_rating": "HIGH",
    "city": "Chittagong",
    "total_transactions": 890,
    "monthly_volume_bdt": 420000,
    "created_at": "2025-11-15"
  },
  {
    "id": "CUST-36209",
    "code": "CUST-36209",
    "name": "Shirin Akter",
    "phone": "+880 1539-223344",
    "nid": "1983261011293",
    "nid_status": "VERIFIED",
    "kyc_level": "Tier-1",
    "persona": "Handicrafts Cooperative Lead",
    "risk_rating": "LOW",
    "city": "Barisal",
    "total_transactions": 280,
    "monthly_volume_bdt": 64000,
    "created_at": "2025-12-15"
  }
];

  return {
    transactions,
    cases,
    alerts,
    auditLogs,
    systemUsers,
    customers,
  };
}

function getDB(): MockDB {
  if (typeof window === "undefined") {
    return getInitialDB();
  }
  try {
    const raw = localStorage.getItem("nexusguard_db_v5");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  const init = getInitialDB();
  try {
    localStorage.setItem("nexusguard_db_v5", JSON.stringify(init));
  } catch {
    // ignore
  }
  return init;
}

function saveDB(db: MockDB) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nexusguard_db_v5", JSON.stringify(db));
    } catch {
      // ignore
    }
  }
}

// --------------------------------------------------------------------------
// GENERIC FETCH WITH RETRY & FALLBACK
// --------------------------------------------------------------------------

async function fetchWithFallback<T>(endpoint: string, fallbackData: () => T, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return fallbackData();
  }
}

// --------------------------------------------------------------------------
// SENTINELFLOW CORE API FUNCTIONS
// --------------------------------------------------------------------------

export async function loginUser(credentials: { email: string; password?: string }) {
  const db = getDB();
  const found = db.systemUsers.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase()) || db.systemUsers[0];
  return {
    access_token: `nxo_auth_${Date.now()}`,
    token_type: "bearer",
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    user: found,
  };
}

export async function getCurrentUser() {
  const db = getDB();
  return db.systemUsers[0];
}

export async function getDashboardSummary() {
  return fetchWithFallback("/dashboard/summary", () => ({
    transactions_monitored: 212749,
    fraud_intercepted_bdt: 4820000,
    walletguard_alerts: 1089,
    p99_latency_ms: 14.8,
    risk_distribution: [
      { name: "Low Risk (<20)", value: 86.4, color: "#10B981" },
      { name: "Moderate (20-50)", value: 9.8, color: "#F59E0B" },
      { name: "High Risk (50-80)", value: 2.6, color: "#EA580C" },
      { name: "Critical (>80)", value: 1.2, color: "#DC2626" },
    ],
    hourly_volume: [
      { hour: "00:00", volume: 4200, fraud: 12 },
      { hour: "04:00", volume: 1800, fraud: 8 },
      { hour: "08:00", volume: 14200, fraud: 34 },
      { hour: "12:00", volume: 28400, fraud: 68 },
      { hour: "16:00", volume: 34100, fraud: 84 },
      { hour: "20:00", volume: 22100, fraud: 45 },
    ],
  }));
}

export async function getSystemHealth() {
  return fetchWithFallback("/system/health", () => ({
    status: "HEALTHY",
    version: "2.4.0",
    uptime_seconds: 142800,
    components: {
      lightgbm_scorer: { status: "HEALTHY", latency_ms: 11.2 },
      isolation_forest: { status: "HEALTHY", latency_ms: 8.4 },
      graph_engine: { status: "HEALTHY", latency_ms: 18.0 },
      ledger: { status: "HEALTHY", blocks: 8104 },
    },
  }));
}

export async function getSystemStats() {
  return fetchWithFallback("/system/stats", () => ({
    total_transactions: 212749,
    active_mules_detected: 48,
    ato_attacks_blocked: 1089,
    avg_inference_latency_ms: 14.2,
  }));
}

export async function getSystemConfig() {
  return fetchWithFallback("/system/config", () => ({
    threshold_critical: 80.0,
    threshold_high: 50.0,
    threshold_moderate: 20.0,
    auto_hold_enabled: true,
  }));
}

export async function getTransactions(params: {
  page?: number;
  limit?: number;
  page_size?: number;
  risk_level?: string;
  min_risk?: number;
  customer_code?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc" | string;
} = {}) {
  const query = new URLSearchParams();
  const page = params.page || 1;
  const pageSize = params.limit || params.page_size || 20;
  query.set("page", String(page));
  query.set("page_size", String(pageSize));
  if (params.risk_level && params.risk_level !== "all") {
    query.set("risk_level", params.risk_level);
  }
  if (params.customer_code) {
    query.set("customer_code", params.customer_code);
  }
  if (params.search && params.search.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.sort_by) {
    query.set("sort_by", params.sort_by);
  }
  if (params.sort_dir) {
    query.set("sort_dir", params.sort_dir);
  }

  return fetchWithFallback(
    `/transactions?${query.toString()}`,
    () => {
      const db = getDB();
      let list = [...db.transactions];
      if (params.risk_level && params.risk_level !== "all") {
        list = list.filter((t) => t.risk_level.toLowerCase() === params.risk_level?.toLowerCase());
      }
      if (params.customer_code) {
        list = list.filter((t) => t.customer_code === params.customer_code);
      }
      if (params.search && params.search.trim()) {
        const s = params.search.toLowerCase().trim();
        list = list.filter(
          (t) =>
            t.transaction_code.toLowerCase().includes(s) ||
            t.customer_name?.toLowerCase().includes(s) ||
            t.sender_wallet?.includes(s) ||
            t.recipient_wallet?.includes(s)
        );
      }
      const total = list.length;
      const items = list.slice((page - 1) * pageSize, page * pageSize);
      return {
        items,
        total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize) || 1,
      };
    }
  );
}

export async function getTransaction(identifier: string) {
  return fetchWithFallback(
    `/transactions/${encodeURIComponent(identifier)}`,
    () => {
      const db = getDB();
      const found = db.transactions.find((t) => t.id === identifier || t.transaction_code === identifier) || db.transactions[0];
      return found;
    }
  );
}

export async function getWalletGuardOverview() {
  return fetchWithFallback("/walletguard/overview", () => ({
    active_threats: 18,
    ato_prevented_volume_bdt: 1240000,
    sim_swap_tripwires_active: 42,
    brute_force_pin_failures: 89,
    top_suspicious_devices: [
      { device_id: "DEV-8821", failure_count: 5, risk_score: 94.3 },
      { device_id: "DEV-5E10", failure_count: 4, risk_score: 88.0 },
      { device_id: "DEV-C7D2", failure_count: 3, risk_score: 82.5 },
    ],
  }));
}

export async function getWalletGuardAlerts(params: any = {}) {
  const db = getDB();
  return {
    items: db.alerts,
    total: db.alerts.length,
    page: 1,
    page_size: 20,
  };
}

export async function getNetworkTargets() {
  return [
    { code: "WAL-5512", label: "Mule Ring Hub (14-Node Syndicate)", risk: 94.3, type: "Mule Consolidator" },
    { code: "WAL-9821", label: "Hero Compromised Account (Arif Hossain ATO)", risk: 94.3, type: "Victim Account" },
    { code: "WAL-4412", label: "Circular Smurfing Ring (Wash Loop)", risk: 88.4, type: "Circular Layering" },
    { code: "MERCH-094", label: "Rogue Merchant Terminal (QR Kickback)", risk: 91.2, type: "Cash-Out Point" },
  ];
}

export async function searchNetworkEntities(query: string) {
  const q = (query || "").toLowerCase().trim();
  const candidates = [
    { id: "WAL-5512", label: "WAL-5512 (Mule Ring Hub)", type: "wallet", risk: 94.3 },
    { id: "WAL-9821", label: "WAL-9821 (Hero Compromised bKash)", type: "wallet", risk: 94.3 },
    { id: "WAL-4412", label: "WAL-4412 (Circular Smurfing Hub)", type: "wallet", risk: 88.4 },
    { id: "MERCH-094", label: "MERCH-094 (Rogue QR Terminal)", type: "merchant", risk: 91.2 },
    { id: "CUST-10492", label: "CUST-10492 (Arif Hossain - Victim)", type: "customer", risk: 86.0 },
    { id: "DEV-8821", label: "DEV-8821 (Attacker Hardware Pool)", type: "device", risk: 91.0 },
    { id: "AGENT-004", label: "AGENT-004 (Cash-Out Agent Sylhet)", type: "merchant", risk: 95.0 },
  ];

  if (!q) return candidates;
  const filtered = candidates.filter(
    (c) => c.id.toLowerCase().includes(q) || c.label.toLowerCase().includes(q) || c.type.includes(q)
  );

  if (filtered.length > 0) return filtered;

  return [
    { id: query.toUpperCase(), label: `${query.toUpperCase()} (Dynamic Search Entity)`, type: query.startsWith("DEV") ? "device" : query.startsWith("MERCH") ? "merchant" : "wallet", risk: 78.4 },
    { id: "WAL-5512", label: "WAL-5512 (Syndicate Layering Hub)", type: "wallet", risk: 94.3 }
  ];
}

export async function getNetworkEntity(identifier: string, depth = 2) {
  const id = (identifier || "WAL-5512").trim().toUpperCase();

  // SCENARIO 1: Mule Ring Hub (WAL-5512)
  if (id === "WAL-5512" || id.includes("5512") || id.includes("MULE")) {
    return {
      center_entity: "WAL-5512",
      mule_cluster_detected: true,
      indicators: [
        "High velocity fan-out within 4 minutes of victim credit",
        "Layering through 6 intermediary wallets to evade BFIU thresholds",
        "Rapid consolidation and attempted cash-out at AGENT-004 & AGENT-009",
        "New hardware pairing DEV-8821 detected at 02:13 AM (off-hours)",
        "ScyllaDB graph centrality score 0.943 indicates Tier-1 syndicate aggregator"
      ],
      center: {
        id: "WAL-5512",
        code: "WAL-5512",
        label: "WAL-5512 (Syndicate Hub)",
        type: "wallet",
        risk_score: 94.3,
        incoming_volume_bdt: 18700,
        connected_wallets_count: 14,
        risk_signals_count: 5,
        first_observed: "2026-10-02"
      },
      nodes: [
        { id: "USER-10492", code: "USER-10492", label: "USER-10492 (Victim Account)", type: "customer" as const, risk_score: 86.0, group: "source" },
        { id: "WAL-5512", code: "WAL-5512", label: "WAL-5512 (Layering Hub)", type: "wallet" as const, risk_score: 94.3, group: "hub" },
        { id: "WALLET-A1", code: "WALLET-A1", label: "WALLET-A1 (Mule Layer 1)", type: "wallet" as const, risk_score: 88.0, group: "mule" },
        { id: "WALLET-A2", code: "WALLET-A2", label: "WALLET-A2 (Mule Layer 1)", type: "wallet" as const, risk_score: 87.5, group: "mule" },
        { id: "WALLET-A3", code: "WALLET-A3", label: "WALLET-A3 (Mule Layer 1)", type: "wallet" as const, risk_score: 89.2, group: "mule" },
        { id: "WALLET-B1", code: "WALLET-B1", label: "WALLET-B1 (Intermediary)", type: "wallet" as const, risk_score: 90.1, group: "mule" },
        { id: "WALLET-B2", code: "WALLET-B2", label: "WALLET-B2 (Intermediary)", type: "wallet" as const, risk_score: 91.4, group: "mule" },
        { id: "WALLET-B3", code: "WALLET-B3", label: "WALLET-B3 (Intermediary)", type: "wallet" as const, risk_score: 88.6, group: "mule" },
        { id: "WALLET-Y1", code: "WALLET-Y1", label: "WALLET-Y1 (Consolidator A)", type: "wallet" as const, risk_score: 93.0, group: "mule" },
        { id: "WALLET-Y2", code: "WALLET-Y2", label: "WALLET-Y2 (Consolidator B)", type: "wallet" as const, risk_score: 92.5, group: "mule" },
        { id: "AGENT-004", code: "AGENT-004", label: "AGENT-004 (Cashout Sylhet)", type: "merchant" as const, risk_score: 95.0, group: "exit" },
        { id: "AGENT-009", code: "AGENT-009", label: "AGENT-009 (Cashout Dhaka)", type: "merchant" as const, risk_score: 94.0, group: "exit" },
        { id: "DEV-8821", code: "DEV-8821", label: "DEV-8821 (Attacker Hardware)", type: "device" as const, risk_score: 91.0, group: "device" },
        { id: "IP-103.21", code: "IP-103.21", label: "IP-103.21 (VPN Exit Point)", type: "device" as const, risk_score: 89.0, group: "device" }
      ],
      edges: [
        { source: "USER-10492", target: "WAL-5512", amount: 18700, label: "৳ 18,700", type: "transfer", weight: 4 },
        { source: "DEV-8821", target: "WAL-5512", amount: 0, label: "Login Pairing", type: "device", weight: 2 },
        { source: "IP-103.21", target: "WAL-5512", amount: 0, label: "Proxy Tunnel", type: "device", weight: 2 },
        { source: "WAL-5512", target: "WALLET-A1", amount: 6200, label: "৳ 6,200", type: "split", weight: 2 },
        { source: "WAL-5512", target: "WALLET-A2", amount: 6100, label: "৳ 6,100", type: "split", weight: 2 },
        { source: "WAL-5512", target: "WALLET-A3", amount: 6000, label: "৳ 6,000", type: "split", weight: 2 },
        { source: "WALLET-A1", target: "WALLET-B1", amount: 3100, label: "৳ 3,100", type: "split", weight: 2 },
        { source: "WALLET-A1", target: "WALLET-B2", amount: 3050, label: "৳ 3,050", type: "split", weight: 2 },
        { source: "WALLET-A2", target: "WALLET-B2", amount: 3050, label: "৳ 3,050", type: "split", weight: 2 },
        { source: "WALLET-A2", target: "WALLET-B3", amount: 3000, label: "৳ 3,000", type: "split", weight: 2 },
        { source: "WALLET-A3", target: "WALLET-B3", amount: 5950, label: "৳ 5,950", type: "split", weight: 2 },
        { source: "WALLET-B1", target: "WALLET-Y1", amount: 6150, label: "৳ 6,150", type: "consolidation", weight: 3 },
        { source: "WALLET-B2", target: "WALLET-Y1", amount: 6050, label: "৳ 6,050", type: "consolidation", weight: 3 },
        { source: "WALLET-B3", target: "WALLET-Y2", amount: 5950, label: "৳ 5,950", type: "consolidation", weight: 3 },
        { source: "WALLET-Y1", target: "AGENT-004", amount: 12200, label: "৳ 12,200 Cashout", type: "cashout", weight: 4 },
        { source: "WALLET-Y2", target: "AGENT-009", amount: 5950, label: "৳ 5,950 Cashout", type: "cashout", weight: 3 }
      ]
    };
  }

  // SCENARIO 2: Hero Compromised Account (WAL-9821 / TXN-982173 / CUST-10492)
  if (id === "WAL-9821" || id.includes("9821") || id.includes("10492") || id.includes("HERO") || id.includes("ARIF")) {
    return {
      center_entity: "WAL-9821",
      mule_cluster_detected: true,
      indicators: [
        "Account takeover victim Arif Hossain (CUST-10492)",
        "Divergent geographic pairing: Dhaka baseline vs Sylhet liquidation IP",
        "Off-hours credential credential insertion at 02:13 AM",
        "Rapid fan-out to 4 intermediary wallets within 120 seconds",
        "Terminal cash-out attempted at high-risk POS AGENT-SYL-01"
      ],
      center: {
        id: "WAL-9821",
        code: "WAL-9821",
        label: "WAL-9821 (Arif Hossain Compromised)",
        type: "wallet",
        risk_score: 94.3,
        incoming_volume_bdt: 18700,
        connected_wallets_count: 12,
        risk_signals_count: 5,
        first_observed: "2026-11-20"
      },
      nodes: [
        { id: "CUST-10492", code: "CUST-10492", label: "Arif Hossain (Victim Entity)", type: "customer" as const, risk_score: 86.0, group: "source" },
        { id: "WAL-9821", code: "WAL-9821", label: "01711-982173 (Compromised Wallet)", type: "wallet" as const, risk_score: 94.3, group: "hub" },
        { id: "DEV-TRUSTED", code: "DEV-TRUSTED", label: "DEV-0012 (Dhaka Baseline Device)", type: "device" as const, risk_score: 12.0, group: "device" },
        { id: "DEV-8821", code: "DEV-8821", label: "DEV-8821 (Sylhet Attacker Device)", type: "device" as const, risk_score: 94.3, group: "device" },
        { id: "HOP-MULE-1", code: "HOP-MULE-1", label: "01912-882104 (Layer 1 Mule)", type: "wallet" as const, risk_score: 91.0, group: "mule" },
        { id: "HOP-MULE-2", code: "HOP-MULE-2", label: "01811-332211 (Layer 1 Mule)", type: "wallet" as const, risk_score: 89.5, group: "mule" },
        { id: "HOP-MULE-3", code: "HOP-MULE-3", label: "01612-445566 (Layer 2 Mule)", type: "wallet" as const, risk_score: 88.0, group: "mule" },
        { id: "CONSOLIDATOR", code: "CONSOLIDATOR", label: "01511-998822 (Syndicate Collector)", type: "wallet" as const, risk_score: 93.8, group: "mule" },
        { id: "AGENT-SYL-01", code: "AGENT-SYL-01", label: "AGENT-SYL-01 (Zindabazar Cashout)", type: "merchant" as const, risk_score: 96.0, group: "exit" },
        { id: "AGENT-SYL-02", code: "AGENT-SYL-02", label: "AGENT-SYL-02 (Amberkhana Cashout)", type: "merchant" as const, risk_score: 93.5, group: "exit" },
        { id: "SIM-PROVIDER", code: "SIM-PROVIDER", label: "GP Telco Central HLR Gateway", type: "device" as const, risk_score: 45.0, group: "device" },
        { id: "USSD-CELL", code: "USSD-CELL", label: "BTS Cell Tower (Sylhet Sadar)", type: "device" as const, risk_score: 72.0, group: "device" }
      ],
      edges: [
        { source: "CUST-10492", target: "WAL-9821", amount: 18700, label: "Account Owner", type: "transfer", weight: 3 },
        { source: "DEV-8821", target: "WAL-9821", amount: 0, label: "Unrecognized Pairing", type: "device", weight: 3 },
        { source: "DEV-TRUSTED", target: "WAL-9821", amount: 0, label: "Baseline Device", type: "device", weight: 1 },
        { source: "SIM-PROVIDER", target: "WAL-9821", amount: 0, label: "SIM Swap Flagged", type: "device", weight: 2 },
        { source: "WAL-9821", target: "HOP-MULE-1", amount: 9500, label: "৳ 9,500 Cashout", type: "split", weight: 3 },
        { source: "WAL-9821", target: "HOP-MULE-2", amount: 9200, label: "৳ 9,200 Cashout", type: "split", weight: 3 },
        { source: "HOP-MULE-1", target: "HOP-MULE-3", amount: 4800, label: "৳ 4,800 Layer", type: "split", weight: 2 },
        { source: "HOP-MULE-1", target: "CONSOLIDATOR", amount: 4650, label: "৳ 4,650 Layer", type: "split", weight: 2 },
        { source: "HOP-MULE-2", target: "CONSOLIDATOR", amount: 9150, label: "৳ 9,150 Layer", type: "split", weight: 2 },
        { source: "HOP-MULE-3", target: "AGENT-SYL-01", amount: 4750, label: "৳ 4,750 Cashout", type: "cashout", weight: 4 },
        { source: "CONSOLIDATOR", target: "AGENT-SYL-02", amount: 13700, label: "৳ 13,700 Cashout", type: "cashout", weight: 4 }
      ]
    };
  }

  // SCENARIO 3: Circular Smurfing Ring (WAL-4412)
  if (id === "WAL-4412" || id.includes("4412") || id.includes("CIRCULAR") || id.includes("SMURF")) {
    return {
      center_entity: "WAL-4412",
      mule_cluster_detected: true,
      indicators: [
        "Circular cyclic laundering flow detected across 5 intermediary wallets",
        "Transactions structured at exactly ৳24,900 below regulatory reporting limits",
        "Zero net economic benefit: 97.8% of funds return to originator hub within 3 hours",
        "Machine learning cycle detection algorithm flagged closed directed cycle length = 5"
      ],
      center: {
        id: "WAL-4412",
        code: "WAL-4412",
        label: "WAL-4412 (Circular Hub)",
        type: "wallet",
        risk_score: 88.4,
        incoming_volume_bdt: 99600,
        connected_wallets_count: 10,
        risk_signals_count: 4,
        first_observed: "2026-10-18"
      },
      nodes: [
        { id: "WAL-4412", code: "WAL-4412", label: "WAL-4412 (Originator / Recipient)", type: "wallet" as const, risk_score: 88.4, group: "hub" },
        { id: "CYCLE-HOP-1", code: "CYCLE-HOP-1", label: "01722-110022 (Ring Hop 1)", type: "wallet" as const, risk_score: 84.0, group: "mule" },
        { id: "CYCLE-HOP-2", code: "CYCLE-HOP-2", label: "01833-221133 (Ring Hop 2)", type: "wallet" as const, risk_score: 85.5, group: "mule" },
        { id: "CYCLE-HOP-3", code: "CYCLE-HOP-3", label: "01944-332244 (Ring Hop 3)", type: "wallet" as const, risk_score: 87.0, group: "mule" },
        { id: "CYCLE-HOP-4", code: "CYCLE-HOP-4", label: "01655-443355 (Ring Hop 4)", type: "wallet" as const, risk_score: 86.2, group: "mule" },
        { id: "INJECT-1", code: "INJECT-1", label: "01511-990011 (Smurf Inflow A)", type: "wallet" as const, risk_score: 79.0, group: "source" },
        { id: "INJECT-2", code: "INJECT-2", label: "01788-881122 (Smurf Inflow B)", type: "wallet" as const, risk_score: 80.5, group: "source" },
        { id: "MERCH-WASH", code: "MERCH-WASH", label: "MERCH-WASH-01 (POS Layering Terminal)", type: "merchant" as const, risk_score: 89.0, group: "exit" },
        { id: "AGENT-EXIT-1", code: "AGENT-EXIT-1", label: "AGENT-RAJ-08 (Rajshahi Cashout)", type: "merchant" as const, risk_score: 91.0, group: "exit" },
        { id: "DEV-BOT-CLUSTER", code: "DEV-BOT-CLUSTER", label: "DEV-POOL-AUTO (Scripted Android Bot)", type: "device" as const, risk_score: 93.0, group: "device" }
      ],
      edges: [
        { source: "INJECT-1", target: "WAL-4412", amount: 24900, label: "৳ 24,900 Smurf", type: "transfer", weight: 3 },
        { source: "INJECT-2", target: "WAL-4412", amount: 24900, label: "৳ 24,900 Smurf", type: "transfer", weight: 3 },
        { source: "DEV-BOT-CLUSTER", target: "WAL-4412", amount: 0, label: "Automated Triggers", type: "device", weight: 2 },
        { source: "WAL-4412", target: "CYCLE-HOP-1", amount: 24800, label: "৳ 24,800 Layer", type: "split", weight: 2 },
        { source: "CYCLE-HOP-1", target: "CYCLE-HOP-2", amount: 24650, label: "৳ 24,650 Layer", type: "split", weight: 2 },
        { source: "CYCLE-HOP-2", target: "CYCLE-HOP-3", amount: 24500, label: "৳ 24,500 Layer", type: "split", weight: 2 },
        { source: "CYCLE-HOP-3", target: "CYCLE-HOP-4", amount: 24350, label: "৳ 24,350 Layer", type: "split", weight: 2 },
        { source: "CYCLE-HOP-4", target: "WAL-4412", amount: 24100, label: "৳ 24,100 (Washed Return)", type: "consolidation", weight: 4 },
        { source: "CYCLE-HOP-3", target: "MERCH-WASH", amount: 5000, label: "৳ 5,000 Fee", type: "cashout", weight: 2 },
        { source: "CYCLE-HOP-4", target: "AGENT-EXIT-1", amount: 8000, label: "৳ 8,000 Payout", type: "cashout", weight: 3 }
      ]
    };
  }

  // SCENARIO 4: Rogue Merchant QR Kickback (MERCH-094)
  if (id === "MERCH-094" || id.includes("094") || id.includes("MERCH") || id.includes("QR")) {
    return {
      center_entity: "MERCH-094",
      mule_cluster_detected: true,
      indicators: [
        "Rogue retail QR terminal executing circular micro-wash credits",
        "Immediate 95% cashback fan-out back to customer wallets in under 45 seconds",
        "Terminal turnover increased 1,420% over 72-hour period without physical foot traffic",
        "High correlation with burner SIM cards registered under forged identity documents"
      ],
      center: {
        id: "MERCH-094",
        code: "MERCH-094",
        label: "MERCH-094 (Rogue QR Merchant)",
        type: "merchant",
        risk_score: 91.2,
        incoming_volume_bdt: 240000,
        connected_wallets_count: 11,
        risk_signals_count: 5,
        first_observed: "2026-11-01"
      },
      nodes: [
        { id: "MERCH-094", code: "MERCH-094", label: "MERCH-094 (Rogue QR Point)", type: "merchant" as const, risk_score: 91.2, group: "hub" },
        { id: "DEV-6201", code: "DEV-6201", label: "DEV-6201 (Merchant POS Android)", type: "device" as const, risk_score: 88.0, group: "device" },
        { id: "QR-BUYER-1", code: "QR-BUYER-1", label: "01819-223145 (Sadia Sultana)", type: "wallet" as const, risk_score: 84.5, group: "source" },
        { id: "QR-BUYER-2", code: "QR-BUYER-2", label: "01711-334411 (Fake Customer A)", type: "wallet" as const, risk_score: 89.0, group: "source" },
        { id: "QR-BUYER-3", code: "QR-BUYER-3", label: "01922-556677 (Fake Customer B)", type: "wallet" as const, risk_score: 87.2, group: "source" },
        { id: "KICKBACK-1", code: "KICKBACK-1", label: "01612-990022 (Kickback Recipient 1)", type: "wallet" as const, risk_score: 92.4, group: "mule" },
        { id: "KICKBACK-2", code: "KICKBACK-2", label: "01511-445588 (Kickback Recipient 2)", type: "wallet" as const, risk_score: 90.8, group: "mule" },
        { id: "EXIT-AGENT-DHK", code: "EXIT-AGENT-DHK", label: "AGENT-DHK-44 (Gulshan POS Exit)", type: "merchant" as const, risk_score: 94.0, group: "exit" },
        { id: "EXIT-AGENT-MIR", code: "EXIT-AGENT-MIR", label: "AGENT-MIR-12 (Mirpur POS Exit)", type: "merchant" as const, risk_score: 92.5, group: "exit" },
        { id: "BANK-SETTLE", code: "BANK-SETTLE", label: "NPSB Central Clearing Escrow", type: "device" as const, risk_score: 15.0, group: "device" },
        { id: "GEO-DHAKA-NORTH", code: "GEO-DHAKA-NORTH", label: "Dhaka North GeoIP Cluster", type: "device" as const, risk_score: 64.0, group: "device" }
      ],
      edges: [
        { source: "DEV-6201", target: "MERCH-094", amount: 0, label: "Terminal Pairing", type: "device", weight: 2 },
        { source: "QR-BUYER-1", target: "MERCH-094", amount: 38000, label: "৳ 38,000 QR Pay", type: "transfer", weight: 3 },
        { source: "QR-BUYER-2", target: "MERCH-094", amount: 42000, label: "৳ 42,000 QR Pay", type: "transfer", weight: 3 },
        { source: "QR-BUYER-3", target: "MERCH-094", amount: 35000, label: "৳ 35,000 QR Pay", type: "transfer", weight: 3 },
        { source: "MERCH-094", target: "KICKBACK-1", amount: 36100, label: "৳ 36,100 (95% Kickback)", type: "split", weight: 4 },
        { source: "MERCH-094", target: "KICKBACK-2", amount: 73150, label: "৳ 73,150 (95% Kickback)", type: "split", weight: 4 },
        { source: "KICKBACK-1", target: "EXIT-AGENT-DHK", amount: 35000, label: "৳ 35,000 Cashout", type: "cashout", weight: 4 },
        { source: "KICKBACK-2", target: "EXIT-AGENT-MIR", amount: 70000, label: "৳ 70,000 Cashout", type: "cashout", weight: 4 },
        { source: "MERCH-094", target: "BANK-SETTLE", amount: 5750, label: "৳ 5,750 Retained Fee", type: "transfer", weight: 2 }
      ]
    };
  }

  // DYNAMIC FALLBACK: For ANY arbitrary identifier typed by user
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseRisk = 75 + (hash % 20);

  return {
    center_entity: id,
    mule_cluster_detected: baseRisk > 80,
    indicators: [
      `Dynamic graph topology mapped for query ${id}`,
      `Observed ${3 + (hash % 5)} connected transactions within analysis time window`,
      `Multi-engine ensemble computed cluster anomaly score: ${baseRisk}.0`,
      "Autonomous graph traversal active across layer-1 and layer-2 neighbor nodes"
    ],
    center: {
      id: id,
      code: id,
      label: `${id} (Target Focal Node)`,
      type: id.startsWith("MERCH") ? "merchant" : id.startsWith("DEV") ? "device" : id.startsWith("CUST") ? "customer" : "wallet",
      risk_score: baseRisk,
      incoming_volume_bdt: 12500 + (hash * 30),
      connected_wallets_count: 8,
      risk_signals_count: 3 + (hash % 3),
      first_observed: "2026-11-05"
    },
    nodes: [
      { id: id, code: id, label: `${id} (Analyzed Entity)`, type: "wallet" as const, risk_score: baseRisk, group: "hub" },
      { id: `PEER-1-${hash % 99}`, code: `PEER-1-${hash % 99}`, label: `Wallet-P1 (${id.slice(0, 4)})`, type: "wallet" as const, risk_score: baseRisk - 5, group: "source" },
      { id: `PEER-2-${hash % 99}`, code: `PEER-2-${hash % 99}`, label: `Wallet-P2 (${id.slice(-4)})`, type: "wallet" as const, risk_score: baseRisk - 8, group: "source" },
      { id: `MULE-HOP-${hash % 50}`, code: `MULE-HOP-${hash % 50}`, label: `Mule-Intermediary-${hash % 50}`, type: "wallet" as const, risk_score: baseRisk + 3, group: "mule" },
      { id: `CONSOL-${hash % 40}`, code: `CONSOL-${hash % 40}`, label: `Consolidator-${hash % 40}`, type: "wallet" as const, risk_score: baseRisk + 6, group: "mule" },
      { id: `AGENT-EXIT-${hash % 20}`, code: `AGENT-EXIT-${hash % 20}`, label: `Agent-Terminal-${hash % 20}`, type: "merchant" as const, risk_score: baseRisk + 8, group: "exit" },
      { id: `DEV-HARDWARE-${hash % 30}`, code: `DEV-HARDWARE-${hash % 30}`, label: `Hardware-ID-${hash % 30}`, type: "device" as const, risk_score: baseRisk - 2, group: "device" },
      { id: `MERCH-PAY-${hash % 15}`, code: `MERCH-PAY-${hash % 15}`, label: `Merchant-Partner-${hash % 15}`, type: "merchant" as const, risk_score: 42.0, group: "exit" }
    ],
    edges: [
      { source: `PEER-1-${hash % 99}`, target: id, amount: 14500, label: "৳ 14,500", type: "transfer", weight: 3 },
      { source: `PEER-2-${hash % 99}`, target: id, amount: 9800, label: "৳ 9,800", type: "transfer", weight: 2 },
      { source: `DEV-HARDWARE-${hash % 30}`, target: id, amount: 0, label: "Device Binding", type: "device", weight: 2 },
      { source: id, target: `MULE-HOP-${hash % 50}`, amount: 12100, label: "৳ 12,100", type: "split", weight: 3 },
      { source: id, target: `CONSOL-${hash % 40}`, amount: 11500, label: "৳ 11,500", type: "split", weight: 3 },
      { source: `MULE-HOP-${hash % 50}`, target: `CONSOL-${hash % 40}`, amount: 11800, label: "৳ 11,800", type: "consolidation", weight: 3 },
      { source: `CONSOL-${hash % 40}`, target: `AGENT-EXIT-${hash % 20}`, amount: 22800, label: "৳ 22,800 Cashout", type: "cashout", weight: 4 },
      { source: id, target: `MERCH-PAY-${hash % 15}`, amount: 1200, label: "৳ 1,200", type: "transfer", weight: 1 }
    ]
  };
}

export async function getCases(params: any = {}) {
  const db = getDB();
  return {
    items: db.cases,
    total: db.cases.length,
    page: 1,
    page_size: 20,
  };
}

export async function getCase(identifier: string) {
  const db = getDB();
  const found = db.cases.find((c) => c.id === identifier || c.code === identifier) || db.cases[0];
  return found;
}

export async function createCase(payload: any) {
  const db = getDB();
  const newCase = {
    id: `CASE-${(db.cases.length + 1).toString().padStart(4, "0")}`,
    code: `CASE-${(db.cases.length + 1).toString().padStart(4, "0")}`,
    title: payload.title || "Manual Investigation Case",
    priority: payload.priority || "HIGH",
    status: "OPEN",
    transaction_code: payload.transaction_code || "TXN-982173",
    assigned_analyst: "Current Operator",
    risk_score: payload.risk_score || 85.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: [
      {
        id: `note_${Date.now()}`,
        author: "Current Operator",
        created_at: new Date().toISOString(),
        body: payload.note || "Case created manually by analyst for forensic inspection.",
      },
    ],
  };
  db.cases.unshift(newCase);
  saveDB(db);
  return newCase;
}

export async function addCaseNote(caseId: string, body: string) {
  const db = getDB();
  const target = db.cases.find((c) => c.id === caseId || c.code === caseId);
  if (target) {
    target.notes = target.notes || [];
    target.notes.push({
      id: `note_${Date.now()}`,
      author: "Current Operator",
      created_at: new Date().toISOString(),
      body,
    });
    saveDB(db);
    return target;
  }
  return { status: "ok" };
}

export async function updateCaseStatus(caseId: string, payload: { status: string; resolution?: string; resolution_note?: string }) {
  const db = getDB();
  const target = db.cases.find((c) => c.id === caseId || c.code === caseId);
  if (target) {
    target.status = payload.status;
    target.resolution = payload.resolution;
    target.updated_at = new Date().toISOString();
    saveDB(db);
    return target;
  }
  return { status: "ok" };
}

export async function generateAIReport(identifier: string) {
  const db = getDB();
  const target = db.transactions.find((t) => t.id === identifier || t.transaction_code === identifier) || db.transactions[0];
  return {
    status: "completed",
    model_name: "Claude 3.7 Sonnet (Reasoning) + Gemini 2.0 Flash Guard",
    latency_ms: 382,
    report: {
      transaction_code: target.transaction_code,
      risk_score: target.risk_score,
      summary: target.ai_report?.summary_en || "Elevated anomaly detection confirmed by multi-engine ensemble.",
      summary_bn: target.ai_report?.summary_bn || "বহু-মডেল ঝুঁকি সমন্বয় ইঞ্জিন দ্বারা উচ্চ ঝুঁকি নিশ্চিত করা হয়েছে।",
      recommended_action: target.ai_report?.recommended_action || "HUMAN_REVIEW_REQUIRED",
      generated_at: new Date().toISOString(),
    },
  };
}

export async function downloadReportPDF(transactionCode: string): Promise<Blob> {
  const text = `SENTINELFLOW TRUST INTELLIGENCE REPORT\nTransaction Code: ${transactionCode}\nStatus: VERIFIED\nGenerated: ${new Date().toISOString()}`;
  return new Blob([text], { type: "application/pdf" });
}

export async function getModels() {
  return fetchWithFallback("/models", () => [
    {
      id: "transaction_risk",
      name: "Supervised Transaction Risk Engine",
      algorithm: "LightGBM Classifier + TreeSHAP",
      version: "2.4.1",
      pr_auc: 0.985,
      roc_auc: 0.999,
      latency_p95_ms: 11.2,
      status: "PRODUCTION_ACTIVE",
      features_count: 48,
      metrics: {
        roc_auc: 0.999,
        pr_auc: 0.985,
        precision: 0.970,
        recall: 0.968,
        decision_threshold: 75.0,
      },
    },
    {
      id: "anomaly_detection",
      name: "Customer Behavioral Deviation Engine",
      algorithm: "Isolation Forest + Robust Scaler",
      version: "1.9.0",
      pr_auc: 0.918,
      roc_auc: 0.965,
      latency_p95_ms: 8.4,
      status: "PRODUCTION_ACTIVE",
      features_count: 24,
      metrics: {
        roc_auc: 0.965,
        precision: 0.924,
        recall: 0.895,
      },
    },
    {
      id: "walletguard",
      name: "WalletGuard ATO & Credential Shield",
      algorithm: "LightGBM ATO + 10 Rule Signals",
      version: "3.1.0",
      pr_auc: 0.998,
      roc_auc: 0.999,
      latency_p95_ms: 4.8,
      status: "PRODUCTION_ACTIVE",
      features_count: 18,
      metrics: {
        roc_auc: 0.999,
        precision: 0.998,
        recall: 1.0,
      },
    },
    {
      id: "network_graph",
      name: "ScamShield Mule Network Graph",
      algorithm: "NetworkX Multi-Entity Graph + Louvain",
      version: "1.5.2",
      pr_auc: 0.892,
      roc_auc: 0.944,
      latency_p95_ms: 18.0,
      status: "PRODUCTION_ACTIVE",
      features_count: 32,
      metrics: {
        nodes: 24272,
        edges: 34342,
        communities: 18,
      },
    },
  ]);
}

export async function getModelFeatures(modelId: string) {
  // Map any legacy IDs
  let id = modelId || "transaction_risk";
  if (id === "behavioral_anomaly") id = "anomaly_detection";
  if (id === "walletguard_ato") id = "walletguard";
  if (id === "scamshield_graph") id = "network_graph";

  return fetchWithFallback(`/models/${id}/features`, () => {
    const fallbackMap: Record<string, any[]> = {
      transaction_risk: [
        { feature: "amount_ratio_median", importance: 0.285, label: "Amount Ratio to Median", description: "Transaction amount divided by customer's 30-day median" },
        { feature: "is_new_device", importance: 0.198, label: "New Device Identifier", description: "Device never observed on this customer account before" },
        { feature: "velocity_10m", importance: 0.162, label: "10-Minute Velocity Count", description: "Count of transactions within trailing 10 minutes" },
        { feature: "amount_ratio_mean", importance: 0.114, label: "Amount Ratio to Mean", description: "Transaction amount divided by customer's 30-day mean" },
        { feature: "is_new_recipient", importance: 0.098, label: "New Recipient", description: "Recipient wallet never received funds from sender" },
        { feature: "failed_logins_24h", importance: 0.054, label: "Failed Logins (24h)", description: "Failed authentication attempts preceding event" },
        { feature: "is_night", importance: 0.038, label: "Off-Hours Activity", description: "Event executed during customer off-hours" },
        { feature: "amount_log", importance: 0.026, label: "Log Transaction Amount", description: "Log-scale absolute transaction volume" },
        { feature: "velocity_1h", importance: 0.015, label: "1-Hour Velocity Count", description: "Transactions count within trailing 60 minutes" },
        { feature: "hour_share", importance: 0.010, label: "Historical Hour Share", description: "Customer activity proportion in this hour bucket" },
      ],
      walletguard: [
        { feature: "is_new_device", importance: 0.320, label: "New Device Pairing", description: "Transaction originating from unassociated hardware device" },
        { feature: "failed_logins_24h", importance: 0.245, label: "Failed Logins Spike", description: "Brute-force or PIN reset failures prior to login" },
        { feature: "password_changed_24h", importance: 0.180, label: "Recent Credential Reset", description: "PIN / credential reset within trailing 24 hours" },
        { feature: "device_shared_wallets", importance: 0.125, label: "Shared Device Footprint", description: "Number of distinct customer wallets on this device" },
        { feature: "sim_swapped_72h", importance: 0.080, label: "SIM Swap Signal", description: "Telecom IMSI renewal within 72 hours" },
        { feature: "velocity_10m", importance: 0.050, label: "Immediate Outbound Velocity", description: "Speed of liquidation following account access" },
      ],
      anomaly_detection: [
        { feature: "amount_deviation_sigma", importance: 0.340, label: "Amount Sigma Deviation", description: "Standard deviations from user rolling mean" },
        { feature: "velocity_burst_ratio", importance: 0.280, label: "Velocity Burst Ratio", description: "Transaction count over baseline cadence" },
        { feature: "spatial_distance_km", importance: 0.220, label: "Spatial Distance (km)", description: "Kilometers from registered residence centroid" },
        { feature: "temporal_entropy", importance: 0.160, label: "Temporal Entropy", description: "Log-likelihood of transaction timestamp" },
      ],
      network_graph: [
        { feature: "graph_pagerank", importance: 0.350, label: "PageRank Centrality", description: "Centrality score in money flow graph" },
        { feature: "in_degree_24h", importance: 0.280, label: "In-Degree Inflow", description: "Distinct senders funneling into node" },
        { feature: "shared_device_degree", importance: 0.220, label: "Device Co-occurrence", description: "Overlapping device footprint across counterparties" },
        { feature: "pass_through_ratio", importance: 0.150, label: "Rapid Drain Ratio", description: "Percentage of funds forwarded within 30 min" },
      ],
    };
    return {
      model_id: id,
      feature_importance: fallbackMap[id] || fallbackMap.transaction_risk,
    };
  });
}

export async function getModelDrift(modelId: string) {
  let id = modelId || "transaction_risk";
  if (id === "behavioral_anomaly") id = "anomaly_detection";
  if (id === "walletguard_ato") id = "walletguard";
  if (id === "scamshield_graph") id = "network_graph";

  return fetchWithFallback(`/models/${id}/drift`, () => ({
    model_id: id,
    overall_drift_status: "STABLE",
    last_monitored_at: new Date().toISOString(),
    monitoring_window_days: 14,
    features: [
      { name: "amount_ratio_median", baseline_mean: 1.120, current_mean: 1.150, psi: 0.021, status: "STABLE" },
      { name: "velocity_10m", baseline_mean: 1.040, current_mean: 1.060, psi: 0.015, status: "STABLE" },
      { name: "is_new_device", baseline_mean: 0.042, current_mean: 0.046, psi: 0.018, status: "STABLE" },
      { name: "failed_logins_24h", baseline_mean: 0.080, current_mean: 0.090, psi: 0.012, status: "STABLE" },
      { name: "is_night", baseline_mean: 0.165, current_mean: 0.170, psi: 0.009, status: "STABLE" },
      { name: "amount_ratio_mean", baseline_mean: 1.080, current_mean: 1.095, psi: 0.014, status: "STABLE" },
      { name: "is_new_recipient", baseline_mean: 0.075, current_mean: 0.082, psi: 0.019, status: "STABLE" },
    ],
    prediction_distribution: {
      low_pct: 86.4,
      medium_pct: 9.8,
      high_pct: 2.6,
      critical_pct: 1.2,
    },
  }));
}

export async function getAuditLogs(params: any = {}) {
  const db = getDB();
  return {
    items: db.auditLogs,
    total: db.auditLogs.length,
    page: 1,
    page_size: 25,
  };
}

export async function getDemoScenarios() {
  return fetchWithFallback("/demo/scenarios", () => [
    {
      id: "scenario-a",
      label: "Scenario A",
      title: "Baseline Legitimate Transaction",
      description: "Standard evening peer-to-peer transfer by a loyal customer on their registered device and typical location.",
      category: "Baseline Normal",
      customer_code: "CUST-1024",
      customer_name: "Rafiq Ahmed",
      transaction_code: "TXN-1010657",
      wallet_code: "WAL-1024",
      device_code: "DEV-88A1",
      expected_signals: ["None (Normal behavioral baseline)"],
      expected_risk_band: "LOW (< 20.0)",
      key_findings: [
        "Transaction amount ৳1,300 aligns with historical median (৳1,350)",
        "Executed from primary registered Android smartphone (DEV-88A1)",
        "Known recurrent recipient wallet",
        "Zero authentication anomalies or velocity spikes",
      ],
    },
    {
      id: "scenario-b",
      label: "Scenario B",
      title: "Clean Account Takeover (ATO) & Off-Hours Drain",
      description: "Unfamiliar device logging in from a distant geographic region at 03:40 AM with prior failed PIN attempts, liquidating wallet balance.",
      category: "Account Takeover",
      customer_code: "CUST-3310",
      customer_name: "Shahin Chowdhury",
      transaction_code: "TXN-1011109",
      wallet_code: "WAL-3310",
      device_code: "DEV-NEW-B",
      expected_signals: ["new_device", "failed_logins_24h", "far_location", "off_hours"],
      expected_risk_band: "CRITICAL (> 80.0)",
      key_findings: [
        "Device first seen 4 hours prior to transaction",
        "2 failed PIN attempts preceding successful authorization",
        "Transferred ৳22,890 to unassociated counterparty",
        "Severe behavioral deviation from typical daytime profile",
      ],
    },
    {
      id: "scenario-c",
      label: "Scenario C",
      title: "Mule Wallet Structuring & Rapid Agent Cash-Out",
      description: "Stolen or funneled funds received into an intermediary mule wallet are drained via rapid sequential cash-outs at physical agent outlets.",
      category: "Mule Funneling",
      customer_code: "CUST-7090",
      customer_name: "Imran Sarker",
      transaction_code: "TXN-1011093",
      wallet_code: "WAL-5512",
      device_code: "DEV-5E10",
      expected_signals: ["rapid_drain", "mule_cash_out", "unusual_agent_volume"],
      expected_risk_band: "HIGH (> 50.0)",
      key_findings: [
        "Intermediary wallet WAL-5512 received aggregate funds minutes earlier",
        "Immediate sequential cash-outs (৳21,000, ৳17,500, ৳13,800)",
        "Turnaround holding time under 25 minutes (pass-through > 90%)",
        "Physical agent point-of-sale in high-risk distribution cluster",
      ],
    },
    {
      id: "scenario-d",
      label: "Scenario D",
      title: "High-Frequency Velocity Smurfing Attack",
      description: "Automated burst of micro-transfers executed within minutes to evade single-transaction reporting thresholds.",
      category: "Velocity Smurfing",
      customer_code: "CUST-2048",
      customer_name: "Habib Khan",
      transaction_code: "TXN-1009853",
      wallet_code: "WAL-2048",
      device_code: "DEV-VEL-D",
      expected_signals: ["high_velocity_10m", "rapid_burst", "structuring_pattern"],
      expected_risk_band: "ELEVATED BURST",
      key_findings: [
        "10 outbound transfers initiated within a 4-minute window",
        "Uniform structured amounts below threshold limits",
        "Velocity engine score spikes to 95.0",
        "Automated scripting or compromised API key pattern",
      ],
    },
    {
      id: "scenario-e",
      label: "Scenario E",
      title: "Suspicious Device Sharing & Syndicated Ring",
      description: "A single hardware device ID observed operating across 8 distinctly owned customer wallets in disparate geographic zones.",
      category: "Syndicate / Device Sharing",
      customer_code: "CUST-5393",
      customer_name: "Ritu Majumder",
      transaction_code: "TXN-1009907",
      wallet_code: "WAL-5393",
      device_code: "DEV-C7D2",
      expected_signals: ["device_shared_wallets", "graph_cluster", "syndicate_link"],
      expected_risk_band: "MODERATE / SYNDICATE",
      key_findings: [
        "Hardware device DEV-C7D2 linked to 8 distinct wallet credentials",
        "Network topology engine identifies high-density bipartite cluster",
        "Repeated authentication switches within brief intervals",
        "Indicative of fraudulent call center or syndicate operation",
      ],
    },
    {
      id: "scenario-f",
      label: "Scenario F",
      title: "Hero Scenario: Combined Attack on CUST-1024",
      description: "Targeted Account Takeover on Rafiq Ahmed: 3 failed PIN attempts, attacker device DEV-8821, 02:13 AM transfer of ৳18,700 to mule wallet WAL-5512.",
      category: "Multi-Engine Hero Attack",
      customer_code: "CUST-1024",
      customer_name: "Rafiq Ahmed",
      transaction_code: "TXN-982173",
      wallet_code: "WAL-1024",
      device_code: "DEV-8821",
      expected_signals: [
        "amount_deviation_13x",
        "new_device_attacker_pool",
        "off_hours_02am",
        "failed_logins_spike",
        "known_mule_recipient",
      ],
      expected_risk_band: "CRITICAL (94.3)",
      key_findings: [
        "Amount ৳18,700 is 13.8x customer median (৳1,350)",
        "Originates from attacker hardware DEV-8821 registered 15 min prior",
        "Executed at 02:13 AM (customer normal window 18:00 - 23:00)",
        "3 consecutive failed authentication attempts in preceding session",
        "Recipient WAL-5512 is identified mule in 6-node laundering ring",
        "4 corroborating engines trigger full system critical alert",
      ],
    },
  ]);
}

export async function triggerDemoScenario(scenarioId: string) {
  const normId = scenarioId.toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/demo/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: normId }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Direct trigger demo failed, falling back", err);
  }

  // Graceful fallback simulation
  const db = getDB();
  const hero = db.transactions.find((t) => t.is_hero) || db.transactions[0];
  hero.occurred_at = new Date().toISOString();
  saveDB(db);

  return {
    scenario_id: normId,
    label: normId.toUpperCase(),
    title: `Executed Scenario ${normId}`,
    transaction_code: hero.transaction_code,
    risk_score: 94.3,
    risk_level: "critical",
    action_recommended: "AUTO_FREEZE",
    engine_scores: {
      transaction_risk: 94.3,
      behavior_risk: 91.2,
      ato_risk: 98.4,
      network_risk: 95.0,
    },
  };
}

export async function getCustomers(params: any = {}) {
  const query = new URLSearchParams();
  const page = params.page || 1;
  const pageSize = params.page_size || params.limit || 20;
  query.set("page", String(page));
  query.set("page_size", String(pageSize));
  if (params.search && params.search.trim()) query.set("search", params.search.trim());
  if (params.persona && params.persona !== "all") query.set("persona", params.persona);
  if (params.kyc_level && params.kyc_level !== "all") query.set("kyc_level", params.kyc_level);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.sort_dir) query.set("sort_dir", params.sort_dir);

  return fetchWithFallback(
    `/customers?${query.toString()}`,
    () => {
      const db = getDB();
      return {
        items: db.customers.slice((page - 1) * pageSize, page * pageSize),
        total: db.customers.length,
        page,
        page_size: pageSize,
        total_pages: Math.max(1, Math.ceil(db.customers.length / pageSize)),
      };
    }
  );
}

export async function getCustomerProfile(identifier: string) {
  return fetchWithFallback(
    `/customers/${encodeURIComponent(identifier)}`,
    () => {
      const db = getDB();
      const found = db.customers.find((c) => c.id === identifier || c.code === identifier) || db.customers[0];
      return found;
    }
  );
}

export async function getSystemUsers(params: any = {}) {
  const db = getDB();
  return db.systemUsers;
}

export async function createSystemUser(payload: any) {
  const db = getDB();
  const newUser = {
    id: `usr_${Date.now()}`,
    email: payload.email,
    full_name: payload.full_name,
    role: payload.role || "fraud_analyst",
    role_display_name: payload.role === "admin" ? "Administrator" : "Fraud Analyst (L3)",
    is_active: true,
    created_at: new Date().toISOString().split("T")[0],
    last_login: "Never",
  };
  db.systemUsers.push(newUser);
  saveDB(db);
  return newUser;
}

export async function getDatabaseOverview() {
  return {
    database_name: "nexusops_fraud_shield",
    engine: "PostgreSQL 16 + pgvector",
    total_size_pretty: "142.8 MB",
    tables: [
      { name: "transactions", row_count: 212749, size_bytes: 88290099, size_pretty: "84.2 MB", column_count: 28 },
      { name: "wallets", row_count: 54200, size_bytes: 23173529, size_pretty: "22.1 MB", column_count: 14 },
      { name: "network_edges", row_count: 184200, size_bytes: 19293798, size_pretty: "18.4 MB", column_count: 8 },
      { name: "cases", row_count: 1420, size_bytes: 5033164, size_pretty: "4.8 MB", column_count: 16 },
      { name: "audit_ledger", row_count: 8104, size_bytes: 6501171, size_pretty: "6.2 MB", column_count: 12 },
      { name: "prompt_traces", row_count: 48200, size_bytes: 7444889, size_pretty: "7.1 MB", column_count: 10 },
    ],
  };
}

export async function getTableData(tableName: string, page = 1, pageSize = 25) {
  const db = getDB();
  let items: any[] = [];
  if (tableName === "transactions") items = db.transactions;
  else if (tableName === "cases") items = db.cases;
  else if (tableName === "audit_ledger" || tableName === "audit") items = db.auditLogs;
  else if (tableName === "users" || tableName === "systemUsers") items = db.systemUsers;
  else items = db.customers;

  const cols =
    items.length > 0
      ? Object.keys(items[0]).map((k) => ({
          name: k,
          type: typeof items[0][k] === "number" ? "numeric" : "text",
          nullable: true,
        }))
      : [
          { name: "id", type: "text", nullable: false },
          { name: "created_at", type: "timestamp", nullable: false },
        ];

  return {
    table_name: tableName,
    total: items.length,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(items.length / pageSize)),
    columns: cols,
    rows: items.slice((page - 1) * pageSize, page * pageSize),
  };
}

export async function runDatabaseQuery(query: string) {
  const q = query.trim().toUpperCase();
  const db = getDB();
  let result: any[] = [];
  if (q.includes("TRANSACTIONS")) {
    result = db.transactions.slice(0, 10);
  } else if (q.includes("CASES")) {
    result = db.cases;
  } else if (q.includes("AUDIT")) {
    result = db.auditLogs;
  } else {
    result = [
      { execution_time_ms: 1.4, rows_affected: 0, query_status: "SUCCESS", notice: "Query parsed and executed on in-memory replica." },
    ];
  }

  return {
    query,
    execution_time_ms: 2.4,
    row_count: result.length,
    columns: result.length > 0 ? Object.keys(result[0]) : ["status"],
    rows: result,
  };
}

// --------------------------------------------------------------------------
// AGENTOPS API NAMESPACES (NEXUSOPS)
// --------------------------------------------------------------------------

export const agentsApi = {
  list: async () => ({ agents: [], total: 0, page: 1 }),
  get: async (id: string) => ({ id, name: "Sample Agent" }),
  create: async (body: any) => body,
  update: async (id: string, body: any) => body,
  delete: async (id: string) => {},
};

export const tracesApi = {
  list: async () => ({ traces: [], total: 0 }),
  get: async (id: string) => ({ id, spans: [] }),
};

export const analyticsApi = {
  overview: async () => ({ totalRuns: 142000, successRate: 98.4 }),
  costs: async () => [],
  tokens: async () => [],
};

export const evalsApi = {
  list: async () => ({ evals: [] }),
  get: async (id: string) => ({ id, runs: [] }),
  run: async (id: string) => ({ jobId: "job_01" }),
};

export default {
  loginUser,
  getCurrentUser,
  getDashboardSummary,
  getSystemHealth,
  getSystemStats,
  getTransactions,
  getTransaction,
  getWalletGuardOverview,
  getWalletGuardAlerts,
  getNetworkEntity,
  getNetworkTargets,
  getCases,
  getCase,
  createCase,
  addCaseNote,
  updateCaseStatus,
  generateAIReport,
  downloadReportPDF,
  getModels,
  getModelFeatures,
  getModelDrift,
  getAuditLogs,
  getDemoScenarios,
  triggerDemoScenario,
  getCustomers,
  getCustomerProfile,
  getSystemUsers,
  createSystemUser,
  getDatabaseOverview,
  getTableData,
  runDatabaseQuery,
  agentsApi,
  tracesApi,
  analyticsApi,
  evalsApi,
};
