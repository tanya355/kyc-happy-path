import { useState } from "react";
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableFilters, EMPTY_FILTERS } from "./FilterPanel";

// ─── Types ────────────────────────────────────────────────────────
type RiskLevel    = "Elevated" | "Moderate" | "Minimal";
type PriorityLevel = "High" | "Medium" | "Low";
type StageValue   = "From Analyst" | "Reworked by Analyst" | "Escalated";
type QaStatus     = "Ready for QA" | "QA In Progress" | "Rework Requested" | "Final Closure";
type SortKey      = "name" | "dueDate" | "analyst" | "riskRating" | "qaStatus" | "stage";
type SortDir      = "asc" | "desc";

interface QaEntity {
  id: string;
  name: string;
  dueDate: string;
  analyst: string;
  riskRating: RiskLevel;
  exceptions: number;
  stage: StageValue;
  qaStatus: QaStatus;
  reworkReason: string | null;
}

interface QaDrgGroup {
  id: string;
  name: string;
  priority: { count: number; level: PriorityLevel };
  entities: QaEntity[];
}

// ─── Static QA data ───────────────────────────────────────────────
const QA_DRG_GROUPS: QaDrgGroup[] = [
  {
    id: "blackrock",
    name: "BlackRock DRG Group",
    priority: { count: 3, level: "High" },
    entities: [
      {
        id: "advisors", name: "BlackRock Advisors", dueDate: "4/25/2026",
        analyst: "Alex Kim", riskRating: "Elevated", exceptions: 1,
        stage: "From Analyst", qaStatus: "Ready for QA", reworkReason: null,
      },
      {
        id: "institutional", name: "BlackRock Institutional", dueDate: "5/14/2026",
        analyst: "Alex Kim", riskRating: "Elevated", exceptions: 3,
        stage: "Reworked by Analyst", qaStatus: "QA In Progress",
        reworkReason: "Insufficient Evidence",
      },
      {
        id: "entity13", name: "Entity 13", dueDate: "6/28/2026",
        analyst: "Sarah Lee", riskRating: "Elevated", exceptions: 1,
        stage: "Escalated", qaStatus: "QA In Progress", reworkReason: null,
      },
      {
        id: "entityxx1", name: "Entity XX", dueDate: "6/29/2026",
        analyst: "Alex Kim", riskRating: "Moderate", exceptions: 1,
        stage: "From Analyst", qaStatus: "Ready for QA", reworkReason: null,
      },
      {
        id: "entityxx2", name: "Entity XX", dueDate: "6/29/2026",
        analyst: "Sarah Lee", riskRating: "Moderate", exceptions: 1,
        stage: "Reworked by Analyst", qaStatus: "Rework Requested",
        reworkReason: "Incomplete Rationale",
      },
      {
        id: "entityxx3", name: "Entity XX", dueDate: "7 Jun 2024",
        analyst: "Alex Kim", riskRating: "Minimal", exceptions: 1,
        stage: "From Analyst", qaStatus: "Final Closure", reworkReason: null,
      },
    ],
  },
  {
    id: "drg2",
    name: "DRG Name 2",
    priority: { count: 3, level: "High" },
    entities: [
      {
        id: "d2e1", name: "Entity A", dueDate: "5/1/2026",
        analyst: "Sarah Lee", riskRating: "Elevated", exceptions: 2,
        stage: "From Analyst", qaStatus: "Ready for QA", reworkReason: null,
      },
      {
        id: "d2e2", name: "Entity B", dueDate: "5/10/2026",
        analyst: "Alex Kim", riskRating: "Moderate", exceptions: 1,
        stage: "Reworked by Analyst", qaStatus: "QA In Progress",
        reworkReason: "Missing Beneficial Owner",
      },
    ],
  },
  {
    id: "drg3",
    name: "DRG Name 3",
    priority: { count: 2, level: "Medium" },
    entities: [
      {
        id: "d3e1", name: "Entity C", dueDate: "6/1/2026",
        analyst: "Alex Kim", riskRating: "Moderate", exceptions: 1,
        stage: "From Analyst", qaStatus: "QA In Progress", reworkReason: null,
      },
    ],
  },
  {
    id: "drg4",
    name: "DRG Name 4",
    priority: { count: 4, level: "Low" },
    entities: [
      {
        id: "d4e1", name: "Entity D", dueDate: "7/15/2026",
        analyst: "Sarah Lee", riskRating: "Minimal", exceptions: 0,
        stage: "From Analyst", qaStatus: "Final Closure", reworkReason: null,
      },
    ],
  },
];

