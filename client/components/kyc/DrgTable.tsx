import { useState } from "react";
import { WorkQueueFilters } from "./WorkQueueFilterPanel";
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown, Lock, ChevronLeft } from "lucide-react";

const PAGE_SIZE = 3;

type SortKey = "name" | "dueDate" | "riskRating" | "confidence" | "exceptions" | "status" | "action";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<string, number> = { Minimal: 0, Moderate: 1, Elevated: 2 };

function sortEntities(entities: any[], key: SortKey, dir: SortDir) {
  const mult = dir === "asc" ? 1 : -1;
  return [...entities].sort((a, b) => {
    let av: any = a[key];
    let bv: any = b[key];
    if (key === "riskRating") {
      av = RISK_ORDER[av] ?? 0;
      bv = RISK_ORDER[bv] ?? 0;
    } else if (key === "confidence") {
      av = parseFloat(String(av).replace("%", "")) || 0;
      bv = parseFloat(String(bv).replace("%", "")) || 0;
    } else if (key === "dueDate") {
      av = new Date(av).getTime() || 0;
      bv = new Date(bv).getTime() || 0;
    } else if (typeof av === "string") {
      return av.localeCompare(bv) * mult;
    }
    return (av < bv ? -1 : av > bv ? 1 : 0) * mult;
  });
}

// ─── Types ────────────────────────────────────────────────────────
type RiskLevel = "Elevated" | "Moderate" | "Minimal";
type PriorityLevel = "High" | "Medium" | "Low";

interface Entity {
  id: string;
  name: string;
  customerType?: string;
  dueDate: string;
  jurisdiction: string;
  priority?: PriorityLevel;
  riskRating: RiskLevel;
  confidence: string;
  exceptions: number;
  status: string;
  action: string;
}

interface DrgGroup {
  id: string;
  name: string;
  priority: { count: number; level: PriorityLevel };
  entities: Entity[];
}

// ─── Static data ──────────────────────────────────────────────────
const DRG_GROUPS: DrgGroup[] = [
  {
    id: "blackrock",
    name: "BlackRock DRG Group",
    priority: { count: 3, level: "High" },
    entities: [
      { id: "advisors",     name: "BlackRock Advisors",      customerType: "Registered Investment Adviser", dueDate: "4/25/2026",  jurisdiction: "USA",  priority: "High",   riskRating: "Elevated", confidence: "90%", exceptions: 1, status: "In Progress",     action: "Periodic Refresh" },
      { id: "institutional", name: "BlackRock Institutional",  customerType: "Institutional Investor",       dueDate: "5/14/2026",  jurisdiction: "UK",   priority: "High",   riskRating: "Elevated", confidence: "98%", exceptions: 3, status: "Pending Feedback", action: "Periodic Refresh" },
      { id: "entity13",     name: "Entity 13",                customerType: "Investment Entity",            dueDate: "6/28/2026",  jurisdiction: "EU",   priority: "Medium", riskRating: "Elevated", confidence: "XX%", exceptions: 1, status: "Not Started",     action: "Periodic Refresh" },
      { id: "entityxx1",    name: "Entity XX",                customerType: "Corporate Fund",               dueDate: "6/29/2026",  jurisdiction: "USA",  priority: "Medium", riskRating: "Elevated", confidence: "XX%", exceptions: 1, status: "In Progress",     action: "Periodic Refresh" },
      { id: "entityxx2",    name: "Entity XX",                customerType: "Complex Ownership",            dueDate: "6/29/2026",  jurisdiction: "APAC", priority: "Low",    riskRating: "Moderate", confidence: "XX%", exceptions: 1, status: "Pending Feedback", action: "Periodic Refresh" },
      { id: "entityxx3",    name: "Entity XX",                customerType: "Individual",                   dueDate: "7 Jun 2024", jurisdiction: "CA",   priority: "Low",    riskRating: "Minimal",  confidence: "XX%", exceptions: 1, status: "Complete",         action: "Periodic Refresh" },
    ],
  },
  {
    id: "drg2",
    name: "DRG Name 2",
    priority: { count: 3, level: "High" },
    entities: [
      { id: "d2e1", name: "Entity A", customerType: "Corporate Fund",    dueDate: "5/1/2026",  jurisdiction: "USA", priority: "High",   riskRating: "Elevated", confidence: "88%", exceptions: 2, status: "Not Started", action: "Periodic Refresh" },
      { id: "d2e2", name: "Entity B", customerType: "Investment Entity", dueDate: "5/10/2026", jurisdiction: "EU",  priority: "Medium", riskRating: "Elevated", confidence: "92%", exceptions: 1, status: "In Progress", action: "Periodic Refresh" },
    ],
  },
  {
    id: "drg3",
    name: "DRG Name 3",
    priority: { count: 2, level: "Medium" },
    entities: [
      { id: "d3e1", name: "Entity C", customerType: "Individual", dueDate: "6/1/2026", jurisdiction: "UK", priority: "Medium", riskRating: "Moderate", confidence: "75%", exceptions: 1, status: "Pending Feedback", action: "Periodic Refresh" },
    ],
  },
  {
    id: "drg4",
    name: "DRG Name 4",
    priority: { count: 4, level: "Low" },
    entities: [
      { id: "d4e1", name: "Entity D", customerType: "Institutional Investor", dueDate: "7/15/2026", jurisdiction: "APAC", priority: "Low", riskRating: "Minimal", confidence: "99%", exceptions: 0, status: "Complete", action: "Periodic Refresh" },
    ],
  },
];

