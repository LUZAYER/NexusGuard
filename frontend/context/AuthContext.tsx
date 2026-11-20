"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  role_display_name?: string;
  avatar?: string;
  department?: string;
  created_at?: string;
  last_login?: string;
  phone?: string;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<AuthUser>;
  signup: (full_name: string, email: string, password?: string, company?: string) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (updatedData: Partial<AuthUser>) => Promise<AuthUser>;
  quickLogin: (preset: "reyazul" | "sadia" | "badol" | "rafi") => Promise<AuthUser>;
  switchAnalyst: (preset: "reyazul" | "sadia" | "badol" | "rafi") => Promise<AuthUser>;
  allAnalysts: AuthUser[];
}

export const PRESET_USERS: Record<string, AuthUser> = {
  reyazul: {
    id: "usr_reyazul_001",
    email: "reyazul.islam@nexusguard.io",
    full_name: "Reyazul Islam",
    role: "admin",
    role_display_name: "Chief Risk Officer & Lead Forensic Architect",
    avatar: "RI",
    department: "Executive & Fraud Architecture",
    phone: "+880 1711-002233",
    created_at: "2026-01-15",
    last_login: "Just now",
    permissions: [
      "dashboard:read",
      "transactions:read",
      "transactions:analyze",
      "alerts:read",
      "alerts:write",
      "cases:read",
      "cases:write",
      "wallets:read",
      "walletguard:read",
      "network:read",
      "investigations:ai",
      "models:read",
      "models:write",
      "governance:admin",
      "system:read",
      "audit:read",
      "circuit_breaker:override",
    ],
  },
  sadia: {
    id: "usr_sadia_002",
    email: "sadia.jannat@nexusguard.io",
    full_name: "Sadia Jannat",
    role: "lead_investigator",
    role_display_name: "Senior AML Forensic Investigator & SAR Lead",
    avatar: "SJ",
    department: "AML & Financial Crime Investigations",
    phone: "+880 1819-445566",
    created_at: "2026-02-01",
    last_login: "5m ago",
    permissions: [
      "dashboard:read",
      "transactions:read",
      "transactions:analyze",
      "alerts:read",
      "alerts:write",
      "cases:read",
      "cases:write",
      "walletguard:read",
      "network:read",
      "investigations:ai",
      "reports:generate",
      "audit:read",
    ],
  },
  badol: {
    id: "usr_badol_003",
    email: "mohammad.badol@nexusguard.io",
    full_name: "Mohammad Badol",
    role: "ml_graph_engineer",
    role_display_name: "Principal ML & Graph Threat Intelligence Engineer",
    avatar: "MB",
    department: "Applied AI & Graph Research",
    phone: "+880 1912-778899",
    created_at: "2026-02-15",
    last_login: "12m ago",
    permissions: [
      "dashboard:read",
      "transactions:read",
      "models:read",
      "models:write",
      "network:read",
      "evals:run",
      "datasets:manage",
      "governance:admin",
      "traces:read",
    ],
  },
  rafi: {
    id: "usr_rafi_004",
    email: "rafi.mahmud@nexusguard.io",
    full_name: "Rafi Mahmud",
    role: "risk_ops_analyst",
    role_display_name: "Risk Operations Specialist & Compliance Auditor",
    avatar: "RM",
    department: "Real-Time Surveillance & Audits",
    phone: "+880 1612-332211",
    created_at: "2026-03-01",
    last_login: "25m ago",
    permissions: [
      "dashboard:read",
      "transactions:read",
      "transactions:analyze",
      "alerts:read",
      "alerts:write",
      "cases:read",
      "cases:write",
      "walletguard:read",
      "audit:read",
    ],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(PRESET_USERS.reyazul);
  const [token, setToken] = useState<string | null>("nxg_live_token_2026");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("nexusguard_user");
      const storedToken = localStorage.getItem("nexusguard_token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        setUser(PRESET_USERS.reyazul);
        setToken("nxg_live_token_2026");
      }
    } catch {
      setUser(PRESET_USERS.reyazul);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      let matched = Object.values(PRESET_USERS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.full_name.toLowerCase() === email.toLowerCase()
      );
      if (!matched) {
        matched = {
          id: `usr_${Date.now().toString(16)}`,
          email,
          full_name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          role: "fraud_analyst",
          role_display_name: "Fraud & Trust Analyst",
          avatar: email.slice(0, 2).toUpperCase(),
          department: "Operations",
          created_at: new Date().toISOString().split("T")[0],
          last_login: "Just now",
          permissions: ["dashboard:read", "transactions:read", "cases:read", "cases:write"],
        };
      }

      const generatedToken = `nxg_live_${Date.now()}`;
      setToken(generatedToken);
      setUser(matched);
      localStorage.setItem("nexusguard_token", generatedToken);
      localStorage.setItem("nexusguard_user", JSON.stringify(matched));
      return matched;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    full_name: string,
    email: string,
    password?: string,
    company?: string
  ): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const newUser: AuthUser = {
        id: `usr_${Date.now().toString(16)}`,
        email,
        full_name,
        role: "admin",
        role_display_name: "Workspace Administrator",
        avatar: full_name.slice(0, 2).toUpperCase(),
        department: company || "Engineering",
        created_at: new Date().toISOString().split("T")[0],
        last_login: "Just now",
        permissions: [
          "dashboard:read",
          "transactions:read",
          "cases:read",
          "cases:write",
          "models:read",
          "governance:admin",
        ],
      };

      const generatedToken = `nxg_live_${Date.now()}`;
      setToken(generatedToken);
      setUser(newUser);
      localStorage.setItem("nexusguard_token", generatedToken);
      localStorage.setItem("nexusguard_user", JSON.stringify(newUser));
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("nexusguard_token");
    localStorage.removeItem("nexusguard_user");
  };

  const updateProfile = async (updatedData: Partial<AuthUser>): Promise<AuthUser> => {
    if (!user) throw new Error("No authenticated user");
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem("nexusguard_user", JSON.stringify(updated));
    return updated;
  };

  const quickLogin = async (preset: "reyazul" | "sadia" | "badol" | "rafi"): Promise<AuthUser> => {
    const target = PRESET_USERS[preset];
    if (!target) throw new Error("Unknown preset");
    return login(target.email);
  };

  const switchAnalyst = async (preset: "reyazul" | "sadia" | "badol" | "rafi"): Promise<AuthUser> => {
    return quickLogin(preset);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        quickLogin,
        switchAnalyst,
        allAnalysts: Object.values(PRESET_USERS),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
