/**
 * api/types.ts — wire-level type contracts for the Experience Service API.
 *
 * KEY PATTERN: ApiCaseStatus covers all backend values (incl. blocked/paused/abandoned).
 * UI components only receive the narrower CaseStatus after caller-side narrowing.
 * See lib/utils/enums.ts for display-level types.
 */

import type { CaseStatus } from "@/lib/utils/enums";

// ── Wire status (superset of display CaseStatus) ──────────────────
export type ApiCaseStatus = CaseStatus | "blocked" | "paused" | "abandoned";

// ── API response shapes ───────────────────────────────────────────

export type ApiEntity = {
  id: string;
  name: string;
  customerType: string;
  dueDate: string;
  jurisdiction: string;
  priority: string;
  riskRating: string;
  confidence: string;
  openExceptions: number;
  caseStatus: ApiCaseStatus;
};

export type ApiDrgGroup = {
  id: string;
  drgName: string;
  priority: string;
  entityCount: number;
  entities: ApiEntity[];
};

export type ApiQueueMetrics = {
  total: number;
  analystReview: number;
  pendingFeedback: number;
  breachingToday: number;
  completedThisWeek: number;
};

export type ApiException = {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  status: "open" | "resolved" | "pending";
  entity: string;
  caseNumber: string;
  createdAt: string;
};

export type ApiDashboardMetrics = {
  totalCases: number;
  inProgress: number;
  completedThisWeek: number;
  breachingSla: number;
  avgResolutionDays: number;
};