// ─── Due Date urgency helpers (primary visual driver) ────────────
type DueDateUrgency = "overdue" | "urgent" | "upcoming" | "normal";

function getDueDateUrgency(dateStr: string): DueDateUrgency {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "normal";
  const daysUntil = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (daysUntil < 0)   return "overdue";
  if (daysUntil <= 14) return "urgent";
  if (daysUntil <= 45) return "upcoming";
  return "normal";
}

const DUE_DATE_STYLE: Record<DueDateUrgency, { chip: React.CSSProperties; row: string; label?: string }> = {
  overdue:  { chip: { background: "var(--color-red-000)",    color: "var(--color-red-700)",    border: "1px solid var(--color-red-200)",    fontWeight: 700 }, row: "", label: "Overdue" },
  urgent:   { chip: { background: "var(--color-red-000)",    color: "var(--color-red-700)",    border: "1px solid var(--color-red-200)",    fontWeight: 600 }, row: "" },
  upcoming: { chip: { background: "var(--color-yellow-000)", color: "var(--color-neutral-900)", border: "1px solid var(--color-yellow-300)", fontWeight: 500 }, row: "" },
  normal:   { chip: { background: "transparent",             color: "var(--color-neutral-600)", border: "none",                            fontWeight: 400 }, row: "" },
};

function DueDateCell({ dateStr }: { dateStr: string }) {
  const urgency = getDueDateUrgency(dateStr);
  const cfg     = DUE_DATE_STYLE[urgency];
  const d       = new Date(dateStr);
  const label   = isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-[11px] px-1.5 py-0.5 rounded" style={cfg.chip}>
        {cfg.label ? <>{cfg.label} · </> : null}{label}
      </span>
    </span>
  );
}

// ─── Style helpers ────────────────────────────────────────────────
const priorityBadgeStyle: Record<PriorityLevel, string> = {
  High:   "bg-ds-red-000 text-ds-red-700",
  Medium: "bg-ds-yellow-000 text-ds-neutral-700",
  Low:    "bg-ds-green-000 text-ds-green-700",
};

// Risk Rating — secondary signal: text-only, small, muted
const riskTextColor: Record<RiskLevel, string> = {
  Elevated: "text-ds-red-700",
  Moderate: "text-kyc-neutral-700",
  Minimal:  "text-ds-green-700",
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`text-[11px] font-medium ${riskTextColor[level]}`}>{level}</span>
  );
}

// ─── Main component ───────────────────────────────────────────────
export type { Entity };

