import { useState } from "react";
import { Bot, Check, ChevronDown, ChevronUp, ChevronRight, X } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

// ── Data ──────────────────────────────────────────────────────────────

const AGENT_REVIEW_FINDINGS = [
  {
    id: "ar1",
    attribute: "Legal Entity Name",
    entity: "BlackRock Advisors LLC",
    verdict: "disagree" as const,
    analystDecision: "Accepted 'BlackRock Group Holdings Ltd.' based on email confirmation.",
    agentAssessment:
      "The email confirmation is not an authoritative source for legal name. Board resolution or SEC filing should be used. Recommend reverting to registered name from EDGAR.",
    suggestedAction:
      "Replace source with SEC EDGAR filing (CIK 0000890114). Update legal name to 'BlackRock Advisors LLC'.",
    errorType: "Insufficient/Incorrect evidence",
  },
  {
    id: "ar2",
    attribute: "PEP Status – Lawrence D. Fink",
    entity: "BlackRock Advisors LLC",
    verdict: "agree" as const,
    analystDecision: "Flagged as PEP based on Refinitiv database match.",
    agentAssessment:
      "Correct. L. Fink meets PEP criteria as a senior executive of a major financial institution. Refinitiv is an approved source. No further action needed.",
    suggestedAction: null,
    errorType: null,
  },
  {
    id: "ar3",
    attribute: "AUM Verification",
    entity: "BlackRock Advisors LLC",
    verdict: "disagree" as const,
    analystDecision: "Confirmed AUM figure based on analyst note without external source.",
    agentAssessment:
      "AUM must be verified against an external authoritative source such as the Annual Report or SEC Form ADV. An analyst note alone does not satisfy CDD evidence requirements.",
    suggestedAction:
      "Attach FY 2023 Annual Report (SEC EDGAR) as source. Re-verify AUM figure of $9.1T against filed data.",
    errorType: "Incorrect CIP classification",
  },
  {
    id: "ar4",
    attribute: "Passport – Lawrence D. Fink",
    entity: "Principal: Lawrence D. Fink",
    verdict: "flag" as const,
    analystDecision: "Accepted expired passport (Mar 2024) with updated copy from analyst file.",
    agentAssessment:
      "Expired document accepted without formal exception. Policy requires a valid, non-expired government-issued ID. The analyst-sourced copy has not been independently verified.",
    suggestedAction:
      "Raise formal exception for expired document. Request updated passport directly from client or relationship manager.",
    errorType: "Document not certified or translated",
  },
];

const VERDICT_CFG = {
  agree: {
    label: "Confirmed",
    bg: "var(--color-green-000)",
    color: "var(--color-green-700)",
    border: "var(--color-green-200)",
  },
  disagree: {
    label: "Correction",
    bg: "var(--color-red-000)",
    color: "var(--color-red-700)",
    border: "var(--color-red-200)",
  },
  flag: {
    label: "Review",
    bg: "var(--color-yellow-000)",
    color: "var(--color-neutral-700)",
    border: "var(--color-yellow-300)",
  },
};

type FindingAction = "accepted" | "overridden" | null;

// ── AgentReviewFinding ────────────────────────────────────────────────

