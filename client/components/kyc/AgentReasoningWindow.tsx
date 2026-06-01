/**
 * AgentReasoningWindow — floating live agent reasoning panel.
 *
 * Sits fixed at the bottom-center of the screen and streams agent thinking
 * steps in real time as each agent in the KYC pipeline runs.
 *
 * Features:
 *   - Animated step streaming with ~700 ms per step
 *   - Per-agent PENDING / RUNNING / DONE states
 *   - Progress bar and completion count
 *   - Minimise to compact pill / fully close
 *   - Auto-scrolls to the latest step
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Minus, X, CheckCircle2, Loader2, Clock } from "lucide-react";

// ── Agent pipeline data ────────────────────────────────────────────

type AgentStatus = "pending" | "running" | "done";

interface AgentDef {
  id: string;
  name: string;
  steps: string[];
}

const PIPELINE: AgentDef[] = [
  {
    id: "beneficial-ownership",
    name: "Beneficial Ownership Agent",
    steps: [
      "Resolving ownership graph at 25% threshold",
      "Traversed 3 layers — 2 UBOs identified",
      "All UBOs have valid ID documents on file",
    ],
  },
  {
    id: "risk-scoring",
    name: "Risk Scoring Agent",
    steps: [
      "Aggregating 12 signals from upstream agents",
      "Composite score: 62 (Elevated)",
      "No tier escalation triggered",
    ],
  },
  {
    id: "client-outreach",
    name: "Client Outreach Agent",
    steps: [
      "Loading template TITLE_CLARIFICATION_v3",
      "Routing to RM: J. Mendes",
      "Pending client response — SLA 5d",
    ],
  },
  {
    id: "audit-trail",
    name: "Audit Trail Agent",
    steps: [
      "Hashing decision payload (SHA-256)",
      "Writing immutable audit record",
      "Audit entry committed — ID: AUD-28821-04",
    ],
  },
];

const STEP_DELAY_MS  = 780;
const AGENT_PAUSE_MS = 420;

// ── Sub-components ─────────────────────────────────────────────────

function AgentIcon({ status }: { status: AgentStatus }) {
  if (status === "done") return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "var(--color-green-000)", border: "1.5px solid var(--color-green-300)" }}>
      <CheckCircle2 size={12} style={{ color: "var(--color-green-700)" }} />
    </div>
  );
  if (status === "running") return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "var(--color-dark-blue-000)", border: "1.5px solid var(--color-dark-blue-300)" }}>
      <Loader2 size={12} className="animate-spin" style={{ color: "var(--color-dark-blue-600)" }} />
    </div>
  );
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "var(--color-neutral-050)", border: "1.5px solid var(--color-neutral-200)" }}>
      <Clock size={11} style={{ color: "var(--color-neutral-400)" }} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

interface AgentReasoningWindowProps {
  onClose: () => void;
}

export function AgentReasoningWindow({ onClose }: AgentReasoningWindowProps) {
  const [minimised, setMinimised]     = useState(false);
  const [agentIdx, setAgentIdx]       = useState(0);       // which agent is running
  const [stepIdx, setStepIdx]         = useState(0);        // how many steps revealed in current agent
  const [revealedSteps, setRevealedSteps] = useState<Record<string, number>>({}); // agentId → steps revealed
  const [doneAgents, setDoneAgents]   = useState<Set<string>>(new Set());
  const [finished, setFinished]       = useState(false);
  const [typingText, setTypingText]   = useState("");       // text currently being "typed"
  const [typingDone, setTypingDone]   = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doneCount = doneAgents.size;
  const totalCount = PIPELINE.length;
  const progress = finished ? 100 : Math.round((doneCount / totalCount) * 100);

  const currentAgent = PIPELINE[agentIdx] ?? null;

  // Scroll to bottom whenever steps update
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [revealedSteps, typingText]);

  // Typing animation for the current step
  const typeText = useCallback((text: string, onDone: () => void) => {
    setTypingText("");
    setTypingDone(false);
    let i = 0;
    const tick = () => {
      i++;
      setTypingText(text.slice(0, i));
      if (i < text.length) {
        timerRef.current = setTimeout(tick, 18);
      } else {
        setTypingDone(true);
        timerRef.current = setTimeout(onDone, 300);
      }
    };
    timerRef.current = setTimeout(tick, 80);
  }, []);

  // Advance through pipeline
  useEffect(() => {
    if (finished) return;
    const agent = PIPELINE[agentIdx];
    if (!agent) { setFinished(true); return; }

    const currentStepText = agent.steps[stepIdx];
    if (currentStepText === undefined) {
      // Agent done — mark and move to next
      timerRef.current = setTimeout(() => {
        setDoneAgents(prev => new Set([...prev, agent.id]));
        setTypingText("");
        setTypingDone(false);
        timerRef.current = setTimeout(() => {
          setAgentIdx(i => i + 1);
          setStepIdx(0);
        }, AGENT_PAUSE_MS);
      }, 200);
      return;
    }

    // Type out the current step, then commit it and advance
    typeText(currentStepText, () => {
      setRevealedSteps(prev => ({
        ...prev,
        [agent.id]: (prev[agent.id] ?? 0) + 1,
      }));
      setTypingText("");
      setTypingDone(false);
      timerRef.current = setTimeout(() => {
        setStepIdx(s => s + 1);
      }, STEP_DELAY_MS);
    });

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentIdx, stepIdx, finished]);

  const subtitle = finished
    ? `Completed · ${totalCount}/${totalCount} done`
    : currentAgent
    ? `${currentAgent.name.split(" ")[0]} · ${doneCount}/${totalCount} done`
    : "";

  // ── Minimised pill ──────────────────────────────────────────────
  if (minimised) {
    return (
      <div
        className="fixed bottom-4 right-6 z-[500] flex items-center gap-2.5 px-4 py-2 rounded-full shadow-lg cursor-pointer"
        style={{
          background: finished ? "var(--color-green-700)" : "var(--color-dark-blue-700)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        onClick={() => setMinimised(false)}
        role="button"
        aria-label="Expand agent reasoning panel"
      >
        {!finished && <Loader2 size={12} className="animate-spin text-white shrink-0" />}
        {finished && <CheckCircle2 size={12} className="text-white shrink-0" />}
        <span className="text-[11px] font-semibold text-white whitespace-nowrap">
          {finished ? "Agents Complete" : `Agents Running — ${doneCount}/${totalCount} done`}
        </span>
        {!finished && (
          <div className="h-1 w-16 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
            <div className="h-1 rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    );
  }

  // ── Full panel ──────────────────────────────────────────────────
  return (
    <div
      className="fixed bottom-4 right-6 z-[500] flex flex-col shadow-2xl"
      style={{
        width: 400,
        maxHeight: 480,
        background: "#ffffff",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: 12,
        boxShadow: "0 8px 40px rgba(0,16,48,0.18)",
      }}
      role="region"
      aria-label="Agent reasoning — live view"
    >
      {/* ── Header ── */}
      <div
        className="shrink-0 px-4 py-3 border-b"
        style={{ borderColor: "var(--color-neutral-200)", borderRadius: "12px 12px 0 0", background: "var(--color-neutral-050)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {!finished
              ? <Loader2 size={13} className="animate-spin shrink-0" style={{ color: "var(--color-dark-blue-600)" }} />
              : <CheckCircle2 size={13} className="shrink-0" style={{ color: "var(--color-green-700)" }} />
            }
            <p className="text-[12px] font-bold text-kyc-neutral-800">
              {finished ? "Agents Complete" : "Agents Running"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimised(true)}
              className="w-6 h-6 flex items-center justify-center rounded text-kyc-neutral-400 hover:text-kyc-neutral-700 hover:bg-kyc-neutral-100 transition-colors"
              aria-label="Minimise"
            >
              <Minus size={11} />
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded text-kyc-neutral-400 hover:text-kyc-neutral-700 hover:bg-kyc-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X size={11} />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-kyc-neutral-500 mb-2">{subtitle}</p>

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-200)" }}>
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: finished ? "var(--color-green-500)" : "var(--color-dark-blue-600)",
            }}
          />
        </div>
      </div>

      {/* ── Agent list ── */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ scrollbarWidth: "none" }}>
        {PIPELINE.map((agent, ai) => {
          const isDone    = doneAgents.has(agent.id);
          const isRunning = !isDone && ai === agentIdx;
          const isPending = !isDone && !isRunning;
          const revealed  = revealedSteps[agent.id] ?? 0;
          const status: AgentStatus = isDone ? "done" : isRunning ? "running" : "pending";

          return (
            <div
              key={agent.id}
              className="rounded-lg border px-3 py-2.5 transition-all"
              style={{
                borderColor: isRunning
                  ? "var(--color-dark-blue-200)"
                  : isDone
                  ? "var(--color-green-200)"
                  : "var(--color-neutral-200)",
                background: isRunning
                  ? "var(--color-dark-blue-000)"
                  : isDone
                  ? "var(--color-green-000)"
                  : "var(--color-neutral-050)",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {/* Agent header row */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <AgentIcon status={status} />
                  <span className="text-[11px] font-semibold text-kyc-neutral-800 truncate">{agent.name}</span>
                </div>
                {isDone && (
                  <span
                    className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "var(--color-green-100, #d1fae5)", color: "var(--color-green-800)" }}
                  >
                    DONE
                  </span>
                )}
                {isRunning && (
                  <span
                    className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "var(--color-dark-blue-600)", color: "#fff" }}
                  >
                    RUNNING
                  </span>
                )}
              </div>

              {/* Completed steps */}
              {(isDone || isRunning) && (
                <div className="space-y-0.5 ml-8">
                  {agent.steps.slice(0, revealed).map((step, si) => (
                    <p key={si} className="text-[10.5px] leading-snug" style={{ color: "var(--color-neutral-600)" }}>
                      <span className="mr-1 opacity-40">›</span>{step}
                    </p>
                  ))}

                  {/* Currently typing step */}
                  {isRunning && typingText && (
                    <p className="text-[10.5px] leading-snug" style={{ color: "var(--color-dark-blue-700)" }}>
                      <span className="mr-1 opacity-40">›</span>
                      {typingText}
                      {!typingDone && (
                        <span className="inline-block w-[1.5px] h-[11px] ml-0.5 align-text-bottom animate-pulse" style={{ background: "var(--color-dark-blue-600)" }} />
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: "var(--color-neutral-200)", borderRadius: "0 0 12px 12px", background: "var(--color-neutral-050)" }}
      >
        <p className="text-[9.5px] text-kyc-neutral-400">KYC Agent Orchestrator v2.1</p>
        {finished && (
          <span
            className="text-[9.5px] font-semibold"
            style={{ color: "var(--color-green-700)" }}
          >
            ✓ All agents complete
          </span>
        )}
      </div>
    </div>
  );
}
