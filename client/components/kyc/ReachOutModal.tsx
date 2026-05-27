import { useState } from "react";
import {
  X, Mail, Send, CheckCircle2, AlertTriangle, Clock,
  FileText, Building2, Edit3, ChevronDown, ChevronUp, Copy, Check,
} from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

// ── Types ──────────────────────────────────────────────────────────────

export type ReachOutRequestType = "document_request" | "clarification" | "escalation";

export interface ReachOut {
  id: string;
  timestamp: Date;
  exceptionIdx: number;
  exceptionTitle: string;
  entity: string;
  caseNumber: string;
  requestType: ReachOutRequestType;
  description: string;
  status: "pending" | "in_draft" | "sent";
}

// ── Helpers ────────────────────────────────────────────────────────────

function requestTypeLabel(type: ReachOutRequestType) {
  return {
    document_request: "Document Request",
    clarification:    "Clarification",
    escalation:       "Escalation",
  }[type];
}

function requestTypeColor(type: ReachOutRequestType) {
  return {
    document_request: { bg: "var(--color-dark-blue-000)", border: "var(--color-dark-blue-100)", color: "var(--color-dark-blue-700)" },
    clarification:    { bg: "var(--color-yellow-000)",    border: "var(--color-yellow-300)",    color: "var(--color-yellow-800)" },
    escalation:       { bg: "var(--color-red-000)",       border: "var(--color-red-200)",       color: "var(--color-red-700)" },
  }[type];
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function generateDraftEmail(reachOuts: ReachOut[]): string {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const items = reachOuts
    .map((r, i) =>
      `${i + 1}. ${requestTypeLabel(r.requestType)} — ${r.entity} (${r.caseNumber})\n   Exception: ${r.exceptionTitle}\n   Request: ${r.description}`
    )
    .join("\n\n");

  return `To: Relationship Manager <rm@client.com>
Cc: kyc-compliance@kpmg.com
Subject: Outstanding KYC Requests — BlackRock DRG Group (#KYC-2024-8821)
Date: ${today}

Dear Relationship Manager,

I am writing in connection with the ongoing KYC review for BlackRock DRG Group (Case #KYC-2024-8821). Following our review of the case documentation, we have identified the following outstanding items that require your attention:

${items}

Please arrange for the submission of the above documentation or responses at your earliest convenience. Our review cannot be finalised until these items have been received.

Should you have any questions or require clarification on any of the above, please do not hesitate to contact our team.

Kind regards,

[Analyst Name]
KYC Compliance Team
KPMG`;
}

// ── Sub-components ─────────────────────────────────────────────────────

function ReachOutRow({ ro, index }: { ro: ReachOut; index: number }) {
  const typeColor = requestTypeColor(ro.requestType);

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0"
      style={{ borderColor: "var(--color-neutral-200)" }}
    >
      {/* Index */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold border"
        style={{ background: "var(--color-neutral-100)", borderColor: "var(--color-neutral-200)", color: "var(--color-neutral-600)" }}
      >
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-semibold border shrink-0"
            style={{ background: typeColor.bg, borderColor: typeColor.border, color: typeColor.color }}
          >
            {requestTypeLabel(ro.requestType)}
          </span>
          <div className="inline-flex items-center gap-1 rounded border text-[10px] overflow-hidden shrink-0"
            style={{ borderColor: "var(--color-neutral-200)" }}
          >
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-ds-neutral-600 font-medium leading-none">
              <Building2 size={8} className="shrink-0 text-ds-neutral-400" />
              {ro.entity}
            </span>
            <span className="px-1.5 py-0.5 font-mono font-semibold text-ds-dark-blue-600 leading-none border-l"
              style={{ background: "var(--color-dark-blue-000)", borderColor: "var(--color-neutral-200)" }}
            >
              {ro.caseNumber}
            </span>
          </div>
          <span className="text-[10px] font-mono text-kyc-neutral-400">{formatTime(ro.timestamp)}</span>
        </div>
        <p className="text-[11px] text-kyc-neutral-500 italic mb-0.5 truncate">{ro.exceptionTitle}</p>
        <p className="text-[12px] text-kyc-neutral-700 leading-snug">{ro.description}</p>
      </div>

      {/* Status */}
      <div className="shrink-0 self-start mt-0.5">
        {ro.status === "sent" ? (
          <CheckCircle2 size={14} style={{ color: "var(--color-green-700)" }} />
        ) : (
          <Clock size={13} className="text-kyc-neutral-400" />
        )}
      </div>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────

type Step = "review" | "draft" | "sent";

interface ReachOutModalProps {
  reachOuts: ReachOut[];
  onClose: () => void;
  onSent?: () => void;
}

export function ReachOutModal({ reachOuts, onClose, onSent }: ReachOutModalProps) {
  const [step, setStep] = useState<Step>("review");
  const [draftEmail, setDraftEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [editingDraft, setEditingDraft] = useState(false);

  const pending = reachOuts.filter(r => r.status === "pending");

  const handleGenerateDraft = () => {
    setDraftEmail(generateDraftEmail(pending));
    setStep("draft");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftEmail).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setStep("sent");
    onSent?.();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reachout-modal-title"
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
          height: step === "draft" ? "min(84vh, 860px)" : "min(72vh, 680px)",
          background: "#ffffff",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: "var(--corner-large, 12px)",
          boxShadow: "0 8px 48px rgba(0,16,48,0.18)",
          transition: "height 300ms ease",
        }}
      >

        {/* ── Header ── */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border shrink-0"
              style={{ background: "var(--color-dark-blue-000)", borderColor: "var(--color-dark-blue-200)" }}
            >
              <Mail size={13} style={{ color: "var(--color-dark-blue-600)" }} />
            </div>
            <div>
              <h2 id="reachout-modal-title" className="text-[13px] font-bold text-kyc-neutral-800">
                {step === "review" && "Pending Reach Outs"}
                {step === "draft"  && "Draft Email — Review & Send"}
                {step === "sent"   && "Sent for Approval"}
              </h2>
              <p className="text-[11px] text-kyc-neutral-500">
                Case #KYC-2024-8821 · BlackRock DRG Group
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 mr-3">
            {(["review", "draft", "sent"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border"
                  style={{
                    background: step === s ? "var(--color-dark-blue-600)" : s === "sent" && step === "sent" ? "var(--color-green-600)" : "var(--color-neutral-100)",
                    borderColor: step === s ? "var(--color-dark-blue-600)" : "var(--color-neutral-300)",
                    color: step === s ? "#fff" : "var(--color-neutral-500)",
                  }}
                >
                  {s === "sent" && step === "sent" ? <CheckCircle2 size={10} style={{ color: "#fff" }} /> : i + 1}
                </div>
                {i < 2 && <div className="w-4 h-px" style={{ background: "var(--color-neutral-300)" }} />}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full border transition-colors hover:bg-kyc-neutral-100"
            style={{ borderColor: "var(--color-neutral-200)" }}
            aria-label="Close"
          >
            <X size={14} className="text-kyc-neutral-600" />
          </button>
        </div>

        {/* ── Step 1: Review ── */}
        {step === "review" && (
          <>
            {/* Summary bar */}
            <div
              className="shrink-0 flex items-center gap-4 px-5 py-2.5 border-b"
              style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold"
                  style={{ background: "var(--color-yellow-000)", borderColor: "var(--color-yellow-300)", color: "var(--color-yellow-800)" }}
                >
                  <Clock size={10} />
                  {pending.length} pending
                </span>
              </div>
              <p className="text-[11px] text-kyc-neutral-500 flex-1">
                These requests will be combined into a single outreach email for reviewer approval.
              </p>
            </div>

            {/* Empty state */}
            {pending.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 px-8 text-center">
                <CheckCircle2 size={28} className="text-kyc-neutral-300" />
                <p className="text-[13px] font-semibold text-kyc-neutral-600">No pending reach outs</p>
                <p className="text-[11px] text-kyc-neutral-500 leading-snug">
                  Reach outs are generated when you select non-resolution actions like document requests or clarification flags.
                </p>
              </div>
            )}

            {/* List */}
            {pending.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                {pending.map((ro, i) => (
                  <ReachOutRow key={ro.id} ro={ro} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Step 2: Draft email ── */}
        {step === "draft" && (
          <>
            <div
              className="shrink-0 flex items-center justify-between px-5 py-2 border-b"
              style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
            >
              <p className="text-[11px] text-kyc-neutral-600">
                Review the draft below before sending for approval. You can edit it inline.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingDraft(v => !v)}
                  className="flex items-center gap-1 text-[11px] font-semibold border px-2 py-1 transition-colors"
                  style={{
                    borderRadius: "var(--corner-full)",
                    borderColor: "var(--color-neutral-300)",
                    color: editingDraft ? "var(--color-dark-blue-700)" : "var(--color-neutral-600)",
                    background: editingDraft ? "var(--color-dark-blue-000)" : "transparent",
                  }}
                >
                  <Edit3 size={10} /> {editingDraft ? "Done editing" : "Edit"}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-semibold border px-2 py-1 transition-colors"
                  style={{
                    borderRadius: "var(--corner-full)",
                    borderColor: copied ? "var(--color-green-400)" : "var(--color-neutral-300)",
                    color: copied ? "var(--color-green-700)" : "var(--color-neutral-600)",
                    background: copied ? "var(--color-green-000)" : "transparent",
                  }}
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {editingDraft ? (
                <textarea
                  value={draftEmail}
                  onChange={e => setDraftEmail(e.target.value)}
                  className="w-full h-full text-[12px] font-mono text-kyc-neutral-700 leading-relaxed outline-none resize-none p-3 border"
                  style={{
                    minHeight: 340,
                    borderColor: "var(--color-dark-blue-200)",
                    background: "var(--color-dark-blue-000)",
                    borderRadius: "var(--corner-small, 4px)",
                  }}
                />
              ) : (
                <div
                  className="p-3 border text-[12px] font-mono text-kyc-neutral-700 leading-relaxed whitespace-pre-wrap"
                  style={{
                    borderColor: "var(--color-neutral-200)",
                    background: "var(--color-neutral-050)",
                    borderRadius: "var(--corner-small, 4px)",
                    minHeight: 340,
                  }}
                >
                  {draftEmail}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Sent ── */}
        {step === "sent" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center border"
              style={{ background: "var(--color-green-000)", borderColor: "var(--color-green-300)" }}
            >
              <CheckCircle2 size={28} style={{ color: "var(--color-green-700)" }} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-kyc-neutral-800 mb-1">Sent for approval</p>
              <p className="text-[12px] text-kyc-neutral-600 leading-snug">
                The outreach email has been sent to the reviewer queue.
                You'll be notified once it's approved and dispatched to the client.
              </p>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded border w-full max-w-sm text-left"
              style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
            >
              <Mail size={16} className="text-kyc-neutral-500 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-kyc-neutral-700">rm@client.com</p>
                <p className="text-[11px] text-kyc-neutral-500">
                  {pending.length} request{pending.length !== 1 ? "s" : ""} · Awaiting reviewer approval
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}
        >
          {step === "review" && (
            <>
              <p className="text-[11px] text-kyc-neutral-500">
                {pending.length} item{pending.length !== 1 ? "s" : ""} will be included in the outreach email.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outlined" size="small" label="Close" onClick={onClose} />
                <Button
                  variant="filled"
                  size="small"
                  label="Generate Draft Email"
                  icon={<Mail size={12} />}
                  disabled={pending.length === 0}
                  onClick={handleGenerateDraft}
                />
              </div>
            </>
          )}
          {step === "draft" && (
            <>
              <Button variant="text" size="small" label="← Back" onClick={() => setStep("review")} />
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-kyc-neutral-500">Ready to send for approval?</p>
                <Button
                  variant="filled"
                  size="small"
                  label="Send for Approval"
                  icon={<Send size={12} />}
                  onClick={handleSend}
                />
              </div>
            </>
          )}
          {step === "sent" && (
            <>
              <p className="text-[11px] text-kyc-neutral-500">Outreach dispatched · {new Date().toLocaleTimeString()}</p>
              <Button variant="filled" size="small" label="Done" onClick={onClose} />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
