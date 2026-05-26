/**
 * Formatting utilities for dates, risk labels, case IDs, and other display values.
 *
 * All functions are pure — no side effects, no imports from views/.
 */

import type { CaseStatus, RiskRating, Priority } from "./enums";

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });
}

export function isDueSoon(iso: string, thresholdDays = 3): boolean {
  const msPerDay = 86_400_000;
  const diff = new Date(iso).getTime() - Date.now();
  return diff >= 0 && diff <= thresholdDays * msPerDay;
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

// ─── Domain label formatters ──────────────────────────────────────────────────

/** Human-readable label for CaseStatus values. */
export function caseStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    not_started:        "Not Started",
    in_progress_agents: "Agent Processing",
    analyst_review:     "Analyst Review",
    qa_review:          "QA Review",
    complete:           "Complete",
  };
  return labels[status];
}

/** Tailwind color classes for CaseStatus badges. */
export function caseStatusClasses(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    not_started:        "bg-neutral-100 text-neutral-600 border-neutral-200",
    in_progress_agents: "bg-blue-50 text-blue-700 border-blue-200",
    analyst_review:     "bg-amber-50 text-amber-800 border-amber-200",
    qa_review:          "bg-purple-50 text-purple-700 border-purple-200",
    complete:           "bg-green-50 text-green-700 border-green-200",
  };
  return map[status];
}

/** Tailwind color classes for RiskRating badges. */
export function riskRatingClasses(rating: RiskRating): string {
  const map: Record<RiskRating, string> = {
    Elevated: "bg-red-50 text-red-700 border-red-200",
    Moderate: "bg-amber-50 text-amber-800 border-amber-200",
    Minimal:  "bg-green-50 text-green-700 border-green-200",
  };
  return map[rating];
}

/** Tailwind color classes for Priority indicators. */
export function priorityClasses(priority: Priority): string {
  const map: Record<Priority, string> = {
    High:   "text-red-700",
    Medium: "text-amber-700",
    Low:    "text-neutral-500",
  };
  return map[priority];
}
