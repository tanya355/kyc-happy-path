import { useState } from "react";
import {
  Bot, ChevronDown, FileText, ExternalLink, Sparkles, Send, Check, CheckCircle, RotateCcw,
} from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";
import type { ItemDecision } from "../QaDashboardData";

function AgentReasoningBox({ reasoning }: { reasoning: ItemDecision["reasoning"] }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button onClick={() => setExpanded(v => !v)} aria-expanded={expanded} className="w-full flex items-center gap-2 py-1.5 mb-2">
        <Bot size={12} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
        <span className="text-[13px] font-bold flex-1 text-left" style={{ color: "var(--color-neutral-900)" }}>Agent Reasoning</span>
        <ChevronDown size={11} className={`transition-transform ${expanded ? "rotate-180" : ""}`} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
      </button>
      {expanded && (
        <div className="rounded-lg p-3 space-y-2 text-[10px] leading-[1.55]" style={{ background: "var(--color-neutral-000)", border: "1px solid var(--color-neutral-200)" }}>
          <p className="font-semibold" style={{ color: "var(--color-neutral-900)" }}>{reasoning.title}</p>
          <p style={{ color: "var(--color-neutral-700)" }}><span className="font-semibold" style={{ color: "var(--color-neutral-800)" }}>Reasoning: </span>{reasoning.text}</p>
          <p style={{ color: "var(--color-neutral-700)" }}><span className="font-semibold" style={{ color: "var(--color-neutral-800)" }}>Flagged for Risk: </span>{reasoning.risk}</p>
          <a href="#source" className="flex items-center gap-1.5 font-medium mt-1 hover:underline" style={{ color: "var(--color-dark-blue-600)" }}>
            <FileText size={10} className="shrink-0" />Source: {reasoning.source}<ExternalLink size={9} style={{ color: "var(--color-neutral-500)" }} />
          </a>
        </div>
      )}
    </div>
  );
}

interface QaDecisionPanelProps {
  decision: ItemDecision;
}

export function QaDecisionPanel({ decision }: QaDecisionPanelProps) {
  const [choice,   setChoice]   = useState<number | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [showCaps, setShowCaps] = useState(false);

  const caps = ["Summarise conflicting evidence sources", "Compare OCR quality across documents", "Flag regulatory precedent for this attribute", "Draft feedback note to analyst", "Check cross-entity consistency"];
  const aiRec = decision.aiRecommended;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--color-base-white)" }}>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-neutral-700)" }}>{decision.description}</p>
        <AgentReasoningBox reasoning={decision.reasoning} />
        <div>
          <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-neutral-900)" }}>How would you like to resolve this?</p>
          <div className="space-y-2">
            {decision.options.map((opt, i) => {
              const isAiRec  = i === aiRec;
              const isChosen = choice === i;
              return (
                <button key={i} onClick={() => setChoice(i)}
                  className="w-full text-left p-3 rounded-lg transition-all"
                  style={{
                    border: isChosen
                      ? "2px solid var(--color-dark-blue-600)"
                      : isAiRec
                      ? "2px solid var(--color-dark-blue-200)"
                      : "2px solid var(--color-neutral-200)",
                    background: isChosen ? "var(--color-dark-blue-000)" : "var(--color-base-white)",
                  }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-900)" }}>{opt.label}</p>
                    {isAiRec && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-100)" }}>
                        <Sparkles size={7} aria-hidden /> AI Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] leading-snug" style={{ color: "var(--color-neutral-600)" }}>{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-neutral-200)" }}>
          <textarea value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="Ask a follow up question" rows={3}
            className="w-full px-4 pt-3 pb-2 text-[11px] resize-none outline-none"
            style={{ background: "var(--color-base-white)", color: "var(--color-neutral-800)" }} />
          <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-000)" }}>
            <button onClick={() => setShowCaps(v => !v)} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--color-dark-blue-600)" }}>
              <Sparkles size={10} aria-hidden /> More AI capabilities
            </button>
            <button disabled={!followUp.trim()} className="w-7 h-7 flex items-center justify-center text-white rounded-lg disabled:opacity-30"
              style={{ background: "var(--color-dark-blue-600)" }}><Send size={11} /></button>
          </div>
        </div>
        {showCaps && (
          <div className="space-y-1.5">
            {caps.map((c, i) => (
              <button key={i} onClick={() => setFollowUp(c)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] transition-colors"
                style={{ border: "1px solid var(--color-neutral-200)", color: "var(--color-neutral-700)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-neutral-000)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <Sparkles size={9} style={{ color: "var(--color-dark-blue-600)" }} className="shrink-0" />{c}
              </button>
            ))}
          </div>
        )}
      </div>
      {choice !== null && (
        <div className="shrink-0 px-5 py-3 flex flex-col gap-1.5" style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
          <Button
            variant="filled"
            size="small"
            label="Resolved"
            icon={<Check size={13} />}
          />
          <Button
            variant="outlined"
            size="small"
            label="Confirm & Sign off"
            icon={<CheckCircle size={13} />}
          />
          <Button
            variant="text"
            size="small"
            label="Return to Revision"
            icon={<RotateCcw size={13} />}
          />
        </div>
      )}
    </div>
  );
}
