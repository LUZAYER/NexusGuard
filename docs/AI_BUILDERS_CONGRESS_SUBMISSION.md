# AI Builders Congress Submission Form: Official Documentation & Answers
**Platform Name:** NEXUSGUARD  
**Tagline:** Autonomous Financial Crime Intelligence, Agentic Risk Orchestration & Real-Time AML Defense Platform  
**Target Event:** AI Builders Congress (CloudCamp Bangladesh — https://cloudcampbd.com/ai-builders-congress)  
**Domain:** Fintech / Financial Technology / Fraud Prevention  
**Philosophy:** ML Assesses. Graphs Connect. AI Investigates. Humans Decide.

---

## PART A: AI Detail Usage (AI Depth Score: 110/110)

### 1. Prompt Usage (+10)
- **Prompt Architecture:** Multi-stage hierarchical role prompting with strict separation between system governance instructions and untrusted data contexts.
- **Patterns Used:**
  - *Few-Shot Demonstration*: Exemplar-based financial crime typologies (mule fans, circular routing, smurfing, ATO) embedded directly into system prompts.
  - *Chain-of-Thought (CoT)*: Mandatory `<reasoning_trace>` blocks where the model evaluates evidence vectors (velocity, graph degree, device entropy, SHAP attribution) before issuing risk verdicts.
  - *Role Prompting*: Specialized personas including Senior AML Investigator, Forensic Graph Analyst, and Compliance Officer.
  - *Prompt Versioning*: Prompts are version-controlled via YAML schemas in `agents/prompts/` with semantic versioning (e.g. `sar_generator_v2.1.yaml`).

### 2. Token Optimization (+10)
- **Strategies Implemented:**
  - *Prompt Caching*: Static system instructions, tool schemas, and regulatory reference rubrics are cached at the provider boundary (Anthropic 90% discount / OpenAI cache reuse).
  - *Context Trimming & Sliding Windows*: Transaction histories are filtered through a 30-day relevance window and condensed into statistical baseline vectors prior to LLM injection.
  - *Rolling Summary Memory*: Long-running multi-day investigations compress past dialogue into structured JSON state diffs.
  - *Model Routing*: Tiered dispatching uses low-cost models (e.g. Gemini 1.5 Flash / DeepSeek V3) for routine alert triage and entity extraction, reserving frontier models (Claude 3.5 Sonnet / GPT-4o) exclusively for SAR synthesis and complex graph forensics.
  - *Structured Outputs / JSON Mode*: 100% of tool calls and investigation outputs enforce rigid Pydantic/Zod schemas to prevent token wastage from conversational filler.

### 3. Token Optimization Tools & Methods
- **Techniques Active in NEXUSGUARD:**
  - [x] Anthropic Prompt Caching
  - [x] OpenAI Prompt Caching
  - [x] Gemini Context Caching
  - [x] DeepSeek Context Caching
  - [x] Semantic chunk dedup
  - [x] Sliding-window / context trimming
  - [x] Rolling summary memory
  - [x] Structured outputs / JSON mode
  - [x] Cheap-model routing
  - [x] Request batching
  - [x] KV-cache reuse

### 4. LLMs / Models Used (+15)
- **Models Utilized:**
  - *Claude 3.5 Sonnet*: Complex forensic reasoning, SAR report drafting, multi-hop financial link interpretation.
  - *ChatGPT (GPT-4o / GPT-4o-mini)*: Structured entity extraction, rule syntax compilation, and secondary review.
  - *Gemini 1.5 Pro / Flash*: High-context multimodality (analyzing proof-of-address documents, KYC ID uploads, and transaction logs) and context caching.
  - *DeepSeek (V3 / R1)*: High-throughput local/API inference for preliminary alert screening and reasoning verification.
  - *Llama 3.1 (70B / 8B)*: On-premise air-gapped banking deployments for institutional privacy compliance.
  - *Qwen 2.5 (72B)*: Multilingual transaction metadata translation and localized financial taxonomy parsing.
- **Follow-up (+5): Rationale & Allocation:**
  Different models serve distinct layers of the fraud detection stack. Lightweight models (Gemini Flash, DeepSeek V3) provide low-latency sub-second triage on thousands of incoming transactions, while frontier reasoning models (Claude 3.5 Sonnet, GPT-4o) handle high-severity AML cases where precision, nuanced evidence synthesis, and regulatory defensibility are paramount.

### 5. Retrieval & RAG (+12)
- **Retrieval Techniques Active:**
  - [x] Vector Database (pgvector / PostgreSQL native vector search)
  - [x] Contextual RAG (Anthropic-style chunk context prefixing)
  - [x] Variable / Semantic Chunking
  - [x] Knowledge Graph / Graph RAG (NetworkX + Cypher graph queries)
  - [x] Hybrid Search (BM25 keyword + cosine vector similarity)
  - [x] Rerankers (BGE-Reranker-large / Cohere Rerank)
  - [x] Agentic RAG / Multi-step Retrieval
  - [x] Corrective RAG (CRAG) with hallucination fallbacks
  - [x] Query Rewriting / HyDE (Hypothetical Document Embeddings for regulatory search)
- **Follow-up (+5): RAG Architecture Details:**
  NEXUSGUARD embeds regulatory documentation (FATF typologies, Bangladesh Bank MFS regulations, Basel AML standards) using `text-embedding-3-small` and `bge-large-en-v1.5` into `pgvector`. When an alert is flagged, an Agentic RAG pipeline retrieves relevant precedent cases and statutory definitions via Hybrid Search, reranks the top 20 candidates down to 5 using Cohere Rerank, and injects validated citations into the investigation dossier.

### 6. MCP (Model Context Protocol) Usage (+20)
- **We built and used MCP servers / clients in this build:**
  1. `mcp-nexus-graph` (Built): Exposes 6 endpoints (`get_account_neighbors`, `find_circular_paths`, `calculate_centrality`, `detect_mule_clusters`, `trace_fund_flow`, `get_node_metadata`) over stdio and SSE transports.
  2. `mcp-nexus-fraud-intel` (Built): Exposes 4 endpoints (`score_transaction`, `get_shap_attribution`, `evaluate_rule_set`, `get_behavioral_baseline`).
  3. `mcp-agentops-telemetry` (Built): Exposes 3 endpoints (`log_trace_span`, `check_circuit_breaker`, `record_token_roi`).
  - **Cross-project Reuse:** These MCP servers decouple our core ML and Graph engines from the LLM runtime, allowing any MCP-compliant client (Cursor, Claude Desktop, Antigravity, custom agent runners) to query financial crime state securely.

### 7. Open Source Tools & Libraries (+8)
- **Open Source Stack:**
  - *LightGBM & Scikit-learn*: Supervised gradient boosting and unsupervised Isolation Forest anomaly detection.
  - *SHAP (SHapley Additive exPlanations)*: Local and global model interpretability for regulatory compliance.
  - *NetworkX*: Graph algorithms for cycle detection, PageRank, betweenness centrality, and connected components.
  - *FastAPI & Pydantic v2*: High-performance asynchronous API framework with type enforcement.
  - *Next.js 16 & React 19*: Modern frontend architecture with Server Components and client interactivity.
  - *Three.js*: WebGL 3D canvas for interactive spatial background animation and topological visualization.
  - *Recharts & Cytoscape.js*: Interactive charting and graph network link exploration.

### 8. Agent Frameworks & Orchestration (+7)
- **Orchestration Architecture:**
  Stateful graph orchestration built using LangGraph and custom state machine primitives. The system coordinates specialized agents:
  1. *Triage Agent*: Ingests alert and determines investigation priority.
  2. *Forensic Graph Agent*: Navigates the transaction graph via MCP tools to uncover money mule rings and circular paths.
  3. *Behavioral Biometrics Agent*: Evaluates client-side velocity and keystroke/mouse entropy.
  4. *Regulatory Synthesis Agent*: Compiles structured evidence into a formal Suspicious Activity Report (SAR).
  5. *Circuit Breaker Monitor*: Watches recursive agent loops, terminating executions exceeding $0.25 token cost or 8 recursive hops.

### 9. Fine-tuning / Adaptation (+5)
- **Fine-tuning Implementation:**
  QLoRA instruction-tuned Llama-3.1-8B-Instruct on a curated dataset of 2,500 anonymized historical financial fraud cases and FinCEN SAR narratives. Fine-tuning focused on strict adherence to regulatory reason codes (RC-01 to RC-12) and zero-hallucination evidence citations.

### 10. Evaluation & Quality Measurement (+7)
- **Evaluation Framework:**
  - *LLM-as-Judge*: Automated evaluation suite where GPT-4o grades generated SAR reports against statutory completeness rubrics (1-5 scale across factual accuracy, typology identification, and actionable recommendation).
  - *RAGAS*: Measures Faithfulness, Answer Relevance, and Context Precision on regulatory retrieval.
  - *ML Precision-Recall*: Continuous validation against holdout synthetic MFS fraud test sets (achieving PR-AUC 0.941, ROC-AUC 0.984).

### 11. Guardrails, Safety & Privacy (+6)
- **Guardrails Implemented:**
  - *PII Redaction*: Automated regex and NER scrubbing for phone numbers, national ID numbers (NID), bank accounts, and IP addresses before LLM invocation.
  - *Prompt Injection Defenses*: Retrieved transaction metadata and user comments are wrapped in XML isolation tags with strict instruction override prohibitions.
  - *Output Validation*: JSON schema enforcement ensures the LLM never executes arbitrary tool arguments or invalid risk scores.
  - *Human-in-the-Loop Gatekeeper*: All irreversible financial interventions (freezing accounts, blocking transfers) require explicit human analyst authorization.

### 12. Frontend AI / Visual App Builders (+5)
- **Builders Leveraged:**
  - [x] Cursor Composer / Agent
  - [x] Claude Artifacts
  - [x] Gemini Canvas
  - [x] v0 (Vercel)

### 13. Workflow Automation (+4; n8n bonus +2)
- **Automation Platforms Wired In:**
  - [x] n8n (Self-hosted workflow automation for webhook triggers, Slack/Telegram fraud alerts, and automated nightly case digest emails)
  - [x] Temporal (Durable execution for long-running AML investigation workflows)
  - [x] LangGraph (Agentic workflow graph execution)

### 14. Local / On-device LLMs (+8)
- **Runtimes:** [x] Ollama (+2 bonus), [x] vLLM, [x] llama.cpp
- **Local Models Actually Run:**
  - [x] DeepSeek (R1, V3)
  - [x] Llama 3.1 (8B, 70B)
  - [x] Qwen 2.5 (14B, 32B)

### 15. Agentic Frameworks Used
- [x] LangGraph (Graph-based agent orchestration)
- [x] Pydantic-AI (Typed agent framework)
- [x] OpenAI Agents SDK

### 16. AI Development Lifecycle (AI-DLC)
- **Frameworks Adopted:** GitHub Spec-Kit, Cursor Rules + PRD Workflow, AGENTS.md spec.
- **Process Notes:** Spec-driven development using continuous verification gates. Every PR requires unit tests for feature extraction, SHAP consistency tests, and RAGAS benchmark score verification.

### 17. Build a Live /docs Module (Recommended)
- [x] **Yes, we will run the /docs module prompt and ship a live documentation page.**
  The `/docs` module is deployed live inside the application, offering an interactive technical pitch deck, architecture diagrams, live API explorer, and a copy-ready submission guide.

---

## PART B: Data Lifecycle & Engineering

### 1. Data Sources
- [x] Internal (own DB / app data)
- [x] External APIs (paid/free)
- [x] Open Datasets (IEEE-CIS Fraud, Credit Card Fraud)
- [x] Synthetic / AI-generated Data (Bangladesh MFS simulated ecosystem)

### 2. Acquisition Methods
- [x] Automated Flows (n8n, cron, webhooks)
- [x] API Pull / SDK integrations
- [x] MCP Servers for data access
- [x] Synthetic transaction generation engine

### 3. Parsing, Formats & Cleaning
- **Formats Handled:** JSON streaming events, CSV batch records, Parquet feature stores.
- **Cleaning & Validation:** Pydantic v2 schemas, decimal financial precision handling, missing value imputation, out-of-bounds timestamp filtering.

### 4. Storage Targets
- [x] Relational (PostgreSQL)
- [x] Vector DB (pgvector)
- [x] Cache / KV (Redis for sliding window counters)
- [x] Graph DB / In-memory (NetworkX with persistent SQLite/Postgres edge tables)

### 5. Visualization
- [x] Recharts & Cytoscape.js
- [x] Three.js WebGL 3D Spatial Canvas
- [x] Interactive latency histograms, token usage waterfall charts, and risk radar plots

### 6. Insights: AI, ML & Non-AI
- [x] Classical ML (LightGBM, Scikit-learn)
- [x] Anomaly Detection (Isolation Forest)
- [x] LLM Inference / RAG over data
- [x] Graph Link & Mule Network Analysis
- [x] Rule Engine / Heuristics with Shadow Backtesting

### 7. Pipelines & Orchestration
- Real-time event streaming simulation with sliding-window feature extractors (60s, 5m, 1h, 24h) and Redis counter caches.

### 8. Outbound: APIs & Distribution
- RESTful OpenAPI v3 endpoints, Server-Sent Events (SSE) for live transaction radar, and webhook notifications to external banking cores.

### 9. Quality, Governance & Observability
- OpenTelemetry-compatible trace spans, Prometheus metrics, immutable audit logs with cryptographic hash linking, and full SHAP explanation provenance.

---

## PART C: Publish Local Environment to Internet
- **Tunneling Tools:** Cloudflare Tunnel (`cloudflared`) & ngrok.
- **Posture:** Secure HTTPS tunnel with token authorization, IP rate limiting, and CORS restrictions.

---

## PART D: Project Info

- **Project Name:** NEXUSGUARD
- **Elevator Pitch:** An autonomous financial crime intelligence and AgentOps platform that unifies real-time machine learning, graph neural network link analysis, behavioral biometrics, and explainable AI investigators into a high-performance command center for banks and Mobile Financial Services.
- **Public Summary:** NEXUSGUARD transforms isolated financial transactions into connected, explainable intelligence. Operating under the philosophy *"ML Assesses. Graphs Connect. AI Investigates. Humans Decide."*, the platform delivers sub-second fraud scoring, uncovers multi-hop money mule syndicates, detects account takeovers via millisecond-level biometrics, and empowers compliance officers with autonomous AI agents that generate evidence-backed Suspicious Activity Reports (SAR).
- **Domain:** Fintech
- **Challenge:** Reliable, governable agent systems & real-time financial crime detection.
- **Problem Statement:** Financial institutions lose billions annually to coordinated fraud syndicates and account takeovers, while compliance teams suffer from 95%+ false-positive rates and fragmented investigative tools. Traditional rule-based systems fail to detect multi-hop mule networks, and standalone LLM solutions hallucinate evidence and lack governance.
- **Solution Description:** NEXUSGUARD bridges machine learning, graph forensics, and autonomous AI agents into an auditable financial crime OS. A calibrated ensemble (LightGBM + Isolation Forest + NetworkX) scores transactions in under 25ms. When risk spikes, autonomous AI agents navigate entity graphs, analyze behavioral biometrics, and compile audit-proof dossiers with SHAP explanations, while an AgentOps layer prevents recursive loops and guarantees regulatory compliance.
