/**
 * TanStack Query hooks for the Work Queue page.
 *
 * queryKey conventions:
 *   ['work-queue']     → DRG-grouped queue list
 *   ['queue-metrics']  → aggregate counts (polled every 15 s)
 *
 * Data is currently mocked locally. Replace `queryFn` bodies with
 * `apiClient.get(...)` calls once the Experience Service endpoints are ready.
 */

import { useQuery } from "@tanstack/react-query";
import type { DrgGroup, QueueMetrics } from "@/lib/types";
import { STALE_TIME_MS, POLL_INTERVAL_MS } from "@/lib/utils/constants";

// ─── Mock data ────────────────────────────────────────────────────────────────
// Remove this block and replace queryFn bodies with apiClient calls when API is ready.

const MOCK_GROUPS: DrgGroup[] = [
  {
    id: "blackrock",
    drgName: "BlackRock DRG Group",
    priority: "High",
    entityCount: 6,
    entities: [
      { id: "advisors",      name: "BlackRock Advisors",      customerType: "Registered Investment Adviser", dueDate: "2026-04-25", jurisdiction: "USA",  priority: "High",   riskRating: "Elevated", confidence: "90%", openExceptions: 1, caseStatus: "analyst_review"     },
      { id: "institutional", name: "BlackRock Institutional",  customerType: "Institutional Investor",       dueDate: "2026-05-14", jurisdiction: "UK",   priority: "High",   riskRating: "Elevated", confidence: "98%", openExceptions: 3, caseStatus: "not_started"        },
      { id: "entity13",      name: "Entity 13",                customerType: "Investment Entity",            dueDate: "2026-06-28", jurisdiction: "EU",   priority: "Medium", riskRating: "Elevated", confidence: "—",   openExceptions: 1, caseStatus: "not_started"        },
      { id: "entityxx1",     name: "Entity XX",                customerType: "Corporate Fund",               dueDate: "2026-06-29", jurisdiction: "USA",  priority: "Medium", riskRating: "Elevated", confidence: "—",   openExceptions: 1, caseStatus: "in_progress_agents" },
      { id: "entityxx2",     name: "Entity XX",                customerType: "Complex Ownership",            dueDate: "2026-06-29", jurisdiction: "APAC", priority: "Low",    riskRating: "Moderate", confidence: "—",   openExceptions: 1, caseStatus: "not_started"        },
      { id: "entityxx3",     name: "Entity XX",                customerType: "Individual",                   dueDate: "2026-07-06", jurisdiction: "CA",   priority: "Low",    riskRating: "Minimal",  confidence: "—",   openExceptions: 0, caseStatus: "complete"           },
    ],
  },
  {
    id: "vanguard",
    drgName: "Vanguard Institutional",
    priority: "Medium",
    entityCount: 3,
    entities: [
      { id: "v-mgmt",   name: "Vanguard Asset Management",  customerType: "Investment Adviser",  dueDate: "2026-05-10", jurisdiction: "USA", priority: "Medium", riskRating: "Moderate", confidence: "88%", openExceptions: 2, caseStatus: "analyst_review"     },
      { id: "v-trust",  name: "Vanguard Trust Company",     customerType: "Trust Entity",        dueDate: "2026-05-20", jurisdiction: "USA", priority: "Medium", riskRating: "Moderate", confidence: "92%", openExceptions: 1, caseStatus: "in_progress_agents" },
      { id: "v-idx",    name: "Vanguard Index Funds",       customerType: "Registered Fund",     dueDate: "2026-06-05", jurisdiction: "USA", priority: "Low",    riskRating: "Minimal",  confidence: "96%", openExceptions: 0, caseStatus: "qa_review"          },
    ],
  },
  {
    id: "fidelity",
    drgName: "Fidelity Investments LLC",
    priority: "Low",
    entityCount: 2,
    entities: [
      { id: "fi-adv",  name: "Fidelity Advisors",        customerType: "Investment Adviser", dueDate: "2026-05-30", jurisdiction: "USA", priority: "Low", riskRating: "Minimal", confidence: "94%", openExceptions: 0, caseStatus: "not_started" },
      { id: "fi-intl", name: "Fidelity International",   customerType: "Investment Entity",  dueDate: "2026-06-15", jurisdiction: "UK",  priority: "Low", riskRating: "Minimal", confidence: "91%", openExceptions: 0, caseStatus: "not_started" },
    ],
  },
];

const MOCK_METRICS: QueueMetrics = {
  total:             11,
  analystReview:     2,
  pendingFeedback:   1,
  breachingToday:    1,
  completedThisWeek: 3,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useWorkQueue() {
  return useQuery<DrgGroup[]>({
    queryKey: ["work-queue"],
    queryFn: async () => MOCK_GROUPS,
    staleTime: STALE_TIME_MS,
  });
}

export function useQueueMetrics() {
  return useQuery<QueueMetrics>({
    queryKey: ["queue-metrics"],
    queryFn: async () => MOCK_METRICS,
    staleTime: STALE_TIME_MS,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
