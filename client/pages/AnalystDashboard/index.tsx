import { useCallback, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Activity, MessageSquare, Paperclip, X, Zap } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";
import { TopNav } from "@/components/kyc/TopNav";
import {
  getAnalystDashboardViewModel,
  type ActionDetail,
  type AiPriorityAction,
} from "./AnalystDashboardData";
import { DashboardHeader } from "./components/DashboardHeader";
import { KpiStrip, type KpiContext } from "./components/KpiStrip";
import { PriorityCasesTable } from "./components/PriorityCasesTable";
import { CasesByStatusCard } from "./components/CasesByStatusCard";
import { CasesTrendChartCard } from "./components/CasesTrendChartCard";
import { ResponseTrendCard } from "./components/ResponseTrendCard";
import { ForecastChartCard } from "./components/ForecastChartCard";
import {
  AIAssistantPanel,
  type FollowUpMessage,
} from "./components/AIAssistantPanel";
import { PriorityActionsCard } from "./components/PriorityActionsCard";
import {
  CollaborationFeed,
  renderCollabIcon,
} from "./components/CollaborationFeed";

const RIGHT_PANE_MIN = 300;
const RIGHT_PANE_MAX = 720;

function getFollowUpResponse(
  input: string,
  responses: Record<string, string>,
): string {
  const lower = input.toLowerCase();
  if (
    lower.includes("sla") ||
    lower.includes("breach") ||
    lower.includes("deadline")
  )
    return responses.sla;
  if (
    lower.includes("risk") ||
    lower.includes("high risk") ||
    lower.includes("flag")
  )
    return responses.risk;
  if (
    lower.includes("overdue") ||
    lower.includes("late") ||
    lower.includes("missed")
  )
    return responses.overdue;
  if (
    lower.includes("summary") ||
    lower.includes("overview") ||
    lower.includes("today")
  )
    return responses.summary;
  return responses.default;
}

type ExpandedDrawerProps = {
  panel: "ai" | "collab";
  onClose: () => void;
  actions: AiPriorityAction[];
  actionDetails: Record<number, ActionDetail>;
  activeAction: number | null;
  onToggleAction: (idx: number) => void;
  followUpThread: FollowUpMessage[];
  followUpThinking: boolean;
  aiInput: string;
  onAiInputChange: (value: string) => void;
  onSendFollowUp: () => void;
  collab: ReturnType<typeof getAnalystDashboardViewModel>["collab"];
};

