import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2, Sparkles, Send,
  ExternalLink, FileText, AlertTriangle, BookOpen,
  ArrowRight, Database, RotateCcw, ThumbsUp, ThumbsDown, Loader2, Clock,
} from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";
import { exceptions, type Exception } from "./ExceptionsPanel";
import { Building2 } from "lucide-react";

const ENTITY_CASE_NUMBERS: Record<string, string> = {
  "BlackRock Advisors":      "KYC-28821",
  "BlackRock Institutional": "KYC-28834",
  "Entity 13":               "KYC-29107",
};

// ── Data ──────────────────────────────────────────────────────────────

interface EvidenceDoc {
  name: string;
  type: string;
  page: string | null;
}

interface AffectedRecord {
  entity: string;
  caseNumber: string;
  attribute: string;
  oldValue: string;
  newValue: string;
}

interface SuggestedAction {
  label: string;
  value: string;
  primary: boolean;
  isResolution: boolean;
  rationale: string;
  /** Post-action reasoning shown after the user selects this action */
  postActionReasoning?: string;
  /** Records that would be modified if this action is applied */
  affectedRecords?: AffectedRecord[];
}

interface ExceptionData {
  summary: string;              // one-sentence conflict description
  detail: string;               // additional context
  reasoning: string;            // why it may be acceptable
  confidence: number;           // 0–100 model confidence
  evidence: EvidenceDoc[];
  suggestedActions: SuggestedAction[];
  evidenceRationale: string;  // why these docs were selected
}

