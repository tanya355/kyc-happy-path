import { useEffect, useState } from "react";
import { AgentStatusTicker } from "./AgentStatusTicker";

type DashboardHeaderProps = {
  greeting: string;
  briefing: string;
  agentStatuses: readonly string[];
};

export function DashboardHeader({
  greeting,
  briefing,
  agentStatuses,
}: DashboardHeaderProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <>
      <div className="flex items-center justify-between gap-4 anim-fade-in anim-delay-0">
        <div>
          <p className="text-[20px] font-bold text-ds-neutral-900 leading-tight">
            {greeting}
          </p>
          <p className="text-[12px] mt-0.5 text-ds-neutral-900">{briefing}</p>
        </div>
        <div className="shrink-0 text-right tabular-nums">
          <p className="text-[11px] text-ds-neutral-800">{dateStr}</p>
          <p className="text-[11px] font-semibold text-ds-neutral-900">
            {timeStr}
          </p>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-6 px-4 py-4 rounded-md anim-fade-slide-up anim-delay-1 overflow-hidden"
        style={{
          background: "var(--color-neutral-000)",
          border: "1px solid var(--color-neutral-200)",
          position: "relative",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 rounded-l-md"
          style={{
            width: 3,
            background: "var(--color-dark-blue-600)",
            opacity: 0.18,
          }}
        />

        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
              style={{ background: "var(--color-dark-blue-400)" }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2" />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-ds-neutral-800 shrink-0">
            KYC Ops Agent
          </span>
          <div className="w-px h-3 bg-ds-neutral-200 shrink-0" />
          <AgentStatusTicker statuses={agentStatuses} />
        </div>

        <div className="flex items-center gap-2.5 text-[10px] text-ds-neutral-700 shrink-0">
          <span>
            Model{" "}
            <span className="font-semibold text-ds-neutral-900">v2.4.1</span>
          </span>
          <span className="text-ds-neutral-600">·</span>
          <span>
            Confidence{" "}
            <span className="font-semibold text-ds-neutral-900">94%</span>
          </span>
          <span className="text-ds-neutral-600">·</span>
          <span>
            Synced{" "}
            <span className="font-semibold text-ds-neutral-900">2m ago</span>
          </span>
          <span className="text-ds-neutral-600">·</span>
          <span>119 cases reviewed</span>
        </div>
      </div>
    </>
  );
}
