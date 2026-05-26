/**
 * DrgEntityGrid — Analyst Work Queue data grid using TanStack Table v8.
 *
 * Layout: expandable DRG group header rows → entity sub-rows.
 * Columns: Status | Entity Name | Customer Type | Risk | Priority | Jurisdiction | Due Date | Exceptions | Confidence
 * Clicking an entity row navigates to /case (Analyst Case View).
 *
 * TERMINOLOGY:
 *   Risk Rating → Elevated / Moderate / Minimal (NEVER High/Medium/Low)
 *   Priority    → High / Medium / Low
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState, type Row,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, ChevronRight as NavArrow } from "lucide-react";
import { cn } from "@/lib/cn";
import { RiskBadge } from "@/views/components/shared/risk-badge";
import { CaseStatusBadge } from "@/views/components/shared/case-status-badge";
import type { DrgGroup, EntityRow, WorkQueueFilterState } from "@/lib/types";
import { priorityClasses, formatDateShort, isDueSoon, isOverdue } from "@/lib/utils/format-utils";

// ── Column definitions ─────────────────────────────────────────────

const COLUMNS: ColumnDef<EntityRow>[] = [
  {
    accessorKey: "caseStatus",
    header: "Status",
    cell: ({ row }) => <CaseStatusBadge status={row.getValue("caseStatus")} />,
  },
  {
    accessorKey: "name",
    header: "Entity Name",
    cell: ({ row }) => <span className="text-[11px] font-semibold text-neutral-800">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "customerType",
    header: "Customer Type",
    cell: ({ row }) => <span className="text-[11px] text-neutral-600">{row.getValue("customerType")}</span>,
  },
  {
    accessorKey: "riskRating",
    header: "Risk Rating",
    sortingFn: (a, b) => {
      const order: Record<string, number> = { Minimal: 0, Moderate: 1, Elevated: 2 };
      return (order[String(a.getValue("riskRating"))] ?? 0) - (order[String(b.getValue("riskRating"))] ?? 0);
    },
    cell: ({ row }) => <RiskBadge rating={row.getValue("riskRating")} />,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const p = row.getValue<EntityRow["priority"]>("priority");
      return <span className={cn("text-[11px] font-semibold", priorityClasses(p))}>{p}</span>;
    },
  },
  {
    accessorKey: "jurisdiction",
    header: "Jurisdiction",
    cell: ({ row }) => <span className="text-[11px] text-neutral-600">{row.getValue("jurisdiction")}</span>,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    sortingFn: (a, b) => new Date(a.getValue("dueDate")).getTime() - new Date(b.getValue("dueDate")).getTime(),
    cell: ({ row }) => {
      const due = row.getValue<string>("dueDate");
      return (
        <span className={cn("text-[11px] font-medium tabular-nums",
          isOverdue(due) ? "text-red-700" : isDueSoon(due) ? "text-amber-700" : "text-neutral-700"
        )}>
          {formatDateShort(due)}
        </span>
      );
    },
  },
  {
    accessorKey: "openExceptions",
    header: "Exceptions",
    cell: ({ row }) => {
      const n = row.getValue<number>("openExceptions");
      return <span className={cn("text-[11px] font-semibold tabular-nums", n > 0 ? "text-red-700" : "text-neutral-400")}>{n > 0 ? n : "—"}</span>;
    },
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => <span className="text-[11px] text-neutral-600 tabular-nums">{row.getValue("confidence")}</span>,
  },
];

// ── Sort icon ──────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc")  return <ArrowUp   size={10} className="shrink-0 text-[var(--color-dark-blue-600)]" />;
  if (direction === "desc") return <ArrowDown  size={10} className="shrink-0 text-[var(--color-dark-blue-600)]" />;
  return <ArrowUpDown size={10} className="shrink-0 text-neutral-300" />;
}

// ── DRG group header row ───────────────────────────────────────────

function DrgGroupRow({ group, expanded, onToggle }: { group: DrgGroup; expanded: boolean; onToggle: () => void }) {
  return (
    <tr className="cursor-pointer select-none hover:bg-[var(--color-dark-blue-000)] transition-colors"
      style={{ background: "var(--color-neutral-050)" }}
      onClick={onToggle} aria-expanded={expanded}
    >
      <td colSpan={COLUMNS.length + 1} className="px-4 py-2.5 border-b" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-neutral-400">
            {expanded ? <ChevronDown size={13} aria-hidden /> : <ChevronRight size={13} aria-hidden />}
          </span>
          <span className="text-[12px] font-bold text-neutral-800">{group.drgName}</span>
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold border border-neutral-200 text-neutral-500 bg-white">
            {group.entityCount} {group.entityCount === 1 ? "entity" : "entities"}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ── Entity data row ────────────────────────────────────────────────

function EntityDataRow({ row }: { row: Row<EntityRow> }) {
  const navigate = useNavigate();
  return (
    <tr className="group cursor-pointer hover:bg-[var(--color-dark-blue-000)] transition-colors"
      onClick={() => navigate("/case")} role="button"
      aria-label={`View case for ${row.getValue("name")}`}
    >
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="px-4 py-2.5 border-b align-middle" style={{ borderColor: "var(--color-neutral-100)" }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
      <td className="pr-3 border-b align-middle" style={{ borderColor: "var(--color-neutral-100)" }}>
        <NavArrow size={12} className="text-neutral-300 group-hover:text-[var(--color-dark-blue-600)] transition-colors" aria-hidden />
      </td>
    </tr>
  );
}

// ── Per-group section ──────────────────────────────────────────────

function GroupSection({ group, gi, expanded, sorting, onToggle }: {
  group: DrgGroup; gi: number; expanded: boolean; sorting: SortingState; onToggle: () => void;
}) {
  const groupTable = useReactTable({ data: group.entities, columns: COLUMNS, state: { sorting }, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  return (
    <>
      <DrgGroupRow group={group} expanded={expanded} onToggle={onToggle} />
      {expanded && groupTable.getRowModel().rows.map((row) => <EntityDataRow key={`${gi}-${row.id}`} row={row} />)}
    </>
  );
}

// ── Main grid ──────────────────────────────────────────────────────

type DrgEntityGridProps = { groups: DrgGroup[]; filters: WorkQueueFilterState };

export function DrgEntityGrid({ groups, filters }: DrgEntityGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map((_, i) => [String(i), true]))
  );

  const filteredGroups = useMemo(() => groups.map(g => ({
    ...g,
    entities: g.entities.filter(e => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.name.toLowerCase().includes(q) && !g.drgName.toLowerCase().includes(q)) return false;
      }
      if (filters.riskRatings.length > 0 && !filters.riskRatings.includes(e.riskRating)) return false;
      if (filters.priorities.length > 0  && !filters.priorities.includes(e.priority))   return false;
      if (filters.statuses.length > 0    && !filters.statuses.includes(e.caseStatus))   return false;
      return true;
    }),
  })).filter(g => g.entities.length > 0), [groups, filters]);

  const headerTable = useReactTable({ data: [], columns: COLUMNS, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  if (filteredGroups.length === 0) return (
    <div className="flex-1 flex items-center justify-center text-neutral-400">
      <p className="text-[13px]">No entities match the current filters.</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <table className="w-full border-collapse text-left" role="grid" aria-label="Analyst Work Queue">
        <thead className="sticky top-0 z-10" style={{ background: "var(--color-neutral-050)" }}>
          <tr>
            {headerTable.getFlatHeaders().map((header) => (
              <th key={header.id}
                className="px-4 py-2 border-b text-[9px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap select-none"
                style={{ borderColor: "var(--color-neutral-200)", cursor: header.column.getCanSort() ? "pointer" : "default" }}
                onClick={header.column.getToggleSortingHandler()}
                aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none"}
              >
                <div className="flex items-center gap-1">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && <SortIcon direction={header.column.getIsSorted()} />}
                </div>
              </th>
            ))}
            <th className="w-6 border-b" style={{ borderColor: "var(--color-neutral-200)" }} aria-hidden />
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map((group, gi) => (
            <GroupSection key={group.id} group={group} gi={gi} expanded={!!expanded[String(gi)]} sorting={sorting}
              onToggle={() => setExpanded(prev => ({ ...prev, [String(gi)]: !prev[String(gi)] }))}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
