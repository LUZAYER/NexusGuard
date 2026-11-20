import React, { useState } from "react";
import { Bot, CheckCircle2, Clock, Download, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { generateAIReport, downloadReportPDF } from "@/lib/api";

interface RecommendedAction {
  action: string;
  priority: string;
  sla: string;
  rationale: string;
}

export interface AIReportData {
  status: string;
  model_name?: string;
  latency_ms?: number;
  executive_summary?: string;
  attack_hypothesis?: string;
  recommended_actions?: RecommendedAction[];
  evidence_codes?: string[];
  context_hash?: string;
  generated_at?: string;
}

interface InvestigationReportViewProps {
  report: AIReportData | null;
  transactionCode: string;
  onRefresh?: () => void;
  className?: string;
}

export const InvestigationReportView: React.FC<InvestigationReportViewProps> = ({
  report: initialReport,
  transactionCode,
  onRefresh,
  className,
}) => {
  const [report, setReport] = useState<AIReportData | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await generateAIReport(transactionCode);
      if (data.report) {
        setReport({
          status: data.status,
          model_name: data.model_name,
          latency_ms: data.latency_ms,
          ...data.report,
        });
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to generate AI investigation advisory report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await downloadReportPDF(transactionCode);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Incident-Report-${transactionCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden ${className || ""}`}>
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
              AI Advisory Investigation Synthesis
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                ADVISORY ONLY
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic evidence synthesis with strict prompt injection defense
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? "Exporting..." : "Export PDF"}
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {report ? "Regenerate" : "Run AI Investigation"}
          </button>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="bg-amber-50/70 border-b border-amber-200 px-5 py-2 text-[11px] text-amber-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Human-in-the-Loop Mandate:</strong> This synthesis is produced by an advisory LLM ({report?.model_name || "Ollama Local"}). It provides decision support; consequential financial blocks require human authorization.
        </span>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      {/* Content */}
      {report ? (
        <div className="p-5 space-y-4">
          {/* Executive Summary */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Executive Summary
            </h4>
            <p className="mt-1 text-sm font-medium text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              {(report as any).summary || report.executive_summary || "Investigation summary generated based on observed anomaly patterns."}
            </p>
          </div>

          {/* Key Risk Indicators */}
          {(report as any).key_risk_indicators && (report as any).key_risk_indicators.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Key Risk Indicators
              </h4>
              <ul className="mt-1 space-y-1 bg-red-50/40 p-3 rounded border border-red-100 text-xs text-red-900">
                {(report as any).key_risk_indicators.map((kri: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{kri}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attack Hypothesis & Vector / Behavioral Analysis */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Behavioral Analysis & Attack Vector
            </h4>
            <div className="mt-1 text-xs text-slate-700 leading-relaxed bg-amber-50/40 p-3 rounded border border-amber-200">
              {(report as any).behavioral_analysis || report.attack_hypothesis || "Discrepancy detected between observed session dynamics and historical baseline."}
            </div>
          </div>

          {/* Network Context */}
          {(report as any).network_context && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Topological & Mule Network Context
              </h4>
              <div className="mt-1 text-xs text-slate-700 leading-relaxed bg-indigo-50/40 p-3 rounded border border-indigo-100">
                {(report as any).network_context}
              </div>
            </div>
          )}

          {/* Recommended Investigation Steps / Actions */}
          {((report as any).recommended_investigation_steps || report.recommended_actions) && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Prescriptive Remediation & Investigation Steps
              </h4>
              <div className="mt-2 space-y-2">
                {(report as any).recommended_investigation_steps ? (
                  (report as any).recommended_investigation_steps.map((step: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-2.5 text-xs font-medium text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))
                ) : (
                  report.recommended_actions?.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{act.action}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                              act.priority.toLowerCase() === "critical"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {act.priority}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{act.rationale}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>SLA: {act.sla}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span>Model:</span>
              <strong className="text-slate-800">{report.model_name || "qwen3:8b (Primary)"}</strong>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                {report.status || "completed"}
              </span>
            </span>
            {report.latency_ms && <span>Latency: {report.latency_ms}ms</span>}
            {report.context_hash && (
              <span className="truncate max-w-[200px]" title={report.context_hash}>
                Hash: {report.context_hash.slice(0, 16)}...
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 text-xs">
          <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No Advisory Report Generated Yet</p>
          <p className="mt-1 text-slate-500">
            Click &ldquo;Run AI Investigation&rdquo; to trigger local Ollama inference with structured evidence validation.
          </p>
        </div>
      )}
    </div>
  );
};