interface DrgTableProps {
  selected: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
  onEntityClick?: (entity: Entity) => void;
  filters?: WorkQueueFilters;
  statusMap?: Record<string, string>;
  hideGroupCheckbox?: boolean;
  hideAllCheckboxes?: boolean;
}

export function DrgTable({ selected = new Set<string>(), onSelectionChange = () => {}, onEntityClick, filters, statusMap, hideGroupCheckbox = false, hideAllCheckboxes = false }: Partial<DrgTableProps>) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["blackrock"]));
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const setSelected = onSelectionChange;

  const activeFilters = filters ?? { entity: "", dueDateFrom: "", dueDateTo: "", jurisdictions: [], priorities: [], riskRatings: [] };

  const allFilteredGroups = DRG_GROUPS
    .filter(group => (activeFilters.priorities ?? []).length === 0 || (activeFilters.priorities ?? []).includes(group.priority.level))
    .map(group => ({
      ...group,
      entities: group.entities.filter(entity => {
        if (activeFilters.entity && !entity.name.toLowerCase().includes(activeFilters.entity.toLowerCase())) return false;
        if (activeFilters.dueDateFrom || activeFilters.dueDateTo) {
          const d = new Date(entity.dueDate);
          if (activeFilters.dueDateFrom && d < new Date(activeFilters.dueDateFrom)) return false;
          if (activeFilters.dueDateTo && d > new Date(activeFilters.dueDateTo)) return false;
        }
        if ((activeFilters.jurisdictions ?? []).length > 0 && !activeFilters.jurisdictions.includes(entity.jurisdiction)) return false;
        if ((activeFilters.riskRatings ?? []).length > 0 && !activeFilters.riskRatings.includes(entity.riskRating)) return false;
        return true;
      }),
    }))
    .filter(group => group.entities.length > 0);

  const totalGroups = allFilteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const filteredGroups = allFilteredGroups.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const totalEntities = allFilteredGroups.reduce((s, g) => s + g.entities.length, 0);
  const firstEntry = safePage * PAGE_SIZE + 1;
  const lastEntry = Math.min((safePage + 1) * PAGE_SIZE, totalGroups);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={10} className="opacity-40" />;
    return sortDir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />;
  };

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleEntity = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleGroup = (group: DrgGroup) => {
    const allSelected = group.entities.every(e => selected.has(e.id));
    const next = new Set(selected);
    group.entities.forEach(e => allSelected ? next.delete(e.id) : next.add(e.id));
    setSelected(next);
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "var(--color-base-white)", border: "1px solid var(--color-neutral-200)", boxShadow: "var(--shadow-200)" }}>
      {/* Column headers */}
      <div className={`grid ${hideAllCheckboxes ? 'grid-cols-[1fr_160px_90px_140px_100px_80px_80px_90px_140px_100px]' : 'grid-cols-[auto_1fr_160px_90px_140px_100px_80px_80px_90px_140px_100px]'} gap-x-4 px-4 py-2.5`} style={{ background: "var(--color-neutral-000)", borderBottom: "1px solid var(--color-neutral-200)" }}>
        {!hideAllCheckboxes && <div className="w-5" />}
        {/* 1. Entity Name */}
        <button onClick={() => handleSort("name")} className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide flex items-center gap-1 hover:text-kyc-blue text-left">
          Entity Name <SortIcon k="name" />
        </button>
        {/* 2. Due Date */}
        <button onClick={() => handleSort("dueDate")} className="text-[11px] font-bold text-kyc-neutral-800 uppercase tracking-wide flex items-center gap-1 hover:text-kyc-blue text-left">
          Due Date <SortIcon k="dueDate" />
        </button>
        {/* 3. Confidence */}
        <button onClick={() => handleSort("confidence")} className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide flex items-center gap-1 hover:text-kyc-blue text-left">
          Confidence <SortIcon k="confidence" />
        </button>
        {/* 4. Customer Type */}
        <span className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide">Customer Type</span>
        {/* 5. Jurisdiction */}
        <span className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide">Jurisdiction</span>
        {/* 6. Priority */}
        <span className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide">Priority</span>
        {/* 7. Risk */}
        <button onClick={() => handleSort("riskRating")} className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide flex items-center gap-1 hover:text-kyc-blue text-left">
          Risk <SortIcon k="riskRating" />
        </button>
        {/* 8. Exceptions */}
        <button onClick={() => handleSort("exceptions")} className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide flex items-center gap-1 hover:text-kyc-blue text-left">
          # Exc <SortIcon k="exceptions" />
        </button>
        {/* 9. Status */}
        <button onClick={() => handleSort("status")} className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide flex items-center gap-1 hover:text-kyc-blue text-left">
          Status <SortIcon k="status" />
        </button>
        {/* 10. Action */}
        <button onClick={() => handleSort("action")} className="text-[11px] font-semibold text-kyc-neutral-600 uppercase tracking-wide flex items-center gap-1 hover:text-kyc-blue text-left">
          Action <SortIcon k="action" />
        </button>
      </div>

      {/* DRG groups */}
      {filteredGroups.map(group => {
        const isExpanded = expanded.has(group.id);
        const allSelected = group.entities.length > 0 && group.entities.every(e => selected.has(e.id));
        const someSelected = group.entities.some(e => selected.has(e.id));
        // Group is locked if there's an active selection but none of its entities are in it
        const hasAnySelection = selected.size > 0;
        const groupLocked = hasAnySelection && !someSelected;

        return (
          <div key={group.id} style={{ borderBottom: "1px solid var(--color-neutral-200)" }} className="last:border-b-0">
            {/* Group header row */}
            <div
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                groupLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{ background: "var(--color-neutral-000)" }}
              onMouseEnter={e => { if (!groupLocked) e.currentTarget.style.background = "var(--color-neutral-100)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--color-neutral-000)"; }}
              onClick={() => !groupLocked && toggle(group.id)}
            >
              {/* Checkbox for group — hidden in QA view */}
              {!hideGroupCheckbox && (
                <div
                  onClick={e => { e.stopPropagation(); if (!groupLocked) toggleGroup(group); }}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    groupLocked
                      ? "border-kyc-neutral-200 bg-kyc-neutral-100 cursor-not-allowed"
                      : allSelected
                      ? "bg-kyc-blue border-kyc-blue cursor-pointer"
                      : someSelected
                      ? "bg-kyc-blue/30 border-kyc-blue cursor-pointer"
                      : "border-kyc-neutral-300 bg-white hover:border-kyc-blue cursor-pointer"
                  }`}
                >
                  {groupLocked ? (
                    <Lock size={8} className="text-kyc-neutral-400" aria-hidden="true" />
                  ) : (allSelected || someSelected) ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d={allSelected ? "M1 4L3.5 6.5L9 1" : "M1 4H9"} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
              )}

              {/* Expand chevron */}
              <div className="text-kyc-neutral-600 shrink-0">
                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </div>

              {/* DRG name */}
              <span className="text-sm font-bold text-kyc-neutral-800">{group.name}</span>

              {/* Priority badge */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${priorityBadgeStyle[group.priority.level]}`}>
                {group.priority.count} {group.priority.level} Priority Items
              </span>
            </div>

            {/* Expanded entity rows */}
            {isExpanded && sortEntities(group.entities, sortKey, sortDir).map((entity) => {
              const isSelected   = selected.has(entity.id);
              const entityLocked = hasAnySelection && !isSelected;
              const urgency      = getDueDateUrgency(entity.dueDate);
              const urgencyRow   = DUE_DATE_STYLE[urgency].row;
              const handleRowClick = onEntityClick
                ? () => onEntityClick(entity)
                : () => !entityLocked && toggleEntity(entity.id);
              const gridCols = hideAllCheckboxes
                ? 'grid-cols-[1fr_160px_90px_140px_100px_80px_80px_90px_140px_100px]'
                : 'grid-cols-[auto_1fr_160px_90px_140px_100px_80px_80px_90px_140px_100px]';
              const indentClass = hideAllCheckboxes ? 'pl-6' : 'pl-10';
              const stateClass = onEntityClick
                ? 'bg-white cursor-pointer hover:bg-ds-neutral-000'
                : entityLocked
                ? 'opacity-35 cursor-not-allowed bg-white'
                : isSelected
                ? 'bg-kyc-blue-light/40 cursor-pointer hover:bg-kyc-blue-light/60'
                : 'bg-white cursor-pointer hover:bg-ds-neutral-000';
              return (
                <div
                  key={entity.id}
                  onClick={handleRowClick}
                  title={entityLocked && !onEntityClick ? "Clear current selections to select a different entity" : undefined}
                  className={`grid ${gridCols} gap-x-4 items-center ${indentClass} pr-4 py-2.5 border-t border-kyc-neutral-100 transition-colors ${urgencyRow} ${stateClass}`}
                >
                  {/* Checkbox — hidden when hideAllCheckboxes */}
                  {!hideAllCheckboxes && (
                    <div
                      onClick={e => { e.stopPropagation(); if (!entityLocked) toggleEntity(entity.id); }}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        entityLocked
                          ? "border-kyc-neutral-200 bg-kyc-neutral-100 cursor-not-allowed"
                          : isSelected
                          ? "bg-kyc-blue border-kyc-blue cursor-pointer"
                          : "border-kyc-neutral-300 bg-white hover:border-kyc-blue cursor-pointer"
                      }`}
                    >
                      {entityLocked ? (
                        <Lock size={8} className="text-kyc-neutral-400" aria-hidden="true" />
                      ) : isSelected ? (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </div>
                  )}

                  {/* 1. Entity Name */}
                  <span className="text-xs font-medium text-kyc-neutral-800 truncate">{entity.name}</span>

                  {/* 2. Due Date */}
                  <DueDateCell dateStr={entity.dueDate} />

                  {/* 3. Confidence */}
                  <span className="text-xs text-kyc-neutral-800">{entity.confidence}</span>

                  {/* 4. Customer Type */}
                  <span className="text-xs text-kyc-neutral-600 truncate">{entity.customerType ?? "—"}</span>

                  {/* 5. Jurisdiction */}
                  <span className="text-xs text-kyc-neutral-800">{entity.jurisdiction}</span>

                  {/* 6. Priority */}
                  <span className="text-xs text-kyc-neutral-800">{entity.priority}</span>

                  {/* 7. Risk */}
                  <RiskBadge level={entity.riskRating} />

                  {/* 8. Exceptions */}
                  <span className="text-xs text-kyc-neutral-800">
                    {entity.exceptions > 0 ? entity.exceptions : "—"}
                  </span>

                  {/* 9. Status */}
                  <span className="text-xs text-kyc-neutral-800 truncate">{statusMap?.[entity.status] ?? entity.status}</span>

                  {/* 10. Action */}
                  <span className="text-xs text-kyc-neutral-800">{entity.action}</span>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Pagination footer — outside groups, pinned at bottom of table */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderTop: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-000)" }}
      >
        <span className="text-[11px]" style={{ color: "var(--color-neutral-500)" }}>
          Showing {firstEntry}–{lastEntry} of {totalGroups} groups · {totalEntities} entities
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="w-7 h-7 flex items-center justify-center rounded border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-white"
            style={{ borderColor: "var(--color-neutral-200)", color: "var(--color-neutral-600)" }}
            aria-label="Previous page"
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="w-7 h-7 flex items-center justify-center rounded border text-[11px] font-semibold transition-colors"
              style={{
                borderColor: safePage === i ? "var(--color-dark-blue-600)" : "var(--color-neutral-200)",
                background: safePage === i ? "var(--color-dark-blue-600)" : "transparent",
                color: safePage === i ? "white" : "var(--color-neutral-600)",
              }}
              aria-label={`Page ${i + 1}`}
              aria-current={safePage === i ? "page" : undefined}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="w-7 h-7 flex items-center justify-center rounded border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-white"
            style={{ borderColor: "var(--color-neutral-200)", color: "var(--color-neutral-600)" }}
            aria-label="Next page"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