const exceptionData: ExceptionData[] = [
  {
    summary: "Sarah Williams appears in multiple entities with differing titles.",
    detail:
      "She is listed as 'CEO, Global Equity Fund' in BlackRock Institutional's Fund Charter, but simply 'CEO' in BlackRock Advisors' Form ADV filing. The underlying identity is consistent across both records based on matching tax ID and contact data.",
    reasoning:
      "Title variation across entities at different levels of a DRG structure is common and generally acceptable under FATF guidelines when the individual's identity is independently verified. Both filings were submitted within the same reporting period.",
    confidence: 90,
    evidence: [
      { name: "Fund Charter",           type: "Corporate Charter",   page: "Pg. 3"  },
      { name: "Form ADV – Part 1",      type: "Regulatory Filing",  page: "Pg. 12" },
      { name: "Signatory Registry",     type: "Internal Record",    page: null     },
    ],
    evidenceRationale: "The Fund Charter and Form ADV are the primary source documents for signatory authority at each entity. The Signatory Registry was included as an internal cross-reference to independently verify identity consistency across both records.",
    suggestedActions: [
      {
        label: "Confirm same individual across entities despite title variation",
        value: "confirm-same", primary: true, isResolution: true,
        rationale: "Identity is verified via matching tax ID and contact data across both filings. FATF guidelines permit title variation at different entity levels when the underlying individual is confirmed.",
        postActionReasoning: "No data was modified. The title variation is documented as acceptable under FATF guidelines — both records remain as filed and the exception is closed with analyst confirmation.",
        affectedRecords: [
          { entity: "BlackRock Advisors",      caseNumber: "KYC-28821", attribute: "Signatory Title", oldValue: "CEO",               newValue: "CEO (confirmed — no change)" },
          { entity: "BlackRock Institutional", caseNumber: "KYC-28834", attribute: "Signatory Title", oldValue: "CEO, Global Equity Fund", newValue: "CEO, Global Equity Fund (confirmed — no change)" },
        ],
      },
      {
        label: "Standardize title to 'CEO' across all entity records",
        value: "standardize", primary: false, isResolution: true,
        rationale: "Standardizing the title eliminates this discrepancy from future reviews and reduces noise in automated checks going forward.",
        postActionReasoning: "Title field updated to 'CEO' in both entity records. The Fund Charter qualifier ('Global Equity Fund') was removed from the BlackRock Institutional record to align with the simpler title used in the Form ADV. This change is logged for audit trail purposes.",
        affectedRecords: [
          { entity: "BlackRock Advisors",      caseNumber: "KYC-28821", attribute: "Signatory Title", oldValue: "CEO",               newValue: "CEO" },
          { entity: "BlackRock Institutional", caseNumber: "KYC-28834", attribute: "Signatory Title", oldValue: "CEO, Global Equity Fund", newValue: "CEO" },
        ],
      },
      {
        label: "Flag for additional document request",
        value: "flag-docs", primary: false, isResolution: false,
        rationale: "Use if the title inconsistency cannot be confirmed without a formal clarification or supporting document from the client.",
        postActionReasoning: "No records were modified. This documentation request has been logged in the Reach Outs queue. It will be included in the next aggregated client communication draft and requires reviewer approval before any outreach is initiated. This exception remains open until the document is received.",
        affectedRecords: [],
      },
    ],
  },
  {
    summary: "Sarah Williams' signatory title is inconsistent in BlackRock Institutional records.",
    detail:
      "The Fund Charter lists her as 'CEO, Global Equity Fund' while internal signatory records show 'CEO.' The discrepancy is contained to a single entity and one document pairing.",
    reasoning:
      "This is a lower-severity variant of the cross-entity discrepancy. With 95% confidence the records refer to the same person, this may be resolved by confirming the Fund Charter title as the authoritative source.",
    confidence: 95,
    evidence: [
      { name: "Fund Charter",       type: "Corporate Charter", page: "Pg. 3" },
      { name: "Signatory Registry", type: "Internal Record",   page: null    },
    ],
    evidenceRationale: "The Fund Charter is the controlling document for signatory authority at BlackRock Institutional. The Signatory Registry was used to confirm whether the discrepancy was reflected across internal records or isolated to a single document.",
    suggestedActions: [
      {
        label: "Accept Fund Charter as the authoritative title source",
        value: "accept-charter", primary: true, isResolution: true,
        rationale: "The Fund Charter is the most recently filed controlling document for this entity. Accepting it as authoritative resolves the discrepancy without requiring client outreach.",
        postActionReasoning: "The Signatory Registry entry for Sarah Williams has been flagged as superseded by the Fund Charter (Pg. 3). The Fund Charter title 'CEO, Global Equity Fund' is now the authoritative record for this entity. No client outreach required.",
        affectedRecords: [
          { entity: "BlackRock Institutional", caseNumber: "KYC-28834", attribute: "Authoritative Title Source", oldValue: "Signatory Registry", newValue: "Fund Charter (Pg. 3)" },
          { entity: "BlackRock Institutional", caseNumber: "KYC-28834", attribute: "Signatory Title",            oldValue: "CEO (Signatory Registry)", newValue: "CEO, Global Equity Fund (Fund Charter)" },
        ],
      },
      {
        label: "Request updated signatory form from client",
        value: "request-form", primary: false, isResolution: false,
        rationale: "Use if the internal signatory record is believed to be outdated and a refreshed form is needed to close the file correctly.",
        postActionReasoning: "No records were modified. A client outreach request has been initiated for an updated signatory form. This exception remains open and will be reassigned to the Relationship Manager queue.",
        affectedRecords: [],
      },
    ],
  },
  {
    summary: "Updated Offering Memorandum has not been submitted for BlackRock Institutional.",
    detail:
      "The document was due as part of the periodic refresh cycle. Without it, one CIP attribute cannot be fully validated per KYC policy.",
    reasoning:
      "This exception cannot be waived and requires document receipt or a client escalation to proceed.",
    confidence: 75,
    evidence: [],
    evidenceRationale: "No supporting documents are currently available for this exception. The absence of the Offering Memorandum is itself the exception — no evidence can be selected until the document is received.",
    suggestedActions: [
      { label: "Send document request to client contact", value: "send-request", primary: true,  isResolution: false, rationale: "Initiates the document collection process. Required before this exception can be resolved — no waiver is available under current KYC policy." },
      { label: "Escalate to Relationship Manager",        value: "escalate",     primary: false, isResolution: false, rationale: "Use if the client contact is unresponsive or if the document delay is affecting the overall case deadline." },
    ],
  },
  {
    summary: "Additional validation exception requires analyst review.",
    detail: "A data inconsistency was detected during automated processing. Manual review and confirmation is required before this case can proceed.",
    reasoning: "The AI model flagged this item with moderate confidence. Human sign-off is required per compliance protocol.",
    confidence: 70,
    evidence: [
      { name: "Entity Registry Extract", type: "Regulatory Filing", page: "Pg. 7" },
    ],
    evidenceRationale: "The Entity Registry Extract is the primary source for the flagged attribute. It was selected because it is the most recent regulatory filing available and contains the field that triggered automated detection.",
    suggestedActions: [
      { label: "Confirm data is accurate as reviewed", value: "confirm", primary: true,  isResolution: true,  rationale: "Closes the exception with analyst sign-off. Appropriate when the flagged attribute has been manually verified against source records." },
      { label: "Reject and request correction",        value: "reject",  primary: false, isResolution: false, rationale: "Use if the data in the entity registry extract contains a verifiable error that must be corrected before the case can proceed." },
    ],
  },
  {
    summary: "Entity 13 has a pending validation exception.",
    detail: "Automated review flagged an attribute inconsistency. The AI model is 99% confident in its preliminary assessment but human confirmation is required.",
    reasoning: "Given the high confidence level, this is likely a formatting or labeling discrepancy rather than a substantive conflict.",
    confidence: 99,
    evidence: [
      { name: "Corporate Filing", type: "Regulatory Filing", page: "Pg. 2" },
    ],
    evidenceRationale: "The Corporate Filing was selected as the sole source document because it contains the specific attribute field where the inconsistency was detected. No other documents cover this attribute at this entity level.",
    suggestedActions: [
      { label: "Confirm exception is non-material and proceed", value: "confirm-non-material", primary: true,  isResolution: true,  rationale: "Given 99% model confidence, the discrepancy is likely a labeling artifact. Confirmation allows the case to advance without requiring client outreach." },
      { label: "Request clarification from client",              value: "request-clarify",      primary: false, isResolution: false, rationale: "Use if the discrepancy cannot be explained by internal records alone and client input is needed to formally close it." },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-widest uppercase text-kyc-neutral-600 mb-3">
      {children}
    </p>
  );
}

function EvidenceSection({ docs }: { docs: EvidenceDoc[] }) {
  if (docs.length === 0) {
    return (
      <div className="text-[12px] text-kyc-neutral-600 italic py-2">
        No source documents linked to this exception.
      </div>
    );
  }
  return (
    <div className="divide-y divide-kyc-neutral-100 border border-kyc-neutral-200">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-kyc-neutral-50 transition-colors">
          <FileText size={13} className="text-kyc-neutral-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-kyc-neutral-800">{doc.name}</p>
            <p className="text-[11px] text-kyc-neutral-600 mt-0.5">
              {doc.type}{doc.page ? ` · ${doc.page}` : ""}
            </p>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-semibold text-ds-dark-blue-600 hover:underline shrink-0">
            <ExternalLink size={10} /> View Evidence
          </button>
        </div>
      ))}
    </div>
  );
}

