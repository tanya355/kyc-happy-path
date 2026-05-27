import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Filter } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";
import { TopNav } from "@/components/kyc/TopNav";
import { DrgTable, Entity } from "@/components/kyc/DrgTable";
import { WorkQueueFilterPanel, WorkQueueFilters, EMPTY_WQ_FILTERS } from "@/components/kyc/WorkQueueFilterPanel";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<"all" | "periodic" | "onboarding">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(["advisors", "institutional", "entity13"]));
  const hasSelection = selected.size > 0;

  const [filters, setFilters] = useState<WorkQueueFilters>(EMPTY_WQ_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  const activeFilterCount = [
    filters.entity.trim() !== "",
    filters.dueDateFrom !== "" || filters.dueDateTo !== "",
    filters.jurisdictions.length > 0,
    filters.priorities.length > 0,
    filters.riskRatings.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <div className="flex flex-col flex-1">

        <TopNav />

        {/* Toolbar */}
        <div className="bg-white" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
          <div className="px-6 py-3 flex items-center gap-2">

            {/* Search */}
            <label
              className="flex items-center gap-2 rounded-full px-3 py-1.5 w-72 shrink-0 transition-colors cursor-text"
              style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
            >
              <Search size={13} style={{ color: "var(--color-neutral-400)" }} className="shrink-0" aria-hidden />
              <input
                type="text"
                placeholder="Search entities…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-[12px] outline-none bg-transparent min-w-0"
                style={{ color: "var(--color-neutral-800)" }}
                aria-label="Search entities"
              />
              <span className="text-[10px] tabular-nums shrink-0" style={{ color: "var(--color-neutral-400)" }}>389</span>
            </label>

            <div className="w-px h-4 shrink-0" style={{ background: "var(--color-neutral-200)" }} aria-hidden />

            {/* Filter */}
            <div ref={filterRef} className="relative shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="dashboard-filter-btn" onClick={() => setFilterOpen(o => !o)}>
                  <Button variant="outlined" size="small" label="Filter" showIconTrailing icon={<Filter size={13} />} />
                </div>
                {activeFilterCount > 0 && (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
                    style={{ background: "var(--color-dark-blue-600)" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {filterOpen && (
                <WorkQueueFilterPanel filters={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} />
              )}
            </div>

            <div className="w-px h-4 shrink-0" style={{ background: "var(--color-neutral-200)" }} aria-hidden />

            {/* View segmented control */}
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-full"
              style={{ background: "var(--color-neutral-100)" }}
              role="group"
              aria-label="View filter"
            >
              {(["all", "periodic", "onboarding"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  aria-pressed={activeView === v}
                  className="px-3 py-1 text-[10px] font-semibold rounded-full transition-all"
                  style={
                    activeView === v
                      ? { background: "var(--color-base-white)", color: "var(--color-dark-blue-600)", boxShadow: "var(--shadow-100)" }
                      : { color: "var(--color-neutral-600)" }
                  }
                >
                  {v === "all" ? "All" : v === "periodic" ? "Periodic Refresh" : "Onboarding"}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Primary CTA */}
            <button
              onClick={() => hasSelection && navigate("/case")}
              disabled={!hasSelection}
              className="inline-flex items-center gap-2 px-4 h-9 text-[12px] font-semibold text-white disabled:opacity-40 disabled:pointer-events-none transition-opacity shrink-0"
              style={{ background: "var(--color-dark-blue-600)", borderRadius: "var(--corner-full)" }}
            >
              Review Selected
              {hasSelection && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold" style={{ background: "rgba(255,255,255,0.25)" }}>
                  {selected.size}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <main aria-label="DRG case queue" className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          <DrgTable
            selected={selected}
            onSelectionChange={setSelected}
            filters={filters}
            onEntityClick={(entity: Entity) =>
              navigate("/case", { state: { entity: entity.name, entityId: entity.id, singleEntity: true } })
            }
          />
        </main>

      </div>
    </div>
  );
}
