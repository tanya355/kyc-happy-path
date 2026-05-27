import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Send, CheckCircle2, X, Check, AlertOctagon, XCircle, Info, AlertTriangle, Bot, Loader2, ChevronDown, ChevronUp, ClipboardList, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@kpmg-us/ad-design-lib";
import { DrgModal } from "./DrgModal";
import { CaseAgenticReasoningModal } from "./CaseAgenticReasoningModal";

const drgEntities = [
  "BlackRock DRG Group",
  "BlackRock Advisors",
  "BlackRock Institutional",
  "BlackRock Global Equity Fund",
  "Vanguard Group",
];

export const ENTITY_META: Record<string, {
  risk: string; riskLevel: "elevated" | "moderate" | "low";
  priority: string;
  customerType: string;
  jurisdiction: string;
  dueDate: string;
  exceptionTotal: number;
  status: string;
  confidence: string;
}> = {
  "BlackRock Advisors": {
    risk: "Elevated", riskLevel: "elevated",
    priority: "High", customerType: "Corporate Fund",
    jurisdiction: "USA", dueDate: "Apr 25, 2026", exceptionTotal: 1,
    status: "In Progress", confidence: "90%",
  },
  "BlackRock Institutional": {
    risk: "Elevated", riskLevel: "elevated",
    priority: "High", customerType: "Complex Ownership",
    jurisdiction: "United Kingdom", dueDate: "May 14, 2026", exceptionTotal: 3,
    status: "Pending Feedback", confidence: "98%",
  },
  "Entity 13": {
    risk: "Moderate", riskLevel: "moderate",
    priority: "Medium", customerType: "Investment Entity",
    jurisdiction: "European Union", dueDate: "Jun 28, 2026", exceptionTotal: 1,
    status: "Not Started", confidence: "76%",
  },
};

import type { AuditEntry } from "./AuditLogPanel";

interface CaseHeaderProps {
  resolvedCount: number;
  totalExceptions: number;
  focusedEntity?: string | null;
  onAuditEntry?: (entry: AuditEntry) => void;
  onOpenAuditLog?: () => void;
  onSubmitComplete?: () => void;
  reachOutCount?: number;
  onOpenReachOuts?: () => void;
  onAgentReviewReady?: () => void;
  onRunAgents?: () => void;
}

type SubmitPhase = "confirm" | "processing" | "complete";

const PROCESSING_STEPS = [
  "Validating exception resolutions",
  "Updating affected entity records",
  "Routing to QA review queue",
  "Generating audit trail entry",
];

