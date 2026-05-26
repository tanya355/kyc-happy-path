/**
 * QaWorkQueue — DRG entity grid for QA Reviewers.
 *
 * Route: /qa-work-hub
 * Architecture:
 *   Server state: useWorkQueue() (TanStack Query, same mock data as analyst queue)
 *   Grid: QaDrgGrid (TanStack Table v8) with QA-specific status labels
 */

import { useState } from "react";
import { Search } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { QaDrgGrid } from "./qa-drg-grid";
import { useWorkQueue } from "@/lib/api/queries/work-queue";

export default function QaWorkQueue() {
  const { data: groups = [], isLoading, isError } = useWorkQueue();
  const [search, setSearch] = useState("");

  const filteredGroups = groups.map(g => ({
    ...g,
    entities: g.entities.filter(e =>
      !search || e.name.toLowerCase().includes(search.toLowerCase()) || g.drgName.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.entities.length > 0);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <TopNav />

      {/* Page header */}
      <div className="shrink-0 px-6 py-3.5 border-b flex items-center gap-4" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-bold text-neutral-800 leading-tight">QA Work Queue</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">Cases awaiting QA review and approval</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border rounded-full px-3 py-1.5 bg-white w-56 focus-within:border-[var(--color-dark-blue-400)] transition-all" style={{ borderColor: "var(--color-neutral-200)" }}>
          <Search size={12} className="text-neutral-400 shrink-0" aria-hidden />
          <input
            type="search"
            placeholder="Search entities or DRGs…"
            aria-label="Search QA queue"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 text-[11px] text-neutral-800 bg-transparent outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading && <div className="flex-1 flex items-center justify-center"><p className="text-[13px] text-neutral-400 animate-pulse">Loading queue…</p></div>}
      {isError  && <div className="flex-1 flex items-center justify-center"><p className="text-[13px] text-red-600">Failed to load QA queue.</p></div>}
      {!isLoading && !isError && <QaDrgGrid groups={filteredGroups} />}
    </div>
  );
}
