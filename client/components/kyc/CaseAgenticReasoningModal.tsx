import { useState } from "react";
import {
  X, Bot, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Sparkles, ShieldAlert, Building2, FileSearch, TrendingUp, Users,
  ArrowRight, Info,
} from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

// ── Static case reasoning data ─────────────────────────────────────────

const CASE_SUMMARY = {
  caseId: "KYC-2024-8821",
  entity: "BlackRock DRG Group",
  riskRating: "Elevated",
  confidence: 87,
  overallVerdict: "Requires analyst review before proceeding",
  headline:
    "The DRG structure contains cross-entity signatory discrepancies and a missing document that together prevent full CIP/CDD validation under current KYC policy.",
  reasoning: [
    {
      step: 1,
      title: "DRG structure mapped and entities cross-referenced",
      detail:
        "Three entities were identified under the BlackRock DRG Group: BlackRock Advisors LLC, BlackRock Institutional Trust Co., and Entity 13. Ownership and control relationships were verified against EDGAR and internal entity registries.",
      status: "complete" as const,
    },
    {
      step: 2,
      title: "Signatory records compared across all entities",
      detail:
        "Sarah Williams appears in two entities with differing titles — 'CEO' in the Form ADV and 'CEO, Global Equity Fund' in the Fund Charter. Tax ID and contact data confirm the same individual. FATF guidelines permit title variation at different entity levels when identity is independently verified.",
      status: "complete" as const,
    },
    {
      step: 3,
      title: "CIP attributes validated against source documents",
      detail:
        "CIP validation completed for BlackRock Advisors and Entity 13. BlackRock Institutional has one open CIP attribute (Offering Memorandum) that cannot be validated until the document is received. This represents a hard blocker under KYC policy — no waiver is available.",
      status: "flagged" as const,
    },
    {
      step: 4,
      title: "Risk signals aggregated and confidence scored",
      detail:
        "Two title discrepancies were identified (confidence: 90–95%). One missing document was identified (confidence: 75%). PEP screening, AML watchlist, and sanctions checks returned no matches. Aggregate model confidence is 87%, with the remaining uncertainty attributable to the unresolved Offering Memorandum.",
      status: "complete" as const,
    },
    {
      step: 5,
      title: "Exceptions ranked and routed to analyst",
      detail:
        "Five exceptions were surfaced and ordered by severity: missing document (blocker), title discrepancies (resolvable), validation flags (low-severity). Agent-suggested resolutions were generated for each exception to accelerate analyst review.",
      status: "complete" as const,
    },
  ],
  signals: [
    {
      icon: "discrepancy",
      label: "Signatory Title Discrepancy",
      entity: "BlackRock Advisors / Institutional",
      severity: "medium" as const,
      detail: "Same individual listed with differing titles across two entities.",
    },
    {
      icon: "missing",
      label: "Missing Offering Memorandum",
      entity: "BlackRock Institutional",
      severity: "high" as const,
      detail: "CIP attribute cannot be validated. Document overdue per refresh cycle.",
    },
    {
      icon: "pep",
      label: "PEP Confirmed — Lawrence D. Fink",
      entity: "BlackRock Advisors",
      severity: "info" as const,
      detail: "Flagged and verified against Refinitiv. No further action required.",
    },
    {
      icon: "aum",
      label: "AUM Verification — Insufficient Source",
      entity: "BlackRock Advisors",
      severity: "medium" as const,
      detail: "AUM confirmed via analyst note only. External source required per CDD policy.",
    },
    {
      icon: "entity",
      label: "Entity 13 — Validation Flag",
      entity: "Entity 13",
      severity: "low" as const,
      detail: "99% confidence — likely a labeling artifact. Awaiting analyst confirmation.",
    },
  ],
  entitiesAssessed: [
    { name: "BlackRock Advisors LLC",        caseNumber: "KYC-28821", cipComplete: true,  cddComplete: true,  exceptions: 2 },
    { name: "BlackRock Institutional Trust", caseNumber: "KYC-28834", cipComplete: false, cddComplete: true,  exceptions: 2 },
    { name: "Entity 13",                     caseNumber: "KYC-29107", cipComplete: true,  cddComplete: true,  exceptions: 1 },
  ],
};

// ── Sub-components ─────────────────────────────────────────────────────

