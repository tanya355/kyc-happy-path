import { Activity, Maximize2, Paperclip, Zap } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";
import type {
  ActionDetail,
  AiPriorityAction,
} from "../AnalystDashboardData";
import type { KpiContext } from "./KpiStrip";
import { PriorityActionsCard } from "./PriorityActionsCard";

export type FollowUpMessage = {
  role: "user" | "agent";
  text: string;
};

type AIAssistantPanelProps = {
  actions: AiPriorityAction[];
  actionDetails: Record<number, ActionDetail>;
  activeAction: number | null;
  onToggleAction: (idx: number) => void;
  kpiContext: KpiContext | null;
  onClearKpiContext: () => void;
  followUpThread: FollowUpMessage[];
  followUpThinking: boolean;
  aiInput: string;
  onAiInputChange: (value: string) => void;
  onSendFollowUp: () => void;
  onExpand: () => void;
};

export function AIAssistantPanel({
  actions,
  actionDetails,
  activeAction,
  onToggleAction,
  kpiContext,
  onClearKpiContext,
  followUpThread,
  followUpThinking,
  aiInput,
  onAiInputChange,
  onSendFollowUp,
  onExpand,
}: AIAssistantPanelProps) {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: "var(--color-base-white)",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: 10,
        minHeight: 0,
        flex: "3 1 0",
      }}
    >
      <div
        className="shrink-0 px-4 pt-4 pb-3 flex flex-col gap-3"
        style={{ borderBottom: "1px solid var(--color-neutral-100)" }}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-ds-dark-blue-600 shrink-0" />
          <span className="text-[14px] font-bold text-ds-neutral-900">
            AI Operations Context
          </span>
          <button
            onClick={onExpand}
            className="ml-auto w-6 h-6 flex items-center justify-center rounded text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-ds-dark-blue-600"
            aria-label="Expand AI Operations Context panel"
          >
            <Maximize2 size={12} aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[12px] font-semibold text-ds-neutral-900">
            Alex, your operations are at risk today.
          </p>
          <p className="text-[11px] leading-relaxed text-ds-neutral-900">
            AI has identified 3 SLA breaches within 24 hours, a growing
            Decision Support backlog, and 2 unresolved compliance alerts
            requiring immediate action.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 pt-3 pb-2 flex flex-col gap-3">
        {kpiContext && (
          <div
            className="rounded-lg p-3 anim-fade-slide-up anim-delay-0"
            style={{
              background: "var(--color-dark-blue-000)",
              border: "1px solid var(--color-dark-blue-100)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-ds-dark-blue-600" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-ds-dark-blue-600">
                  AI Analysis — {kpiContext.label}
                </span>
              </div>
              <button
                onClick={onClearKpiContext}
                className="text-ds-neutral-600 hover:text-ds-neutral-900 text-[12px] leading-none"
              >
                ×
              </button>
            </div>

            {kpiContext.allFrames && (
              <div
                className="mb-3 rounded-md overflow-hidden"
                style={{
                  border: "1px solid var(--color-dark-blue-150, #c5d8f0)",
                }}
              >
                {kpiContext.allFrames.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1.5"
                    style={{
                      background:
                        i % 2 === 0
                          ? "var(--color-dark-blue-000)"
                          : "var(--color-blend-600)",
                      borderBottom:
                        i < kpiContext.allFrames!.length - 1
                          ? "1px solid var(--color-dark-blue-100)"
                          : undefined,
                    }}
                  >
                    <span className="text-[13px] font-bold text-ds-neutral-900 leading-none">
                      {f.value}
                      {f.unit ? (
                        <span className="text-[11px] font-medium ml-1 text-ds-neutral-600">
                          {f.unit}
                        </span>
                      ) : null}
                    </span>
                    {f.sub && (
                      <span
                        className="text-[11px] font-medium"
                        style={{
                          color: f.subColor ?? "var(--color-neutral-900)",
                        }}
                      >
                        {f.sub}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-ds-neutral-700 leading-relaxed mb-2">
              {kpiContext.summary}
            </p>
            <div className="flex flex-col gap-1">
              {(kpiContext.points ?? []).map((pt, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[10px] font-bold text-ds-dark-blue-600 shrink-0 mt-0.5">
                    {i + 1}.
                  </span>
                  <p className="text-[10px] text-ds-neutral-700 leading-snug">
                    {pt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <PriorityActionsCard
          actions={actions}
          actionDetails={actionDetails}
          activeAction={activeAction}
          onToggle={onToggleAction}
          variant="compact"
        />

        <div>
          <div className="h-px bg-ds-neutral-100 mb-3" />
          <p
            className="font-semibold uppercase tracking-wider text-ds-neutral-700 mb-2"
            style={{
              fontSize: "var(--label-small-size)",
              lineHeight: "var(--label-small-line-height)",
            }}
          >
            Ask a follow-up
          </p>

          {followUpThread.length > 0 && (
            <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
              {followUpThread.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "agent" && (
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-1.5 mt-0.5"
                      style={{
                        background: "linear-gradient(135deg, #00338D, #4F46E5)",
                      }}
                      aria-hidden="true"
                    >
                      <Zap size={9} className="text-white" aria-hidden="true" />
                    </div>
                  )}
                  <div
                    className="px-2.5 py-2 rounded-lg text-[11px] leading-relaxed max-w-[88%]"
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--color-dark-blue-600)"
                          : "var(--color-neutral-000)",
                      color:
                        msg.role === "user"
                          ? "var(--color-base-white)"
                          : "var(--color-neutral-800)",
                      border:
                        msg.role === "agent"
                          ? "1px solid var(--color-neutral-200)"
                          : "none",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {followUpThinking && (
                <div className="flex justify-start">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-1.5 mt-0.5"
                    style={{
                      background: "linear-gradient(135deg, #00338D, #4F46E5)",
                    }}
                  >
                    <Zap size={9} className="text-white" />
                  </div>
                  <div
                    className="px-2.5 py-2 rounded-lg flex items-center gap-1"
                    style={{
                      background: "var(--color-neutral-050, #fafafa)",
                      border: "1px solid var(--color-neutral-200)",
                    }}
                  >
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-ds-neutral-300"
                        style={{
                          animation: `pulse 1.2s ease-in-out ${d * 0.22}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            className="rounded-lg flex flex-col gap-2 p-2"
            style={{ border: "1px solid var(--color-dark-blue-200)" }}
          >
            <textarea
              value={aiInput}
              onChange={(e) => onAiInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendFollowUp();
                }
              }}
              placeholder="Ask a follow up question"
              aria-label="Ask a follow-up question to the AI agent"
              rows={2}
              className="w-full text-[12px] bg-transparent outline-none text-ds-neutral-600 placeholder:text-ds-neutral-400 resize-none focus-visible:ring-1 focus-visible:ring-ds-dark-blue-400 rounded"
            />
            <div className="flex items-center justify-between">
              <button
                className="w-6 h-6 flex items-center justify-center rounded-md text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-ds-dark-blue-600"
                aria-label="Attach file"
              >
                <Paperclip size={13} aria-hidden="true" />
              </button>
              <Button
                variant="outlined"
                size="small"
                label="Ask"
                onClick={onSendFollowUp}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
