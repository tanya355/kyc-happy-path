/**
 * Shared TypeScript domain types for the KYC platform.
 *
 * RULES:
 *   - Use `type` aliases (not `interface`).
 *   - Use `import type` when importing these elsewhere.
 *   - No JSX — this file belongs in lib/, not views/.
 *
 * Wire-level vs display-level split:
 *   `ApiCaseStatus` covers all values the API can return (including
 *   backend-only states like `blocked`/`paused`). Components receive
 *   the narrower `CaseStatus` after caller-side narrowing.
 */

import type { CaseStatus, RiskRating, Priority, ReviewType } from "./utils/enums";

// ─── API wire types ───────────────────────────────────────────────────────────

/** All case statuses the Experience Service API may return. */
export type ApiCaseStatus = CaseStatus | "blocked" | "paused" | "abandoned";

// ─── Work Queue ───────────────────────────────────────────────────────────────

export type EntityRow = {
  id: string;
  name: string;
  customerType: string;
  dueDate: string;
  jurisdiction: string;
  priority: Priority;
  riskRating: RiskRating;
  confidence: string;
  openExceptions: number;
  caseStatus: CaseStatus;
};

export type DrgGroup = {
  id: string;
  drgName: string;
  priority: Priority;
  entityCount: number;
  entities: EntityRow[];
};

export type QueueMetrics = {
  total: number;
  analystReview: number;
  pendingFeedback: number;
  breachingToday: number;
  completedThisWeek: number;
};

// ─── Queue filter state ───────────────────────────────────────────────────────

export type WorkQueueFilterState = {
  search: string;
  riskRatings: RiskRating[];
  priorities: Priority[];
  statuses: CaseStatus[];
  jurisdictions: string[];
  reviewType: ReviewType | "all";
};

export type WorkQueueSortKey =
  | "name"
  | "dueDate"
  | "riskRating"
  | "priority"
  | "openExceptions"
  | "caseStatus";
