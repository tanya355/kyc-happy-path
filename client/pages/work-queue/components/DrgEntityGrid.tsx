/**
 * DrgEntityGrid — main data grid for the Work Queue, built with TanStack Table v8.
 *
 * Layout: DRG group header rows (expandable) → entity sub-rows.
 * TanStack Table handles sorting, filtering, and row expansion.
 *
 * CONVENTIONS:
 *   - ColumnDef<EntityRow> typed columns; no `any`.
 *   - flexRender() for all cell/header rendering.
 *   - Clicking a DRG header row toggles expansion; clicking an entity row
 *     navigates to /case (Analyst Case View).
 *   - Risk Rating uses DS color tokens (Elevated/Moderate/Minimal — never High/Medium/Low).
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
  type Row,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, ChevronRight as NavArrow } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DrgGroup, EntityRow, WorkQueueFilterState } from "@/lib/types";
import {
  caseStatusLabel,
  caseStatusClasses,
  riskRatingClasses,
  priorityClasses,
  formatDateShort,
  isDueSoon,
  isOverdue,
} from "@/lib/utils/format-utils";

// ─── Column definitions ───────────────────────────────────────────────────────

const ENTITY_COLUMNS: ColumnDef<EntityRow>[] = [
  {
    accessorKey: "name",
    header: "Entity Name",
    cell: ({ row }) => (
      <span className="text-[11px] font-semibold text-neutral-800">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "customerType",
    header: "Customer Type",
    cell: ({ row }) => (
      <span className="text-[11px] text-neutral-600">{row.getValue("customerType")}</span>
    ),
  },
  {
    accessorKey: "caseStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<EntityRow["caseStatus"]>("caseStatus");
      return (
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", caseStatusClasses(status))}>
          {caseStatusLabel(status)}
        </span>
      );
    },
  },
  {
    accessorKey: "riskRating",
    header: "Risk Rating",
    sortingFn: (a, b) => {
      const order: Record<string, number> = { Minimal: 0, Moderate: 1, Elevated: 2 };
      const av = String(a.getValue("riskRating"));
      const bv = String(b.getValue("riskRating"));
      return (order[av] ?? 0) - (order[bv] ?? 0);
    },
    cell: ({ row }) => {
      const rating = row.getValue<EntityRow["riskRating"]>("riskRating");
      return (
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", riskRatingClasses(rating))}>
          {rating}
        </span>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const p = row.getValue<EntityRow["priority"]>("priority");
      return (
        <span className={cn("text-[11px] font-semibold", priorityClasses(p))}>{p}</span>
      );
    },
  },
  {
    accessorKey: "jurisdiction",
    header: "Jurisdiction",
    cell: ({ row }) => (
      <span className="text-[11px] text-neutral-600">{row.getValue("jurisdiction")}</span>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    sortingFn: (a, b) =>
      new Date(a.getValue("dueDate")).getTime() - new Date(b.getValue("dueDate")).getTime(),
    cell: ({ row }) => {
      const due = row.getValue<string>("dueDate");
      const overdue = isOverdue(due);
      const soon = isDueSoon(due);
      return (
        <span className={cn(
          "text-[11px] font-medium tabular-nums",
          overdue ? "text-red-700" : soon ? "text-amber-700" : "text-neutral-700"
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
      return (
        <span className={cn("text-[11px] font-semibold tabular-nums", n > 0 ? "text-red-700" : "text-neutral-400")}>
          {n > 0 ? n : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => (
      <span className="text-[11px] text-neutral-600 tabular-nums">{row.getValue("confidence")}</span>
    ),
  },
];

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc")  return <ArrowUp   size={10} className="shrink-0 text-[var(--color-dark-blue-600)]" />;
  if (direction === "desc") return <ArrowDown  size={10} className="shrink-0 text-[var(--color-dark-blue-600)]" />;
  return <ArrowUpDown size={10} className="shrink-0 text-neutral-300" />;
}

// ─── DRG Group header row ─────────────────────────────────────────────────────

function DrgGroupRow({
  group,
  expanded,
  onToggle,
}: {
  group: DrgGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const priorityDot: Record<string, string> = {
    High:   "bg-red-500",
    Medium: "bg-amber-500",
    Low:    "bg-neutral-400",
  };
  return (
    <tr
      className="cursor-pointer select-none hover:bg-[var(--color-dark-blue-000)] transition-colors"
      style={{ background: "var(--color-neutral-050)" }}
      onClick={onToggle}
      aria-expanded={expanded}
    >
      <td colSpan={ENTITY_COLUMNS.length + 1} className="px-4 py-2.5 border-b" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div className="flex items-center gap-3">
          {/* Expand chevron */}
          <span className="shrink-0 text-neutral-400">
            {expanded
              ? <ChevronDown  size={13} aria-hidden />
              : <ChevronRight size={13} aria-hidden />
            }
          </span>

          {/* DRG name */}
          <span className="text-[12px] font-bold text-neutral-800">{group.drgName}</span>

          {/* Priority dot */}
          <span className={cn("w-2 h-2 rounded-full shrink-0", priorityDot[group.priority] ?? "bg-neutral-400")} title={`Priority: ${group.priority}`} />

          {/* Entity count badge */}
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold border border-neutral-200 text-neutral-500 bg-white">
            {group.entityCount} {group.entityCount === 1 ? "entity" : "entities"}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ─── Entity row ───────────────────────────────────────────────────────────────

