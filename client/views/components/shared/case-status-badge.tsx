/**
 * CaseStatusBadge — pill badge for KYC case workflow status.
 *
 * Maps CaseStatus union values to display labels and color classes.
 * Used on Work Queue grids, Dashboard tables, and Case Header.
 */

import { cn } from "@/lib/cn";
import type { CaseStatus } from "@/lib/utils/enums";
import { caseStatusLabel, caseStatusClasses } from "@/lib/utils/format-utils";

type CaseStatusBadgeProps = {
  status: CaseStatus;
  className?: string;
};

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", caseStatusClasses(status), className)}>
      {caseStatusLabel(status)}
    </span>
  );
}