function AgentReviewFinding({
  finding,
  isOpen,
  onToggle,
  action,
  onAction,
}: {
  finding: (typeof AGENT_REVIEW_FINDINGS)[0];
  isOpen: boolean;
  onToggle: () => void;
  action: FindingAction;
  onAction: (a: FindingAction) => void;
}) {
  const cfg = VERDICT_CFG[finding.verdict];
  const isDone = action !== null;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-neutral-200)",
        opacity: isDone ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: "white" }}
        onMouseEnter={e => {
          if (!isOpen) e.currentTarget.style.background = "var(--color-neutral-050)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "white";
        }}
        aria-expanded={isOpen}
      >
        <span
          className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-center"
          style={{
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            minWidth: 76,
          }}
        >
          {cfg.label}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] font-semibold leading-tight"
            style={{
              color: "var(--color-neutral-900)",
              textDecoration: isDone ? "line-through" : "none",
            }}
          >
            {finding.attribute}
          </p>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--color-neutral-500)" }}>
            {finding.entity}
          </p>
        </div>
        {isDone && (
          <span className="shrink-0 text-[10px] font-semibold" style={{ color: "var(--color-green-700)" }}>
            {action === "accepted" ? "✓ Accepted" : "Overridden"}
          </span>
        )}
        {isOpen ? (
          <ChevronUp size={11} className="shrink-0" style={{ color: "var(--color-neutral-400)" }} />
        ) : (
          <ChevronDown size={11} className="shrink-0" style={{ color: "var(--color-neutral-400)" }} />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 space-y-3" style={{ background: "white" }}>
          <div className="grid grid-cols-2 gap-2">
            <div
              className="px-3 py-2.5"
              style={{
                background: "white",
                border: "1px solid var(--color-neutral-200)",
                borderRadius: "var(--corner-100)",
              }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-neutral-500)" }}
              >
                Analyst decision
              </p>
              <p className="text-[11px] leading-snug" style={{ color: "var(--color-neutral-800)" }}>
                {finding.analystDecision}
              </p>
            </div>
            <div
              className="px-3 py-2.5"
              style={{
                background: "white",
                border: `1px solid ${cfg.border}`,
                borderRadius: "var(--corner-100)",
              }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: cfg.color }}
              >
                Agent assessment
              </p>
              <p className="text-[11px] leading-snug" style={{ color: "var(--color-neutral-800)" }}>
                {finding.agentAssessment}
              </p>
            </div>
          </div>

          {finding.suggestedAction && (
            <div
              className="flex items-start gap-2 px-3 py-2.5"
              style={{
                background: "var(--color-dark-blue-000)",
                border: "1px solid var(--color-dark-blue-100)",
                borderRadius: "var(--corner-100)",
              }}
            >
              <Bot size={11} className="shrink-0 mt-0.5" style={{ color: "var(--color-dark-blue-600)" }} />
              <p className="text-[11px] leading-snug flex-1" style={{ color: "var(--color-neutral-700)" }}>
                {finding.suggestedAction}
              </p>
            </div>
          )}

          {!isDone && finding.verdict !== "agree" && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outlined"
                size="small"
                label="Accept correction"
                onClick={() => onAction("accepted")}
              />
              <Button variant="text" size="small" label="Override" onClick={() => onAction("overridden")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── AgentReviewPanel ──────────────────────────────────────────────────

export interface AgentReviewPanelProps {
  onClose: () => void;
  onAllActioned: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AgentReviewPanel({
  onClose,
  onAllActioned,
  collapsed,
  onToggleCollapse,
}: AgentReviewPanelProps) {
  const sorted = [...AGENT_REVIEW_FINDINGS].sort((a, b) => {
    const order = { disagree: 0, flag: 1, agree: 2 };
    return order[a.verdict] - order[b.verdict];
  });

  const [tab, setTab] = useState<"all" | "action" | "confirmed">("all");
  const [actions, setActions] = useState<Record<string, FindingAction>>({});
  const [openId, setOpenId] = useState<string | null>(
    sorted.find(f => f.verdict !== "agree")?.id ?? sorted[0]?.id ?? null
  );

  const setAction = (id: string, a: FindingAction) => {
    const next = { ...actions, [id]: a };
    setActions(next);
    const actionableIds = sorted.filter(f => f.verdict !== "agree").map(f => f.id);
    if (actionableIds.every(fid => !!next[fid])) setTimeout(() => onAllActioned(), 500);
    setTimeout(() => {
      const remaining = sorted.filter(f => f.verdict !== "agree" && f.id !== id && !next[f.id]);
      setOpenId(remaining.length > 0 ? remaining[0].id : null);
    }, 320);
  };

  const actioned = Object.values(actions).filter(Boolean).length;
  const needsAction = sorted.filter(f => f.verdict !== "agree").length;
  const pct = needsAction > 0 ? Math.round((actioned / needsAction) * 100) : 100;

  const agrees = sorted.filter(f => f.verdict === "agree").length;
  const disagrees = sorted.filter(f => f.verdict === "disagree").length;
  const flags = sorted.filter(f => f.verdict === "flag").length;

  const visible = sorted.filter(f => {
    if (tab === "action") return f.verdict !== "agree";
    if (tab === "confirmed") return f.verdict === "agree";
    return true;
  });

  // ── Collapsed strip ───────────────────────────────────────────────
  if (collapsed) {
    return (
      <div
        className="shrink-0 flex flex-col items-center py-4 gap-3 border-l"
        style={{
          width: 32,
          background: "white",
          borderColor: "var(--color-neutral-200)",
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-neutral-100"
          title="Expand Agent Review"
        >
          <ChevronRight size={13} style={{ color: "var(--color-neutral-500)" }} />
        </button>
        <span
          className="text-[10px] font-bold uppercase tracking-widest select-none"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "var(--color-dark-blue-600)",
          }}
        >
          Agent Review
        </span>
        {needsAction > 0 && actioned < needsAction && (
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ background: "var(--color-red-600)" }}
          >
            {needsAction - actioned}
          </span>
        )}
      </div>
    );
  }

  // ── Full panel ────────────────────────────────────────────────────
  return (
    <div
      className="shrink-0 flex flex-col border-l"
      style={{
        width: 360,
        minHeight: 0,
        maxHeight: "100%",
        background: "white",
        borderColor: "var(--color-neutral-200)",
      }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
      >
        <Bot size={14} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>
            Agent Review
          </p>
          <p className="text-[10px]" style={{ color: "var(--color-neutral-500)" }}>
            BlackRock DRG Group · {sorted.length} attributes checked
          </p>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-neutral-200"
          title="Collapse panel"
        >
          <ChevronRight size={12} style={{ color: "var(--color-neutral-500)" }} />
        </button>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-neutral-200"
          title="Close Agent Review"
        >
          <X size={12} style={{ color: "var(--color-neutral-500)" }} />
        </button>
      </div>

      {/* Stats + progress */}
      <div
        className="shrink-0 px-4 py-3 space-y-2"
        style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "white" }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold"
            style={{ color: "var(--color-red-700)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-red-600)" }} />
            {disagrees} correction{disagrees !== 1 ? "s" : ""}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold"
            style={{ color: "var(--color-neutral-700)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-yellow-500)" }} />
            {flags} for review
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold"
            style={{ color: "var(--color-green-700)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-green-600)" }} />
            {agrees} confirmed
          </span>
          <span
            className="ml-auto text-[10px] font-semibold"
            style={{ color: "var(--color-neutral-500)" }}
          >
            {actioned}/{needsAction} resolved
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--color-neutral-200)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "var(--color-green-600)" : "var(--color-dark-blue-600)",
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="shrink-0 flex"
        style={{ borderBottom: "1px solid var(--color-neutral-200)" }}
      >
        {(["all", "action", "confirmed"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-[10px] font-semibold transition-colors"
            style={
              tab === t
                ? {
                    color: "var(--color-dark-blue-600)",
                    borderBottom: "2px solid var(--color-dark-blue-600)",
                    background: "white",
                  }
                : {
                    color: "var(--color-neutral-500)",
                    borderBottom: "2px solid transparent",
                    background: "white",
                  }
            }
          >
            {t === "all"
              ? `All (${sorted.length})`
              : t === "action"
              ? `Corrections (${needsAction})`
              : `Confirmed (${agrees})`}
          </button>
        ))}
      </div>

      {/* Findings */}
      <div className="flex-1 overflow-y-auto" style={{ background: "white" }}>
        {visible.map(f => (
          <AgentReviewFinding
            key={f.id}
            finding={f}
            isOpen={openId === f.id}
            onToggle={() => setOpenId(prev => (prev === f.id ? null : f.id))}
            action={actions[f.id] ?? null}
            onAction={a => setAction(f.id, a)}
          />
        ))}
        {visible.length === 0 && (
          <p
            className="text-center py-8 text-[12px]"
            style={{ color: "var(--color-neutral-500)" }}
          >
            No findings in this category.
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderTop: "1px solid var(--color-neutral-200)", background: "white" }}
      >
        <p className="text-[10px]" style={{ color: "var(--color-neutral-400)" }}>
          KYC Agent v2.1
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="filled"
            size="small"
            label="Save Changes"
            showIconTrailing
            icon={<Check size={11} />}
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
}