function EntityDataRow({ row }: { row: Row<EntityRow> }) {
  const navigate = useNavigate();
  return (
    <tr
      className="group cursor-pointer hover:bg-[var(--color-dark-blue-000)] transition-colors"
      onClick={() => navigate("/case")}
      role="button"
      aria-label={`View case for ${row.getValue("name")}`}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="px-4 py-2.5 border-b align-middle"
          style={{ borderColor: "var(--color-neutral-100)" }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
      {/* Navigate arrow */}
      <td className="pr-3 border-b align-middle" style={{ borderColor: "var(--color-neutral-100)" }}>
        <NavArrow size={12} className="text-neutral-300 group-hover:text-[var(--color-dark-blue-600)] transition-colors" aria-hidden />
      </td>
    </tr>
  );
}

// ─── Main grid ────────────────────────────────────────────────────────────────

type DrgEntityGridProps = {
  groups: DrgGroup[];
  filters: WorkQueueFilterState;
};

export function DrgEntityGrid({ groups, filters }: DrgEntityGridProps) {
  const [sorting, setSorting]   = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>(
    // Start with all DRG groups expanded
    Object.fromEntries(groups.map((_, i) => [String(i), true]))
  );

  // Flatten + filter entities, tracking which DRG they belong to
  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => ({
        ...g,
        entities: g.entities.filter((e) => {
          if (filters.search) {
            const q = filters.search.toLowerCase();
            if (!e.name.toLowerCase().includes(q) && !g.drgName.toLowerCase().includes(q)) return false;
          }
          if (filters.riskRatings.length > 0 && !filters.riskRatings.includes(e.riskRating)) return false;
          if (filters.priorities.length > 0  && !filters.priorities.includes(e.priority))   return false;
          if (filters.statuses.length > 0    && !filters.statuses.includes(e.caseStatus))   return false;
          if (filters.reviewType !== "all")  return true; // reviewType filter is DRG-level
          return true;
        }),
      }))
      .filter((g) => g.entities.length > 0);
  }, [groups, filters]);

  // Build a flat entity list for TanStack Table (one table per DRG group)
  // We handle grouping manually via DrgGroupRow above TanStack Table rows
  const table = useReactTable({
    data:            [],       // placeholder — we render per-group below
    columns:         ENTITY_COLUMNS,
    state:           { sorting },
    onSortingChange: setSorting,
    getCoreRowModel:     getCoreRowModel(),
    getSortedRowModel:   getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  if (filteredGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <p className="text-[13px]">No entities match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <table className="w-full border-collapse text-left" role="grid" aria-label="Work Queue — DRG entity grid">
        {/* ── Sticky column headers ── */}
        <thead className="sticky top-0 z-10" style={{ background: "var(--color-neutral-050)" }}>
          <tr>
            {table.getFlatHeaders().map((header) => (
              <th
                key={header.id}
                className="px-4 py-2 border-b text-[9px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap select-none"
                style={{ borderColor: "var(--color-neutral-200)", cursor: header.column.getCanSort() ? "pointer" : "default" }}
                onClick={header.column.getToggleSortingHandler()}
                aria-sort={
                  header.column.getIsSorted() === "asc"  ? "ascending"  :
                  header.column.getIsSorted() === "desc" ? "descending" :
                  "none"
                }
              >
                <div className="flex items-center gap-1">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <SortIcon direction={header.column.getIsSorted()} />
                  )}
                </div>
              </th>
            ))}
            <th className="w-6 border-b" style={{ borderColor: "var(--color-neutral-200)" }} aria-hidden />
          </tr>
        </thead>

        {/* ── DRG groups + entity rows ── */}
        <tbody>
          {filteredGroups.map((group, gi) => {
            const isExpanded = !!(expanded as Record<string, boolean>)[String(gi)];

            // Per-group table for correct sorting within group
            return (
              <GroupSection
                key={group.id}
                group={group}
                groupIndex={gi}
                isExpanded={isExpanded}
                sorting={sorting}
                onToggle={() =>
                  setExpanded((prev) => {
                    const p = prev as Record<string, boolean>;
                    return { ...p, [String(gi)]: !p[String(gi)] };
                  })
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Per-group section (own TanStack table for per-group sorting) ─────────────

function GroupSection({
  group,
  groupIndex,
  isExpanded,
  sorting,
  onToggle,
}: {
  group: DrgGroup;
  groupIndex: number;
  isExpanded: boolean;
  sorting: SortingState;
  onToggle: () => void;
}) {
  const groupTable = useReactTable({
    data:            group.entities,
    columns:         ENTITY_COLUMNS,
    state:           { sorting },
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <DrgGroupRow group={group} expanded={isExpanded} onToggle={onToggle} />
      {isExpanded &&
        groupTable.getRowModel().rows.map((row) => (
          <EntityDataRow key={`${groupIndex}-${row.id}`} row={row} />
        ))
      }
    </>
  );
}
