/**
 * RiskBadge — displays compliance risk rating (Elevated / Moderate / Minimal).
 *
 * CRITICAL TERMINOLOGY (§1.12):
 *   Risk Rating is compliance-driven. The three values are Elevated, Moderate, Minimal.
 *   NEVER use "High/Medium/Low" for risk rating.
 *
 * Used on: Analyst Dashboard, Work Queue grids, Case Header.
 */

import { cn } from "@/lib/cn";
import type { RiskRating } from "@/lib/utils/enums";

type RiskBadgeProps = {
  rating: RiskRating | null;
  className?: string;
};

const CLASSES: Record<RiskRating, string> = {
  Elevated: "bg-red-50 text-red-700 border-red-200",
  Moderate: "bg-amber-50 text-amber-800 border-amber-200",
  Minimal:  "bg-green-50 text-green-700 border-green-200",
};

export function RiskBadge({ rating, className }: RiskBadgeProps) {
  if (!rating) return null;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", CLASSES[rating], className)}>
      {rating}
    </span>
  );
}
