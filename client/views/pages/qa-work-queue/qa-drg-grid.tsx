/**
 * QaDrgGrid — QA Work Queue data grid using TanStack Table v8.
 *
 * Same DRG-group structure as Analyst Work Queue but with QA-specific
 * status labels (Ready for QA / QA In Progress / Rework Requested / Final Closure).
 *
 * Clicking a row navigates to /qa-dashboard (QA Case View).
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
import type { DrgGroup, EntityRow } from "@/lib/types";
import { formatDateShort, isDueSoon, isOverdue, priorityClasses } from "@/lib/utils/format-utils";

// ── QA Status mapping ──────────────────────────────────────────────

const QA_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  not_started:        { label: "Ready for QA",    cls: "bg-blue-50 text-blue-700 border-blue-200"   },
  in_progress_agents: { label: "QA In Progress",  cls: "bg-purple-50 text-purple-700 border-purple-200" },
  analyst_review:     { label: "Rework Requested", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  qa_review:          { label: "QA In Progress",  cls: "bg-purple-50 text-purple-700 border-purple-200" },
  complete:           { label: "Final Closure",   cls: "bg-green-50 text-green-700 border-green-200" },
};

function QaStatusBadge({ status }: { status: string }) {
  const cfg = QA_STATUS_MAP[status] ?? { label: status, cls: "bg-neutral-100 text-neutral-600 border-neutral-200" };
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", cfg.cls)}>{cfg.label}</span>;
}

// ── Column definitions ─────────────────────────────────────────────

const COLUMNS: ColumnDef<EntityRow>[] = [
  {
    accessorKey: "caseStatus",
    header: "QA Status",
    cell: ({ row }) => <QaStatusBadge status={String(row.getValue("caseStatus"))} />,
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
      return <span className={cn("text-[11px] font-medium tabular-nums", isOverdue(due) ? "text-red-700" : isDueSoon(due) ? "text-amber-700" : "text-neutral-700")}>{formatDateShort(due)}</span>;
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

// ── Group row ──────────────────────────────────────────────────────

function DrgGroupRow({ group, expanded, onToggle }: { group: DrgGroup; expanded: boolean; onToggle: () => void }) {
  return (
    <tr className="cursor-pointer select-none hover:bg-[var(--color-dark-blue-000)] transition-colors" style={{ background: "var(--color-neutral-050)" }} onClick={onToggle} aria-expanded={expanded}>
      <td colSpan={COLUMNS.length + 1} className="px-4 py-2.5 border-b" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-neutral-400">{expanded ? <ChevronDown size={13} aria-hidden /> : <ChevronRight size={13} aria-hidden />}</span>
          <span className="text-[12px] font-bold text-neutral-800">{group.drgName}</span>
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold border border-neutral-200 text-neutral-500 bg-white">{group.entityCount} {group.entityCount === 1 ? "entity" : "entities"}</span>
        </div>
      </td>
    </tr>
  );
}

function EntityRow_({ row }: { row: Row<EntityRow> }) {
  const navigate = useNavigate();
  return (
    <tr className="group cursor-pointer hover:bg-[var(--color-dark-blue-000)] transition-colors" onClick={() => navigate("/qa-dashboard")} role="button" aria-label={`QA review for ${row.getValue("name")}`}>
      {row.getVisibleCells().map(cell => (
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

function GroupSection({ group, gi, expanded, sorting, onToggle }: { group: DrgGroup; gi: number; expanded: boolean; sorting: SortingState; onToggle: () => void }) {
  const table = useReactTable({ data: group.entities, columns: COLUMNS, state: { sorting }, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  return (
    <>
      <DrgGroupRow group={group} expanded={expanded} onToggle={onToggle} />
      {expanded && table.getRowModel().rows.map(row => <EntityRow_ key={`${gi}-${row.id}`} row={row} />)}
    </>
  );
}

// ── Main grid ──────────────────────────────────────────────────────

type Props = { groups: DrgGroup[] };

export function QaDrgGrid({ groups }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(Object.fromEntries(groups.map((_, i) => [String(i), true])));

  const headerTable = useReactTable({ data: [], columns: COLUMNS, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  if (groups.length === 0) return <div className="flex-1 flex items-center justify-center text-neutral-400"><p className="text-[13px]">No items in the QA queue.</p></div>;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <table className="w-full border-collapse text-left" role="grid" aria-label="QA Work Queue">
        <thead className="sticky top-0 z-10" style={{ background: "var(--color-neutral-050)" }}>
          <tr>
            {headerTable.getFlatHeaders().map(header => (
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
          {groups.map((group, gi) => (
            <GroupSection key={group.id} group={group} gi={gi} expanded={!!expanded[String(gi)]} sorting={sorting}
              onToggle={() => setExpanded(prev => ({ ...prev, [String(gi)]: !prev[String(gi)] }))}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
