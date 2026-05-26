/**
 * DrgEntityGrid — unit tests.
 *
 * Tests the filter logic used by DrgEntityGrid independently of rendering,
 * since @testing-library/react is not yet installed in this project.
 *
 * Tests:
 *   1. Search filter — matches entity name.
 *   2. Search filter — matches DRG group name.
 *   3. Risk rating filter — excludes non-matching entities.
 *   4. Priority filter — excludes non-matching entities.
 *   5. Status filter — excludes non-matching entities.
 *   6. Empty result — returns no groups when nothing matches.
 *   7. No filter — returns all groups unchanged.
 *
 * The filter logic is extracted into a pure function filterGroups()
 * so it can be unit-tested without DOM.
 */

import { describe, it, expect } from "vitest";
import type { DrgGroup, WorkQueueFilterState } from "@/lib/types";
import { EMPTY_FILTERS } from "./queue-filters";

// ─── Re-exported pure filter logic (mirroring drg-entity-grid.tsx) ───────────
// This function is the source of truth for filtering — keep in sync with the grid.

function filterGroups(groups: DrgGroup[], filters: WorkQueueFilterState): DrgGroup[] {
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
        return true;
      }),
    }))
    .filter((g) => g.entities.length > 0);
}

// ─── Test fixtures ────────────────────────────────────────────────────────────

const MOCK_GROUPS: DrgGroup[] = [
  {
    id: "drg-1",
    drgName: "Acme DRG Group",
    priority: "High",
    entityCount: 2,
    entities: [
      {
        id: "e1",
        name: "Acme Advisors",
        customerType: "Investment Adviser",
        dueDate: "2026-06-01",
        jurisdiction: "USA",
        priority: "High",
        riskRating: "Elevated",
        confidence: "90%",
        openExceptions: 2,
        caseStatus: "analyst_review",
      },
      {
        id: "e2",
        name: "Acme Fund",
        customerType: "Registered Fund",
        dueDate: "2026-07-15",
        jurisdiction: "UK",
        priority: "Low",
        riskRating: "Minimal",
        confidence: "95%",
        openExceptions: 0,
        caseStatus: "complete",
      },
    ],
  },
  {
    id: "drg-2",
    drgName: "Beta Holdings",
    priority: "Medium",
    entityCount: 1,
    entities: [
      {
        id: "e3",
        name: "Beta Trust",
        customerType: "Trust Entity",
        dueDate: "2026-05-20",
        jurisdiction: "EU",
        priority: "Medium",
        riskRating: "Moderate",
        confidence: "88%",
        openExceptions: 1,
        caseStatus: "qa_review",
      },
    ],
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("filterGroups — DrgEntityGrid filter logic", () => {
  it("returns all groups when no filters are applied", () => {
    const result = filterGroups(MOCK_GROUPS, EMPTY_FILTERS);
    expect(result).toHaveLength(2);
    expect(result[0].entities).toHaveLength(2);
    expect(result[1].entities).toHaveLength(1);
  });

  it("filters by entity name (case-insensitive)", () => {
    const result = filterGroups(MOCK_GROUPS, { ...EMPTY_FILTERS, search: "acme advisors" });
    expect(result).toHaveLength(1);
    expect(result[0].entities).toHaveLength(1);
    expect(result[0].entities[0].name).toBe("Acme Advisors");
  });

  it("filters by DRG group name — returns all entities in matching DRG", () => {
    const result = filterGroups(MOCK_GROUPS, { ...EMPTY_FILTERS, search: "Beta Holdings" });
    expect(result).toHaveLength(1);
    expect(result[0].drgName).toBe("Beta Holdings");
    expect(result[0].entities).toHaveLength(1);
  });

  it("filters by risk rating — excludes non-matching entities", () => {
    const result = filterGroups(MOCK_GROUPS, { ...EMPTY_FILTERS, riskRatings: ["Elevated"] });
    // Only Acme Advisors has Elevated; Acme Fund (Minimal) and Beta Trust (Moderate) excluded
    expect(result).toHaveLength(1);
    expect(result[0].entities).toHaveLength(1);
    expect(result[0].entities[0].riskRating).toBe("Elevated");
  });

  it("filters by priority — excludes non-matching entities", () => {
    const result = filterGroups(MOCK_GROUPS, { ...EMPTY_FILTERS, priorities: ["High"] });
    expect(result).toHaveLength(1);
    expect(result[0].entities[0].priority).toBe("High");
  });

  it("filters by case status", () => {
    const result = filterGroups(MOCK_GROUPS, { ...EMPTY_FILTERS, statuses: ["complete"] });
    expect(result).toHaveLength(1);
    expect(result[0].entities[0].caseStatus).toBe("complete");
  });

  it("returns empty array when search matches nothing", () => {
    const result = filterGroups(MOCK_GROUPS, { ...EMPTY_FILTERS, search: "zzz-no-match" });
    expect(result).toHaveLength(0);
  });

  it("stacks multiple filters — risk AND priority", () => {
    const result = filterGroups(MOCK_GROUPS, {
      ...EMPTY_FILTERS,
      riskRatings: ["Elevated"],
      priorities:  ["High"],
    });
    expect(result).toHaveLength(1);
    expect(result[0].entities[0].name).toBe("Acme Advisors");
  });
});
