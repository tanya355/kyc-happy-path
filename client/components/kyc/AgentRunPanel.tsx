import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Minus, X, CheckCircle2, Loader2, Globe, ShieldCheck, FileSearch, Layers, Bot } from "lucide-react";

// ── Agent catalogue ───────────────────────────────────────────────────

interface AgentDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  steps: string[];
}

const AGENT_DEFS: AgentDef[] = [
  {
    id: "bulk-triage",
    label: "Bulk Triage Agent",
    icon: <Layers size={15} />,
    steps: [
      "Loading 3 selected entities from queue",
      "Scoring risk signals: jurisdiction, PEP exposure, volume",
      "Classifying entities by triage priority",
      "Flagging 1 high-risk entity for immediate review",
    ],
  },
  {
    id: "agent-review",
    label: "Agent Review",
    icon: <Bot size={15} />,
    steps: [
      "Retrieving analyst decisions across all 5 exceptions",
      "Cross-checking evidence sources against policy rules",
      "Identifying 2 decisions requiring correction",
      "Generating review findings report",
    ],
  },
  {
    id: "doc-extraction",
    label: "Document Extraction Agent",
    icon: <FileSearch size={15} />,
    steps: [
      "Scanning uploaded documents for KYC fields",
      "Extracting: entity name, registration date, signatories",
      "Confidence check: 96% average across 14 fields",
      "Mapping extracted fields to case attributes",
    ],
  },
  {
    id: "sanctions-check",
    label: "Sanctions Screening Agent",
    icon: <ShieldCheck size={15} />,
    steps: [
      "Querying OFAC SDN, EU CFSP, UN 1267",
      "0 hits across 4 parties",
      "Last list refresh: 2h ago",
    ],
  },
];

// ── Types ──────────────────────────────────────────────────────────────

type AgentStatus = "pending" | "running" | "done";

interface RunAgent extends AgentDef {
  status: AgentStatus;
  visibleSteps: number;
}

// ── Sub-components ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AgentStatus }) {
  if (status === "done") return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
      style={{ background: "var(--color-green-000)", color: "var(--color-green-700)", border: "1px solid var(--color-green-200)" }}>
      Done
    </span>
  );
  if (status === "running") return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
      style={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-700)", border: "1px solid var(--color-dark-blue-200)" }}>
      Running
    </span>
  );
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
      style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-500)", border: "1px solid var(--color-neutral-200)" }}>
      Pending
    </span>
  );
}

