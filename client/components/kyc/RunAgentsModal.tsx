import { useState } from "react";
import { Bot, X, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

export interface AgentDef {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const AVAILABLE_AGENTS: AgentDef[] = [
  {
    id: "beneficial-ownership",
    name: "Beneficial Ownership Agent",
    description: "Resolves ownership graph at 25% threshold, traverses layers, identifies UBOs",
    category: "Verification",
  },
  {
    id: "risk-scoring",
    name: "Risk Scoring Agent",
    description: "Aggregates upstream signals and computes composite risk score",
    category: "Risk",
  },
  {
    id: "pep-screening",
    name: "PEP Screening Agent",
    description: "Screens all principals against PEP and sanctions databases (Refinitiv, WorldCheck)",
    category: "Screening",
  },
  {
    id: "document-verification",
    name: "Document Verification Agent",
    description: "Validates document authenticity, certification, and expiry dates",
    category: "Verification",
  },
  {
    id: "client-outreach",
    name: "Client Outreach Agent",
    description: "Prepares and routes client communication via relationship manager",
    category: "Outreach",
  },
  {
    id: "audit-trail",
    name: "Audit Trail Agent",
    description: "Creates immutable audit record of all analyst decisions",
    category: "Compliance",
  },
];

const CATEGORIES = ["Verification", "Risk", "Screening", "Outreach", "Compliance"];

interface RunAgentsModalProps {
  onClose: () => void;
  onRun: (agentIds: string[]) => void;
}

export function RunAgentsModal({ onClose, onRun }: RunAgentsModalProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(AVAILABLE_AGENTS.map(a => a.id))
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORIES)
  );

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleCategory = (cat: string) => {
    const agentsInCat = AVAILABLE_AGENTS.filter(a => a.category === cat);
    const allSelected = agentsInCat.every(a => selected.has(a.id));
    setSelected(prev => {
      const next = new Set(prev);
      agentsInCat.forEach(a => (allSelected ? next.delete(a.id) : next.add(a.id)));
      return next;
    });
  };

  const toggleExpand = (cat: string) =>
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const selectAll = () => setSelected(new Set(AVAILABLE_AGENTS.map(a => a.id)));
  const clearAll = () => setSelected(new Set());

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center"
      style={{ background: "rgba(0,16,48,0.4)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white flex flex-col"
        style={{
          width: 500,
          maxHeight: "80vh",
          borderRadius: "var(--corner-200)",
          boxShadow: "var(--shadow-400)",
          border: "1px solid var(--color-neutral-200)",
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-neutral-200)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)" }}
          >
            <Bot size={14} style={{ color: "var(--color-dark-blue-600)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: "var(--color-neutral-900)" }}>
              Run Agents
            </p>
            <p className="text-[11px]" style={{ color: "var(--color-neutral-500)" }}>
              Select agents to run on this case
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-neutral-100"
          >
            <X size={14} style={{ color: "var(--color-neutral-500)" }} />
          </button>
        </div>

        {/* Select all / clear controls */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-2"
          style={{ borderBottom: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-050)" }}
        >
          <span className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-600)" }}>
            {selected.size} of {AVAILABLE_AGENTS.length} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-[11px] font-semibold transition-colors hover:underline"
              style={{ color: "var(--color-dark-blue-600)" }}
            >
              Select all
            </button>
            <button
              onClick={clearAll}
              className="text-[11px] font-semibold transition-colors hover:underline"
              style={{ color: "var(--color-neutral-500)" }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Agent list by category */}
        <div className="flex-1 overflow-y-auto">
          {CATEGORIES.map(cat => {
            const agents = AVAILABLE_AGENTS.filter(a => a.category === cat);
            if (agents.length === 0) return null;
            const allCatSelected = agents.every(a => selected.has(a.id));
            const someCatSelected = agents.some(a => selected.has(a.id));
            const isExpanded = expandedCategories.has(cat);

            return (
              <div key={cat} style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                {/* Category header */}
                <div className="flex items-center gap-3 px-5 py-2.5">
                  <input
                    type="checkbox"
                    checked={allCatSelected}
                    ref={el => { if (el) el.indeterminate = !allCatSelected && someCatSelected; }}
                    onChange={() => toggleCategory(cat)}
                    className="cursor-pointer"
                  />
                  <button
                    onClick={() => toggleExpand(cat)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--color-neutral-500)" }}>
                      {cat}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0 rounded-full font-semibold"
                      style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }}
                    >
                      {agents.length}
                    </span>
                    <span className="ml-auto">
                      {isExpanded
                        ? <ChevronUp size={12} style={{ color: "var(--color-neutral-400)" }} />
                        : <ChevronDown size={12} style={{ color: "var(--color-neutral-400)" }} />}
                    </span>
                  </button>
                </div>

                {/* Agents in category */}
                {isExpanded && agents.map(agent => (
                  <label
                    key={agent.id}
                    className="flex items-start gap-3 px-5 py-2.5 cursor-pointer transition-colors"
                    style={{
                      background: selected.has(agent.id) ? "var(--color-dark-blue-000)" : "white",
                      borderTop: "1px solid var(--color-neutral-100)",
                    }}
                    onMouseEnter={e => {
                      if (!selected.has(agent.id))
                        (e.currentTarget as HTMLElement).style.background = "var(--color-neutral-050)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background =
                        selected.has(agent.id) ? "var(--color-dark-blue-000)" : "white";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(agent.id)}
                      onChange={() => toggle(agent.id)}
                      className="mt-0.5 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--color-neutral-900)" }}>
                        {agent.name}
                      </p>
                      <p className="text-[10.5px] leading-snug mt-0.5" style={{ color: "var(--color-neutral-500)" }}>
                        {agent.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--color-neutral-200)", background: "white" }}
        >
          <p className="text-[10px]" style={{ color: "var(--color-neutral-400)" }}>
            KYC Agent Orchestrator v2.1
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outlined" size="small" label="Cancel" onClick={onClose} />
            <Button
              variant="filled"
              size="small"
              label={`Run ${selected.size} Agent${selected.size !== 1 ? "s" : ""}`}
              showIconLeading
              icon={<Play size={11} />}
              disabled={selected.size === 0}
              onClick={() => { onRun(Array.from(selected)); onClose(); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