type Resolution = "accepted" | "rejected" | "standardized" | string;

/** Per-action async phase for the post-action expansion */
type RerunPhase = "idle" | "loading" | "done";

interface ResolutionSectionProps {
  data: ExceptionData;
  resolution: Resolution | null;
  customNote: string;
  /** actionKey → phase */
  rerunPhases: Record<string, RerunPhase>;
  /** actionKey → feedback "up" | "down" | null */
  feedbackMap: Record<string, "up" | "down" | null>;
  onSelectAction: (val: string) => void;
  onRerun: (val: string) => void;
  onFeedback: (val: string, fb: "up" | "down") => void;
  onCustomNote: (val: string) => void;
  onSubmit: () => void;
  onUndo: () => void;
  onOpenReachOuts?: () => void;
}

// ── Inline streaming agent steps ──────────────────────────────────────

const INLINE_STEPS = [
  "Loading exception context and selected action…",
  "Cross-referencing source documents for consistency…",
  "Evaluating impact across affected entities…",
  "Finalising post-action reasoning…",
];

function InlineAgentSteps() {
  const [revealed, setRevealed] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const stepRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const typeStep = (text: string, cb: () => void) => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i++;
        setTyping(text.slice(0, i));
        if (i < text.length) setTimeout(tick, 22);
        else setTimeout(cb, 280);
      };
      setTimeout(tick, 60);
    };

    const advance = () => {
      if (cancelled) return;
      const step = INLINE_STEPS[stepRef.current];
      if (!step) return;
      typeStep(step, () => {
        if (cancelled) return;
        setRevealed(prev => [...prev, step]);
        setTyping("");
        stepRef.current += 1;
        if (stepRef.current < INLINE_STEPS.length) setTimeout(advance, 200);
      });
    };
    advance();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="border-t px-4 py-4 space-y-2.5"
      style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Loader2 size={12} className="animate-spin shrink-0" style={{ color: "var(--color-dark-blue-600)" }} />
        <p className="text-[11px] font-bold" style={{ color: "var(--color-dark-blue-700)" }}>
          Agent re-running analysis
        </p>
      </div>
      <div className="space-y-1.5 ml-5">
        {revealed.map((s, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <CheckCircle2 size={10} className="shrink-0 mt-0.5" style={{ color: "var(--color-green-600)" }} />
            <p className="text-[10.5px] leading-snug" style={{ color: "var(--color-neutral-600)" }}>{s}</p>
          </div>
        ))}
        {typing && (
          <div className="flex items-start gap-1.5">
            <Clock size={10} className="shrink-0 mt-0.5" style={{ color: "var(--color-dark-blue-400)" }} />
            <p className="text-[10.5px] leading-snug" style={{ color: "var(--color-dark-blue-700)" }}>
              {typing}
              <span
                className="inline-block w-[1.5px] h-[10px] ml-0.5 align-text-bottom animate-pulse"
                style={{ background: "var(--color-dark-blue-600)" }}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Action expansion sub-component ────────────────────────────────────

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-[5px] h-[5px] rounded-full bg-current"
          style={{ animation: `kycDotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  );
}

interface ActionExpansionProps {
  action: SuggestedAction;
  phase: RerunPhase;
  feedback: "up" | "down" | null;
  onRerun: () => void;
  onFeedback: (fb: "up" | "down") => void;
  onOpenReachOuts?: () => void;
}

function ActionExpansion({ action, phase, feedback, onRerun, onFeedback, onOpenReachOuts }: ActionExpansionProps) {
  const isReachOut = !action.isResolution;
  const hasRecords = (action.affectedRecords ?? []).length > 0;

  // ── Loading state ──────────────────────────────────────────────────
  if (phase === "loading") {
    return <InlineAgentSteps />;
  }

  // ── Done state ─────────────────────────────────────────────────────
  return (
    <div
      className="border-t space-y-3 pb-3"
      style={{ borderColor: "var(--color-dark-blue-100)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: "#ffffff", borderBottom: "1px solid var(--color-neutral-200)" }}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles size={10} className="text-kyc-neutral-600 shrink-0" />
          <p className="text-[11px] font-bold tracking-widest uppercase text-kyc-neutral-600">Agent Reasoning — Post Action</p>
        </div>
        <button
          onClick={onRerun}
          className="flex items-center gap-1 text-[11px] font-semibold text-kyc-neutral-600 hover:text-kyc-neutral-800 transition-colors"
          aria-label="Re-run agent analysis for this action"
        >
          <RotateCcw size={10} /> Re-run
        </button>
      </div>

      <div className="px-3 space-y-3">

        {/* Post-action narrative */}
        {action.postActionReasoning && (
          <p className="text-[11px] text-kyc-neutral-700 leading-relaxed">
            {action.postActionReasoning}
          </p>
        )}

        {/* Before / After records table */}
        {hasRecords ? (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Database size={10} className="text-kyc-neutral-600 shrink-0" />
              <p className="text-[11px] font-bold tracking-widest uppercase text-kyc-neutral-600">
                {action.affectedRecords!.length} Record{action.affectedRecords!.length !== 1 ? "s" : ""} Updated
              </p>
            </div>
            <div className="border overflow-hidden" style={{ borderColor: "var(--color-dark-blue-100)" }}>
              {/* Column headers */}
              <div
                className="grid px-2 py-1.5"
                style={{ gridTemplateColumns: "1.2fr 1fr 1.5fr", background: "var(--color-neutral-050)" }}
              >
                {["Entity / Case", "Attribute", "Before → After"].map(h => (
                  <p key={h} className="text-[11px] font-bold uppercase tracking-widest text-kyc-neutral-500">{h}</p>
                ))}
              </div>
              {/* Rows */}
              {action.affectedRecords!.map((rec, i) => (
                <div
                  key={i}
                  className="grid px-2 py-2 hover:bg-kyc-neutral-50 transition-colors"
                  style={{
                    gridTemplateColumns: "1.2fr 1fr 1.5fr",
                    borderTop: "1px solid var(--color-neutral-200)",
                  }}
                >
                  {/* Entity */}
                  <div className="min-w-0 pr-2">
                    <p className="text-[11px] font-semibold text-kyc-neutral-800 truncate">{rec.entity}</p>
                    <p className="text-[11px] font-mono text-kyc-neutral-500">{rec.caseNumber}</p>
                  </div>
                  {/* Attribute */}
                  <p className="text-[11px] text-kyc-neutral-700 pr-2 leading-snug self-start pt-0.5">{rec.attribute}</p>
                  {/* Before → After */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-kyc-neutral-600 truncate max-w-full"
                      style={{ background: "var(--color-neutral-100)", borderRadius: "var(--corner-xsmall, 2px)" }}
                      title={rec.oldValue}
                    >
                      <span className="opacity-60 shrink-0 text-[11px]">Before</span>
                      <span className="truncate line-through opacity-70">{rec.oldValue}</span>
                    </div>
                    <div
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] truncate max-w-full"
                      style={{
                        background: "var(--color-green-000)",
                        border: "1px solid var(--color-green-200)",
                        borderRadius: "var(--corner-xsmall, 2px)",
                        color: "var(--color-green-800)",
                      }}
                      title={rec.newValue}
                    >
                      <ArrowRight size={8} className="shrink-0 opacity-70" />
                      <span className="font-semibold truncate">{rec.newValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded"
            style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
          >
            {/* Main message */}
            <div className="flex items-start gap-2.5 px-3 py-2.5">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: "var(--color-neutral-500)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold mb-0.5 text-kyc-neutral-700">No records modified</p>
                <p className="text-[11px] leading-snug" style={{ color: "var(--color-neutral-700)" }}>
                  No data was modified. This documentation request has been added to the Reach Outs queue and will be included in the next aggregated client communication draft, pending reviewer approval.
                </p>
              </div>
            </div>
            {/* Queue status tags + action */}
            <div
              className="flex items-center justify-between px-3 py-2 border-t gap-2"
              style={{ borderColor: "var(--color-neutral-200)", background: "rgba(0,0,0,0.02)" }}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[10px] font-semibold border"
                  style={{ background: "var(--color-neutral-100)", borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-600)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
                  Queued for aggregated outreach
                </span>
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[10px] font-semibold border"
                  style={{ background: "var(--color-neutral-100)", borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-600)" }}
                >
                  Pending reviewer approval
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback row */}
        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "var(--color-neutral-200)" }}>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-kyc-neutral-500">Was this reasoning helpful?</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFeedback("up")}
              aria-label="Mark reasoning as helpful"
              aria-pressed={feedback === "up"}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium border transition-colors"
              style={{
                borderRadius: "var(--corner-full)",
                borderColor: feedback === "up" ? "var(--color-green-400)" : "var(--color-neutral-300)",
                background: feedback === "up" ? "var(--color-green-000)" : "transparent",
                color: feedback === "up" ? "var(--color-green-700)" : "var(--color-neutral-600)",
              }}
            >
              <ThumbsUp size={10} />
              {feedback === "up" && <span>Thanks</span>}
            </button>
            <button
              onClick={() => onFeedback("down")}
              aria-label="Mark reasoning as not helpful"
              aria-pressed={feedback === "down"}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium border transition-colors"
              style={{
                borderRadius: "var(--corner-full)",
                borderColor: feedback === "down" ? "var(--color-red-300)" : "var(--color-neutral-300)",
                background: feedback === "down" ? "var(--color-red-000)" : "transparent",
                color: feedback === "down" ? "var(--color-red-700)" : "var(--color-neutral-600)",
              }}
            >
              <ThumbsDown size={10} />
              {feedback === "down" && <span>Noted</span>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Resolution section ─────────────────────────────────────────────────

function ResolutionSection({
  data, resolution, customNote, rerunPhases, feedbackMap,
  onSelectAction, onRerun, onFeedback, onCustomNote, onSubmit, onUndo, onOpenReachOuts,
}: ResolutionSectionProps) {
  return (
    <div>
      {/* Contextual reasoning */}
      <div className="mb-4">
        <p className="text-[11px] text-kyc-neutral-700 leading-relaxed">
          <span className="font-semibold">Why this may be acceptable: </span>
          {data.reasoning}
        </p>
        <p className="text-[11px] text-kyc-neutral-600 leading-relaxed mt-2 italic">
          Choose one of the items below to continue
        </p>
      </div>

      <div>
          {/* Suggested actions */}
          <div className="space-y-2 mb-3">
            {data.suggestedActions.map(action => {
              const isSelected = resolution === action.value;
              const phase = rerunPhases[action.value] ?? "idle";
              const feedback = feedbackMap[action.value] ?? null;
              const showExpansion = isSelected && phase !== "idle";
              return (
                <div
                  key={action.value}
                  className="border overflow-hidden transition-colors"
                  style={{
                    borderColor: isSelected
                      ? "var(--color-dark-blue-400)"
                      : "var(--color-neutral-200)",
                    background: "#ffffff",
                  }}
                >
                  {/* Action selector row */}
                  <button
                    onClick={() => onSelectAction(action.value)}
                    className="w-full text-left flex flex-col gap-1 px-3 py-2.5 transition-colors hover:brightness-[0.97]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 w-[14px] h-[18px] flex items-center justify-center">
                        {isSelected ? (
                          <CheckCircle2 size={14} className="text-ds-dark-blue-600" />
                        ) : (
                          <span className="block w-[12px] h-[12px] rounded-full border border-kyc-neutral-300" />
                        )}
                      </span>
                      <span className={`flex-1 text-[12px] leading-[18px] ${isSelected ? "font-semibold text-kyc-neutral-800" : "text-kyc-neutral-700"}`}>
                        {action.label}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 self-center">
                        {action.primary && !isSelected && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full border bg-ds-dark-blue-000 text-ds-dark-blue-600 border-ds-dark-blue-100"
                            style={{ fontSize: "var(--label-small-size)", lineHeight: "var(--label-small-line-height)", fontWeight: "var(--label-small-weight)" }}
                          >
                            Recommended
                          </span>
                        )}
                        {isSelected && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full border"
                            style={{
                              fontSize: "var(--label-small-size)",
                              lineHeight: "var(--label-small-line-height)",
                              fontWeight: "var(--label-small-weight)",
                              background: "var(--color-dark-blue-000)",
                              color: "var(--color-dark-blue-600)",
                              borderColor: "var(--color-dark-blue-200)",
                            }}
                          >
                            {action.isResolution ? "Selected" : "Queued"}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10.5px] text-kyc-neutral-600 leading-snug pl-5">{action.rationale}</p>
                  </button>

                  {/* Immediate reach-out bar — visible as soon as a non-resolution action is selected */}
                  {isSelected && !action.isResolution && onOpenReachOuts && (
                    <div
                      className="flex items-center justify-between px-3 py-2 border-t gap-2"
                      style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[10px] font-semibold border"
                          style={{ background: "var(--color-neutral-100)", borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-600)" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
                          Queued for outreach
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[10px] font-semibold border"
                          style={{ background: "var(--color-neutral-100)", borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-600)" }}
                        >
                          Pending reviewer approval
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Post-action expansion (loading → done) */}
                  {showExpansion && (
                    <ActionExpansion
                      action={action}
                      phase={phase}
                      feedback={feedback}
                      onRerun={() => onRerun(action.value)}
                      onFeedback={fb => onFeedback(action.value, fb)}
                      onOpenReachOuts={onOpenReachOuts}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom note input */}
          <div className="border border-kyc-neutral-200 bg-white mb-3">
            <textarea
              value={customNote}
              onChange={e => onCustomNote(e.target.value)}
              placeholder="Or enter a custom resolution note…"
              rows={2}
              className="w-full px-3 py-2 text-[12px] outline-none text-kyc-neutral-700 placeholder:text-kyc-neutral-600 resize-none"
            />
            <div className="px-3 pb-2 flex justify-end border-t border-kyc-neutral-200 pt-2">
              <button
                onClick={onSubmit}
                disabled={!customNote.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-transparent text-ds-dark-blue-600 border border-ds-dark-blue-600 hover:bg-ds-dark-blue-000 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: "var(--corner-full)" }}
              >
                <Send size={10} /> Submit Note
              </button>
            </div>
          </div>

          {/* Ask AI follow-up */}
          <div className="mb-3">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-kyc-neutral-600 mb-2">Ask a follow-up</p>
            <div className="flex items-center border border-ds-neutral-300 overflow-hidden" style={{ borderRadius: "var(--corner-full)", background: "var(--color-neutral-000, #fff)" }}>
              <div className="pl-3 shrink-0">
                <BookOpen size={13} className="text-kyc-neutral-600" />
              </div>
              <input
                type="text"
                placeholder="Ask a follow-up question about this exception…"
                className="flex-1 px-2 py-2 text-[12px] outline-none text-kyc-neutral-700 placeholder:text-kyc-neutral-600 bg-transparent"
              />
              <button
                className="mr-1.5 px-3 h-6 text-[11px] font-semibold transition-colors shrink-0 bg-transparent hover:opacity-90"
                style={{
                  color: "var(--color-dark-blue-600)",
                  border: "1px solid var(--color-dark-blue-600)",
                  borderRadius: "var(--corner-full)",
                }}
              >
                Ask
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────

import type { AuditEntry } from "./AuditLogPanel";
import type { ReachOut } from "./ReachOutModal";

interface AiReasoningPanelProps {
  activeIdx: number;
  onExceptionResolved: (idx: number, resolved: boolean) => void;
  onOpenDocument?: (docName: string) => void;
  onAuditEntry?: (entry: AuditEntry) => void;
  onReachOut?: (ro: ReachOut) => void;
  onOpenReachOuts?: () => void;
}

export function AiReasoningPanel({ activeIdx, onExceptionResolved, onOpenDocument, onAuditEntry, onReachOut, onOpenReachOuts }: AiReasoningPanelProps) {
  const [customNote, setCustomNote] = useState("");
  const [resolutionMap, setResolutionMap] = useState<Record<number, Resolution | null>>({});
  // key: `${exceptionIdx}:${actionValue}` → phase
  const [rerunPhases, setRerunPhases] = useState<Record<string, RerunPhase>>({});
  // key: `${exceptionIdx}:${actionValue}` → feedback
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down" | null>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const ex: Exception = exceptions[activeIdx];
  const data = exceptionData[activeIdx];
  const resolution = resolutionMap[activeIdx] ?? null;

  // Scoped keys so state survives switching between exceptions
  const phaseKey = (val: string) => `${activeIdx}:${val}`;
  const activePhases: Record<string, RerunPhase> = {};
  data.suggestedActions.forEach(a => {
    activePhases[a.value] = rerunPhases[phaseKey(a.value)] ?? "idle";
  });
  const activeFeedback: Record<string, "up" | "down" | null> = {};
  data.suggestedActions.forEach(a => {
    activeFeedback[a.value] = feedbackMap[phaseKey(a.value)] ?? null;
  });

  const triggerRerun = (val: string, isManual = false) => {
    const key = phaseKey(val);
    if (timersRef.current[key]) clearTimeout(timersRef.current[key]);
    setRerunPhases(prev => ({ ...prev, [key]: "loading" }));
    timersRef.current[key] = setTimeout(() => {
      setRerunPhases(prev => ({ ...prev, [key]: "done" }));
      if (isManual) {
        const action = data.suggestedActions.find(a => a.value === val);
        onAuditEntry?.({
          id: `rerun-${activeIdx}-${val}-${Date.now()}`,
          timestamp: new Date(),
          type: "agent_rerun",
          title: `Agent re-ran analysis for: ${action?.label ?? val}`,
          detail: "Agent re-evaluated the exception with the selected action context.",
          exceptionIdx: activeIdx,
          exceptionTitle: data.summary,
          entity: ex.entity,
          agentConfidence: data.confidence,
          agentSteps: [
            "Re-loaded exception context and selected action.",
            "Cross-referenced source documents for consistency.",
            "Updated post-action reasoning and record impact.",
          ],
        });
      }
    }, 2000);
  };

  const handleSelectAction = (val: string) => {
    const isAlreadySelected = resolutionMap[activeIdx] === val;
    const next = { ...resolutionMap, [activeIdx]: isAlreadySelected ? null : val };
    setResolutionMap(next);
    onExceptionResolved(activeIdx, !isAlreadySelected);

    if (!isAlreadySelected) {
      triggerRerun(val);
      const action = data.suggestedActions.find(a => a.value === val);
      onAuditEntry?.({
        id: `action-${activeIdx}-${val}-${Date.now()}`,
        timestamp: new Date(),
        type: "action_selected",
        title: action?.label ?? val,
        detail: action?.rationale,
        exceptionIdx: activeIdx,
        exceptionTitle: data.summary,
        entity: ex.entity,
        caseNumber: ex.entity === "BlackRock Advisors" ? "KYC-28821" : ex.entity === "BlackRock Institutional" ? "KYC-28834" : "KYC-29107",
        result: action?.isResolution ? (action.affectedRecords && action.affectedRecords.length > 0 ? "updated" : "resolved") : "flagged",
        agentConfidence: data.confidence,
        agentSteps: [
          "Identified entities involved and cross-referenced signatory records.",
          "Compared document sources for title consistency.",
          "Assessed confidence threshold and flagged for human review.",
        ],
        postActionReasoning: action?.postActionReasoning,
        affectedRecords: action?.affectedRecords,
      });
      // Fire reach out for informational (non-resolution) actions
      if (action && !action.isResolution) {
        const caseNumber = ex.entity === "BlackRock Advisors" ? "KYC-28821" : ex.entity === "BlackRock Institutional" ? "KYC-28834" : "KYC-29107";
        onReachOut?.({
          id: `ro-${activeIdx}-${val}-${Date.now()}`,
          timestamp: new Date(),
          exceptionIdx: activeIdx,
          exceptionTitle: data.summary,
          entity: ex.entity,
          caseNumber,
          requestType: val.includes("escalat") ? "escalation" : val.includes("clarif") || val.includes("request") ? "clarification" : "document_request",
          description: action.rationale,
          status: "pending",
        });
      }
    } else {
      const key = phaseKey(val);
      if (timersRef.current[key]) clearTimeout(timersRef.current[key]);
      setRerunPhases(prev => ({ ...prev, [key]: "idle" }));
      onAuditEntry?.({
        id: `cleared-${activeIdx}-${val}-${Date.now()}`,
        timestamp: new Date(),
        type: "action_cleared",
        title: `Action cleared`,
        exceptionIdx: activeIdx,
        exceptionTitle: data.summary,
        entity: ex.entity,
        result: "cleared",
      });
    }
  };

  const handleRerun = (val: string) => triggerRerun(val, true);

  const handleFeedback = (val: string, fb: "up" | "down") => {
    const key = phaseKey(val);
    setFeedbackMap(prev => ({
      ...prev,
      [key]: prev[key] === fb ? null : fb, // toggle
    }));
  };

  const handleSubmitNote = () => {
    if (!customNote.trim()) return;
    const next = { ...resolutionMap, [activeIdx]: customNote.trim() };
    setResolutionMap(next);
    onExceptionResolved(activeIdx, true);
    onAuditEntry?.({
      id: `note-${activeIdx}-${Date.now()}`,
      timestamp: new Date(),
      type: "custom_note",
      title: "Custom resolution note submitted",
      detail: customNote.trim(),
      exceptionIdx: activeIdx,
      exceptionTitle: data.summary,
      entity: ex.entity,
      result: "resolved",
    });
    setCustomNote("");
  };

  const handleUndo = () => {
    const next = { ...resolutionMap, [activeIdx]: null };
    setResolutionMap(next);
    onExceptionResolved(activeIdx, false);
  };

  return (
    <div className="overflow-hidden flex flex-col h-full" style={{ background: "#ffffff" }}>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-0 space-y-4">

        {/* ── 1. Exception Summary ── */}
        <section className="space-y-0 divide-y divide-kyc-neutral-200">

          {/* Header — sticky, matches Exceptions panel header style */}
          <div className="sticky -top-4 z-10 -mx-5 -mt-4 min-h-[44px] flex items-center justify-between px-4 py-3 shrink-0 border-b border-kyc-neutral-200" style={{ background: "var(--color-neutral-000, #fff)" }}>
            <div className="flex items-center gap-2">
              {/* Fluent UI Sparkle — outlined/stroked */}
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-kyc-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2.5 L10.55 4.967 A4.25 4.25 0 0 0 13.555 7.972 L16 8.5 L13.555 9.028 A4.25 4.25 0 0 0 10.55 12.033 L10 14.5 L9.45 12.033 A4.25 4.25 0 0 0 6.445 9.028 L4 8.5 L6.445 7.972 A4.25 4.25 0 0 0 9.45 4.967 Z" />
                <path d="M4 2 L4.22 2.88 A1.5 1.5 0 0 0 4.88 3.78 L5.5 4 L4.88 4.22 A1.5 1.5 0 0 0 4.22 5.12 L4 6 L3.78 5.12 A1.5 1.5 0 0 0 3.12 4.22 L2.5 4 L3.12 3.78 A1.5 1.5 0 0 0 3.78 2.88 Z" />
                <path d="M16 11 L16.18 11.72 A1.25 1.25 0 0 0 16.78 12.82 L17.5 13 L16.78 13.18 A1.25 1.25 0 0 0 16.18 14.28 L16 15 L15.82 14.28 A1.25 1.25 0 0 0 15.22 13.18 L14.5 13 L15.22 12.82 A1.25 1.25 0 0 0 15.82 11.72 Z" />
              </svg>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-kyc-neutral-700">Exception Summary</span>
                {ex.entity && (
                  <div className="inline-flex items-center gap-0 rounded border border-ds-neutral-200 overflow-hidden text-[11px] w-fit">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-ds-neutral-600 font-medium leading-none">
                      <Building2 size={9} aria-hidden="true" className="shrink-0 text-ds-neutral-400" />
                      {ex.entity}
                    </span>
                    <span
                      className="px-1.5 py-0.5 font-mono font-semibold text-ds-dark-blue-600 leading-none border-l border-ds-neutral-200"
                      style={{ background: "var(--color-dark-blue-000)" }}
                    >
                      {ENTITY_CASE_NUMBERS[ex.entity] ?? "—"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[11px] font-medium border shrink-0 ${
                data.confidence >= 90 ? "bg-ds-green-000 text-ds-green-700 border-ds-green-100"
                  : data.confidence >= 75 ? "bg-ds-yellow-000 text-ds-neutral-700 border-ds-yellow-300"
                  : "bg-ds-red-000 text-ds-red-700 border-ds-red-200"
              }`}>
                {data.confidence}% Confidence
              </span>
              <span className="text-[11px] text-kyc-neutral-600">Reasoned in 3 steps</span>
            </div>
          </div>

          {/* ── A. Reasoning ── */}
          <div className="px-4 py-3 !border-t-0">
            <p className="text-[11px] font-bold tracking-widest uppercase text-kyc-neutral-600 mb-2">Why This Exception Exists</p>
            <div className="border-l-2 pl-3 mb-2" style={{ borderColor: "var(--color-red-700)" }}>
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: "var(--color-red-700)" }} />
                <p className="text-[12px] font-semibold text-kyc-neutral-800">{data.summary}</p>
              </div>
            </div>
            <p className="text-[11px] text-kyc-neutral-700 leading-relaxed mb-3">{data.detail}</p>
            <div className="space-y-2">
              {[
                { text: "Identified entities involved and cross-referenced signatory records.", source: "Signatory Registry", page: null },
                { text: "Compared document sources for title consistency.",                    source: "Form ADV – Part 1",  page: "Pg. 12" },
                { text: "Assessed confidence threshold and flagged for human review.",         source: "Fund Charter",       page: "Pg. 3"  },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-kyc-neutral-700 text-[11px] font-bold shrink-0 border-r border-kyc-neutral-700 pr-1.5 mr-0.5">{i + 1}</span>
                  <p className="flex-1 text-[11px] text-kyc-neutral-700 leading-snug">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── B. Evidence ── */}
          <div className="px-4 py-3 !border-t-0">
            <p className="text-[11px] font-bold tracking-widest uppercase text-kyc-neutral-600 mb-1.5">Why This Evidence Was Selected</p>
            <p className="text-[11px] text-kyc-neutral-600 leading-relaxed mb-2.5 italic">{data.evidenceRationale}</p>
            {data.evidence.length === 0 ? (
              <p className="text-[11px] text-kyc-neutral-600 italic">No source documents linked to this exception.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {data.evidence.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-kyc-neutral-50 border border-kyc-neutral-200 px-2.5 py-2 min-w-0">
                    <FileText size={11} className="text-kyc-neutral-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-kyc-neutral-800 truncate">{doc.name}</p>
                      <p className="text-[11px] text-kyc-neutral-600">{doc.type}{doc.page ? ` · ${doc.page}` : ""}</p>
                    </div>
                    <button
                      onClick={() => onOpenDocument?.(doc.name)}
                      className="px-3 h-6 text-[11px] font-semibold transition-colors shrink-0 hover:opacity-90 bg-transparent"
                      style={{
                        color: "var(--color-dark-blue-600)",
                        border: "1px solid var(--color-dark-blue-600)",
                        borderRadius: "var(--corner-full)",
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        <div className="border-t border-kyc-neutral-200" />

        {/* ── 2. Resolution & Next Actions ── */}
        <section>
          <SectionLabel>Resolution & Next Actions</SectionLabel>
          <ResolutionSection
            data={data}
            resolution={resolution}
            customNote={customNote}
            rerunPhases={activePhases}
            feedbackMap={activeFeedback}
            onSelectAction={handleSelectAction}
            onRerun={handleRerun}
            onFeedback={handleFeedback}
            onCustomNote={setCustomNote}
            onSubmit={handleSubmitNote}
            onUndo={handleUndo}
            onOpenReachOuts={onOpenReachOuts}
          />
        </section>

      </div>

    </div>
  );
}