// ─── Style helpers ────────────────────────────────────────────────
const priorityBadgeStyle: Record<PriorityLevel, string> = {
  High:   "bg-ds-red-000 text-ds-red-700",
  Medium: "bg-ds-yellow-000 text-ds-neutral-700",
  Low:    "bg-ds-green-000 text-ds-green-700",
};

const riskTextColor: Record<string, string> = {
  Elevated: "text-ds-red-700",
  Moderate: "text-kyc-neutral-700",
  Minimal:  "text-ds-green-700",
};

const stageStyle: Record<StageValue, string> = {
  "From Analyst":         "text-ds-neutral-700 bg-ds-neutral-100",
  "Reworked by Analyst":  "text-ds-dark-blue-600 bg-ds-dark-blue-000",
  "Escalated":            "text-ds-red-700 bg-ds-red-000",
};

const qaStatusStyle: Record<QaStatus, string> = {
  "Ready for QA":     "text-ds-neutral-600",
  "QA In Progress":   "text-ds-dark-blue-600",
  "Rework Requested": "text-ds-red-700",
  "Final Closure":    "text-ds-green-700",
};

// ─── Sort ─────────────────────────────────────────────────────────
const RISK_ORDER: Record<string, number> = { Minimal: 0, Moderate: 1, Elevated: 2 };

function sortEntities(entities: QaEntity[], key: SortKey, dir: SortDir): QaEntity[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...entities].sort((a, b) => {
    let av: any = a[key as keyof QaEntity];
    let bv: any = b[key as keyof QaEntity];
    if (key === "riskRating") { av = RISK_ORDER[av] ?? 0; bv = RISK_ORDER[bv] ?? 0; }
    else if (key === "dueDate") { av = new Date(av).getTime() || 0; bv = new Date(bv).getTime() || 0; }
    else if (typeof av === "string") return av.localeCompare(bv) * mult;
    return (av < bv ? -1 : av > bv ? 1 : 0) * mult;
  });
}

// ─── Component ────────────────────────────────────────────────────
interface QaDrgTableProps {
  selected: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
  filters?: TableFilters;
}

