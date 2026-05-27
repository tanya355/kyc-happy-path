/**
 * QaWorkHub seed data + types.
 *
 * Map analyst statuses → QA statuses for display in the shared DrgTable,
 * plus toolbar defaults.
 */

export type QaViewKey = "all" | "periodic" | "onboarding";

export interface QaViewOption {
  key: QaViewKey;
  label: string;
}

export const QA_VIEW_OPTIONS: readonly QaViewOption[] = [
  { key: "all", label: "All" },
  { key: "periodic", label: "Periodic Refresh" },
  { key: "onboarding", label: "Onboarding" },
] as const;

export const QA_STATUS_MAP: Record<string, string> = {
  "Not Started": "Ready for QA",
  "In Progress": "QA In Progress",
  "Pending Feedback": "Rework Requested",
  Complete: "Final Closure",
};

export interface QaWorkHubSeed {
  viewOptions: readonly QaViewOption[];
  statusMap: Record<string, string>;
}

export const QA_WORK_HUB_SEED: QaWorkHubSeed = {
  viewOptions: QA_VIEW_OPTIONS,
  statusMap: QA_STATUS_MAP,
};

export function getQaWorkHubData(): QaWorkHubSeed {
  return QA_WORK_HUB_SEED;
}