function StepRow({ step, isLast }: { step: typeof CASE_SUMMARY.reasoning[0]; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const isDone    = step.status === "complete";
  const isFlagged = step.status === "flagged";

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center border shrink-0 text-[10px] font-bold"
          style={{
            background: isFlagged ? "var(--color-yellow-000)" : "var(--color-dark-blue-000)",
            borderColor: isFlagged ? "var(--color-yellow-300)" : "var(--color-dark-blue-200)",
            color: isFlagged ? "var(--color-yellow-800)" : "var(--color-dark-blue-700)",
          }}
        >
          {isDone ? <CheckCircle2 size={12} style={{ color: "var(--color-dark-blue-600)" }} /> : <AlertTriangle size={11} style={{ color: "var(--color-yellow-700)" }} />}
        </div>
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: "var(--color-neutral-200)", minHeight: 12 }} />}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-3"}`}>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full text-left flex items-start gap-2"
          aria-expanded={open}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-kyc-neutral-800 leading-snug">{step.title}</p>
              {isFlagged && (
                <span
                  className="inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-medium border shrink-0"
                  style={{ background: "var(--color-yellow-000)", borderColor: "var(--color-yellow-300)", color: "var(--color-yellow-800)" }}
                >
                  Flagged
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 mt-0.5 text-kyc-neutral-400">
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>
        {open && (
          <p className="text-[11px] text-kyc-neutral-600 leading-relaxed mt-1.5 pr-4">{step.detail}</p>
        )}
      </div>
    </div>
  );
}

