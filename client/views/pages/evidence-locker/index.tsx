/**
 * EvidenceLocker — document storage and evidence management screen.
 * Route: /evidence-locker
 * Status: scaffold — full implementation pending document ingestion pipeline.
 */

import { useState } from "react";
import { Lock, FileText, Search, Filter } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { cn } from "@/lib/cn";

type DocEntry = {
  id: string;
  name: string;
  entity: string;
  type: string;
  date: string;
  locked: boolean;
};

const MOCK_DOCS: DocEntry[] = [
  { id: "d1", name: "Form ADV Part 1 — BlackRock Advisors LLC",          entity: "BlackRock Advisors",     type: "Regulatory Filing", date: "2026-01-15", locked: false },
  { id: "d2", name: "Fund Charter — BlackRock Institutional Trust Co.",   entity: "BlackRock Institutional", type: "Corporate Document", date: "2025-11-20", locked: false },
  { id: "d3", name: "Ownership Register — BlackRock DRG Group",           entity: "BlackRock DRG Group",    type: "Ownership Record",  date: "2025-10-01", locked: false },
  { id: "d4", name: "OFAC Screening Report — BlackRock Advisors",         entity: "BlackRock Advisors",     type: "Screening Report",  date: "2026-03-10", locked: true  },
  { id: "d5", name: "AML Policy Certificate — v3",                        entity: "All entities",           type: "Policy Document",   date: "2024-08-01", locked: false },
];

export default function EvidenceLocker() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_DOCS.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <TopNav />

      <div className="shrink-0 px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div>
          <h1 className="text-[18px] font-bold text-neutral-800 leading-tight">Evidence Locker</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">Source documents and compliance evidence store</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border rounded-full px-3 py-1.5 bg-white w-60 focus-within:border-[var(--color-dark-blue-400)] transition-all" style={{ borderColor: "var(--color-neutral-200)" }}>
          <Search size={12} className="text-neutral-400 shrink-0" aria-hidden />
          <input
            type="search"
            placeholder="Search documents…"
            aria-label="Search evidence locker"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-[11px] text-neutral-800 bg-transparent outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <FileText size={28} className="opacity-25 mb-2" />
            <p className="text-[13px]">No documents match your search.</p>
          </div>
        )}

        {filtered.map(doc => (
          <div key={doc.id} className="flex items-center gap-4 px-4 py-3 rounded-lg border hover:bg-neutral-50 transition-colors cursor-pointer" style={{ borderColor: "var(--color-neutral-200)" }}>
            <FileText size={16} className="text-neutral-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-neutral-800 truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10.5px] text-neutral-500">{doc.entity}</span>
                <span className="text-neutral-300" aria-hidden>·</span>
                <span className="text-[10.5px] text-neutral-400">{doc.type}</span>
                <span className="text-neutral-300" aria-hidden>·</span>
                <span className="text-[10.5px] text-neutral-400">{doc.date}</span>
              </div>
            </div>
            {doc.locked
              ? <span title="Locked — audit trail protected"><Lock size={12} className="text-neutral-400 shrink-0" /></span>
              : <span className="text-[10px] font-semibold text-blue-600 hover:underline shrink-0">View</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
