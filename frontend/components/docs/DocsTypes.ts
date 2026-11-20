export interface DocsAccessConfig {
  enabled: boolean;
  scheduleMode: 'always_on' | 'schedule' | 'always_off';
  startDate: string; // ISO datetime string, default '2026-06-10T00:00:00'
  endDate: string; // ISO datetime string, default '2026-06-14T23:59:59'
  adminOverride: boolean;
  showcaseTitle: string;
  publishedVersion: string;
  lastUpdated: string;
  customNotes?: string;
}

export const DEFAULT_DOCS_CONFIG: DocsAccessConfig = {
  enabled: true,
  scheduleMode: 'schedule',
  startDate: '2026-06-10T00:00:00',
  endDate: '2026-06-14T23:59:59',
  adminOverride: true, // Allows admin preview and instant judge bypass
  showcaseTitle: 'Official Judging Window · AI & FinTech Showcase',
  publishedVersion: 'v4.0.0-PROD',
  lastUpdated: new Date().toISOString(),
  customNotes: 'Default configuration active for AI Builders Congress & Institutional Evaluation Window.',
};

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  clearance: string;
  bio: string;
  avatarText: string;
  accentColor: string;
  skills: string[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'reyazul',
    name: 'Reyazul Islam',
    role: 'Chief Risk Officer & Lead Forensic Architect',
    email: 'reyazul.islam@nexusguard.io',
    department: 'Executive & Fraud Architecture',
    clearance: 'Clearance L4 · Super Admin',
    bio: 'Pioneered sub-25ms dual machine learning scoring pipelines and local TreeSHAP reason-code attribution. Ex-central bank financial crime advisor.',
    avatarText: 'RI',
    accentColor: 'from-amber-500 to-rose-600',
    skills: ['Dual ML Architecture', 'TreeSHAP', 'Regulatory Liaison', 'FastAPI'],
  },
  {
    id: 'sadia',
    name: 'Sadia Jannat',
    role: 'Senior AML Forensic Investigator & SAR Lead',
    email: 'sadia.jannat@nexusguard.io',
    department: 'Financial Intelligence Unit (FIU)',
    clearance: 'Clearance L3 · Forensic Lead',
    bio: 'Specialized in FATF Recommendations 10/16 and Bangladesh Bank MFS regulations. Author of the autonomous LangGraph SAR dossier generator.',
    avatarText: 'SJ',
    accentColor: 'from-cyan-500 to-blue-600',
    skills: ['LangGraph Agents', 'BFIU Typologies', 'SAR Generation', 'Prompt Defense'],
  },
  {
    id: 'badol',
    name: 'Mohammad Badol',
    role: 'Principal ML & Graph Intelligence Engineer',
    email: 'mohammad.badol@nexusguard.io',
    department: 'Machine Learning & Topology',
    clearance: 'Clearance L3 · ML Ops',
    bio: 'Engineered NetworkX multi-hop cyclic graph traversals, PageRank centrality, and real-time Isolation Forest zero-day anomaly detectors.',
    avatarText: 'MB',
    accentColor: 'from-emerald-500 to-teal-600',
    skills: ['NetworkX', 'Isolation Forest', 'pgvector RAG', 'LightGBM Tuning'],
  },
  {
    id: 'rafi',
    name: 'Rafi Mahmud',
    role: 'Risk Operations & Front-line Triage Specialist',
    email: 'rafi.mahmud@nexusguard.io',
    department: 'SOC Operations & Interception',
    clearance: 'Clearance L2 · SOC Triage',
    bio: 'Directs the 24/7 transaction stream intercept queue, human-in-the-loop approvals, and WalletGuard behavioral biometric hardware pairing validation.',
    avatarText: 'RM',
    accentColor: 'from-purple-500 to-indigo-600',
    skills: ['WalletGuard Biometrics', 'Stream Triage', 'Incident Response', 'Redis Queues'],
  },
];
