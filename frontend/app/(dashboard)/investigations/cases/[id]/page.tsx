"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Briefcase,
  CheckCircle,
  Clock,
  Layers,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  User,
} from "lucide-react";
import { addCaseNote, getCase, updateCaseStatus } from "@/lib/api";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { EvidenceCard } from "@/components/ui/EvidenceCard";
import { formatDate } from "@/lib/utils";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const identifier = (params?.id as string) || "CASE-0001";

  const [caseData, setCaseData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>("");
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const loadCase = () => {
    setLoading(true);
    getCase(identifier)
      .then((data) => setCaseData(data))
      .catch((err) => setError(err.message || "Failed to load case"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCase();
  }, [identifier]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !caseData) return;
    setSubmittingNote(true);
    try {
      await addCaseNote(caseData.id, newNote.trim());
      setNewNote("");
      loadCase();
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: string, resolution?: string) => {
    if (!caseData) return;
    setUpdatingStatus(true);
    try {
      await updateCaseStatus(caseData.id, {
        status: newStatus,
        resolution: resolution || undefined,
        resolution_note: resolution ? `Case resolved as ${resolution}.` : undefined,
      });
      loadCase();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 max-w-5xl mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-400" />
        <p className="font-semibold text-slate-700">Loading Case Dossier...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="p-8 bg-white rounded-lg border border-red-200 text-center max-w-2xl mx-auto my-12">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Case Record Not Found</h2>
        <p className="text-xs text-slate-600 mt-1">{error || "Unable to locate case."}</p>
        <Link
          href="/investigations/cases"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Case Management
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/investigations/cases"
            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-500">
                CASE DOSSIER /
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                {caseData.code}
              </h1>
              <RiskBadge level={caseData.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created {formatDate(caseData.created_at)} • Assigned to {caseData.assigned_to || "Unassigned"}
            </p>
          </div>
        </div>

        {/* Workflow Disposition Buttons */}
        <div className="flex items-center gap-2">
          {caseData.status !== "resolved" ? (
            <>
              {caseData.status === "open" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                >
                  Start Investigation
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStatusChange("resolved", "confirmed_fraud")}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
              >
                Resolve as Confirmed Fraud
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("resolved", "false_positive")}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Close as False Positive
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs uppercase">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Resolved: {caseData.resolution?.replace(/_/g, " ") || "Closed"}
            </span>
          )}
        </div>
      </div>

      {/* Case Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Metadata & Associated Entities */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Incident Context
            </h3>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Incident Title
              </span>
              <span className="text-sm font-bold text-slate-900 leading-snug block mt-0.5">
                {caseData.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Customer
                </span>
                <span className="font-semibold text-slate-800 block">
                  {caseData.customer_name}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {caseData.customer_code}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Wallet
                </span>
                <span className="font-mono font-bold text-slate-800 block">
                  {caseData.wallet_code}
                </span>
              </div>
            </div>

            {caseData.transaction_code && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Attached Flagged Transaction
                </span>
                <Link
                  href={`/monitoring/transactions/${caseData.transaction_code}`}
                  className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-indigo-700 font-mono font-bold text-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{caseData.transaction_code}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chronological Notes & Investigator Log */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Investigator Chronology & Case Notes ({caseData.notes?.length || 0})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Immutable Audit Log
            </span>
          </div>

          {/* Notes Timeline */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-96">
            {caseData.notes && caseData.notes.length > 0 ? (
              caseData.notes.map((note: any) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {note.author_name} ({note.author_email})
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {note.body}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No investigator notes logged yet.
              </div>
            )}
          </div>

          {/* Add Note Form */}
          <form
            onSubmit={handleAddNote}
            className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Add investigator note or audit record..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-white border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              disabled={submittingNote || !newNote.trim()}
              className="px-4 py-2 rounded bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingNote ? "Saving..." : "Add Note"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
