/**
 * TanStack Query hooks for exception-related API calls.
 *
 * queryKey conventions:
 *   ['exceptions', caseId] → exceptions for a specific case
 */

import { useQuery } from "@tanstack/react-query";
import type { ApiException } from "@/lib/api/types";
import { STALE_TIME_MS } from "@/lib/utils/constants";

const MOCK_EXCEPTIONS: ApiException[] = [
  { id: "exc-001", title: "Authorized Signatory Title Discrepancy", severity: "high",   status: "open",     entity: "BlackRock Advisors",      caseNumber: "KYC-28821", createdAt: "2026-04-10" },
  { id: "exc-002", title: "UBO Documentation Missing",              severity: "high",   status: "pending",  entity: "BlackRock Institutional",  caseNumber: "KYC-28834", createdAt: "2026-04-12" },
  { id: "exc-003", title: "Jurisdiction Verification Required",     severity: "medium", status: "open",     entity: "Entity 13",                caseNumber: "KYC-29107", createdAt: "2026-04-14" },
  { id: "exc-004", title: "PEP Screening Inconclusive",             severity: "medium", status: "resolved", entity: "BlackRock Advisors",       caseNumber: "KYC-28821", createdAt: "2026-04-08" },
  { id: "exc-005", title: "Address Verification Pending",           severity: "low",    status: "open",     entity: "BlackRock Institutional",  caseNumber: "KYC-28834", createdAt: "2026-04-15" },
];

export function useExceptions(caseId?: string) {
  return useQuery<ApiException[]>({
    queryKey: ["exceptions", caseId ?? "all"],
    queryFn: async () => MOCK_EXCEPTIONS,
    staleTime: STALE_TIME_MS,
    enabled: true,
  });
}
