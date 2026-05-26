/**
 * Reports — analytics and compliance reporting screen.
 * Route: /reports
 * Status: placeholder — full implementation pending capacity-model integration.
 */

import { BarChart2, Download, Calendar } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";

const PLACEHOLDER_REPORTS = [
  { id: "r1", name: "Monthly KYC Completion",     period: "Apr 2026",  status: "pending",   count: 42 },
  { id: "r2", name: "Risk Rating Distribution",   period: "Q1 2026",   status: "available", count: 128 },
  { id: "r3", name: "Exception Resolution Rate",  period: "Mar 2026",  status: "available", count: 67 },
  { id: "r4", name: "SLA Compliance Summary",     period: "Apr 2026",  status: "pending",   count: 0  },
];

export default function Reports() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <TopNav />

      <div className="shrink-0 px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div>
          <h1 className="text-[18px] font-bold text-neutral-800 leading-tight">Reports</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">Compliance analytics and audit exports</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[10.5px] font-semibold text-amber-700 border border-amber-200 bg-amber-50">
          <BarChart2 size={11} />
          Capacity-model dependent — placeholder view
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-3 max-w-2xl">
          {PLACEHOLDER_REPORTS.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-4 py-3.5 rounded-lg border" style={{ borderColor: "var(--color-neutral-200)" }}>
              <BarChart2 size={18} className="text-neutral-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-neutral-800">{r.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar size={10} className="text-neutral-400" />
                  <span className="text-[10.5px] text-neutral-500">{r.period}</span>
                  {r.count > 0 && <span className="text-[10.5px] text-neutral-400">· {r.count} records</span>}
                </div>
              </div>
              {r.status === "available"
                ? <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-semibold rounded-full border transition-colors hover:bg-neutral-50" style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-700)" }}><Download size={10} /> Export</button>
                : <span className="text-[10px] text-neutral-400 italic">Generating…</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
