import { useState } from "react";
import {
  X, CheckCircle2, AlertTriangle, Bot, FileText, Send,
  ChevronDown, ChevronUp, Download, ArrowRight, Clock,
  Sparkles, Database, StickyNote, Flag,
} from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

// ── Types ──────────────────────────────────────────────────────────────

export interface AuditAffectedRecord {
  entity: string;
  caseNumber: string;
  attribute: string;
  oldValue: string;
  newValue: string;
}

export type AuditEntryType =
  | "session_start"
  | "action_selected"
  | "action_cleared"
  | "agent_rerun"
  | "agent_review"
  | "custom_note"
  | "document_viewed"
  | "submit"
  | "escalate";

export interface AuditEntry {
  id: string;
  timestamp: Date;
  type: AuditEntryType;
  title: string;
  detail?: string;
  exceptionIdx?: number;
  exceptionTitle?: string;
  entity?: string;
  caseNumber?: string;
  result?: "resolved" | "pending" | "updated" | "flagged" | "submitted" | "escalated" | "cleared";
  agentSteps?: string[];
  agentConfidence?: number;
  affectedRecords?: AuditAffectedRecord[];
  postActionReasoning?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}
function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Icon dot ───────────────────────────────────────────────────────────

function EntryDot({ type, result }: { type: AuditEntryType; result?: string }) {
  const base = "w-6 h-6 rounded-full flex items-center justify-center shrink-0";

  if (type === "session_start") return (
    <div className={base} style={{ background: "var(--color-dark-blue-050, #eef2fb)", border: "1.5px solid var(--color-dark-blue-200)" }}>
      <Clock size={11} style={{ color: "var(--color-dark-blue-500)" }} />
    </div>
  );
  if (type === "submit") return (
    <div className={base} style={{ background: "var(--color-green-000)", border: "1.5px solid var(--color-green-300)" }}>
      <Send size={10} style={{ color: "var(--color-green-700)" }} />
    </div>
  );
  if (type === "escalate") return (
    <div className={base} style={{ background: "var(--color-yellow-000)", border: "1.5px solid var(--color-yellow-300)" }}>
      <Flag size={10} style={{ color: "var(--color-yellow-700)" }} />
    </div>
  );
  if (type === "agent_review" || type === "agent_rerun") return (
    <div className={base} style={{ background: "var(--color-dark-blue-000)", border: "1.5px solid var(--color-dark-blue-200)" }}>
      <Bot size={11} style={{ color: "var(--color-dark-blue-600)" }} />
    </div>
  );
  if (type === "document_viewed") return (
    <div className={base} style={{ background: "var(--color-neutral-050)", border: "1.5px solid var(--color-neutral-200)" }}>
      <FileText size={10} style={{ color: "var(--color-neutral-500)" }} />
    </div>
  );
  if (type === "custom_note") return (
    <div className={base} style={{ background: "var(--color-neutral-050)", border: "1.5px solid var(--color-neutral-200)" }}>
      <StickyNote size={10} style={{ color: "var(--color-neutral-500)" }} />
    </div>
  );
  if (type === "action_cleared") return (
    <div className={base} style={{ background: "var(--color-neutral-050)", border: "1.5px solid var(--color-neutral-200)" }}>
      <X size={10} style={{ color: "var(--color-neutral-400)" }} />
    </div>
  );
  if (result === "resolved" || result === "updated") return (
    <div className={base} style={{ background: "var(--color-green-000)", border: "1.5px solid var(--color-green-300)" }}>
      <CheckCircle2 size={11} style={{ color: "var(--color-green-700)" }} />
    </div>
  );
  return (
    <div className={base} style={{ background: "var(--color-yellow-000)", border: "1.5px solid var(--color-yellow-300)" }}>
      <AlertTriangle size={10} style={{ color: "var(--color-yellow-700)" }} />
    </div>
  );
}

// ── Result badge ───────────────────────────────────────────────────────

function ResultBadge({ result }: { result?: string }) {
  if (!result) return null;
  const map: Record<string, [string, string, string]> = {
    resolved:  ["var(--color-green-000)",      "var(--color-green-200)",      "var(--color-green-800)"],
    updated:   ["var(--color-dark-blue-000)",   "var(--color-dark-blue-200)",  "var(--color-dark-blue-700)"],
    pending:   ["var(--color-yellow-000)",      "var(--color-yellow-300)",     "var(--color-yellow-800)"],
    flagged:   ["var(--color-yellow-000)",      "var(--color-yellow-300)",     "var(--color-yellow-800)"],
    submitted: ["var(--color-green-000)",       "var(--color-green-200)",      "var(--color-green-800)"],
    escalated: ["var(--color-yellow-000)",      "var(--color-yellow-300)",     "var(--color-yellow-800)"],
    cleared:   ["var(--color-neutral-100)",     "var(--color-neutral-300)",    "var(--color-neutral-600)"],
  };
  const [bg, border, color] = map[result] ?? [];
  if (!bg) return null;
  const label = result.charAt(0).toUpperCase() + result.slice(1);
  return (
    <span
      className="inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-semibold border shrink-0"
      style={{ background: bg, borderColor: border, color }}
    >
      {label}
    </span>
  );
}

