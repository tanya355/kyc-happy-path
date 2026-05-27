import { Link } from "react-router";
import type { CSSProperties } from "react";
import { AlertTriangle, ChevronRight, Zap } from "lucide-react";
import type { PriorityCase, PriorityLevel2 } from "../AnalystDashboardData";

type PriorityCasesTableProps = {
  cases: PriorityCase[];
};

const cardStyle: CSSProperties = {
  background: "var(--color-base-white)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: 8,
};

const priorityPillStyle: Record<PriorityLevel2, string> = {
  High: "bg-ds-red-000 text-ds-red-700 border border-ds-red-200",
  Medium: "bg-ds-yellow-000 text-ds-neutral-700 border border-ds-yellow-300",
  Low: "bg-ds-neutral-100 text-ds-neutral-600 border border-ds-neutral-200",
};

export function PriorityCasesTable({ cases }: PriorityCasesTableProps) {
  const highCount = cases.filter((c) => c.priority === "High").length;

  return (
    <div style={cardStyle} className="p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-bold text-ds-neutral-900">
            Priority Cases
          </h2>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              background: "var(--color-red-000)",
              color: "var(--color-red-700)",
              border: "1px solid var(--color-red-200)",
            }}
          >
            <AlertTriangle size={9} aria-hidden="true" />
            {highCount} High
          </span>
        </div>
        <Link
          to="/dashboard"
          className="text-[11px] font-semibold text-ds-dark-blue-600 hover:underline flex items-center gap-0.5"
        >
          View all <ChevronRight size={11} />
        </Link>
      </div>

      <div
        className="grid grid-cols-[auto_1fr_auto] gap-3 px-2 pb-1.5 mb-0.5"
        style={{ borderBottom: "1px solid var(--color-neutral-200)" }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-wider text-ds-neutral-400 w-[68px]">
          Priority
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-ds-neutral-400">
          Case / Entity
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-ds-neutral-400 text-right">
          Due
        </span>
      </div>

      <div className="flex-1 flex flex-col divide-y divide-ds-neutral-100">
        {cases.map((c) => {
          const isUrgentDue = c.due === "Today" || c.due.includes("hrs");
          return (
            <Link
              key={c.id}
              to="/case"
              state={{ caseId: c.id, entity: c.entity, priority: c.priority }}
              className="grid grid-cols-[auto_1fr_auto] gap-3 px-2 py-2.5 items-start rounded-md hover:bg-ds-neutral-50 transition-colors group"
            >
              <span
                className={`inline-flex items-center justify-center w-[68px] px-2 py-0.5 rounded-full font-semibold mt-0.5 cursor-help ${c.priority === "Medium" ? "text-[9px]" : "text-[10px]"} ${priorityPillStyle[c.priority]}`}
                title={c.priorityReason}
                aria-label={`Priority: ${c.priority}. ${c.priorityReason}`}
              >
                {c.priority}
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[12px] font-bold text-ds-neutral-900 group-hover:text-ds-dark-blue-600 transition-colors leading-none shrink-0">
                    {c.id}
                  </p>
                  <span className="text-[11px] font-medium text-ds-neutral-700 truncate leading-none">
                    {c.entity}
                  </span>
                </div>
                <p
                  className="text-[10px] text-ds-neutral-500 leading-snug min-w-0"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.reason}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    isUrgentDue ? "text-ds-red-700" : "text-ds-neutral-600"
                  }`}
                >
                  {c.due}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded tabular-nums"
                  style={{
                    background: "var(--color-dark-blue-000)",
                    color: "var(--color-dark-blue-600)",
                    border: "1px solid var(--color-dark-blue-100)",
                  }}
                  title="AI-estimated based on AHT and historical patterns"
                >
                  <Zap size={8} aria-hidden="true" />
                  {c.effort}
                </span>
                <ChevronRight
                  size={11}
                  className="text-ds-neutral-300 group-hover:text-ds-dark-blue-600 transition-colors"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