function ApprovalModal({
  onClose, onConfirm, resolvedCount, totalExceptions, reachOutCount, onOpenAuditLog,
}: {
  onClose: () => void;
  onConfirm: () => void;
  resolvedCount: number;
  totalExceptions: number;
  reachOutCount: number;
  onOpenAuditLog?: () => void;
}) {
  const [phase, setPhase] = useState<SubmitPhase>("confirm");
  const [doneSteps, setDoneSteps] = useState(0);

  const startProcessing = () => {
    setPhase("processing");
    const delays = [700, 1400, 2100, 2700];
    delays.forEach((d, i) => {
      setTimeout(() => {
        setDoneSteps(i + 1);
        if (i === delays.length - 1) {
          setTimeout(() => {
            onConfirm();
            setPhase("complete");
          }, 400);
        }
      }, d);
    });
  };

  const accentColor = phase === "complete" ? "var(--color-green-600)" : "var(--color-dark-blue-600)";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
    >
      <div className="absolute inset-0" style={{ background: "rgba(0,16,48,0.5)" }} onClick={phase === "confirm" ? onClose : undefined} aria-hidden="true" />

      <div
        className="relative w-full mx-4 rounded-xl overflow-hidden flex flex-col"
        style={{
          maxWidth: phase === "complete" ? 520 : 440,
          maxHeight: "90vh",
          background: "var(--color-base-white)",
          border: "1px solid var(--color-neutral-200)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
          transition: "max-width 0.2s",
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 3, background: accentColor, flexShrink: 0 }} aria-hidden="true" />

        {/* ── CONFIRM PHASE ── */}
        {phase === "confirm" && (
          <>
            <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-dark-blue-000)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-dark-blue-600)" }}>
                <Send size={15} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="submit-modal-title" className="text-[15px] font-bold text-ds-neutral-900 leading-tight">Submit for Approval</h2>
                <p className="text-[11px] text-ds-neutral-600 mt-0.5">Case <span className="font-semibold text-ds-neutral-800">#KYC-2024-8821</span> — BlackRock DRG Group</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="w-7 h-7 flex items-center justify-center rounded text-ds-neutral-500 hover:text-ds-neutral-800 hover:bg-ds-neutral-100 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-[13px] text-ds-neutral-700 leading-relaxed mb-4">
                {resolvedCount} of {totalExceptions} exceptions addressed. This case will be routed to the QA review queue for final sign-off.
              </p>
              <div className="rounded-lg px-4 py-3 mb-5 flex flex-col gap-2" style={{ background: "var(--color-neutral-050)", border: "1px solid var(--color-neutral-200)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-ds-neutral-600">Exceptions addressed</span>
                  <span className="text-[11px] font-semibold text-ds-neutral-800">{resolvedCount} / {totalExceptions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-ds-neutral-600">Risk rating</span>
                  <span className="text-[11px] font-semibold text-ds-neutral-800">Elevated</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-ds-neutral-600">Reach Outs pending</span>
                  <span className="text-[11px] font-semibold text-ds-neutral-800">{reachOutCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-ds-neutral-600">Next step</span>
                  <span className="text-[11px] font-semibold text-ds-dark-blue-600">QA Review queue</span>
                </div>
              </div>
              <div className="flex gap-3 [&>*]:flex-1">
                <Button variant="outlined" size="small" label="Cancel" onClick={onClose} />
                <Button variant="filled" size="small" label="Confirm & Submit" showIconTrailing icon={<Send size={13} />} onClick={startProcessing} />
              </div>
            </div>
          </>
        )}

        {/* ── PROCESSING PHASE ── */}
        {phase === "processing" && (
          <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--color-dark-blue-000)", border: "1.5px solid var(--color-dark-blue-200)" }}>
              <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-dark-blue-600)" }} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-ds-neutral-900 mb-1">Submitting case…</p>
              <p className="text-[12px] text-ds-neutral-600">#KYC-2024-8821 · BlackRock DRG Group</p>
            </div>
            <div className="w-full space-y-2.5 text-left">
              {PROCESSING_STEPS.map((step, i) => {
                const done = i < doneSteps;
                const active = i === doneSteps;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{
                      background: done ? "var(--color-green-000)" : "var(--color-neutral-100)",
                      border: `1.5px solid ${done ? "var(--color-green-300)" : active ? "var(--color-dark-blue-300)" : "var(--color-neutral-200)"}`,
                    }}>
                      {done
                        ? <Check size={10} style={{ color: "var(--color-green-600)" }} strokeWidth={2.5} />
                        : active
                        ? <Loader2 size={10} className="animate-spin" style={{ color: "var(--color-dark-blue-600)" }} />
                        : null}
                    </div>
                    <p className={`text-[12px] ${done ? "text-ds-neutral-700" : active ? "font-semibold text-ds-neutral-800" : "text-ds-neutral-400"}`}>
                      {step}{active ? "…" : ""}
                    </p>
                    {done && <Check size={11} className="ml-auto shrink-0" style={{ color: "var(--color-green-600)" }} strokeWidth={2.5} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── COMPLETE PHASE ── */}
        {phase === "complete" && (
          <div className="flex flex-col overflow-hidden" style={{ maxHeight: "88vh" }}>
            {/* Success header */}
            <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-green-000)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-green-100)", border: "1.5px solid var(--color-green-300)" }}>
                <CheckCircle2 size={18} style={{ color: "var(--color-green-600)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="submit-modal-title" className="text-[14px] font-bold leading-tight" style={{ color: "var(--color-green-800)" }}>Case Submitted</h2>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--color-green-700)" }}>
                  #KYC-2024-8821 · BlackRock DRG Group — routed to QA Review queue
                </p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">

              {/* What changed */}
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-neutral-500)" }}>What changed</p>
                <div className="space-y-1.5">
                  {[
                    { entity: "BlackRock Advisors LLC",            case_: "KYC-28821", result: "Title variation confirmed — no record change",                  status: "no-change" as const },
                    { entity: "BlackRock Institutional Trust Co.", case_: "KYC-28834", result: "Fund Charter accepted as authoritative — Signatory Registry updated", status: "updated" as const },
                    { entity: "Entity 13",                         case_: "KYC-29107", result: `Documentation request queued (${reachOutCount} reach-out pending)`, status: "queued" as const },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2 border" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}>
                      <div className="shrink-0 mt-0.5">
                        {row.status === "updated"   && <CheckCircle2 size={12} style={{ color: "var(--color-green-600)" }} />}
                        {row.status === "no-change" && <Check         size={12} style={{ color: "var(--color-neutral-500)" }} />}
                        {row.status === "queued"    && <AlertTriangle  size={12} style={{ color: "var(--color-yellow-600)" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-800)" }}>{row.entity}</p>
                        <p className="text-[10px]" style={{ color: "var(--color-neutral-600)" }}>{row.case_} · {row.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Records modified */}
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-neutral-500)" }}>Records modified</p>
                <div className="border overflow-hidden" style={{ borderColor: "var(--color-neutral-200)" }}>
                  <div className="grid px-3 py-1.5" style={{ gridTemplateColumns: "1.4fr 1fr 1.5fr", background: "var(--color-neutral-100)" }}>
                    {["Entity / Case", "Attribute", "Change"].map(h => (
                      <p key={h} className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--color-neutral-500)" }}>{h}</p>
                    ))}
                  </div>
                  <div className="grid px-3 py-2 border-t" style={{ gridTemplateColumns: "1.4fr 1fr 1.5fr", borderColor: "var(--color-neutral-200)" }}>
                    <div>
                      <p className="text-[10px] font-semibold" style={{ color: "var(--color-neutral-800)" }}>BlackRock Institutional</p>
                      <p className="text-[9px] font-mono" style={{ color: "var(--color-neutral-500)" }}>KYC-28834</p>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>Auth. Title Source</p>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 inline-block" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-600)", textDecoration: "line-through" }}>Signatory Registry</span>
                      <span className="text-[9px] px-1.5 py-0.5 inline-block font-semibold" style={{ background: "var(--color-green-000)", color: "var(--color-green-700)", border: "1px solid var(--color-green-200)" }}>Fund Charter (Pg. 3)</span>
                    </div>
                  </div>
                  <div className="grid px-3 py-2 border-t" style={{ gridTemplateColumns: "1.4fr 1fr 1.5fr", borderColor: "var(--color-neutral-200)" }}>
                    <div>
                      <p className="text-[10px] font-semibold" style={{ color: "var(--color-neutral-800)" }}>BlackRock Advisors</p>
                      <p className="text-[9px] font-mono" style={{ color: "var(--color-neutral-500)" }}>KYC-28821</p>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>All attributes</p>
                    <span className="text-[9px] self-center" style={{ color: "var(--color-neutral-500)" }}>No changes — confirmed as-is</span>
                  </div>
                </div>
              </div>

              {/* Downstream routing */}
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-neutral-500)" }}>Downstream impact</p>
                <div className="px-4 py-3 border space-y-2" style={{ borderColor: "var(--color-dark-blue-100)", background: "var(--color-dark-blue-000)" }}>
                  {[
                    ["Routed to",      "QA Review queue"],
                    ["Assigned to",    "Reviewer pool (unassigned)"],
                    ["SLA",            "48 hours"],
                    ["Reach Outs",     `${reachOutCount} pending — awaiting aggregated draft approval`],
                    ["Audit trail",    "Logged · Available in Audit Log"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-start gap-2">
                      <span className="shrink-0 text-[10px] font-semibold w-24" style={{ color: "var(--color-dark-blue-700)" }}>{label}</span>
                      <span className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="shrink-0 px-6 py-4 border-t flex gap-3 [&>*]:flex-1" style={{ borderColor: "var(--color-neutral-200)" }}>
              {onOpenAuditLog && (
                <Button variant="outlined" size="small" label="View Audit Log" icon={<ClipboardList size={12} />} onClick={onOpenAuditLog} />
              )}
              <Button variant="filled" size="small" label="Return to Queue" onClick={onClose} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Escalation data ───────────────────────────────────────────────────

const ESCALATION_TARGETS: Record<string, string[]> = {
  "Sales":            ["Relationship Risk", "Litigation Risk", "Approval"],
  "Compliance":       ["Guidance Required", "Approval"],
  "Operations Lead":  ["Guidance Required", "Re-allocate"],
};

function EscalationModal({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [note, setNote]     = useState<string>("");

  const reasons = target ? ESCALATION_TARGETS[target] : [];

  const handleSubmit = () => {
    toast.success(`Escalated to ${target}`, {
      description: `Reason: ${reason}${note ? ` — "${note}"` : ""}`,
      duration: 4000,
    });
    onClose();
  };

  const canSubmit = target && reason;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="escalate-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,16,48,0.5)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden"
        style={{
          background: "var(--color-base-white)",
          border: "1px solid var(--color-neutral-200)",
          boxShadow: "var(--shadow-dialog, 0 8px 32px rgba(0,0,0,0.14))",
        }}
      >
        {/* DS accent */}
        <div style={{ height: 3, background: "var(--color-dark-blue-600)" }} aria-hidden="true" />

        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b"
          style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-dark-blue-000)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--color-dark-blue-600)" }}
            aria-hidden="true"
          >
            <AlertOctagon size={15} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="escalate-modal-title" className="text-[15px] font-bold text-ds-neutral-900 leading-tight">
              Escalate Case
            </h2>
            <p className="text-[11px] text-ds-neutral-600 mt-0.5">
              Case <span className="font-semibold text-ds-neutral-800">#KYC-2024-8821</span> — BlackRock DRG Group
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close escalation dialog"
            className="w-7 h-7 flex items-center justify-center rounded text-ds-neutral-500 hover:text-ds-neutral-800 hover:bg-ds-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-ds-dark-blue-600"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Escalate to */}
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-ds-neutral-700 mb-2">
              Escalate to <span className="text-ds-red-700" aria-hidden="true">*</span>
            </legend>
            <div className="flex flex-col gap-1.5" role="radiogroup" aria-required="true">
              {Object.keys(ESCALATION_TARGETS).map(t => (
                <label
                  key={t}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    target === t
                      ? "border-ds-dark-blue-400 bg-ds-dark-blue-000"
                      : "border-ds-neutral-200 bg-white hover:border-ds-neutral-300 hover:bg-ds-neutral-050"
                  }`}
                >
                  <input
                    type="radio"
                    name="escalation-target"
                    value={t}
                    checked={target === t}
                    onChange={() => { setTarget(t); setReason(""); }}
                    className="accent-ds-dark-blue-600"
                    aria-label={t}
                  />
                  <span className={`text-[13px] font-semibold ${target === t ? "text-ds-dark-blue-700" : "text-ds-neutral-800"}`}>
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Escalation reason — conditional on target */}
          {target && (
            <fieldset>
              <legend className="text-[11px] font-semibold uppercase tracking-wider text-ds-neutral-700 mb-2">
                Reason <span className="text-ds-red-700" aria-hidden="true">*</span>
              </legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-required="true">
                {reasons.map(r => (
                  <label
                    key={r}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-[12px] font-medium ${
                      reason === r
                        ? "border-ds-dark-blue-400 bg-ds-dark-blue-000 text-ds-dark-blue-700"
                        : "border-ds-neutral-200 bg-white text-ds-neutral-700 hover:border-ds-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="escalation-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="sr-only"
                    />
                    {reason === r && <Check size={11} className="text-ds-dark-blue-600 shrink-0" aria-hidden="true" />}
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Optional note */}
          <div>
            <label htmlFor="escalation-note" className="block text-[11px] font-semibold uppercase tracking-wider text-ds-neutral-700 mb-2">
              Additional notes <span className="text-ds-neutral-500 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="escalation-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Provide context or instructions for the recipient…"
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-[12px] text-ds-neutral-800 placeholder:text-ds-neutral-400 resize-none outline-none focus-visible:ring-2 focus-visible:ring-ds-dark-blue-400"
              style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-000)" }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 [&>*]:flex-1">
            <Button variant="outlined" size="small" label="Cancel" onClick={onClose} />
            <Button
              variant="filled"
              size="small"
              label="Submit Escalation"
              showIconTrailing
              icon={<AlertOctagon size={13} aria-hidden="true" />}
              onClick={handleSubmit}
              disabled={!canSubmit}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Subway line ───────────────────────────────────────────────────────

const STAGES = [
  {
    key: "not-started",
    label: "Not Started",
    description: "Case created and awaiting initial processing.",
  },
  {
    key: "enrichment",
    label: "Enrichment",
    description: "Supporting documents requested; CIP attributes being populated.",
  },
  {
    key: "analyst-review",
    label: "Analyst Review",
    description: "Analyst reviewing exceptions, ownership structure, and adverse media.",
  },
  {
    key: "qa-review",
    label: "QA Review",
    description: "QA officer validating analyst decisions before case closure.",
  },
  {
    key: "case-closed",
    label: "Case Closed",
    description: "Case cleared and filed. Periodic review scheduled.",
  },
];

const CURRENT_STAGE = "analyst-review";

export function CaseStatusBar() { return <StatusSubwayLine />; }

function StatusSubwayLine() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const currentIdx = STAGES.findIndex(s => s.key === CURRENT_STAGE);

  const handleMouseEnter = (key: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom });
    setHovered(key);
  };

  const hoveredStage = STAGES.find(s => s.key === hovered);
  const hoveredIdx   = STAGES.findIndex(s => s.key === hovered);

  return (
    <>
      <div className="flex items-center gap-0 max-w-xs">
        {STAGES.map((stage, i) => {
          const done    = i < currentIdx;
          const current = i === currentIdx;

          return (
            <div key={stage.key} className="flex items-center flex-1 last:flex-none">
              <div
                className="flex items-center gap-1 cursor-default"
                onMouseEnter={e => handleMouseEnter(stage.key, e)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Dot */}
                <div className={`rounded-full flex items-center justify-center transition-all ${
                  done    ? "w-2.5 h-2.5 bg-ds-dark-blue-300" :
                  current ? "w-3 h-3 border-2 border-ds-dark-blue-600 bg-ds-dark-blue-600" :
                            "w-2.5 h-2.5 border border-kyc-neutral-400 bg-white"
                }`}>
                  {done && <Check size={6} className="text-white" strokeWidth={3} />}
                </div>

                {/* Current label only */}
                {current && (
                  <span className="text-[11px] font-semibold text-ds-dark-blue-700 whitespace-nowrap">{stage.label}</span>
                )}
              </div>

              {i < STAGES.length - 1 && (
                <div className={`flex-1 h-px mx-1.5 ${i < currentIdx ? "bg-ds-dark-blue-300" : "bg-kyc-neutral-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Portal tooltip — escapes any overflow/stacking-context constraints */}
      {hovered && hoveredStage && createPortal(
        <div
          className="fixed z-[9999] w-48 px-2.5 py-2 pointer-events-none"
          style={{
            left: Math.min(tooltipPos.x - 96, window.innerWidth - 200),
            top: tooltipPos.y + 8,
            background: "var(--color-neutral-000, #fff)",
            border: "1px solid var(--color-dark-blue-100)",
            boxShadow: "0 4px 16px rgba(0,16,48,0.12)",
            borderRadius: "var(--corner-medium, 8px)",
          }}
        >
          <p className="text-[11px] font-bold text-kyc-neutral-800 mb-0.5">{hoveredStage.label}</p>
          <p className="text-[11px] text-kyc-neutral-600 leading-snug">{hoveredStage.description}</p>
          <p className={`mt-1 text-[11px] font-semibold ${
            hoveredIdx < currentIdx ? "text-ds-green-700" :
            hoveredIdx === currentIdx ? "text-ds-dark-blue-700" :
            "text-kyc-neutral-600"
          }`}>
            {hoveredIdx < currentIdx ? "✓ Completed" : hoveredIdx === currentIdx ? "● Active" : "Upcoming"}
          </p>
        </div>,
        document.body
      )}
    </>
  );
}

/* ================================================================== */
/*  Agent Review Modal                                                  */
/* ================================================================== */
const AGENT_REVIEW_FINDINGS = [
  {
    id: "ar1",
    attribute: "Legal Entity Name",
    entity: "BlackRock Advisors LLC",
    verdict: "disagree" as const,
    analystDecision: "Accepted 'BlackRock Group Holdings Ltd.' based on email confirmation.",
    agentAssessment: "The email confirmation is not an authoritative source for legal name. Board resolution or SEC filing should be used. Recommend reverting to registered name from EDGAR.",
    suggestedAction: "Replace source with SEC EDGAR filing (CIK 0000890114). Update legal name to 'BlackRock Advisors LLC'.",
    errorType: "Insufficient/Incorrect evidence",
  },
  {
    id: "ar2",
    attribute: "PEP Status – Lawrence D. Fink",
    entity: "BlackRock Advisors LLC",
    verdict: "agree" as const,
    analystDecision: "Flagged as PEP based on Refinitiv database match.",
    agentAssessment: "Correct. L. Fink meets PEP criteria as a senior executive of a major financial institution. Refinitiv is an approved source. No further action needed.",
    suggestedAction: null,
    errorType: null,
  },
  {
    id: "ar3",
    attribute: "AUM Verification",
    entity: "BlackRock Advisors LLC",
    verdict: "disagree" as const,
    analystDecision: "Confirmed AUM figure based on analyst note without external source.",
    agentAssessment: "AUM must be verified against an external authoritative source such as the Annual Report or SEC Form ADV. An analyst note alone does not satisfy CDD evidence requirements.",
    suggestedAction: "Attach FY 2023 Annual Report (SEC EDGAR) as source. Re-verify AUM figure of $9.1T against filed data.",
    errorType: "Incorrect CIP classification",
  },
  {
    id: "ar4",
    attribute: "Passport – Lawrence D. Fink",
    entity: "Principal: Lawrence D. Fink",
    verdict: "flag" as const,
    analystDecision: "Accepted expired passport (Mar 2024) with updated copy from analyst file.",
    agentAssessment: "Expired document accepted without formal exception. Policy requires a valid, non-expired government-issued ID. The analyst-sourced copy has not been independently verified.",
    suggestedAction: "Raise formal exception for expired document. Request updated passport directly from client or relationship manager.",
    errorType: "Document not certified or translated",
  },
];

const VERDICT_CFG = {
  agree:    { label: "Confirmed",  bg: "var(--color-green-000)",   color: "var(--color-green-700)",   border: "var(--color-green-200)" },
  disagree: { label: "Correction", bg: "var(--color-red-000)",     color: "var(--color-red-700)",     border: "var(--color-red-200)" },
  flag:     { label: "Review",     bg: "var(--color-yellow-000)",  color: "var(--color-neutral-700)", border: "var(--color-yellow-300)" },
};

type FindingAction = "accepted" | "overridden" | null;

function AgentReviewFinding({
  finding, isOpen, onToggle, action, onAction,
}: {
  finding: typeof AGENT_REVIEW_FINDINGS[0];
  isOpen: boolean;
  onToggle: () => void;
  action: FindingAction;
  onAction: (a: FindingAction) => void;
}) {
  const cfg = VERDICT_CFG[finding.verdict];
  const isDone = action !== null;

  return (
    <div style={{ borderBottom: "1px solid var(--color-neutral-200)", opacity: isDone ? 0.6 : 1, transition: "opacity 0.2s" }}>
      {/* Row header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
        style={{ background: "white" }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "var(--color-neutral-050, #fafafa)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
        aria-expanded={isOpen}
      >
        {/* Verdict pill */}
        <span
          className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-center"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, minWidth: 90 }}
        >
          {cfg.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold leading-tight" style={{ color: "var(--color-neutral-900)", textDecoration: isDone ? "line-through" : "none" }}>{finding.attribute}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--color-neutral-500)" }}>{finding.entity}</p>
        </div>
        {isDone && (
          <span className="shrink-0 text-[10px] font-semibold" style={{ color: "var(--color-green-700)" }}>
            {action === "accepted" ? "✓ Accepted" : "Overridden"}
          </span>
        )}
        {isOpen
          ? <ChevronUp size={12} className="shrink-0" style={{ color: "var(--color-neutral-400)" }} />
          : <ChevronDown size={12} className="shrink-0" style={{ color: "var(--color-neutral-400)" }} />}
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div className="px-5 pb-4 pt-2 space-y-3" style={{ background: "white" }}>
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2.5" style={{ background: "white", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--corner-100)" }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-neutral-500)" }}>Analyst decision</p>
              <p className="text-[11px] leading-snug" style={{ color: "var(--color-neutral-800)" }}>{finding.analystDecision}</p>
            </div>
            <div className="px-3 py-2.5" style={{ background: "white", border: `1px solid ${cfg.border}`, borderRadius: "var(--corner-100)" }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: cfg.color }}>Agent assessment</p>
              <p className="text-[11px] leading-snug" style={{ color: "var(--color-neutral-800)" }}>{finding.agentAssessment}</p>
            </div>
          </div>

          {/* Suggested correction */}
          {finding.suggestedAction && (
            <div className="flex items-start gap-2 px-3 py-2.5" style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)", borderRadius: "var(--corner-100)" }}>
              <Bot size={11} className="shrink-0 mt-0.5" style={{ color: "var(--color-dark-blue-600)" }} />
              <p className="text-[11px] leading-snug flex-1" style={{ color: "var(--color-neutral-700)" }}>{finding.suggestedAction}</p>
            </div>
          )}

          {/* Per-finding actions — DS Button */}
          {!isDone && finding.verdict !== "agree" && (
            <div className="flex items-center gap-2 pt-1">
              <Button variant="outlined" size="small" label="Accept correction" onClick={() => onAction("accepted")} />
              <Button variant="text" size="small" label="Override" onClick={() => onAction("overridden")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentReviewModal({ onClose, onAllActioned }: { onClose: () => void; onAllActioned: () => void }) {
  // Sort: corrections first, flags second, confirmed last
  const sorted = [...AGENT_REVIEW_FINDINGS].sort((a, b) => {
    const order = { disagree: 0, flag: 1, agree: 2 };
    return order[a.verdict] - order[b.verdict];
  });

  const [tab, setTab]         = useState<"all" | "action" | "confirmed">("all");
  const [actions, setActions] = useState<Record<string, FindingAction>>({});
  const [openId, setOpenId]   = useState<string | null>(
    sorted.find(f => f.verdict !== "agree")?.id ?? sorted[0]?.id ?? null
  );

  const setAction = (id: string, a: FindingAction) => {
    const next = { ...actions, [id]: a };
    setActions(next);
    // Unlock case buttons when all actionable items are resolved
    const actionableIds = sorted.filter(f => f.verdict !== "agree").map(f => f.id);
    if (actionableIds.every(fid => !!next[fid])) setTimeout(() => onAllActioned(), 500);
    // Advance to next unresolved finding
    setTimeout(() => {
      const remaining = sorted.filter(f => f.verdict !== "agree" && f.id !== id && !next[f.id]);
      setOpenId(remaining.length > 0 ? remaining[0].id : null);
    }, 320);
  };

  const actioned  = Object.values(actions).filter(Boolean).length;
  const needsAction = sorted.filter(f => f.verdict !== "agree").length;
  const pct = needsAction > 0 ? Math.round((actioned / needsAction) * 100) : 100;

  const visible = sorted.filter(f => {
    if (tab === "action")    return f.verdict !== "agree";
    if (tab === "confirmed") return f.verdict === "agree";
    return true;
  });

  const agrees    = sorted.filter(f => f.verdict === "agree").length;
  const disagrees = sorted.filter(f => f.verdict === "disagree").length;
  const flags     = sorted.filter(f => f.verdict === "flag").length;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl bg-white flex flex-col"
        style={{ maxHeight: "84vh", boxShadow: "var(--shadow-400)", borderRadius: "var(--corner-200)", border: "1px solid var(--color-neutral-200)" }}
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
          <Bot size={15} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: "var(--color-neutral-900)" }}>Agent Review</p>
            <p className="text-[11px]" style={{ color: "var(--color-neutral-500)" }}>BlackRock DRG Group · {sorted.length} attributes checked</p>
          </div>
        </div>

        {/* Stats + progress */}
        <div className="shrink-0 px-5 py-3 space-y-2.5" style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "white" }}>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--color-red-700)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-red-600)" }} />{disagrees} AI suggested correction{disagrees !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--color-neutral-700)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-yellow-500)" }} />{flags} for review
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--color-green-700)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-green-600)" }} />{agrees} confirmed
            </span>
            <span className="ml-auto text-[10px] font-semibold" style={{ color: "var(--color-neutral-500)" }}>{actioned}/{needsAction} resolved</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-200)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? "var(--color-green-600)" : "var(--color-dark-blue-600)" }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="shrink-0 flex" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
          {(["all", "action", "confirmed"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-[11px] font-semibold transition-colors"
              style={tab === t
                ? { color: "var(--color-dark-blue-600)", borderBottom: "2px solid var(--color-dark-blue-600)", background: "white" }
                : { color: "var(--color-neutral-500)", borderBottom: "2px solid transparent", background: "white" }
              }
            >
              {t === "all" ? `All (${sorted.length})` : t === "action" ? `AI Suggested Corrections (${needsAction})` : `Confirmed (${agrees})`}
            </button>
          ))}
        </div>

        {/* Findings list */}
        <div className="flex-1 overflow-y-auto" style={{ background: "white" }}>
          {visible.map((f) => (
            <AgentReviewFinding
              key={f.id}
              finding={f}
              isOpen={openId === f.id}
              onToggle={() => setOpenId(prev => prev === f.id ? null : f.id)}
              action={actions[f.id] ?? null}
              onAction={a => setAction(f.id, a)}
            />
          ))}
          {visible.length === 0 && (
            <p className="text-center py-8 text-[12px]" style={{ color: "var(--color-neutral-500)" }}>No findings in this category.</p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--color-neutral-200)", background: "white" }}>
          <p className="text-[10px]" style={{ color: "var(--color-neutral-400)" }}>KYC Agent v2.1</p>
          <div className="flex items-center gap-2">
            <Button variant="outlined" size="small" label="Dismiss" onClick={onClose} />
            <Button variant="filled" size="small" label="Save Changes" icon={<Check size={12} />} showIconTrailing onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseHeader({ resolvedCount, totalExceptions, focusedEntity, onAuditEntry, onOpenAuditLog, onSubmitComplete, reachOutCount = 0, onOpenReachOuts }: CaseHeaderProps) {
  const entityMeta = focusedEntity ? ENTITY_META[focusedEntity] : null;
  const [drgValue] = useState(drgEntities[0]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [showDrgModal, setShowDrgModal] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [showAgentReview, setShowAgentReview] = useState(false);
  const [agentReviewComplete, setAgentReviewComplete] = useState(false);
  const [showCaseReasoning, setShowCaseReasoning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => runAgentReview();
    window.addEventListener("kyc-run-agent-review", handler);
    return () => window.removeEventListener("kyc-run-agent-review", handler);
  }, [agentRunning]);

  const runAgentReview = () => {
    if (agentRunning) return;
    setAgentRunning(true);
    toast.loading("Agent reviewing analyst work…", { id: "agent-review", duration: 99999 });
    setTimeout(() => {
      setAgentRunning(false);
      toast.dismiss("agent-review");
      setShowAgentReview(true);
      onAuditEntry?.({
        id: `agent-review-${Date.now()}`,
        timestamp: new Date(),
        type: "agent_review",
        title: "Agent Review completed",
        detail: "Agent assessed analyst decisions across all exceptions and flagged corrections where applicable.",
        result: "updated",
        agentConfidence: 88,
        agentSteps: [
          "Loaded analyst decisions for all 5 exceptions.",
          "Cross-referenced each decision against source documents.",
          "Identified 2 disagreements and 3 agreements.",
          "Generated correction suggestions for disagreement items.",
        ],
      });
    }, 2800);
  };

  const handleConfirm = () => {
    // Log audit entry and notify parent — modal stays open to show complete phase
    onAuditEntry?.({
      id: `submit-${Date.now()}`,
      timestamp: new Date(),
      type: "submit",
      title: "Case submitted for QA review",
      detail: "#KYC-2024-8821 · BlackRock DRG Group routed to QA review queue.",
      result: "submitted",
    });
    onSubmitComplete?.();
  };

  return (
    <>
      {showConfirm && (
        <ApprovalModal
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          resolvedCount={resolvedCount}
          totalExceptions={totalExceptions}
          reachOutCount={reachOutCount}
          onOpenAuditLog={onOpenAuditLog ? () => { setShowConfirm(false); onOpenAuditLog(); } : undefined}
        />
      )}
      {showEscalate && (
        <EscalationModal onClose={() => setShowEscalate(false)} />
      )}
      {showDrgModal && (
        <DrgModal onClose={() => setShowDrgModal(false)} />
      )}
      {showAgentReview && (
        <AgentReviewModal onClose={() => setShowAgentReview(false)} onAllActioned={() => setAgentReviewComplete(true)} />
      )}
      {showCaseReasoning && (
        <CaseAgenticReasoningModal onClose={() => setShowCaseReasoning(false)} />
      )}
      <div className="bg-white">


        {/* ── Enhanced meta fields row ── */}
        <div className="px-6 py-2 border-b border-kyc-neutral-200 bg-white">
          <div className="flex items-center">

            {/* DRG */}
            <div className="shrink-0 relative">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-500 mb-1">DRG</p>
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-semibold text-kyc-neutral-700 truncate max-w-[260px] leading-none">
                  {drgValue}
                </p>
                <button
                  title="View DRG details"
                  onClick={() => setShowDrgModal(true)}
                  className="text-kyc-neutral-600 hover:text-kyc-neutral-800 transition-colors shrink-0 flex items-center"
                >
                  <Info size={13} />
                </button>
              </div>
            </div>

            <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-6" />

            {/* Exceptions Progress */}
            <div className="shrink-0 transition-all">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-500 mb-1">Exceptions</p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-kyc-neutral-700">
                  {resolvedCount}
                  <span className="text-[11px] font-normal text-kyc-neutral-600">/{entityMeta?.exceptionTotal ?? totalExceptions}</span>
                </span>
                <span className="text-[10.5px] text-kyc-neutral-600">addressed</span>
              </div>
            </div>

            <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-6" />

            {/* Due Date */}
            <div className="shrink-0 transition-all">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-500 mb-1">Due Date</p>
              <span className="flex items-center text-[12px] font-semibold text-kyc-neutral-700">{entityMeta?.dueDate ?? "Apr 25, 2026"}</span>
            </div>

            <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-6" />

            {/* Risk */}
            <div className="shrink-0 transition-all">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-500 mb-1">Risk</p>
              <span className="text-[12px] font-semibold text-kyc-neutral-700">
                {entityMeta?.risk ?? "Elevated"}
              </span>
            </div>

            <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-6" />

            {/* Priority */}
            <div className="shrink-0 transition-all">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-500 mb-1">Priority</p>
              <span className="text-[12px] font-semibold text-kyc-neutral-700">
                {entityMeta?.priority ?? "High"}
              </span>
            </div>

            <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-6" />

            {/* Reach Outs */}
            <div className="shrink-0 transition-all">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-500 mb-1">Reach Outs</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-kyc-neutral-700">{reachOutCount}</span>
                <span className="text-[11px] text-kyc-neutral-400">pending</span>
              </div>
            </div>

            <div className="flex-1" />

            {/* Actions */}
            <div className="shrink-0 self-center flex items-center gap-3">
              {/* Secondary actions */}
              <div className="flex items-center gap-1">
                {onOpenAuditLog && (
                  <Button
                    variant="text"
                    size="small"
                    label="Audit Log"
                    icon={<ClipboardList size={13} />}
                    onClick={onOpenAuditLog}
                  />
                )}
                {onOpenReachOuts && (
                  <div className="relative inline-flex">
                    <Button
                      variant="text"
                      size="small"
                      label="Reach Outs"
                      icon={<Mail size={12} aria-hidden />}
                      onClick={onOpenReachOuts}
                      aria-label={`Reach Outs — ${reachOutCount} pending`}
                    />
                    {reachOutCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold pointer-events-none"
                        style={{ background: "var(--color-dark-blue-600)", color: "#fff" }}
                      >
                        {reachOutCount}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-kyc-neutral-200 shrink-0" aria-hidden="true" />

              {/* Primary actions */}
              <div className="flex items-center gap-2 case-header-actions">
                <Button
                  variant="outlined"
                  size="small"
                  label="Cancel"
                  icon={<XCircle size={13} />}
                  onClick={() => navigate("/dashboard")}
                />
                <Button
                  variant="outlined"
                  size="small"
                  label="Escalate"
                  showIconTrailing
                  icon={<AlertOctagon size={13} />}
                  disabled={resolvedCount === 0 && !agentReviewComplete}
                  onClick={() => setShowEscalate(true)}
                />
                <Button
                  variant="filled"
                  size="small"
                  label="Submit"
                  showIconTrailing
                  icon={<Send size={13} />}
                  disabled={resolvedCount === 0 && !agentReviewComplete}
                  onClick={() => setShowConfirm(true)}
                />
              </div>
            </div> {/* end actions wrapper */}

          </div>
        </div>

      </div>
    </>
  );
}