export function QaDrgTable({
  selected = new Set<string>(),
  onSelectionChange = () => {},
  filters,
}: Partial<QaDrgTableProps>) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["blackrock"]));
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const setSelected = onSelectionChange;

  const activeFilters: TableFilters = filters ?? EMPTY_FILTERS;

  const filteredGroups = QA_DRG_GROUPS
    .filter(g => activeFilters.priorities.length === 0 || activeFilters.priorities.includes(g.priority.level))
    .map(g => ({
      ...g,
      entities: g.entities.filter(e => {
        if (activeFilters.entity && !e.name.toLowerCase().includes(activeFilters.entity.toLowerCase())) return false;
        return true;
      }),
    }))
    .filter(g => g.entities.length > 0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={10} className="opacity-40" />;
    return sortDir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />;
  };

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleEntity = (id: string) => {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n);
  };

  const toggleGroup = (g: QaDrgGroup) => {
    const allSel = g.entities.every(e => selected.has(e.id));
    const n = new Set(selected);
    g.entities.forEach(e => allSel ? n.delete(e.id) : n.add(e.id));
    setSelected(n);
  };

  // grid: checkbox | entity | due | analyst | stage | risk | qa-status | rework-reason
  const GRID = "grid-cols-[auto_4fr_2fr_2fr_3fr_2fr_3fr_4fr]";
  const hdr = "text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide";

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.52)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: "1px solid rgba(0,51,141,0.13)", boxShadow: "0 4px 32px rgba(0,51,141,0.07), inset 0 1px 0 rgba(255,255,255,0.75)" }}>

      {/* Column headers */}
      <div className={`grid ${GRID} gap-x-3 px-4 py-2 border-b`} style={{ background: "#ffffff", borderColor: "rgba(0,51,141,0.10)" }}>
        <div className="w-5" />
        <button onClick={() => handleSort("name")} className={`${hdr} flex items-center gap-1 hover:text-kyc-blue text-left`}>Entity Name <SortIcon k="name" /></button>
        <button onClick={() => handleSort("dueDate")} className={`${hdr} flex items-center gap-1 hover:text-kyc-blue text-left`}>Due Date <SortIcon k="dueDate" /></button>
        <button onClick={() => handleSort("analyst")} className={`${hdr} flex items-center gap-1 hover:text-kyc-blue text-left`}>Analyst <SortIcon k="analyst" /></button>
        <button onClick={() => handleSort("stage")} className={`${hdr} flex items-center gap-1 hover:text-kyc-blue text-left`}>Source / Stage <SortIcon k="stage" /></button>
        <button onClick={() => handleSort("riskRating")} className={`${hdr} flex items-center gap-1 hover:text-kyc-blue text-left`}>Risk <SortIcon k="riskRating" /></button>
        <button onClick={() => handleSort("qaStatus")} className={`${hdr} flex items-center gap-1 hover:text-kyc-blue text-left`}>QA Status <SortIcon k="qaStatus" /></button>
        <span className={hdr}>Rework Reason</span>
      </div>

      {/* DRG groups */}
      {filteredGroups.map(group => {
        const isExpanded = expanded.has(group.id);
        const allSelected = group.entities.length > 0 && group.entities.every(e => selected.has(e.id));
        const someSelected = group.entities.some(e => selected.has(e.id));

        return (
          <div key={group.id} className="border-b border-kyc-neutral-200 last:border-b-0">
            {/* Group header */}
            <div
              className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-ds-neutral-000 cursor-pointer transition-colors"
              onClick={() => toggle(group.id)}
            >
              <div
                onClick={e => { e.stopPropagation(); toggleGroup(group); }}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  allSelected ? "bg-kyc-blue border-kyc-blue" : someSelected ? "bg-kyc-blue/30 border-kyc-blue" : "border-kyc-neutral-300 bg-white hover:border-kyc-blue"
                }`}
              >
                {(allSelected || someSelected) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d={allSelected ? "M1 4L3.5 6.5L9 1" : "M1 4H9"} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="text-kyc-neutral-600 shrink-0">
                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </div>
              <span className="text-sm font-bold text-kyc-neutral-800">{group.name}</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${priorityBadgeStyle[group.priority.level]}`}>
                {group.priority.count} {group.priority.level} Priority Items
              </span>
            </div>

            {/* Entity rows */}
            {isExpanded && sortEntities(group.entities, sortKey, sortDir).map(entity => {
              const isSelected = selected.has(entity.id);
              const isReworked = entity.stage === "Reworked by Analyst";
              return (
                <div
                  key={entity.id}
                  onClick={() => toggleEntity(entity.id)}
                  className={`grid ${GRID} gap-x-3 items-center pl-10 pr-4 py-2.5 border-t border-kyc-neutral-100 transition-colors cursor-pointer ${
                    isSelected ? "bg-kyc-blue-light/40" : isReworked ? "bg-ds-dark-blue-000/50" : "bg-white"
                  } hover:bg-ds-neutral-000`}
                >
                  {/* Checkbox */}
                  <div
                    onClick={e => e.stopPropagation()}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      isSelected ? "bg-kyc-blue border-kyc-blue" : "border-kyc-neutral-300 bg-white hover:border-kyc-blue"
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Entity name */}
                  <span className="text-xs font-medium text-kyc-neutral-800 truncate">{entity.name}</span>

                  {/* Due date */}
                  <span className="text-xs text-kyc-neutral-800">{entity.dueDate}</span>

                  {/* Analyst */}
                  <span className="text-xs text-kyc-neutral-800 truncate">{entity.analyst}</span>

                  {/* Source / Stage */}
                  <span className="text-xs text-kyc-neutral-800">{entity.stage}</span>

                  {/* Risk */}
                  <span className="text-xs text-kyc-neutral-800">{entity.riskRating}</span>

                  {/* QA Status */}
                  <span className="text-xs text-kyc-neutral-800">{entity.qaStatus}</span>

                  {/* Rework Reason */}
                  <span className="text-xs text-kyc-neutral-800 truncate">
                    {entity.reworkReason ?? "—"}
                  </span>

                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
