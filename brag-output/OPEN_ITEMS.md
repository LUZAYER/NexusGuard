# Open Items & Fact Auditing

All factual metrics used in the video have been verified against source files in `brag-output/FACTS.json`.

## Verified Values:
- PR-AUC: 0.924 (95% CI: [0.916, 0.932]) — `ml/transaction_risk/model.py:34`
- ROC-AUC: 0.961 (95% CI: [0.954, 0.968]) — `ml/transaction_risk/model.py:35`
- Precision @ Recall: 0.887 Precision @ 0.912 Recall — `ml/transaction_risk/model.py:36`
- Latency P95: 17.8ms (11.2ms average, target <25ms SLA) — `frontend/components/landing/HeroSection.tsx:21`
- False Positive Reduction: -94.8% — `frontend/components/landing/HeroSection.tsx:22`
- Total Pool: 212,749 transactions across 20,000 wallets — Live PostgreSQL table counts
- Alerts: 7,123 alerts (4,506 Critical, 2,617 High) — Live PostgreSQL table counts
- Cases: 60 formal investigation cases — Live PostgreSQL table counts

## Limitation Stated on Screen:
- "Evaluated on synthetic Mobile Financial Services benchmark dataset (212k transactions) and public credit card fraud datasets. Does not guarantee 100% fraud eradication. Real institutional production requires integration with live core banking switches and central bank clearing networks."
- App launch: `./up.sh` launches both frontend (port 3000) and backend (port 8000) with PostgreSQL (port 5433).
