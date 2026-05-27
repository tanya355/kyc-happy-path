import {
  ENTITY_SECTIONS,
  FILTERS,
  QA_ENTITY_TO_SECTION_ID,
  getAllFlaggedItems,
  type FilterType,
} from "../QaDashboardData";
import { StatusPill } from "./StatusPill";

interface QaSummaryRailProps {
  focusedEntity: string;
  activeFilter: FilterType;
  onChangeFilter: (f: FilterType) => void;
}

export function QaSummaryRail({ focusedEntity, activeFilter, onChangeFilter }: QaSummaryRailProps) {
  const section = ENTITY_SECTIONS.find(s => s.id === QA_ENTITY_TO_SECTION_ID[focusedEntity]);

  const flagged = getAllFlaggedItems();
  const counts: Record<FilterType, number> = {
    all:                flagged.length,
    "low-confidence":   flagged.filter(i => i.confidence > 0 && i.confidence < 65).length,
    "needs-review":     flagged.filter(i => i.action === "review").length,
    "missing-evidence": flagged.filter(i => i.action === "request" || i.confidence === 0).length,
    exceptions:         flagged.filter(i => !!i.analystChoice).length,
  };

  const tiles = [
    { label: "CIP Complete",   value: "92%",  color: "var(--color-green-700)" },
    { label: "Flagged Items",  value: String(flagged.length), color: "var(--color-red-700)" },
    { label: "Low Confidence", value: String(flagged.filter(i => i.confidence > 0 && i.confidence < 65).length), color: "var(--color-neutral-900)" },
  ];

  return (
    <div className="shrink-0" style={{ background: "white", borderBottom: "1px solid var(--color-neutral-200)" }}>
      <div className="flex items-center gap-3 px-4" style={{ minHeight: 40 }}>
        <span className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>
          {section?.name ?? focusedEntity}
        </span>
        {section?.customerType && (
          <span className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>
            {section.customerType}
          </span>
        )}
        {section?.status && <StatusPill status={section.status} size="xs" />}
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        {tiles.map(s => (
          <div key={s.label} className="rounded-lg px-3 py-2 text-center" style={{ background: "var(--color-neutral-000)", border: "1px solid var(--color-neutral-200)" }}>
            <p className="text-[20px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] font-semibold mt-1" style={{ color: "var(--color-neutral-700)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-4 pb-2.5 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest mr-1" style={{ color: "var(--color-neutral-700)" }}>Filter:</span>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onChangeFilter(f.id)}
              aria-pressed={isActive}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all"
              style={isActive
                ? { background: "var(--color-dark-blue-600)", color: "var(--color-base-white)", borderColor: "transparent" }
                : { background: "var(--color-neutral-100)", color: "var(--color-neutral-900)", borderColor: "var(--color-neutral-400)" }
              }
            >
              {f.label}
              <span
                className="text-[9px] font-bold rounded-full px-1"
                style={isActive
                  ? { background: "var(--color-dark-blue-800)", color: "var(--color-base-white)" }
                  : { background: "var(--color-neutral-300)", color: "var(--color-neutral-800)" }
                }
              >{counts[f.id]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