function ExpandedDrawer({
  panel,
  onClose,
  actions,
  actionDetails,
  activeAction,
  onToggleAction,
  followUpThread,
  followUpThinking,
  aiInput,
  onAiInputChange,
  onSendFollowUp,
  collab,
}: ExpandedDrawerProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-[180]"
        style={{
          background: "rgba(0,20,60,0.3)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 bottom-0 z-[190] flex flex-col"
        style={{
          width: "min(860px, calc(100vw - 48px))",
          background: "var(--color-base-white)",
          borderLeft: "1px solid var(--color-neutral-200)",
          boxShadow: "-8px 0 40px rgba(0,20,60,0.14)",
          animation: "slideInRight 220ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3.5"
          style={{
            borderBottom: "1px solid var(--color-neutral-200)",
            background: "var(--color-dark-blue-000)",
          }}
        >
          <div className="flex items-center gap-2">
            {panel === "ai" ? (
              <>
                <Activity size={14} className="text-ds-dark-blue-600" />
                <span className="text-[14px] font-bold text-ds-neutral-900">
                  AI Operations Context
                </span>
              </>
            ) : (
              <>
                <MessageSquare size={14} className="text-ds-dark-blue-600" />
                <span className="text-[14px] font-bold text-ds-neutral-900">
                  Collaboration & Insights
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ds-neutral-500 hover:text-ds-neutral-800 hover:bg-ds-neutral-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {panel === "ai" ? (
          <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-[1fr_1fr] divide-x divide-ds-neutral-100">
            <div className="flex flex-col overflow-y-auto min-h-0 px-6 pt-5 pb-5 gap-5">
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--color-dark-blue-000)",
                  border: "1px solid var(--color-dark-blue-100)",
                }}
              >
                <p className="text-[13px] font-semibold text-ds-neutral-900 mb-1">
                  Alex, your operations are at risk today.
                </p>
                <p className="text-[12px] leading-relaxed text-ds-neutral-700">
                  AI has identified 3 SLA breaches within 24 hours, a growing
                  Decision Support backlog, and 2 unresolved compliance alerts
                  requiring immediate action.
                </p>
              </div>

              <PriorityActionsCard
                actions={actions}
                actionDetails={actionDetails}
                activeAction={activeAction}
                onToggle={onToggleAction}
                variant="spacious"
              />
            </div>

            <div className="flex flex-col min-h-0 px-6 pt-5 pb-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ds-neutral-700 mb-3">
                Ask a follow-up
              </p>

              <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 mb-4 pr-1">
                {followUpThread.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #00338D, #4F46E5)",
                      }}
                    >
                      <Zap size={16} className="text-white" />
                    </div>
                    <p className="text-[12px] font-semibold text-ds-neutral-700">
                      Ask the AI agent a follow-up
                    </p>
                    <p className="text-[11px] text-ds-neutral-500">
                      Questions about SLA risk, case backlog, compliance
                      alerts, and more.
                    </p>
                  </div>
                )}
                {followUpThread.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "agent" && (
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, #00338D, #4F46E5)",
                        }}
                      >
                        <Zap size={10} className="text-white" />
                      </div>
                    )}
                    <div
                      className="px-3 py-2.5 rounded-xl text-[12px] leading-relaxed max-w-[85%]"
                      style={{
                        background:
                          msg.role === "user"
                            ? "var(--color-dark-blue-600)"
                            : "var(--color-neutral-050, #fafafa)",
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
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #00338D, #4F46E5)",
                      }}
                    >
                      <Zap size={10} className="text-white" />
                    </div>
                    <div
                      className="px-3 py-2.5 rounded-xl flex items-center gap-1.5"
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

              <div
                className="shrink-0 rounded-xl flex flex-col gap-2 p-3"
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
                  placeholder="Ask a follow-up question…"
                  rows={3}
                  className="w-full text-[13px] bg-transparent outline-none text-ds-neutral-700 placeholder:text-ds-neutral-400 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-md text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors"
                    title="Attach file"
                  >
                    <Paperclip size={14} />
                  </button>
                  <Button
                    variant="outlined"
                    size="small"
                    label="Send"
                    onClick={onSendFollowUp}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pt-5 pb-5">
            <div className="flex flex-col gap-0 divide-y divide-ds-neutral-100">
              {collab.map((c, i) => (
                <div key={i} className="flex items-start gap-4 py-4">
                  <div
                    className={`w-9 h-9 rounded-lg ${c.bg} border border-ds-neutral-100 flex items-center justify-center shrink-0`}
                  >
                    {renderCollabIcon(c.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-ds-neutral-900 leading-relaxed">
                      {c.text}
                    </p>
                    <p className="text-[11px] text-ds-neutral-500 mt-1">
                      {c.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function AnalystDashboard() {
  const vm = getAnalystDashboardViewModel();
  const activePeriod = vm.periods.find((p) => p.label === "Today")!;
  const metrics = activePeriod.kpis;

  const [aiInput, setAiInput] = useState("");
  const [followUpThread, setFollowUpThread] = useState<FollowUpMessage[]>([]);
  const [followUpThinking, setFollowUpThinking] = useState(false);
  const [chartRange, setChartRange] = useState("Last 7 Days");
  const [forecastRange, setForecastRange] = useState("30d");
  const [activeAction, setActiveAction] = useState<number | null>(null);
  const [kpiContext, setKpiContext] = useState<KpiContext | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<"ai" | "collab" | null>(
    null,
  );

  const [rightPaneW, setRightPaneW] = useState(440);
  const draggingPane = useRef(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(0);

  const onPaneDragStart = useCallback(
    (e: ReactMouseEvent) => {
      draggingPane.current = true;
      dragStartX.current = e.clientX;
      dragStartW.current = rightPaneW;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        if (!draggingPane.current) return;
        const delta = dragStartX.current - ev.clientX;
        setRightPaneW(
          Math.max(
            RIGHT_PANE_MIN,
            Math.min(RIGHT_PANE_MAX, dragStartW.current + delta),
          ),
        );
      };
      const onUp = () => {
        draggingPane.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    },
    [rightPaneW],
  );

  function sendFollowUp() {
    if (!aiInput.trim() || followUpThinking) return;
    const userText = aiInput.trim();
    setFollowUpThread((prev) => [...prev, { role: "user", text: userText }]);
    setAiInput("");
    setFollowUpThinking(true);
    setTimeout(
      () => {
        setFollowUpThinking(false);
        setFollowUpThread((prev) => [
          ...prev,
          {
            role: "agent",
            text: getFollowUpResponse(userText, vm.followUpResponses),
          },
        ]);
      },
      900 + Math.random() * 500,
    );
  }

  const trendData =
    chartRange === "Last 30 Days"
      ? vm.casesOverTime30d
      : chartRange === "Last 90 Days"
        ? vm.casesOverTime90d
        : vm.casesOverTime7d;

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex flex-col flex-1 min-h-0">
        <TopNav />

        <main
          className="flex-1 flex gap-4 px-5 py-4 min-h-0 overflow-y-auto"
          aria-label="Analyst dashboard"
        >
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <DashboardHeader
              greeting="Good morning, Alex"
              briefing="AI has analyzed your operations. Here is today's briefing."
              agentStatuses={vm.agentStatuses}
            />

            <KpiStrip metrics={metrics} onKpiSelect={setKpiContext} />

            <div className="grid grid-cols-[1fr_1fr] gap-3 anim-fade-slide-up anim-delay-3">
              <PriorityCasesTable cases={vm.priorityCases} />
              <CasesByStatusCard data={vm.statusData} />
            </div>

            <div className="grid grid-cols-2 gap-3 anim-fade-slide-up anim-delay-4">
              <CasesTrendChartCard
                range={chartRange}
                onRangeChange={setChartRange}
                data={trendData}
              />
              <ResponseTrendCard data={vm.responseTrend} />
            </div>

            <ForecastChartCard
              range={forecastRange}
              onRangeChange={setForecastRange}
              data={vm.forecastData[forecastRange]}
            />
          </div>

          <div
            onMouseDown={onPaneDragStart}
            className="shrink-0 w-1.5 cursor-col-resize self-stretch flex items-center justify-center group"
            role="separator"
            aria-orientation="vertical"
            aria-label="Drag to resize right panel"
            aria-valuenow={rightPaneW}
            aria-valuemin={RIGHT_PANE_MIN}
            aria-valuemax={RIGHT_PANE_MAX}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft")
                setRightPaneW((w) => Math.min(RIGHT_PANE_MAX, w + 20));
              if (e.key === "ArrowRight")
                setRightPaneW((w) => Math.max(RIGHT_PANE_MIN, w - 20));
            }}
          >
            <div className="w-0.5 h-12 rounded-full bg-ds-neutral-200 group-hover:bg-ds-dark-blue-400 transition-colors" />
          </div>

          <div
            className="flex flex-col gap-3 shrink-0"
            style={{ width: rightPaneW }}
          >
            <AIAssistantPanel
              actions={vm.aiPriorityActions}
              actionDetails={vm.actionDetails}
              activeAction={activeAction}
              onToggleAction={(i) =>
                setActiveAction((prev) => (prev === i ? null : i))
              }
              kpiContext={kpiContext}
              onClearKpiContext={() => setKpiContext(null)}
              followUpThread={followUpThread}
              followUpThinking={followUpThinking}
              aiInput={aiInput}
              onAiInputChange={setAiInput}
              onSendFollowUp={sendFollowUp}
              onExpand={() => setExpandedPanel("ai")}
            />

            <CollaborationFeed
              items={vm.collab}
              onExpand={() => setExpandedPanel("collab")}
            />
          </div>
        </main>
      </div>

      {expandedPanel && (
        <ExpandedDrawer
          panel={expandedPanel}
          onClose={() => setExpandedPanel(null)}
          actions={vm.aiPriorityActions}
          actionDetails={vm.actionDetails}
          activeAction={activeAction}
          onToggleAction={(i) =>
            setActiveAction((prev) => (prev === i ? null : i))
          }
          followUpThread={followUpThread}
          followUpThinking={followUpThinking}
          aiInput={aiInput}
          onAiInputChange={setAiInput}
          onSendFollowUp={sendFollowUp}
          collab={vm.collab}
        />
      )}
    </div>
  );
}
