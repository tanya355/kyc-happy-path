/**
 * TanStack Query hooks for case-related API calls.
 *
 * queryKey conventions:
 *   ['cases']              → full case list
 *   ['cases', id]          → single case detail
 *   ['dashboard-metrics']  → analyst KPI counts
 */

import { useQuery } from "@tanstack/react-query";
import type { ApiDashboardMetrics } from "@/lib/api/types";
import { STALE_TIME_MS } from "@/lib/utils/constants";

// ── Mock data (replace with apiClient.get() when API is ready) ────

const MOCK_METRICS: ApiDashboardMetrics = {
  totalCases:          42,
  inProgress:          18,
  completedThisWeek:    9,
  breachingSla:         3,
  avgResolutionDays:   4.2,
};

// ── Hooks ─────────────────────────────────────────────────────────

export function useDashboardMetrics() {
  return useQuery<ApiDashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => MOCK_METRICS,
    staleTime: STALE_TIME_MS,
  });
}
