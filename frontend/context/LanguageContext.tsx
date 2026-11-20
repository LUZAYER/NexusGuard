"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "bn";

interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

const translations: Translations = {
  // Brand & Header
  brandTitle: { en: "NEXUSOPS", bn: "নেক্সাসঅপ্স" },
  brandTag: { en: "AI AGENTOPS & TRUST", bn: "এআই এজেন্টঅপ্স ও ট্রাস্ট" },
  brandSubtitle: { en: "Autonomous Agent Governance & FraudShield", bn: "স্বায়ত্তশাসিত এজেন্ট সুশাসন ও ফ্রডশিল্ড" },
  heroShortcut: { en: "HERO INCIDENT: TXN-982173 (94.3 Critical)", bn: "প্রধান ঘটনা: TXN-982173 (৯৪.৩ সংকটপূর্ণ)" },
  socNormal: { en: "SYSTEMS NORMAL", bn: "সিস্টেম স্বাভাবিক" },
  socDegraded: { en: "DEGRADED", bn: "সীমিত সক্রিয়" },
  analystName: { en: "Reyazul Islam", bn: "রেয়াজুল ইসলাম" },
  roleAdmin: { en: "Administrator", bn: "অ্যাডমিনিস্ট্রেটর" },
  roleFraudAnalyst: { en: "Fraud Analyst (L3)", bn: "জালিয়াতি বিশ্লেষক (স্তর-৩)" },
  roleSecurityAnalyst: { en: "Security Analyst", bn: "নিরাপত্তা বিশ্লেষক" },
  roleOpsManager: { en: "Operations Manager", bn: "অপারেশনস ম্যানেজার" },

  // Auth & Login
  navLogin: { en: "Operator Login", bn: "অপারেটর লগইন" },
  loginTitle: { en: "NexusOps Mission Control Authentication", bn: "নেক্সাসঅপ্স মিশন কন্ট্রোল প্রবেশাধিকার" },
  loginSubtitle: { en: "Authorized personnel access for Agent Observability & FinSphere AI Surveillance", bn: "অনুমোদিত কর্মীদের জন্য এজেন্ট নজরদারি ও ফিনস্ফিয়ার এআই নজরদারি সিস্টেমে লগইন" },
  loginEmail: { en: "Email or Operator Username", bn: "ইমেইল বা অপারেটর নাম" },
  loginPassword: { en: "Security Passcode", bn: "নিরাপত্তা পাসওয়ার্ড" },
  loginBtn: { en: "Authorize & Access Console", bn: "অনুমোদন ও প্রবেশ করুন" },
  loginQuickDemo: { en: "1-Click Operator Credentials", bn: "১-ক্লিক অপারেটর প্রোফাইল" },
  switchAccount: { en: "Switch Operator", bn: "অপারেটর পরিবর্তন" },
  logout: { en: "Log Out", bn: "লগআউট" },
  profile: { en: "Operator Profile", bn: "অপারেটর প্রোফাইল" },

  // Sidebar Sections & Nav
  secAgentOps: { en: "AgentOps & Observability", bn: "এজেন্টঅপ্স ও নজরদারি" },
  secOperations: { en: "FinTech & FraudShield", bn: "ফিনটেক ও ফ্রডশিল্ড" },
  secGraph: { en: "Graph & Investigation", bn: "গ্রাফ ও তদন্ত" },
  secGovernance: { en: "Governance & Ledgers", bn: "সুশাসন ও লেজার" },
  secDeveloper: { en: "Developer & Testing", bn: "ডেভেলপার ও পরীক্ষণ" },
  secAccount: { en: "Workspace & Team", bn: "ওয়ার্কস্পেস ও টিম" },

  navHome: { en: "Platform Home", bn: "প্ল্যাটফর্ম হোম" },
  navDashboard: { en: "SOC Dashboard", bn: "এসওসি ড্যাশবোর্ড" },
  navSessions: { en: "Agent Sessions & Replay", bn: "এজেন্ট সেশন ও রিপ্লে" },
  navTraces: { en: "Distributed Traces", bn: "ডিস্ট্রিবিউটেড ট্রেস (OTel)" },
  navPlayground: { en: "Prompt Playground", bn: "প্রম্পট প্লেগ্রাউন্ড" },
  navEvals: { en: "Evaluation Suites", bn: "ইভ্যালুয়েশন স্যুটস" },
  navDatasets: { en: "Datasets Catalog", bn: "ডেটাবেস ক্যাটালগ" },
  navPrompts: { en: "Prompt Versioning", bn: "প্রম্পট ভার্সনিং" },
  navAlerts: { en: "Circuit Breakers & Alerts", bn: "সার্কিট ব্রেকার ও অ্যালার্ট" },
  navCosts: { en: "Token Costs & Billing", bn: "টোকেন খরচ ও বিলিং" },
  navModels: { en: "Model Registry", bn: "মডেল রেজিস্ট্রি" },
  navIntegrations: { en: "Integrations Hub", bn: "ইন্টিগ্রেশন হাব" },
  navObservability: { en: "Service Map (OTel)", bn: "সার্ভিস ম্যাপ (OTel)" },

  navTransactions: { en: "Transactions Stream", bn: "লেনদেন নজরদারি স্ট্রিম" },
  navWalletGuard: { en: "WalletGuard ATO", bn: "ওয়ালেটগার্ড এটিও" },
  navNetwork: { en: "Network & Mule Graph", bn: "নেটওয়ার্ক ও মিউল রিং" },
  navCases: { en: "Cases & Workflows", bn: "মামলা ও তদন্ত প্রক্রিয়া" },
  navAudit: { en: "Signed Audit Ledger", bn: "স্বাক্ষরিত অডিট লেজার" },
  navUsers: { en: "System Users", bn: "নিবন্ধিত ব্যবহারকারী" },
  navDatabase: { en: "Database Explorer", bn: "ডেটাবেস এক্সপ্লোরার" },
  navSettings: { en: "Settings", bn: "সেটিংস" },

  // Common UI
  liveMonitoring: { en: "LIVE SURVEILLANCE", bn: "সরাসরি নজরদারি" },
  refreshFeeds: { en: "Refresh Feeds", bn: "তথ্য রিফ্রেশ করুন" },
  searchPlaceholder: { en: "Search TXN code, wallet, session...", bn: "লেনদেন কোড, ওয়ালেট বা সেশন খুঁজুন..." },

  // Transactions Monitoring
  txnStreamTitle: { en: "Transaction Surveillance Stream", bn: "লেনদেন নজরদারি স্ট্রিম" },
  txnStreamSubtitle: { en: "Real-time multi-engine scoring across MFS wallets, agents, and merchants", bn: "এমএফএস ওয়ালেট, এজেন্ট এবং মার্চেন্টদের মধ্যে রিয়েল-টাইম বহু-ইঞ্জিন ঝুঁকি মূল্যায়ন" },
  allTiers: { en: "All Tiers", bn: "সব স্তর" },
  criticalTier: { en: "Critical", bn: "সংকটপূর্ণ" },
  highTier: { en: "High", bn: "উচ্চ" },
  moderateTier: { en: "Moderate", bn: "মাঝারি" },
  lowTier: { en: "Low", bn: "নিম্ন" },
  searchPlaceholderTxn: { en: "Search TXN code, customer, wallet...", bn: "লেনদেন কোড, গ্রাহক বা ওয়ালেট খুঁজুন..." },
  searchBtn: { en: "Filter", bn: "ফিল্টার" },
  resetFilters: { en: "Reset Filters", bn: "ফিল্টার রিসেট করুন" },
  inspect: { en: "Inspect", bn: "পরীক্ষা" },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  formatNumber: (num: number | string) => string;
  formatCurrency: (amount: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexusops_lang") || localStorage.getItem("sentinelflow_lang");
      if (stored === "bn" || stored === "en") {
        setLangState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("nexusops_lang", newLang);
      localStorage.setItem("sentinelflow_lang", newLang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang] || translations[key]["en"];
    }
    return key;
  };

  const toBengaliNumber = (input: number | string): string => {
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(input).replace(/[0-9]/g, (w) => bnDigits[+w]);
  };

  const formatNumber = (num: number | string): string => {
    if (lang === "bn") {
      return toBengaliNumber(num);
    }
    return String(num);
  };

  const formatCurrency = (amount: number | string): string => {
    const val = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(val)) return "৳ ০.০০";
    if (lang === "bn") {
      return `৳ ${toBengaliNumber(val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}`;
    }
    return `৳ ${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, formatNumber, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