function SignalRow({ signal }: { signal: typeof CASE_SUMMARY.signals[0] }) {
  const severityStyle = {
    high:   { bg: "var(--color-red-000)",    border: "var(--color-red-200)",    color: "var(--color-red-700)",    label: "High" },
    medium: { bg: "var(--color-yellow-000)", border: "var(--color-yellow-300)", color: "var(--color-yellow-800)", label: "Medium" },
    low:    { bg: "var(--color-neutral-100)", border: "var(--color-neutral-300)", color: "var(--color-neutral-600)", label: "Low" },
    info:   { bg: "var(--color-dark-blue-000)", border: "var(--color-dark-blue-100)", color: "var(--color-dark-blue-600)", label: "Info" },
  }[signal.severity];

  return (
    <div
      className="flex items-start gap-3 px-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: "var(--color-neutral-200)" }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5"
        style={{ background: severityStyle.bg, borderColor: severityStyle.border }}
      >
        {signal.severity === "high"   && <AlertTriangle size={11} style={{ color: severityStyle.color }} />}
        {signal.severity === "medium" && <AlertTriangle size={11} style={{ color: severityStyle.color }} />}
        {signal.severity === "low"    && <Info size={11} style={{ color: severityStyle.color }} />}
        {signal.severity === "info"   && <CheckCircle2 size={11} style={{ color: severityStyle.color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[12px] font-semibold text-kyc-neutral-800">{signal.label}</p>
          <span
            className="inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-medium border shrink-0"
            style={{ background: severityStyle.bg, borderColor: severityStyle.border, color: severityStyle.color }}
          >
            {severityStyle.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <Building2 size={9} className="text-kyc-neutral-400 shrink-0" />
          <p className="text-[11px] text-kyc-neutral-500">{signal.entity}</p>
        </div>
        <p className="text-[11px] text-kyc-neutral-600 leading-snug">{signal.detail}</p>
      </div>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────

interface CaseAgenticReasoningModalProps {
  onClose: () => void;
}

export function CaseAgenticReasoningModal({ onClose }: CaseAgenticReasoningModalProps) {
  const [activeTab, setActiveTab] = useState<"reasoning" | "signals" | "entities">("reasoning");

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "reasoning", label: "Agent Steps" },
    { id: "signals",   label: "Risk Signals" },
    { id: "entities",  label: "Entities Assessed" },
  ];

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-reasoning-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,16,48,0.55)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(680px, 96vw)",
          height: "min(80vh, 780px)",
          background: "#ffffff",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: "var(--corner-large, 12px)",
          boxShadow: "0 8px 48px rgba(0,16,48,0.18)",
        }}
      >

        {/* ── Header ── */}
        <div
          className="shrink-0 px-5 pt-4 pb-0 border-b"
          style={{ borderColor: "var(--color-neutral-200)" }}
        >
          {/* Title row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border shrink-0 mt-0.5"
                style={{ background: "var(--color-dark-blue-000)", borderColor: "var(--color-dark-blue-200)" }}
              >
                <Bot size={15} style={{ color: "var(--color-dark-blue-600)" }} />
              </div>
              <div>
                <h2 id="case-reasoning-title" className="text-[14px] font-bold text-kyc-neutral-900 leading-snug">
                  Case Agentic Reasoning
                </h2>
                <p className="text-[11px] text-kyc-neutral-500 mt-0.5">{CASE_SUMMARY.caseId} · {CASE_SUMMARY.entity}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full border transition-colors hover:bg-kyc-neutral-100 shrink-0"
              style={{ borderColor: "var(--color-neutral-200)" }}
              aria-label="Close"
            >
              <X size={14} className="text-kyc-neutral-600" />
            </button>
          </div>

          {/* Verdict bar */}
          <div
            className="flex items-center gap-3 px-3 py-2 mb-3 rounded"
            style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)" }}
          >
            <Sparkles size={13} style={{ color: "var(--color-dark-blue-600)" }} className="shrink-0" />
            <p className="text-[12px] text-kyc-neutral-700 leading-snug flex-1">{CASE_SUMMARY.headline}</p>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0"
              style={{ background: "var(--color-dark-blue-000)", borderColor: "var(--color-dark-blue-200)", color: "var(--color-dark-blue-700)" }}
            >
              {CASE_SUMMARY.confidence}% confidence
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-stretch gap-0 -mx-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-ds-dark-blue-500 text-ds-dark-blue-600"
                    : "border-transparent text-kyc-neutral-500 hover:text-kyc-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Agent Steps tab */}
          {activeTab === "reasoning" && (
            <div className="px-5 py-4 space-y-0">
              <p className="text-[11px] text-kyc-neutral-500 italic mb-4 leading-snug">
                The following steps were executed by the agent to assess this case. Expand each step to see the detailed reasoning.
              </p>
              {CASE_SUMMARY.reasoning.map((step, i) => (
                <StepRow key={step.step} step={step} isLast={i === CASE_SUMMARY.reasoning.length - 1} />
              ))}
            </div>
          )}

          {/* Risk Signals tab */}
          {activeTab === "signals" && (
            <div>
              <div
                className="px-5 py-3 border-b"
                style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
              >
                <p className="text-[11px] text-kyc-neutral-500 leading-snug">
                  {CASE_SUMMARY.signals.length} signals identified across {CASE_SUMMARY.entitiesAssessed.length} entities. Signals are ordered by severity.
                </p>
              </div>
              <div className="border-b" style={{ borderColor: "var(--color-neutral-200)" }}>
                {CASE_SUMMARY.signals.map((signal, i) => (
                  <SignalRow key={i} signal={signal} />
                ))}
              </div>
            </div>
          )}

          {/* Entities Assessed tab */}
          {activeTab === "entities" && (
            <div>
              <div
                className="px-5 py-3 border-b"
                style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
              >
                <p className="text-[11px] text-kyc-neutral-500 leading-snug">
                  CIP and CDD completion status per entity within the DRG group.
                </p>
              </div>
              {/* Table header */}
              <div
                className="grid px-5 py-2 border-b"
                style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.7fr", background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
              >
                {["Entity", "Case #", "CIP", "CDD", "Exceptions"].map(h => (
                  <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-kyc-neutral-500">{h}</p>
                ))}
              </div>
              {CASE_SUMMARY.entitiesAssessed.map((e, i) => (
                <div
                  key={i}
                  className="grid px-5 py-3 border-b last:border-b-0 hover:bg-kyc-neutral-50 transition-colors"
                  style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.7fr", borderColor: "var(--color-neutral-200)" }}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[12px] font-semibold text-kyc-neutral-800 truncate">{e.name}</p>
                  </div>
                  <p className="text-[11px] font-mono text-kyc-neutral-500 self-center">{e.caseNumber}</p>
                  <div className="self-center">
                    {e.cipComplete
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--color-green-700)" }}><CheckCircle2 size={11} /> Complete</span>
                      : <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--color-red-700)" }}><AlertTriangle size={11} /> Incomplete</span>
                    }
                  </div>
                  <div className="self-center">
                    {e.cddComplete
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--color-green-700)" }}><CheckCircle2 size={11} /> Complete</span>
                      : <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--color-red-700)" }}><AlertTriangle size={11} /> Incomplete</span>
                    }
                  </div>
                  <span
                    className="self-center inline-flex items-center px-1.5 py-0 rounded-full text-[11px] font-semibold border"
                    style={
                      e.exceptions > 1
                        ? { background: "var(--color-yellow-000)", borderColor: "var(--color-yellow-300)", color: "var(--color-yellow-800)" }
                        : { background: "var(--color-neutral-100)", borderColor: "var(--color-neutral-200)", color: "var(--color-neutral-600)" }
                    }
                  >
                    {e.exceptions}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
        >
          <p className="text-[11px] text-kyc-neutral-500">
            Agent assessment · {CASE_SUMMARY.confidence}% overall confidence · {CASE_SUMMARY.signals.length} signals
          </p>
          <Button variant="outlined" size="small" label="Close" onClick={onClose} />
        </div>

      </div>
    </div>
  );
}
