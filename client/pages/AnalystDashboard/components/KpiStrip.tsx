import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import type { PeriodMetrics } from "../AnalystDashboardData";

export type TickerFrame = {
  value: string;
  unit?: string;
  sub?: string;
  subColor?: string;
};

export type KpiContext = {
  label: string;
  value: string;
  unit: string;
  summary: string;
  points: string[];
  allFrames?: TickerFrame[];
};

function useAnimatedCounter(target: number, duration = 500) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(target);
  useEffect(() => {
    const start = Date.now();
    const from = prevTarget.current === target ? 0 : count;
    prevTarget.current = target;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return count;
}

function DonutProgress({ pct }: { pct: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={40} height={40} viewBox="0 0 48 48">
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="var(--color-neutral-200)"
        strokeWidth={5}
      />
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="var(--color-dark-blue-600)"
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text
        x={24}
        y={24}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9"
        fontWeight="700"
        fill="var(--color-dark-blue-600)"
      >
        {pct}%
      </text>
    </svg>
  );
}

type KpiTickerProps = {
  label: string;
  frames: TickerFrame[];
  icon?: ReactNode;
  onSelect?: (frame: TickerFrame, allFrames: TickerFrame[]) => void;
  className?: string;
  style?: CSSProperties;
};

function KpiTicker({
  label,
  frames,
  icon,
  onSelect,
  className,
  style,
}: KpiTickerProps) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setIdx((i) => (i + 1) % frames.length);
        setPhase("in");
      }, 500);
    }, 5500);
    return () => clearInterval(timer);
  }, [frames.length]);

  const frame = frames[idx];
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(frame, frames);
    }
  };

  return (
    <div
      className={`p-4 flex items-center justify-between dashboard-card anim-kpi-pop cursor-pointer ${className ?? ""}`}
      style={style}
      onClick={() => onSelect?.(frame, frames)}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${frame.value}${frame.unit ? " " + frame.unit : ""}. Click to analyze in AI Operations Context.`}
    >
      <div style={{ minWidth: 0 }}>
        <p className="text-[11px] font-medium uppercase tracking-wider text-ds-neutral-800 mb-1.5">
          {label}
        </p>
        <div
          className={`${phase === "in" ? "ticker-in" : "ticker-out"}`}
          key={idx}
        >
          <p className="text-[30px] font-bold leading-none text-ds-neutral-900">
            {frame.value}
            {frame.unit && (
              <span className="text-[14px] font-medium ml-1.5 text-ds-neutral-900">
                {frame.unit}
              </span>
            )}
          </p>
          {frame.sub && (
            <p
              className="text-[10px] font-semibold mt-1.5"
              style={{
                color: frame.subColor ?? "var(--color-neutral-900)",
              }}
            >
              {frame.sub}
            </p>
          )}
        </div>
      </div>
      {icon}
    </div>
  );
}

type KpiStripProps = {
  metrics: PeriodMetrics;
  onKpiSelect: (context: KpiContext) => void;
};

export function KpiStrip({ metrics, onKpiSelect }: KpiStripProps) {
  const animAttention = useAnimatedCounter(metrics.attention);
  const animResponseTimeRaw = useAnimatedCounter(
    Math.round(parseFloat(metrics.responseTime) * 10),
  );
  const animResponseTime = (animResponseTimeRaw / 10).toFixed(1);
  const animComplete = useAnimatedCounter(metrics.complete);
  const animAlerts = useAnimatedCounter(metrics.compAlerts);
  const animDecisions = useAnimatedCounter(metrics.decisions);
  const animPipeline = useAnimatedCounter(metrics.pipeline);
  const animClientResp = useAnimatedCounter(metrics.clientResp);

  const cardStyle: CSSProperties = {
    border: "1px solid var(--color-neutral-200)",
    background: "var(--color-base-white)",
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3 anim-fade-slide-up anim-delay-2">
        <KpiTicker
          label="Cases Requiring Attention"
          icon={
            <AlertTriangle size={40} className="text-ds-neutral-400 shrink-0" />
          }
          className="rounded-lg h-full"
          style={cardStyle}
          frames={[
            {
              value: String(animAttention),
              unit: "cases",
              sub: "+2 since yesterday",
              subColor: "var(--color-red-700)",
            },
            {
              value: "3",
              unit: "SLA risk",
              sub: "Breach within 24 hrs",
              subColor: "var(--color-red-700)",
            },
            {
              value: "High",
              unit: "",
              sub: "Operational priority",
              subColor: "var(--color-neutral-900)",
            },
          ]}
          onSelect={(f, all) =>
            onKpiSelect({
              label: "Cases Requiring Attention",
              value: f.value,
              unit: f.unit ?? "",
              allFrames: all,
              summary:
                "AI has flagged 3 cases at immediate SLA risk. Two involve delayed client document submissions; one is pending sanctions clearance. Escalation is recommended before end of day.",
              points: [
                "KYC-2194: SLA breach in 4h — client unreachable",
                "KYC-2210: Overdue — sanctions flag unresolved",
                "KYC-2188: Decision Support pending 48h — reassign recommended",
              ],
            })
          }
        />

        <KpiTicker
          label="Avg Response Time"
          icon={<Clock size={40} className="text-ds-neutral-400 shrink-0" />}
          className="rounded-lg h-full"
          style={cardStyle}
          frames={[
            {
              value: animResponseTime,
              unit: "days",
              sub: "↑ 0.4d vs yesterday",
              subColor: "var(--color-red-700)",
            },
            {
              value: "78",
              unit: "hrs",
              sub: "Above 72h SLA target",
              subColor: "var(--color-red-700)",
            },
            {
              value: "Slower",
              unit: "",
              sub: "than 30-day average",
              subColor: "var(--color-neutral-900)",
            },
          ]}
          onSelect={(f, all) =>
            onKpiSelect({
              label: "Avg Response Time",
              value: f.value,
              unit: f.unit ?? "",
              allFrames: all,
              summary:
                "Response time has increased 0.4 days vs yesterday, now exceeding the 72-hour SLA threshold. Primary driver is a 14% growth in the Decision Support backlog since Monday.",
              points: [
                "72h SLA target currently breached",
                "Decision Support queue: +14% since Mon",
                "3 cases stalled on client response — follow-up due",
              ],
            })
          }
        />

        <KpiTicker
          label="Cases Complete"
          icon={<DonutProgress pct={metrics.complete} />}
          className="rounded-lg h-full"
          style={cardStyle}
          frames={[
            {
              value: `${animComplete}%`,
              unit: "",
              sub: "↓ 3% vs yesterday",
              subColor: "var(--color-dark-blue-600)",
            },
            {
              value: "23",
              unit: "of 48",
              sub: "cases closed today",
              subColor: "var(--color-neutral-900)",
            },
            {
              value: "On track",
              unit: "",
              sub: "for monthly target",
              subColor: "var(--color-dark-blue-600)",
            },
          ]}
          onSelect={(f, all) =>
            onKpiSelect({
              label: "Cases Complete",
              value: f.value,
              unit: f.unit ?? "",
              allFrames: all,
              summary:
                "48% of active cases are complete today — down 3% vs yesterday, though monthly trajectory remains on target. 25 cases remain open; 8 are within 24h of SLA.",
              points: [
                "23 of 48 cases closed today",
                "8 cases within 24h of SLA deadline",
                "Monthly completion rate: 74% — on track",
              ],
            })
          }
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div
          className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-3"
          style={{
            border: "1px solid var(--color-red-200)",
            background: "var(--color-red-000)",
          }}
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-red-700)" }}
          >
            Compliance Alerts
          </p>
          <p
            className="text-[22px] font-bold leading-none"
            style={{ color: "var(--color-red-700)" }}
          >
            {animAlerts}
          </p>
          <p
            className="text-[10px] mt-1"
            style={{ color: "var(--color-red-700)" }}
          >
            High-risk escalations requiring action
          </p>
        </div>

        <div
          className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-4"
          style={cardStyle}
        >
          <p className="text-[9px] font-medium uppercase tracking-wider mb-1 text-ds-neutral-600">
            Decision Support
          </p>
          <p className="text-[22px] font-bold text-ds-neutral-900 leading-none">
            {animDecisions}
          </p>
          <p className="text-[10px] mt-1 text-ds-neutral-600">
            Final decisions pending
          </p>
        </div>

        <div
          className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-5"
          style={cardStyle}
        >
          <p className="text-[9px] font-medium uppercase tracking-wider mb-1 text-ds-neutral-600">
            Next to Complete
          </p>
          <p className="text-[22px] font-bold text-ds-neutral-900 leading-none">
            {animPipeline}
          </p>
          <p className="text-[10px] mt-1 text-ds-neutral-600">
            Moving to close
          </p>
        </div>

        <div
          className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-6"
          style={cardStyle}
        >
          <p className="text-[9px] font-medium uppercase tracking-wider mb-1 text-ds-neutral-600">
            Client Responses
          </p>
          <p className="text-[22px] font-bold text-ds-neutral-900 leading-none">
            {animClientResp}
          </p>
          <p className="text-[10px] mt-1 text-ds-neutral-600">
            Unblocked by submissions
          </p>
        </div>
      </div>
    </>
  );
}