// ── Entry row ──────────────────────────────────────────────────────────

function AuditEntryRow({ entry, isLast }: { entry: AuditEntry; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = !!(entry.agentSteps?.length || entry.affectedRecords?.length || entry.postActionReasoning);

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center shrink-0 pt-0.5">
        <EntryDot type={entry.type} result={entry.result} />
        {!isLast && (
          <div className="w-px flex-1 mt-1.5" style={{ background: "var(--color-neutral-150, #e8eaed)", minHeight: 12 }} />
        )}
      </div>

      {/* Body */}
      <div className={`flex-1 min-w-0 ${isLast ? "pb-1" : "pb-5"}`}>

        {/* Title + badge */}
        <div className="flex items-center gap-2 flex-wrap leading-none mb-1">
          <p className="text-[11.5px] font-semibold text-kyc-neutral-800 flex-1 min-w-0 leading-snug">{entry.title}</p>
          <ResultBadge result={entry.result} />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[10px] font-mono text-kyc-neutral-400">{formatTime(entry.timestamp)}</span>
          {entry.entity && (
            <>
              <span className="text-kyc-neutral-300" aria-hidden>·</span>
              <span className="text-[10px] text-kyc-neutral-500">
                {entry.entity}
                {entry.caseNumber && (
                  <span className="font-mono text-kyc-neutral-400 ml-1">{entry.caseNumber}</span>
                )}
              </span>
            </>
          )}
          {entry.exceptionTitle && (
            <>
              <span className="text-kyc-neutral-300" aria-hidden>·</span>
              <span className="text-[10px] text-kyc-neutral-400 italic truncate max-w-[180px]">{entry.exceptionTitle}</span>
            </>
          )}
          {entry.agentConfidence !== undefined && (
            <>
              <span className="text-kyc-neutral-300" aria-hidden>·</span>
              <span className="text-[10px] text-kyc-neutral-400">{entry.agentConfidence}% confidence</span>
            </>
          )}
        </div>

        {/* Detail text */}
        {entry.detail && (
          <p className="text-[11px] text-kyc-neutral-500 leading-snug mb-1.5">{entry.detail}</p>
        )}

        {/* Expand toggle */}
        {hasDetail && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[10px] font-semibold mb-2 transition-colors"
            style={{ color: "var(--color-dark-blue-600)" }}
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {expanded ? "Hide details" : "Show details"}
          </button>
        )}

        {/* Expanded detail */}
        {expanded && hasDetail && (
          <div
            className="rounded-lg border space-y-3 p-3 mb-1"
            style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
          >
            {/* Agent steps */}
            {entry.agentSteps && entry.agentSteps.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={9} className="text-kyc-neutral-400" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-kyc-neutral-400">Agent Steps</p>
                </div>
                <ol className="space-y-1.5">
                  {entry.agentSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border mt-0.5"
                        style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-500)", background: "#fff" }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-[10.5px] text-kyc-neutral-600 leading-snug">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Outcome */}
            {entry.postActionReasoning && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-kyc-neutral-400 mb-1">Outcome</p>
                <p className="text-[10.5px] text-kyc-neutral-600 leading-snug">{entry.postActionReasoning}</p>
              </div>
            )}

            {/* Affected records */}
            {entry.affectedRecords && entry.affectedRecords.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Database size={9} className="text-kyc-neutral-400" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-kyc-neutral-400">
                    {entry.affectedRecords.length} Record{entry.affectedRecords.length !== 1 ? "s" : ""} Updated
                  </p>
                </div>
                <div className="rounded border overflow-hidden" style={{ borderColor: "var(--color-neutral-200)" }}>
                  <div
                    className="grid px-2.5 py-1.5"
                    style={{ gridTemplateColumns: "1.1fr 0.9fr 1.4fr", background: "var(--color-neutral-100)" }}
                  >
                    {["Entity", "Attribute", "Before → After"].map(h => (
                      <p key={h} className="text-[9px] font-bold uppercase tracking-widest text-kyc-neutral-500">{h}</p>
                    ))}
                  </div>
                  {entry.affectedRecords.map((rec, i) => (
                    <div
                      key={i}
                      className="grid px-2.5 py-2"
                      style={{
                        gridTemplateColumns: "1.1fr 0.9fr 1.4fr",
                        borderTop: "1px solid var(--color-neutral-200)",
                        background: "#fff",
                      }}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[10.5px] font-semibold text-kyc-neutral-700 truncate">{rec.entity}</p>
                        <p className="text-[9px] font-mono text-kyc-neutral-400">{rec.caseNumber}</p>
                      </div>
                      <p className="text-[10.5px] text-kyc-neutral-600 pr-2 leading-snug self-center">{rec.attribute}</p>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[9.5px] text-kyc-neutral-400 truncate line-through" title={rec.oldValue}>{rec.oldValue}</span>
                        <div className="flex items-center gap-1">
                          <ArrowRight size={8} style={{ color: "var(--color-green-700)" }} className="shrink-0" />
                          <span className="text-[10.5px] font-semibold truncate" style={{ color: "var(--color-green-800)" }} title={rec.newValue}>{rec.newValue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

interface AuditLogPanelProps {
  entries: AuditEntry[];
  onClose: () => void;
  postSubmit?: boolean;
  onReturnToQueue?: () => void;
}

export function AuditLogPanel({ entries, onClose, postSubmit, onReturnToQueue }: AuditLogPanelProps) {
  const sessionDate   = entries.length > 0 ? formatDate(entries[0].timestamp) : formatDate(new Date());
  const resolvedCount = entries.filter(e => e.result === "resolved" || e.result === "updated").length;
  const totalActions  = entries.filter(e => e.type === "action_selected").length;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-log-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,16,48,0.5)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(680px, 96vw)",
          height: "min(80vh, 780px)",
          background: "#fff",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: 12,
          boxShadow: "0 8px 40px rgba(0,16,48,0.14)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: "var(--color-neutral-200)" }}
        >
          <div>
            <h2 id="audit-log-title" className="text-[13px] font-bold text-kyc-neutral-800 leading-none mb-0.5">
              Audit Log
            </h2>
            <p className="text-[10.5px] text-kyc-neutral-400">{sessionDate} · Case #KYC-2024-8821</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Summary chips */}
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold"
                style={{ background: "var(--color-green-000)", borderColor: "var(--color-green-200)", color: "var(--color-green-800)" }}
              >
                <CheckCircle2 size={9} />
                {resolvedCount} resolved
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold"
                style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)", color: "var(--color-neutral-600)" }}
              >
                {totalActions} actions
              </span>
            </div>

            {/* Export */}
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10.5px] font-semibold border rounded-full transition-colors hover:bg-kyc-neutral-50"
              style={{ borderColor: "var(--color-neutral-200)", color: "var(--color-neutral-600)" }}
              onClick={() => {}}
              title="Export audit log"
            >
              <Download size={10} /> Export
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-kyc-neutral-100"
              aria-label="Close audit log"
            >
              <X size={14} className="text-kyc-neutral-500" />
            </button>
          </div>
        </div>

        {/* ── Post-submit banner ── */}
        {postSubmit && (
          <div
            className="shrink-0 flex items-center gap-2.5 px-5 py-2.5 border-b"
            style={{ background: "var(--color-green-000)", borderColor: "var(--color-green-200)" }}
          >
            <CheckCircle2 size={13} style={{ color: "var(--color-green-700)" }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11.5px] font-semibold" style={{ color: "var(--color-green-800)" }}>
                Case submitted for QA review
              </p>
              <p className="text-[10.5px]" style={{ color: "var(--color-green-700)" }}>
                #KYC-2024-8821 · BlackRock DRG Group has been routed to the QA queue.
              </p>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {entries.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-kyc-neutral-400 px-8">
            <Clock size={24} className="opacity-25" />
            <p className="text-[12px] font-semibold text-kyc-neutral-500">No actions recorded yet</p>
            <p className="text-[11px] text-center leading-snug text-kyc-neutral-400">
              Actions taken during this review session will appear here.
            </p>
          </div>
        )}

        {/* ── Timeline ── */}
        {entries.length > 0 && (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {entries.map((entry, i) => (
              <AuditEntryRow key={entry.id} entry={entry} isLast={i === entries.length - 1} />
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
        >
          <p className="text-[10.5px] text-kyc-neutral-400">
            {entries.length} event{entries.length !== 1 ? "s" : ""} · KYC Platform audit trail
          </p>
          {postSubmit ? (
            <Button variant="filled" size="small" label="Return to Work Queue" onClick={onReturnToQueue ?? onClose} />
          ) : (
            <Button variant="outlined" size="small" label="Close" onClick={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