function AgentCard({ agent }: { agent: RunAgent }) {
  const isRunning = agent.status === "running";
  const isDone    = agent.status === "done";

  return (
    <div
      className="rounded-lg px-3 py-3 transition-all"
      style={{
        border: isRunning
          ? "1.5px solid var(--color-dark-blue-300)"
          : "1px solid var(--color-neutral-200)",
        background: isRunning ? "var(--color-dark-blue-000, #f0f4fb)" : "white",
        marginBottom: 8,
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: isDone ? "var(--color-green-100, #dcfce7)" : isRunning ? "var(--color-dark-blue-100)" : "var(--color-neutral-100)",
            color: isDone ? "var(--color-green-700)" : isRunning ? "var(--color-dark-blue-600)" : "var(--color-neutral-400)",
          }}
        >
          {isDone
            ? <CheckCircle2 size={13} />
            : isRunning
            ? <Loader2 size={13} className="animate-spin" />
            : agent.icon}
        </span>
        <span className="text-[12px] font-semibold flex-1" style={{ color: "var(--color-neutral-900)" }}>
          {agent.label}
        </span>
        <StatusBadge status={agent.status} />
      </div>

      {/* Steps */}
      {(isRunning || isDone) && agent.visibleSteps > 0 && (
        <ul className="ml-8 space-y-1 mt-1">
          {agent.steps.slice(0, agent.visibleSteps).map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-[11px] leading-snug"
              style={{ animation: "fadeSlideUp 0.25s ease both", color: "var(--color-neutral-600)" }}
            >
              <span className="shrink-0 mt-0.5" style={{ color: "var(--color-dark-blue-400)" }}>›</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────

interface AgentRunPanelProps {
  agentIds: string[];
  onClose: () => void;
}

function AgentRunPanelInner({ agentIds, onClose }: AgentRunPanelProps) {
  const agents = AGENT_DEFS.filter(d => agentIds.includes(d.id));
  const [runAgents, setRunAgents] = useState<RunAgent[]>(
    agents.map(a => ({ ...a, status: "pending" as AgentStatus, visibleSteps: 0 }))
  );
  const [minimized, setMinimized] = useState(false);
  const doneCount = runAgents.filter(a => a.status === "done").length;
  const allDone = doneCount === runAgents.length;
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Drag state — initialise to bottom-left
  const [pos, setPos] = useState(() => ({
    x: 24,
    y: window.innerHeight - 24 - 500, // approx initial top
  }));
  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onDragStart = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - 440, ev.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60,  ev.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  useEffect(() => {
    // Sequential agent runner
    let delay = 400;

    agents.forEach((_, idx) => {
      // Start this agent
      const startT = setTimeout(() => {
        setRunAgents(prev => prev.map((a, i) =>
          i === idx ? { ...a, status: "running" } : a
        ));

        // Reveal steps one by one
        const def = agents[idx];
        def.steps.forEach((_, si) => {
          const stepT = setTimeout(() => {
            setRunAgents(prev => prev.map((a, i) =>
              i === idx ? { ...a, visibleSteps: si + 1 } : a
            ));
          }, 600 * (si + 1));
          timerRef.current.push(stepT);
        });

        // Mark done after all steps
        const doneT = setTimeout(() => {
          setRunAgents(prev => prev.map((a, i) =>
            i === idx ? { ...a, status: "done", visibleSteps: def.steps.length } : a
          ));
        }, 600 * (def.steps.length + 1) + 300);
        timerRef.current.push(doneT);
      }, delay);

      delay += 600 * (agents[idx].steps.length + 2) + 800;
      timerRef.current.push(startT);
    });

    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.y,
        left: pos.x,
        width: 440,
        background: "white",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: 12,
        boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
        zIndex: 9998,
        overflow: "hidden",
      }}
    >
      {/* Header — drag handle */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-000, #fafafa)", cursor: "grab" }}
        onMouseDown={onDragStart}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--color-dark-blue-100)" }}
        >
          {allDone
            ? <CheckCircle2 size={14} style={{ color: "var(--color-dark-blue-600)" }} />
            : <Loader2 size={14} className="animate-spin" style={{ color: "var(--color-dark-blue-600)" }} />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>
            {allDone ? "Agents Complete" : "Agents Running"}
          </p>
          <p className="text-[11px]" style={{ color: "var(--color-neutral-500)" }}>
            Custom Run ({runAgents.length} agent{runAgents.length !== 1 ? "s" : ""})
            {" · "}
            <span style={{ color: allDone ? "var(--color-green-700)" : "var(--color-neutral-700)" }}>
              {doneCount}/{runAgents.length} done
            </span>
          </p>
        </div>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={() => setMinimized(m => !m)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-100 transition-colors"
          style={{ color: "var(--color-neutral-500)", cursor: "default" }}
          aria-label={minimized ? "Expand" : "Minimize"}
        >
          <Minus size={13} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-100 transition-colors"
          style={{ color: "var(--color-neutral-500)", cursor: "default" }}
          aria-label="Close"
        >
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="px-4 pt-3 pb-1" style={{ maxHeight: 420, overflowY: "auto" }}>
          {runAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Footer */}
      {!minimized && (
        <div
          className="px-4 py-2 flex items-center gap-1.5"
          style={{ borderTop: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-000, #fafafa)" }}
        >
          <Globe size={10} style={{ color: "var(--color-neutral-400)" }} />
          <span className="text-[10px]" style={{ color: "var(--color-neutral-400)" }}>
            KYC Agent Orchestrator v2.1
          </span>
        </div>
      )}
    </div>,
    document.body
  );
}

// ── Exported wrapper (listens for event) ──────────────────────────────

export function AgentRunPanel() {
  const [runningAgentIds, setRunningAgentIds] = useState<string[] | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ids = (e as CustomEvent<string[]>).detail;
      setRunningAgentIds(ids);
    };
    window.addEventListener("kyc-agents-start", handler);
    return () => window.removeEventListener("kyc-agents-start", handler);
  }, []);

  if (!runningAgentIds) return null;
  return (
    <AgentRunPanelInner
      agentIds={runningAgentIds}
      onClose={() => setRunningAgentIds(null)}
    />
  );
}
