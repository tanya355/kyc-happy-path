import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface WorkQueueFilters {
  entity: string;
  dueDateFrom: string;
  dueDateTo: string;
  jurisdictions: string[];
  priorities: string[];
  riskRatings: string[];
}

export const EMPTY_WQ_FILTERS: WorkQueueFilters = {
  entity: "",
  dueDateFrom: "",
  dueDateTo: "",
  jurisdictions: [],
  priorities: [],
  riskRatings: [],
};

const JURISDICTIONS = ["USA", "UK", "Singapore", "Hong Kong", "EU"];
const PRIORITIES    = ["High", "Medium", "Low"];
const RISK_RATINGS  = ["Elevated", "Moderate", "Minimal"];

interface Props {
  filters: WorkQueueFilters;
  onChange: (f: WorkQueueFilters) => void;
  onClose: () => void;
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ds-neutral-200 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-ds-neutral-000 transition-colors"
      >
        <span className="text-[12px] font-semibold text-ds-neutral-800">{title}</span>
        {open ? (
          <ChevronUp size={13} className="text-ds-neutral-500" />
        ) : (
          <ChevronDown size={13} className="text-ds-neutral-500" />
        )}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1 group">
      <div
        onClick={onChange}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange()}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
          checked
            ? "border-transparent"
            : "border-ds-neutral-300 bg-white group-hover:border-ds-dark-blue-400"
        }`}
        style={
          checked
            ? { background: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-600)" }
            : {}
        }
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-[12px] text-ds-neutral-700">{label}</span>
    </label>
  );
}

export function WorkQueueFilterPanel({ filters, onChange }: Props) {
  const toggleArr = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const activeCount = [
    filters.entity.trim() !== "",
    filters.dueDateFrom !== "" || filters.dueDateTo !== "",
    filters.jurisdictions.length > 0,
    filters.priorities.length > 0,
    filters.riskRatings.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-ds-neutral-200 rounded-xl shadow-lg w-72 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ds-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-ds-neutral-900">Filters</span>
          {activeCount > 0 && (
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
              style={{ background: "var(--color-dark-blue-600)" }}
            >
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={() => onChange(EMPTY_WQ_FILTERS)}
          className="text-[11px] font-semibold text-ds-dark-blue-600 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Due Date */}
      <Section title="Due Date">
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-[11px] text-ds-neutral-600 mb-1">From</p>
            <input
              type="date"
              value={filters.dueDateFrom}
              onChange={(e) => onChange({ ...filters, dueDateFrom: e.target.value })}
              className="w-full text-[11px] border border-ds-neutral-200 rounded-lg px-2 py-1.5 outline-none focus:border-ds-dark-blue-400 text-ds-neutral-800"
            />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-ds-neutral-600 mb-1">To</p>
            <input
              type="date"
              value={filters.dueDateTo}
              onChange={(e) => onChange({ ...filters, dueDateTo: e.target.value })}
              className="w-full text-[11px] border border-ds-neutral-200 rounded-lg px-2 py-1.5 outline-none focus:border-ds-dark-blue-400 text-ds-neutral-800"
            />
          </div>
        </div>
      </Section>

      {/* Entity */}
      <Section title="Entity">
        <input
          type="text"
          placeholder="Search entity name..."
          value={filters.entity}
          onChange={(e) => onChange({ ...filters, entity: e.target.value })}
          className="w-full text-[12px] border border-ds-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-ds-dark-blue-400 placeholder:text-ds-neutral-500 text-ds-neutral-800"
        />
      </Section>

      {/* Jurisdiction */}
      <Section title="Jurisdiction" defaultOpen={false}>
        <div className="space-y-0.5">
          {JURISDICTIONS.map((j) => (
            <Checkbox
              key={j}
              checked={filters.jurisdictions.includes(j)}
              onChange={() => onChange({ ...filters, jurisdictions: toggleArr(filters.jurisdictions, j) })}
              label={j}
            />
          ))}
        </div>
      </Section>

      {/* Priority */}
      <Section title="Priority" defaultOpen={false}>
        <div className="space-y-0.5">
          {PRIORITIES.map((p) => (
            <Checkbox
              key={p}
              checked={filters.priorities.includes(p)}
              onChange={() => onChange({ ...filters, priorities: toggleArr(filters.priorities, p) })}
              label={p}
            />
          ))}
        </div>
      </Section>

      {/* Risk */}
      <Section title="Risk" defaultOpen={false}>
        <div className="space-y-0.5">
          {RISK_RATINGS.map((r) => (
            <Checkbox
              key={r}
              checked={filters.riskRatings.includes(r)}
              onChange={() => onChange({ ...filters, riskRatings: toggleArr(filters.riskRatings, r) })}
              label={r}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
