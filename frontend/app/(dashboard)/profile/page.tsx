"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  Key,
  Mail,
  Building,
  CheckCircle,
  Save,
  Lock,
  Smartphone,
  Globe,
  Bell,
  RefreshCw,
  LogOut,
  Sliders,
  Check,
  Copy,
  Users,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth, PRESET_USERS } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ProfilePage() {
  const { user, updateProfile, logout, switchAnalyst, allAnalysts } = useAuth();
  const { lang, t } = useLanguage();
  const { theme, isDark } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || "Reyazul Islam");
  const [email, setEmail] = useState(user?.email || "reyazul.islam@nexusguard.io");
  const [department, setDepartment] = useState(user?.department || "Executive & Fraud Architecture");
  const [phone, setPhone] = useState(user?.phone || "+880 1711-002233");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [apiKey, setApiKey] = useState("nxg_live_sec_88f9210aa39e41b7");
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [sessions, setSessions] = useState([
    { id: "sess_1", device: "Linux x86_64 (Current)", client: "Chrome 131 • Dhaka, BD", status: "ACTIVE", ip: "103.114.172.4" },
    { id: "sess_2", device: "Pixel 8 Pro (Hardware Key)", client: "Biometric FIDO2 • Dhaka, BD", status: "STANDBY", ip: "103.114.172.9" },
    { id: "sess_3", device: "MacBook Pro M3", client: "Safari 18 • Chittagong, BD", status: "STANDBY", ip: "119.30.38.12" },
  ]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        email,
        department,
        phone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New passcode must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passcodes do not match");
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const handleAnalystSwitch = async (key: "reyazul" | "sadia" | "badol" | "rafi") => {
    const switched = await switchAnalyst(key);
    setFullName(switched.full_name);
    setEmail(switched.email);
    setDepartment(switched.department || "");
    setPhone(switched.phone || "");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleGenerateApiKey = () => {
    const newKey = `nxg_live_sec_${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    setApiKey(newKey);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleRevokeSessions = () => {
    setSessions([sessions[0]]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-6 transition-colors">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/20 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-600/25 shrink-0">
            {user?.avatar || fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black">{fullName}</h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-bold">
                {user?.role_display_name || user?.role || "Administrator"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Operator ID: <code className="font-mono text-red-400">{user?.id}</code> • Department: <span className="font-semibold text-slate-300">{department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Profile configuration saved successfully to workspace local cache.</span>
        </div>
      )}

      {/* Switch Analyst Preset Bar */}
      <div className="rounded-2xl border border-red-500/30 bg-slate-900/60 p-4 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Switch Active Forensic Analyst Persona
          </span>
          <span className="text-[11px] text-slate-400">Click to assume role immediately</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              { key: "reyazul", label: "Reyazul Islam", sub: "Chief Risk Officer", avatar: "RI" },
              { key: "sadia", label: "Sadia Jannat", sub: "Senior AML Investigator", avatar: "SJ" },
              { key: "badol", label: "Mohammad Badol", sub: "Principal ML & Graph", avatar: "MB" },
              { key: "rafi", label: "Rafi Mahmud", sub: "Risk Operations Specialist", avatar: "RM" },
            ] as const
          ).map((item) => {
            const isActive = user?.full_name === item.label;
            return (
              <button
                key={item.key}
                onClick={() => handleAnalystSwitch(item.key)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-red-500 bg-red-950/30 shadow-md shadow-red-950/50"
                    : "border-white/10 bg-white/5 hover:border-red-500/40 hover:bg-white/10"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isActive ? "bg-red-600 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.avatar}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-400 truncate">{item.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Columns */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Personal Info & Passcode */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl border border-red-500/25 bg-slate-900/50 backdrop-blur-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              Operator Information & Contact
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Official Bank Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Encrypted Phone / Hotline</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>

          {/* Passcode Reset Form */}
          <form onSubmit={handlePasswordChange} className="p-6 rounded-2xl border border-red-500/25 bg-slate-900/50 backdrop-blur-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              Security Passcode & Biometric Credential
            </h3>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Passcode updated successfully. Argon2id hash re-keyed.</span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold block mb-1">Current Passcode</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">New Secure Passcode</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Confirm New Passcode</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat passcode"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-900/50 text-red-300 font-bold text-xs transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Re-Key Passcode</span>
              </button>
            </div>
          </form>

          {/* API Key Management */}
          <div className="p-6 rounded-2xl border border-red-500/25 bg-slate-900/50 backdrop-blur-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-red-400" />
              Operator API Credentials (MCP & SDK Access)
            </h3>
            <p className="text-xs text-slate-400">
              Used to authenticate MCP tool calls and Python SDK clients into the NexusGuard inference API.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-red-400 select-all"
              />
              <button
                onClick={handleCopyApiKey}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold shrink-0 cursor-pointer"
              >
                {apiKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{apiKeyCopied ? "Copied!" : "Copy Key"}</span>
              </button>
              <button
                onClick={handleGenerateApiKey}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-900/30 text-red-300 text-xs font-semibold shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: RBAC & Hardware Sessions */}
        <div className="space-y-6">
          {/* Two-Factor Authentication Status */}
          <div className="p-6 rounded-2xl border border-red-500/25 bg-slate-900/50 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                Two-Factor (2FA) Security
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${twoFactorEnabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"}`}>
                {twoFactorEnabled ? "ENFORCED" : "DISABLED"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Hardware FIDO2 token & biometric tripwire required for critical transaction freeze approvals.
            </p>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className="w-full mt-2 py-2 px-3 rounded-xl border border-red-500/30 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              {twoFactorEnabled ? "Disable 2FA (Not Recommended)" : "Enable 2FA Hardware Key"}
            </button>
          </div>

          {/* Assigned RBAC Capabilities */}
          <div className="p-6 rounded-2xl border border-red-500/25 bg-slate-900/50 backdrop-blur-md space-y-3 shadow-xl">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Assigned RBAC Capabilities
            </h4>
            <p className="text-xs text-slate-400">
              Clearance: <strong className="text-red-400">{user?.role_display_name}</strong>
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(user?.permissions || [
                "dashboard:read",
                "transactions:read",
                "cases:write",
                "network:read",
                "audit:read",
                "sar:generate",
              ]).map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-red-500/20 text-[10px] font-mono"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Active Hardware Sessions */}
          <div className="p-6 rounded-2xl border border-red-500/25 bg-slate-900/50 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-400" />
                Active Hardware Sessions
              </h4>
              <button
                onClick={handleRevokeSessions}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                Revoke Others
              </button>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-white">{sess.device}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{sess.client}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sess.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {sess.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
