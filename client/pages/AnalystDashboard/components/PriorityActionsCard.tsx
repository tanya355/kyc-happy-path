import { Link } from "react-router";
import { ChevronRight, ExternalLink, ShieldAlert } from "lucide-react";
import type { ActionDetail, AiPriorityAction } from "../AnalystDashboardData";

type PriorityActionsCardProps = {
  actions: AiPriorityAction[];
  actionDetails: Record<number, ActionDetail>;
  activeAction: number | null;
  onToggle: (idx: number) => void;
  variant?: "compact" | "spacious";
  showHeader?: boolean;
};

export function PriorityActionsCard({
  actions,
  actionDetails,
  activeAction,
  onToggle,
  variant = "compact",
  showHeader = true,
}: PriorityActionsCardProps) {
  const compact = variant === "compact";

  return (
    <div>
      {showHeader && (
        <div className={`flex items-center gap-1.5 ${compact ? "mb-2" : "mb-3"}`}>
          <ShieldAlert size={12} className="text-ds-neutral-700" />
          <p
            className={`font-bold uppercase tracking-wider text-ds-neutral-700 ${compact ? "" : "text-[10px]"}`}
            style={compact ? { fontSize: "var(--label-small-size)" } : undefined}
          >
            AI-Recommended Actions
          </p>
        </div>
      )}
      <div className={`flex flex-col ${compact ? "gap-2" : "gap-2.5"}`}>
        {actions.map((action, i) => {
          const isCritical = action.urgency === "critical";
          const isOpen = activeAction === i;
          const cardBorder = isCritical
            ? "1px solid var(--color-red-200)"
            : "1px solid var(--color-neutral-200)";
          const cardBg = isCritical
            ? "var(--color-red-000)"
            : "var(--color-base-white)";
          const detail = actionDetails[i];

          return (
            <div
              key={i}
              className={`rounded-lg overflow-hidden${compact ? ` anim-fade-slide-up anim-delay-${i}` : ""}`}
              style={{ border: cardBorder, background: cardBg }}
            >
              <div
                onClick={() => onToggle(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(i);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-label={`${action.title}. ${action.context}`}
                className={
                  compact
                    ? "flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:brightness-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-dark-blue-600 rounded-t-lg"
                    : "flex items-start gap-3 px-4 py-3 cursor-pointer hover:brightness-[0.97] transition-all"
                }
              >
                <span
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${action.dot}`}
                  aria-hidden="true"
                />
                <div className={compact ? "flex-1 min-w-0" : "flex-1"}>
                  {compact ? (
                    <>
                      <p
                        className="font-semibold text-ds-neutral-900 leading-snug"
                        style={{ fontSize: "var(--body-small-size)" }}
                      >
                        {action.title}
                      </p>
                      <p
                        className={`mt-0.5 leading-snug ${isCritical ? "text-ds-red-700" : "text-ds-neutral-600"}`}
                        style={{ fontSize: "var(--label-small-size)" }}
                      >
                        {action.context}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] font-semibold text-ds-neutral-900">
                        {action.title}
                      </p>
                      <p
                        className={`text-[12px] mt-0.5 leading-snug ${isCritical ? "text-ds-red-700" : "text-ds-neutral-600"}`}
                      >
                        {action.context}
                      </p>
                    </>
                  )}
                </div>
                {compact ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {i === 0 && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full font-medium"
                        style={{
                          border: "1px solid var(--color-neutral-300)",
                          color: "var(--color-neutral-700)",
                          background: "var(--color-base-white)",
                          fontSize: "var(--label-small-size)",
                        }}
                      >
                        Recommended
                      </span>
                    )}
                    <ChevronRight
                      size={13}
                      className="text-ds-neutral-400 transition-transform"
                      style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                  </div>
                ) : (
                  <ChevronRight
                    size={13}
                    className="text-ds-neutral-400 shrink-0 mt-0.5 transition-transform"
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                )}
              </div>

              {isOpen && detail && (
                <div
                  className={
                    compact
                      ? "px-3 pb-3 anim-fade-slide-up anim-delay-0"
                      : "px-4 pb-4 pt-1"
                  }
                  style={{ borderTop: "1px solid var(--color-neutral-100)" }}
                >
                  {compact ? (
                    <>
                      <p
                        className="font-bold text-ds-neutral-900 mt-2.5 mb-1.5"
                        style={{ fontSize: "var(--body-small-size)" }}
                      >
                        {detail.title}
                      </p>
                      <p
                        className="leading-relaxed mb-1.5"
                        style={{
                          fontSize: "var(--label-small-size)",
                          color: "var(--color-neutral-800)",
                        }}
                      >
                        <span className="font-bold">Reasoning: </span>
                        {detail.reasoning}
                      </p>
                      <p
                        className="leading-relaxed mb-2.5"
                        style={{
                          fontSize: "var(--label-small-size)",
                          color: "var(--color-neutral-800)",
                        }}
                      >
                        <span className="font-bold">Flagged for Risk: </span>
                        {detail.flaggedFor}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] font-bold text-ds-neutral-900 mb-1">
                        {detail.title}
                      </p>
                      <p className="text-[12px] leading-relaxed text-ds-neutral-700 mb-1">
                        <span className="font-semibold">Reasoning: </span>
                        {detail.reasoning}
                      </p>
                      <p className="text-[12px] leading-relaxed text-ds-neutral-700 mb-2.5">
                        <span className="font-semibold">Flagged for Risk: </span>
                        {detail.flaggedFor}
                      </p>
                    </>
                  )}
                  <div
                    className="pt-2"
                    style={{ borderTop: "1px solid var(--color-neutral-100)" }}
                  >
                    <Link
                      to={detail.actionTo}
                      state={detail.actionState}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-ds-dark-blue-600 hover:underline transition-colors"
                    >
                      {detail.actionLabel}
                      <ExternalLink size={10} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
