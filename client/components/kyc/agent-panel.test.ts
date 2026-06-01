/**
 * Agent panel components — unit tests.
 *
 * Tests pure logic for RunAgentsModal and AgentReviewPanel
 * without DOM rendering (no @testing-library/react installed).
 *
 * Tests:
 *   RunAgentsModal / AVAILABLE_AGENTS:
 *     1. All agents have required fields.
 *     2. Agent IDs are unique.
 *     3. Categories match the allowed set.
 *
 *   AgentReviewPanel (logic extracted):
 *     4. Findings sort correctly (disagree → flag → agree).
 *     5. Progress % is 0 when nothing actioned.
 *     6. Progress % is 100 when all actionable items resolved.
 *     7. Tab filter "action" excludes agreed findings.
 *     8. Tab filter "confirmed" includes only agreed findings.
 *     9. Tab filter "all" returns all findings.
 */

import { describe, it, expect } from "vitest";
import { AVAILABLE_AGENTS } from "./RunAgentsModal";

// ── Helpers (mirrors AgentReviewPanel logic) ──────────────────────────

const FINDINGS = [
  { id: "ar1", verdict: "disagree" as const },
  { id: "ar2", verdict: "agree" as const },
  { id: "ar3", verdict: "disagree" as const },
  { id: "ar4", verdict: "flag" as const },
];

function sortFindings(findings: typeof FINDINGS) {
  const order = { disagree: 0, flag: 1, agree: 2 };
  return [...findings].sort((a, b) => order[a.verdict] - order[b.verdict]);
}

function calcProgress(findings: typeof FINDINGS, actions: Record<string, string | null>) {
  const actionable = findings.filter(f => f.verdict !== "agree");
  const actioned = actionable.filter(f => !!actions[f.id]).length;
  return actionable.length > 0 ? Math.round((actioned / actionable.length) * 100) : 100;
}

function filterByTab(
  findings: typeof FINDINGS,
  tab: "all" | "action" | "confirmed"
) {
  if (tab === "action") return findings.filter(f => f.verdict !== "agree");
  if (tab === "confirmed") return findings.filter(f => f.verdict === "agree");
  return findings;
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("AVAILABLE_AGENTS", () => {
  it("all agents have required fields", () => {
    for (const agent of AVAILABLE_AGENTS) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.description).toBeTruthy();
      expect(agent.category).toBeTruthy();
    }
  });

  it("agent IDs are unique", () => {
    const ids = AVAILABLE_AGENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("categories belong to the expected set", () => {
    const allowed = new Set(["Verification", "Risk", "Screening", "Outreach", "Compliance"]);
    for (const agent of AVAILABLE_AGENTS) {
      expect(allowed.has(agent.category)).toBe(true);
    }
  });
});

describe("AgentReviewPanel logic", () => {
  it("sorts findings: disagree first, then flag, then agree", () => {
    const sorted = sortFindings(FINDINGS);
    expect(sorted[0].verdict).toBe("disagree");
    expect(sorted[1].verdict).toBe("disagree");
    expect(sorted[2].verdict).toBe("flag");
    expect(sorted[3].verdict).toBe("agree");
  });

  it("progress is 0% when nothing is actioned", () => {
    const pct = calcProgress(FINDINGS, {});
    expect(pct).toBe(0);
  });

  it("progress is 100% when all actionable items are resolved", () => {
    const actions: Record<string, string> = { ar1: "accepted", ar3: "accepted", ar4: "accepted" };
    const pct = calcProgress(FINDINGS, actions);
    expect(pct).toBe(100);
  });

  it("tab 'action' excludes agree findings", () => {
    const result = filterByTab(FINDINGS, "action");
    expect(result.some(f => f.verdict === "agree")).toBe(false);
    expect(result.length).toBe(3);
  });

  it("tab 'confirmed' includes only agree findings", () => {
    const result = filterByTab(FINDINGS, "confirmed");
    expect(result.every(f => f.verdict === "agree")).toBe(true);
    expect(result.length).toBe(1);
  });

  it("tab 'all' returns all findings", () => {
    const result = filterByTab(FINDINGS, "all");
    expect(result.length).toBe(FINDINGS.length);
  });
});
