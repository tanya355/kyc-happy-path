import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Clock,
  AlertTriangle, MessageSquare,
  Globe, ChevronRight, Paperclip,
  Activity,
  Zap, ShieldAlert,
  ExternalLink,
  Maximize2, X,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell,
} from "recharts";
import { TopNav } from "@/components/kyc/TopNav";
import { Button } from "@kpmg-us/ad-design-lib";

// ── Styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "var(--color-base-white)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: 8,
};

// ── AI Operational Briefing data ──────────────────────────────────────

// ── AI action detail responses ────────────────────────────────────────

const ACTION_DETAILS: Record<number, {
  title: string;
  reasoning: string;
  flaggedFor: string;
  actionLabel: string;
  actionTo: string;
  actionState?: Record<string, string>;
}> = {
  0: {
    title: "Imminent SLA Breach Detected",
    reasoning: "KYC-2194 has been escalated and the SLA window closes in under 2 hours. AI has reviewed all attached documents and confirmed entity ownership is verified. No outstanding data gaps were identified.",
    flaggedFor: "Failure to sign off within the SLA window will trigger an automatic compliance flag and require a post-breach corrective action report, increasing regulatory exposure.",
    actionLabel: "Sign off on KYC-2194",
    actionTo: "/case",
    actionState: { caseId: "KYC-2194", entity: "BlackRock Advisors", priority: "High" },
  },
  1: {
    title: "Unresponsive Client — Escalation Required",
    reasoning: "KYC-2210 has had no client response for 5 consecutive days. AI has logged all outreach attempts and confirmed no documentation has been received since the initial submission.",
    flaggedFor: "Continued inaction risks a compliance hold on the account. Formal escalation is required to initiate the outreach protocol and preserve the audit trail.",
    actionLabel: "Escalate KYC-2210",
    actionTo: "/case",
    actionState: { caseId: "KYC-2210", entity: "BlackRock Institutional", priority: "High" },
  },
  2: {
    title: "Decision Support Backlog Identified",
    reasoning: "AI pre-screened all 13 Decision Support cases and identified 4 as low-risk based on document completeness and entity profile. The remaining 9 require human review before decisions can be finalized.",
    flaggedFor: "Delayed decisions increase average response time and contribute to SLA drift. Resolving the 4 low-risk cases now reduces overall backlog by 31%.",
    actionLabel: "Review Decision Support queue",
    actionTo: "/dashboard",
  },
  3: {
    title: "Unresolved Compliance Alerts",
    reasoning: "Two compliance alerts are currently active and unacknowledged. Both were triggered by sanctions screening flags that require analyst review and corrective action documentation.",
    flaggedFor: "Alerts unresolved by end of business will generate an automatic regulatory notification. Both must be acknowledged and archived to avoid a formal compliance breach.",
    actionLabel: "View compliance alerts",
    actionTo: "/dashboard",
  },
};

// ── AI Priority Actions (proactive, not prompts) ───────────────────────

const AI_PRIORITY_ACTIONS = [
  {
    urgency: "critical",
    title: "Sign off on KYC-2194",
    context: "Escalated · SLA breach in 2 hrs",
    dot: "bg-ds-red-700",
    timeClass: "text-ds-neutral-700",
  },
  {
    urgency: "critical",
    title: "Escalate KYC-2210 outreach",
    context: "Overdue today · client unreachable",
    dot: "bg-ds-red-700",
    timeClass: "text-ds-neutral-700",
  },
  {
    urgency: "high",
    title: "Clear 13 Decision Support items",
    context: "SLA at risk · queue growing",
    dot: "bg-ds-yellow-700",
    timeClass: "text-ds-neutral-700",
  },
  {
    urgency: "medium",
    title: "Address 2 compliance alerts",
    context: "Action required before end of day",
    dot: "bg-ds-neutral-400",
    timeClass: "text-ds-neutral-600",
  },
];

// ── Collaboration feed ────────────────────────────────────────────────

const collab = [
  {
    icon: <MessageSquare size={13} className="text-ds-dark-blue-600" />,
    bg: "bg-ds-dark-blue-000",
    text: "Quinn Doe commented on the existing document",
    time: "Today, 7:08 AM",
  },
  {
    icon: <Globe size={13} className="text-ds-dark-blue-500" />,
    bg: "bg-ds-dark-blue-000",
    text: "AI Agent linked 3 new documents",
    time: "Yesterday, 3:12 PM",
  },
  {
    icon: <FileText size={13} className="text-ds-neutral-500" />,
    bg: "bg-ds-neutral-100",
    text: 'You rejected "The Exception" entity',
    time: "April 22, 2026, 7:18 AM",
  },
  {
    icon: <MessageSquare size={13} className="text-ds-dark-blue-600" />,
    bg: "bg-ds-dark-blue-000",
    text: "Quinn Doe commented on the existing document",
    time: "April 22, 2026, 6:03 AM",
  },
];

// ── KPI data ──────────────────────────────────────────────────────────

const PERIODS = [
  {
    label: "Today",
    delta: { attention: "+2 since yesterday", responseTime: "↑ 0.4d vs yesterday", complete: "↓ 3% vs yesterday" },
    kpis: { attention: 2, responseTime: "3.2", complete: 48, caseReview: 25, overdue: 7, decisions: 13, pipeline: 5, clientResp: 3, compAlerts: 2 },
  },
  {
    label: "This Week",
    delta: { attention: "+5 vs last week", responseTime: "↓ 0.3d vs last week", complete: "↑ 8% vs last week" },
    kpis: { attention: 11, responseTime: "2.8", complete: 61, caseReview: 52, overdue: 14, decisions: 28, pipeline: 19, clientResp: 8, compAlerts: 5 },
  },
  {
    label: "This Month",
    delta: { attention: "+12 vs last month", responseTime: "↑ 0.1d vs last month", complete: "↑ 12% vs last month" },
    kpis: { attention: 34, responseTime: "3.1", complete: 74, caseReview: 168, overdue: 31, decisions: 87, pipeline: 52, clientResp: 22, compAlerts: 11 },
  },
];

// ── Status bar data ────────────────────────────────────────────────────

const STATUS_DATA = [
  { label: "Not Started",       count: 2, pct: 20, color: "var(--color-neutral-400)" },
  { label: "In Progress",       count: 3, pct: 30, color: "var(--color-dark-blue-600)" },
  { label: "Pending Feedback",  count: 3, pct: 30, color: "var(--color-dark-blue-300)" },
  { label: "Complete",          count: 2, pct: 20, color: "var(--color-green-700)" },
];

// ── Priority cases ─────────────────────────────────────────────────────

type PriorityLevel2 = "High" | "Medium" | "Low";
type CaseStatus = "Escalated" | "Overdue" | "Pending Decision" | "Awaiting Client";

const PRIORITY_CASES: {
  priority: PriorityLevel2;
  id: string;
  entity: string;
  status: CaseStatus;
  due: string;
  reason: string;
  priorityReason: string;
  effort: string;
}[] = [
  {
    priority: "High", id: "KYC-2194", entity: "BlackRock Advisors", status: "Escalated",
    due: "2 hrs", effort: "45 min",
    reason: "Sanctions flag unresolved — SLA window closes in 2 hours.",
    priorityReason: "High: active SLA breach risk with unresolved sanctions match requiring immediate analyst action.",
  },
  {
    priority: "High", id: "KYC-2210", entity: "BlackRock Institutional", status: "Overdue",
    due: "Today", effort: "30 min",
    reason: "Client unreachable for 5 days — escalation path required.",
    priorityReason: "High: client non-responsive beyond SLA threshold; escalation is the only remaining resolution path.",
  },
  {
    priority: "Medium", id: "KYC-2188", entity: "BlackRock Institutional", status: "Pending Decision",
    due: "Tomorrow", effort: "20 min",
    reason: "Analyst sign-off needed before SLA closes tomorrow.",
    priorityReason: "Medium: pending analyst decision with SLA due tomorrow; no blockers, action needed today.",
  },
  {
    priority: "Medium", id: "KYC-2203", entity: "Entity 13", status: "Pending Decision",
    due: "Friday", effort: "1.5 hrs",
    reason: "Ownership discrepancy flagged during periodic refresh.",
    priorityReason: "Medium: ownership structure discrepancy requires review before periodic refresh cycle closes.",
  },
  {
    priority: "Low", id: "KYC-2215", entity: "BlackRock Advisors", status: "Awaiting Client",
    due: "Next Week", effort: "15 min",
    reason: "Outstanding document request — follow-up due next week.",
    priorityReason: "Low: awaiting client-submitted documents; no analyst action required until response received.",
  },
];

// ── Chart data ─────────────────────────────────────────────────────────

const CASES_OVER_TIME_7D = [
  { day: "Mon", new: 12, completed:  8, overdue: 3 },
  { day: "Tue", new: 18, completed: 14, overdue: 4 },
  { day: "Wed", new: 15, completed: 16, overdue: 3 },
  { day: "Thu", new: 21, completed: 13, overdue: 6 },
  { day: "Fri", new: 17, completed: 19, overdue: 4 },
  { day: "Sat", new:  9, completed: 11, overdue: 2 },
  { day: "Sun", new: 11, completed: 15, overdue: 3 },
];
const CASES_OVER_TIME_30D = [
  { day: "Apr 7",  new: 28, completed: 22, overdue: 7 },
  { day: "Apr 10", new: 32, completed: 27, overdue: 8 },
  { day: "Apr 13", new: 25, completed: 30, overdue: 6 },
  { day: "Apr 16", new: 38, completed: 28, overdue: 9 },
  { day: "Apr 19", new: 41, completed: 35, overdue: 11 },
  { day: "Apr 22", new: 36, completed: 39, overdue: 8 },
  { day: "Apr 25", new: 29, completed: 33, overdue: 7 },
  { day: "Apr 28", new: 44, completed: 38, overdue: 10 },
  { day: "May 1",  new: 39, completed: 42, overdue: 9 },
  { day: "May 4",  new: 51, completed: 44, overdue: 12 },
  { day: "May 7",  new: 47, completed: 49, overdue: 8 },
];
const CASES_OVER_TIME_90D = [
  { day: "Feb",  new: 210, completed: 185, overdue: 42 },
  { day: "Mar 1", new: 240, completed: 210, overdue: 51 },
  { day: "Mar 15", new: 228, completed: 232, overdue: 48 },
  { day: "Apr 1", new: 265, completed: 248, overdue: 55 },
  { day: "Apr 15", new: 289, completed: 271, overdue: 61 },
  { day: "May 1",  new: 312, completed: 295, overdue: 67 },
  { day: "May 7",  new: 298, completed: 310, overdue: 58 },
];

const FORECAST_DATA: Record<string, { date: string; expected: number; actual: number | null }[]> = {
  "30d": [
    { date: "May 1",  expected: 119, actual: 119  },
    { date: "May 5",  expected: 102, actual: 98   },
    { date: "May 7",  expected: 90,  actual: 87   },
    { date: "May 10", expected: 75,  actual: null },
    { date: "May 15", expected: 55,  actual: null },
    { date: "May 20", expected: 34,  actual: null },
    { date: "May 25", expected: 14,  actual: null },
    { date: "May 31", expected: 0,   actual: null },
  ],
  "60d": [
    { date: "May 1",  expected: 119, actual: 119 },
    { date: "May 7",  expected: 90,  actual: 87  },
    { date: "May 15", expected: 70,  actual: null },
    { date: "May 22", expected: 55,  actual: null },
    { date: "Jun 1",  expected: 40,  actual: null },
    { date: "Jun 10", expected: 28,  actual: null },
    { date: "Jun 20", expected: 15,  actual: null },
    { date: "Jun 30", expected: 5,   actual: null },
  ],
  "90d": [
    { date: "May 1",  expected: 119, actual: 119 },
    { date: "May 15", expected: 95,  actual: null },
    { date: "Jun 1",  expected: 75,  actual: null },
    { date: "Jun 15", expected: 58,  actual: null },
    { date: "Jul 1",  expected: 42,  actual: null },
    { date: "Jul 15", expected: 25,  actual: null },
    { date: "Aug 1",  expected: 10,  actual: null },
    { date: "Aug 7",  expected: 0,   actual: null },
  ],
  "6m": [
    { date: "May",    expected: 119, actual: 119 },
    { date: "Jun",   expected: 95,  actual: null },
    { date: "Jul",   expected: 72,  actual: null },
    { date: "Aug",   expected: 50,  actual: null },
    { date: "Sep",   expected: 30,  actual: null },
    { date: "Oct",   expected: 12,  actual: null },
  ],
  "1y": [
    { date: "May 25",  expected: 119, actual: 119 },
    { date: "Jul 25",  expected: 95,  actual: null },
    { date: "Sep 25",  expected: 72,  actual: null },
    { date: "Nov 25",  expected: 50,  actual: null },
    { date: "Jan 26",  expected: 30,  actual: null },
    { date: "Mar 26",  expected: 15,  actual: null },
    { date: "May 26",  expected: 5,   actual: null },
  ],
};

const RESPONSE_TREND = [
  { day: "Mon", avg: 3.8, sla: 3.0 },
  { day: "Tue", avg: 3.5, sla: 3.0 },
  { day: "Wed", avg: 3.2, sla: 3.0 },
  { day: "Thu", avg: 3.6, sla: 3.0 },
  { day: "Fri", avg: 2.9, sla: 3.0 },
  { day: "Sat", avg: 2.7, sla: 3.0 },
  { day: "Sun", avg: 3.1, sla: 3.0 },
];

// ── Sub-components ─────────────────────────────────────────────────────

function DonutProgress({ pct }: { pct: number }) {
  const r = 20, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width={40} height={40} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={r} fill="none" stroke="var(--color-neutral-200)" strokeWidth={5} />
      <circle
        cx={24} cy={24} r={r} fill="none"
        stroke="var(--color-dark-blue-600)" strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x={24} y={24} textAnchor="middle" dominantBaseline="central"
        fontSize="9" fontWeight="700" fill="var(--color-dark-blue-600)">{pct}%</text>
    </svg>
  );
}

const tooltipStyle = {
  contentStyle: { fontSize: 11, background: "#ffffff", border: "1px solid #E5E5E5", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  labelStyle: { fontWeight: 700, color: "#00338D" },
  itemStyle: { color: "#666666" },
};

// ── Page ──────────────────────────────────────────────────────────────

// ── Animated counter hook ────────────────────────────────────────────
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

// ── Bloomberg-style KPI Ticker ───────────────────────────────────────
interface TickerFrame { value: string; unit?: string; sub?: string; subColor?: string; }

function KpiTicker({ label, frames, icon, onSelect, className, style }: { label: string; frames: TickerFrame[]; icon?: React.ReactNode; onSelect?: (frame: TickerFrame, allFrames: TickerFrame[]) => void; className?: string; style?: React.CSSProperties }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setIdx(i => (i + 1) % frames.length);
        setPhase("in");
      }, 500);
    }, 5500);
    return () => clearInterval(timer);
  }, [frames.length]);

  const frame = frames[idx];
  return (
    <div
      className={`p-4 flex items-center justify-between dashboard-card anim-kpi-pop cursor-pointer ${className ?? ""}`}
      style={style}
      onClick={() => onSelect?.(frame, frames)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(frame, frames); } }}
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${frame.value}${frame.unit ? " " + frame.unit : ""}. Click to analyze in AI Operations Context.`}
    >
      <div style={{ minWidth: 0 }}>
        <p className="text-[11px] font-medium uppercase tracking-wider text-ds-neutral-800 mb-1.5">{label}</p>
        <div className={`${phase === "in" ? "ticker-in" : "ticker-out"}`} key={idx}>
          <p className="text-[30px] font-bold leading-none text-ds-neutral-900">
            {frame.value}
            {frame.unit && (
              <span className="text-[14px] font-medium ml-1.5 text-ds-neutral-900">{frame.unit}</span>
            )}
          </p>
          {frame.sub && (
            <p className="text-[10px] font-semibold mt-1.5" style={{ color: frame.subColor ?? "var(--color-neutral-900)" }}>
              {frame.sub}
            </p>
          )}
        </div>
      </div>
      {icon}
    </div>
  );
}


export default function AnalystDashboard() {
  const [aiInput, setAiInput] = useState("");
  const [followUpThread, setFollowUpThread] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [followUpThinking, setFollowUpThinking] = useState(false);

  const FOLLOW_UP_RESPONSES: Record<string, string> = {
    default: "Based on today's case data, I've analyzed your queue and identified the following key insights: 3 cases are at immediate SLA risk, with KYC-2194 requiring escalation before end of day. Decision Support backlog has grown 14% since Monday — clearing those 13 items should be your priority after handling urgent escalations. Would you like me to prioritize your queue based on SLA impact?",
    sla: "Your current SLA compliance rate is 82%. Two cases — KYC-2194 and KYC-2210 — are at high breach risk today. I recommend escalating KYC-2194 immediately and reassigning KYC-2210 to ensure a second outreach attempt before 5pm. Addressing these two cases alone would bring your SLA rate to 94%.",
    risk: "Of your 48 active cases, 6 are rated High Risk. Three are in the Decision Support queue awaiting your sign-off. KYC-2194 has an unresolved sanctions flag that requires senior approval before closure. I recommend prioritizing these flagged cases before end of week to avoid compliance exposure.",
    overdue: "You currently have 2 overdue cases: KYC-2194 (overdue by 6 hours) and KYC-2210 (overdue since yesterday). Both have had at least one outreach attempt. For KYC-2210, client response has not been received — I recommend formal escalation to your supervisor with documentation of the outreach history.",
    summary: "Here is today's operational summary: 3 urgent cases requiring attention, 13 Decision Support items pending your decision, 5 cases ready to close, and 3 cases unblocked by recent client submissions. Avg response time is 3.2 days — slightly above the 72-hour SLA target. Completing the 5 near-close cases today would improve your completion rate from 48% to 58%.",
  };

  function getFollowUpResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes("sla") || lower.includes("breach") || lower.includes("deadline")) return FOLLOW_UP_RESPONSES.sla;
    if (lower.includes("risk") || lower.includes("high risk") || lower.includes("flag")) return FOLLOW_UP_RESPONSES.risk;
    if (lower.includes("overdue") || lower.includes("late") || lower.includes("missed")) return FOLLOW_UP_RESPONSES.overdue;
    if (lower.includes("summary") || lower.includes("overview") || lower.includes("today")) return FOLLOW_UP_RESPONSES.summary;
    return FOLLOW_UP_RESPONSES.default;
  }

  function sendFollowUp() {
    if (!aiInput.trim() || followUpThinking) return;
    const userText = aiInput.trim();
    setFollowUpThread(prev => [...prev, { role: "user", text: userText }]);
    setAiInput("");
    setFollowUpThinking(true);
    setTimeout(() => {
      setFollowUpThinking(false);
      setFollowUpThread(prev => [...prev, { role: "agent", text: getFollowUpResponse(userText) }]);
    }, 900 + Math.random() * 500);
  }
  const [chartRange, setChartRange] = useState("Last 7 Days");
  const [forecastRange, setForecastRange] = useState("30d");
  const [activeAction, setActiveAction] = useState<number | null>(null);
  const [kpiContext, setKpiContext] = useState<{ label: string; value: string; unit: string; summary: string; points: string[]; allFrames?: TickerFrame[] } | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<"ai" | "collab" | null>(null);


  const activePeriod = PERIODS.find(p => p.label === "Today")!;
  const metrics = activePeriod.kpis;

  const animAttention    = useAnimatedCounter(metrics.attention);
  const animResponseTimeRaw = useAnimatedCounter(Math.round(parseFloat(metrics.responseTime) * 10));
  const animResponseTime = (animResponseTimeRaw / 10).toFixed(1);
  const animComplete     = useAnimatedCounter(metrics.complete);
  const animAlerts       = useAnimatedCounter(metrics.compAlerts);
  const animDecisions    = useAnimatedCounter(metrics.decisions);
  const animPipeline     = useAnimatedCounter(metrics.pipeline);
  const animClientResp   = useAnimatedCounter(metrics.clientResp);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const totalActive = STATUS_DATA.filter(s => s.label !== "Complete").reduce((a, b) => a + b.count, 0);

  // ── Right pane resize ──────────────────────────────────────────────
  const RIGHT_PANE_MIN = 300;
  const RIGHT_PANE_MAX = 720;
  const [rightPaneW, setRightPaneW] = useState(440);
  const draggingPane   = useRef(false);
  const dragStartX     = useRef(0);
  const dragStartW     = useRef(0);

  const onPaneDragStart = useCallback((e: React.MouseEvent) => {
    draggingPane.current = true;
    dragStartX.current   = e.clientX;
    dragStartW.current   = rightPaneW;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!draggingPane.current) return;
      const delta = dragStartX.current - ev.clientX; // drag left → wider
      setRightPaneW(Math.max(RIGHT_PANE_MIN, Math.min(RIGHT_PANE_MAX, dragStartW.current + delta)));
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
  }, [rightPaneW]);

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex flex-col flex-1 min-h-0">
        <TopNav />

        {/* ── Main layout ── */}
        <main className="flex-1 flex gap-4 px-5 py-4 min-h-0 overflow-y-auto" aria-label="Analyst dashboard">

          {/* ═══ LEFT: main content ═══ */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">

            {/* ── Header row ── */}
            <div className="flex items-center justify-between gap-4 anim-fade-in anim-delay-0">
              <div>
                <p className="text-[20px] font-bold text-ds-neutral-900 leading-tight">Good morning, Alex</p>
                <p className="text-[12px] mt-0.5 text-ds-neutral-900">AI has analyzed your operations. Here is today's briefing.</p>
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <p className="text-[11px] text-ds-neutral-800">{dateStr}</p>
                <p className="text-[11px] font-semibold text-ds-neutral-900">{timeStr}</p>
              </div>
            </div>



            {/* ── Top KPI cards — separate ── */}
            <div className="grid grid-cols-3 gap-3 anim-fade-slide-up anim-delay-2">

              <KpiTicker
                label="Cases Requiring Attention"
                icon={<AlertTriangle size={40} className="text-ds-neutral-400 shrink-0" />}
                className="rounded-lg h-full"
                style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
                frames={[
                  { value: String(animAttention), unit: "cases",   sub: "+2 since yesterday",    subColor: "var(--color-red-700)" },
                  { value: "3",                  unit: "SLA risk", sub: "Breach within 24 hrs",  subColor: "var(--color-red-700)" },
                  { value: "High",               unit: "",         sub: "Operational priority",  subColor: "var(--color-neutral-900)" },
                ]}
                onSelect={(f, all) => setKpiContext({
                  label: "Cases Requiring Attention",
                  value: f.value, unit: f.unit ?? "",
                  allFrames: all,
                  summary: "AI has flagged 3 cases at immediate SLA risk. Two involve delayed client document submissions; one is pending sanctions clearance. Escalation is recommended before end of day.",
                  points: ["KYC-2194: SLA breach in 4h — client unreachable", "KYC-2210: Overdue — sanctions flag unresolved", "KYC-2188: Decision Support pending 48h — reassign recommended"],
                })}
              />

              <KpiTicker
                label="Avg Response Time"
                icon={<Clock size={40} className="text-ds-neutral-400 shrink-0" />}
                className="rounded-lg h-full"
                style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
                frames={[
                  { value: animResponseTime, unit: "days",  sub: "↑ 0.4d vs yesterday", subColor: "var(--color-red-700)" },
                  { value: "78",            unit: "hrs",   sub: "Above 72h SLA target", subColor: "var(--color-red-700)" },
                  { value: "Slower",        unit: "",      sub: "than 30-day average",  subColor: "var(--color-neutral-900)" },
                ]}
                onSelect={(f, all) => setKpiContext({
                  label: "Avg Response Time",
                  value: f.value, unit: f.unit ?? "",
                  allFrames: all,
                  summary: "Response time has increased 0.4 days vs yesterday, now exceeding the 72-hour SLA threshold. Primary driver is a 14% growth in the Decision Support backlog since Monday.",
                  points: ["72h SLA target currently breached", "Decision Support queue: +14% since Mon", "3 cases stalled on client response — follow-up due"],
                })}
              />

              <KpiTicker
                label="Cases Complete"
                icon={<DonutProgress pct={metrics.complete} />}
                className="rounded-lg h-full"
                style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
                frames={[
                  { value: `${animComplete}%`, unit: "",         sub: "↓ 3% vs yesterday",    subColor: "var(--color-dark-blue-600)" },
                  { value: "23",              unit: "of 48",    sub: "cases closed today",    subColor: "var(--color-neutral-900)" },
                  { value: "On track",        unit: "",         sub: "for monthly target",    subColor: "var(--color-dark-blue-600)" },
                ]}
                onSelect={(f, all) => setKpiContext({
                  label: "Cases Complete",
                  value: f.value, unit: f.unit ?? "",
                  allFrames: all,
                  summary: "48% of active cases are complete today — down 3% vs yesterday, though monthly trajectory remains on target. 25 cases remain open; 8 are within 24h of SLA.",
                  points: ["23 of 48 cases closed today", "8 cases within 24h of SLA deadline", "Monthly completion rate: 74% — on track"],
                })}
              />

            </div>

            {/* ── Summary metric cards — separate ── */}
            <div className="grid grid-cols-4 gap-3">

              {/* Compliance Alerts — red highlighted */}
              <div
                className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-3"
                style={{ border: "1px solid var(--color-red-200)", background: "var(--color-red-000)" }}
              >
                <p className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-red-700)" }}>Compliance Alerts</p>
                <p className="text-[22px] font-bold leading-none" style={{ color: "var(--color-red-700)" }}>{animAlerts}</p>
                <p className="text-[10px] mt-1" style={{ color: "var(--color-red-700)" }}>High-risk escalations requiring action</p>
              </div>

              <div
                className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-4"
                style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
              >
                <p className="text-[9px] font-medium uppercase tracking-wider mb-1 text-ds-neutral-600">Decision Support</p>
                <p className="text-[22px] font-bold text-ds-neutral-900 leading-none">{animDecisions}</p>
                <p className="text-[10px] mt-1 text-ds-neutral-600">Final decisions pending</p>
              </div>

              <div
                className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-5"
                style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
              >
                <p className="text-[9px] font-medium uppercase tracking-wider mb-1 text-ds-neutral-600">Next to Complete</p>
                <p className="text-[22px] font-bold text-ds-neutral-900 leading-none">{animPipeline}</p>
                <p className="text-[10px] mt-1 text-ds-neutral-600">Moving to close</p>
              </div>

              <div
                className="rounded-lg px-4 py-3 dashboard-card anim-fade-slide-up anim-delay-6"
                style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
              >
                <p className="text-[9px] font-medium uppercase tracking-wider mb-1 text-ds-neutral-600">Client Responses</p>
                <p className="text-[22px] font-bold text-ds-neutral-900 leading-none">{animClientResp}</p>
                <p className="text-[10px] mt-1 text-ds-neutral-600">Unblocked by submissions</p>
              </div>

            </div>

            {/* ── Hero Section: Priority Cases + Cases by Status ── */}
            <div className="grid grid-cols-[1fr_1fr] gap-3 anim-fade-slide-up anim-delay-3">

              {/* Left: Priority Cases */}
              <div style={card} className="p-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[13px] font-bold text-ds-neutral-900">Priority Cases</h2>
                    {/* High-priority count badge — ties this table to the KPI tile */}
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: "var(--color-red-000)", color: "var(--color-red-700)", border: "1px solid var(--color-red-200)" }}
                    >
                      <AlertTriangle size={9} aria-hidden="true" />
                      {PRIORITY_CASES.filter(c => c.priority === "High").length} High
                    </span>
                  </div>
                  <Link to="/dashboard" className="text-[11px] font-semibold text-ds-dark-blue-600 hover:underline flex items-center gap-0.5">
                    View all <ChevronRight size={11} />
                  </Link>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 px-2 pb-1.5 mb-0.5" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-ds-neutral-400 w-[68px]">Priority</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-ds-neutral-400">Case / Entity</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-ds-neutral-400 text-right">Due</span>
                </div>

                {/* Rows */}
                <div className="flex-1 flex flex-col divide-y divide-ds-neutral-100">
                  {PRIORITY_CASES.map((c) => {
                    const isUrgentDue = c.due === "Today" || c.due.includes("hrs");
                    const priorityPillStyle: Record<PriorityLevel2, string> = {
                      High:   "bg-ds-red-000 text-ds-red-700 border border-ds-red-200",
                      Medium: "bg-ds-yellow-000 text-ds-neutral-700 border border-ds-yellow-300",
                      Low:    "bg-ds-neutral-100 text-ds-neutral-600 border border-ds-neutral-200",
                    };
                    return (
                      <Link
                        key={c.id}
                        to="/case"
                        state={{ caseId: c.id, entity: c.entity, priority: c.priority }}
                        className="grid grid-cols-[auto_1fr_auto] gap-3 px-2 py-2.5 items-start rounded-md hover:bg-ds-neutral-50 transition-colors group"
                      >
                        {/* Priority pill — tooltip explains why */}
                        <span
                          className={`inline-flex items-center justify-center w-[68px] px-2 py-0.5 rounded-full font-semibold mt-0.5 cursor-help ${c.priority === "Medium" ? "text-[9px]" : "text-[10px]"} ${priorityPillStyle[c.priority]}`}
                          title={c.priorityReason}
                          aria-label={`Priority: ${c.priority}. ${c.priorityReason}`}
                        >
                          {c.priority}
                        </span>

                        {/* Case info */}
                        <div className="min-w-0">
                          {/* Row 1: ID + entity */}
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[12px] font-bold text-ds-neutral-900 group-hover:text-ds-dark-blue-600 transition-colors leading-none shrink-0">{c.id}</p>
                            <span className="text-[11px] font-medium text-ds-neutral-700 truncate leading-none">{c.entity}</span>
                          </div>
                          {/* Row 2: reason — 2-line wrap */}
                          <p className="text-[10px] text-ds-neutral-500 leading-snug min-w-0" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.reason}</p>
                        </div>

                        {/* Due + effort + chevron */}
                        <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                          <span className={`text-[11px] font-semibold tabular-nums ${
                            isUrgentDue ? "text-ds-red-700" : "text-ds-neutral-600"
                          }`}>{c.due}</span>
                          <span
                            className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded tabular-nums"
                            style={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-100)" }}
                            title="AI-estimated based on AHT and historical patterns"
                          >
                            <Zap size={8} aria-hidden="true" />
                            {c.effort}
                          </span>
                          <ChevronRight size={11} className="text-ds-neutral-300 group-hover:text-ds-dark-blue-600 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right: Cases by Status */}
              <div style={card} className="p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-[13px] font-semibold text-ds-neutral-900">Cases by Status</h2>
                    <p className="text-[10px] text-ds-neutral-800 mt-0.5">Operational workload distribution</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-ds-neutral-800 font-medium uppercase tracking-wider">Total Active</p>
                    <p className="text-[24px] font-bold text-ds-neutral-900 leading-none">{totalActive}</p>
                  </div>
                </div>
                {/* Pie — top half, fills available width */}
                <div className="flex-1 min-h-0" role="img" aria-label="Pie chart showing case distribution by status: Not Started 20%, In Progress 30%, Pending Feedback 30%, Complete 20%">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={STATUS_DATA}
                        cx="50%"
                        cy="50%"
                        outerRadius="88%"
                        paddingAngle={0}
                        dataKey="count"
                        strokeWidth={1}
                        stroke="var(--color-base-white)"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
                              {payload.pct}%
                            </text>
                          );
                        }}
                        labelLine={false}
                      >
                        {STATUS_DATA.map((s, i) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, _: string, entry: any) => [`${value} cases (${entry.payload.pct}%)`, entry.payload.label]}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--color-neutral-200)", boxShadow: "var(--shadow-400)" }}
                        itemStyle={{ color: "var(--color-neutral-800)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend — below pie */}
                <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid var(--color-neutral-100)" }}>
                  {STATUS_DATA.map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-[11px] text-ds-neutral-700 flex-1">{s.label}</span>
                      <span className="text-[11px] font-bold text-ds-neutral-900 tabular-nums">{s.count}</span>
                      <span className="text-[10px] text-ds-neutral-500 tabular-nums w-8 text-right">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── Secondary Analytics Row ── */}
            <div className="grid grid-cols-2 gap-3 anim-fade-slide-up anim-delay-4">

              <div style={card} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-[13px] font-semibold text-ds-neutral-900">Cases Over Time</h2>
                    <p className="text-[10px] text-ds-neutral-800 mt-0.5">New, completed, and overdue</p>
                  </div>
                  <select
                    value={chartRange}
                    onChange={e => setChartRange(e.target.value)}
                    aria-label="Select chart date range"
                    className="text-[10px] font-semibold text-ds-neutral-600 bg-ds-neutral-100 border-none rounded px-2 py-1 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ds-dark-blue-600"
                  >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartRange === "Last 30 Days" ? CASES_OVER_TIME_30D : chartRange === "Last 90 Days" ? CASES_OVER_TIME_90D : CASES_OVER_TIME_7D} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} style={{ background: "#ffffff" }}>
                    <CartesianGrid strokeDasharray="" stroke="#E5E5E5" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#666666" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={{ stroke: "#666666" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#666666" }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10, paddingTop: 8, color: "#666666" }} />
                    <Line type="monotone" dataKey="new" stroke="var(--color-dark-blue-600)" strokeWidth={2} dot={false} name="New Cases" />
                    <Line type="monotone" dataKey="completed" stroke="var(--color-green-700)" strokeWidth={2} dot={false} name="Completed" />
                    <Line type="monotone" dataKey="overdue" stroke="var(--color-neutral-600)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Overdue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={card} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-[13px] font-semibold text-ds-neutral-900">Response Time Trend</h2>
                    <p className="text-[10px] text-ds-neutral-800 mt-0.5">Avg days vs SLA target</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-ds-neutral-600">
                    <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: "var(--color-neutral-600)" }} />SLA</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={RESPONSE_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} style={{ background: "#ffffff" }}>
                    <CartesianGrid strokeDasharray="" stroke="#E5E5E5" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#666666" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={{ stroke: "#666666" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#666666" }} axisLine={false} tickLine={false} domain={[2, 4.5]} />
                    <Tooltip {...tooltipStyle} />
                    <ReferenceLine y={3} stroke="var(--color-neutral-600)" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "SLA", position: "right", fontSize: 9, fill: "var(--color-neutral-600)" }} />
                    <Line type="monotone" dataKey="avg" stroke="var(--color-dark-blue-600)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-dark-blue-600)", strokeWidth: 0 }} name="Avg (days)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* ── Operational Forecast ── */}
            <div style={card} className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-[13px] font-bold text-ds-neutral-900">Operational Forecast</h2>
                  <p className="text-[10px] text-ds-neutral-800 mt-0.5">AI-generated projection based on operational workflow trends</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-[10px] text-ds-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-[2px] inline-block rounded" style={{ background: "var(--color-neutral-800)" }} />
                      Projected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-[2px] inline-block rounded" style={{ background: "var(--color-neutral-400)" }} />
                      Actual
                    </span>
                  </div>
                  <select
                    value={forecastRange}
                    onChange={e => setForecastRange(e.target.value)}
                    className="text-[11px] font-medium text-ds-neutral-700 bg-ds-neutral-100 border-none rounded px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="30d">Next 30 Days</option>
                    <option value="60d">This Month</option>
                    <option value="90d">Next Quarter</option>
                    <option value="6m">Custom Range</option>
                  </select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={148}>
                <AreaChart data={FORECAST_DATA[forecastRange]} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="projectedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-neutral-800)" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="var(--color-neutral-800)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-neutral-500)" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="var(--color-neutral-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--color-neutral-150, #ebebeb)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--color-neutral-600)", fontWeight: 500 }}
                    axisLine={{ stroke: "var(--color-neutral-300)" }}
                    tickLine={false}
                    dy={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--color-neutral-600)", fontWeight: 500 }}
                    axisLine={{ stroke: "var(--color-neutral-300)" }}
                    tickLine={false}
                    domain={[0, 140]}
                    tickCount={5}
                  />
                  <Tooltip {...tooltipStyle} />
                  <ReferenceLine
                    x="May 7"
                    stroke="var(--color-neutral-400)"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{ value: "Today", position: "insideTopRight", fontSize: 9, fill: "var(--color-neutral-700)", dy: -2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expected"
                    stroke="var(--color-neutral-800)"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    fill="url(#projectedFill)"
                    dot={false}
                    name="Projected"
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--color-neutral-500)"
                    strokeWidth={2.5}
                    fill="url(#actualFill)"
                    dot={{ r: 3, fill: "var(--color-neutral-600)", strokeWidth: 0 }}
                    name="Actual"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[9px] mt-1.5" style={{ color: "var(--color-neutral-600)" }}>
                * Projections are estimates. Accuracy depends on a configured capacity model — values shown are illustrative until your model is set up.
              </p>
            </div>

          </div>

          {/* Drag handle */}
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
            onKeyDown={e => {
              if (e.key === "ArrowLeft") setRightPaneW(w => Math.min(RIGHT_PANE_MAX, w + 20));
              if (e.key === "ArrowRight") setRightPaneW(w => Math.max(RIGHT_PANE_MIN, w - 20));
            }}
          >
            <div className="w-0.5 h-12 rounded-full bg-ds-neutral-200 group-hover:bg-ds-dark-blue-400 transition-colors" />
          </div>

          {/* ═══ RIGHT: AI Operations Context + Collaboration ═══ */}
          <div className="flex flex-col gap-3 shrink-0" style={{ width: rightPaneW }}>

            {/* AI Operations Context panel — 2/3 height */}
            <div
              className="flex flex-col overflow-hidden"
              style={{ background: "var(--color-base-white)", border: "1px solid var(--color-neutral-200)", borderRadius: 10, minHeight: 0, flex: "3 1 0" }}
            >
              {/* Panel header — fixed */}
              <div
                className="shrink-0 px-4 pt-4 pb-3 flex flex-col gap-3"
                style={{ borderBottom: "1px solid var(--color-neutral-100)" }}
              >
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-ds-dark-blue-600 shrink-0" />
                  <span className="text-[14px] font-bold text-ds-neutral-900">AI Operations Context</span>
                  <button
                    onClick={() => setExpandedPanel("ai")}
                    className="ml-auto w-6 h-6 flex items-center justify-center rounded text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-ds-dark-blue-600"
                    aria-label="Expand AI Operations Context panel"
                  >
                    <Maximize2 size={12} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[12px] font-semibold text-ds-neutral-900">Alex, your operations are at risk today.</p>
                  <p className="text-[11px] leading-relaxed text-ds-neutral-900">
                    AI has identified 3 SLA breaches within 24 hours, a growing Decision Support backlog, and 2 unresolved compliance alerts requiring immediate action.
                  </p>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 pt-3 pb-2 flex flex-col gap-3">

                {/* KPI drill-down context */}
                {kpiContext && (
                  <div className="rounded-lg p-3 anim-fade-slide-up anim-delay-0" style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap size={10} className="text-ds-dark-blue-600" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-ds-dark-blue-600">AI Analysis — {kpiContext.label}</span>
                      </div>
                      <button onClick={() => setKpiContext(null)} className="text-ds-neutral-600 hover:text-ds-neutral-900 text-[12px] leading-none">×</button>
                    </div>

                    {/* All rotating data points */}
                    {kpiContext.allFrames && (
                      <div className="mb-3 rounded-md overflow-hidden" style={{ border: "1px solid var(--color-dark-blue-150, #c5d8f0)" }}>
                        {kpiContext.allFrames.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-2.5 py-1.5"
                            style={{
                              background: i % 2 === 0 ? "var(--color-dark-blue-000)" : "var(--color-blend-600)",
                              borderBottom: i < kpiContext.allFrames!.length - 1 ? "1px solid var(--color-dark-blue-100)" : undefined,
                            }}
                          >
                            <span className="text-[13px] font-bold text-ds-neutral-900 leading-none">
                              {f.value}{f.unit ? <span className="text-[11px] font-medium ml-1 text-ds-neutral-600">{f.unit}</span> : null}
                            </span>
                            {f.sub && (
                              <span className="text-[11px] font-medium" style={{ color: f.subColor ?? "var(--color-neutral-900)" }}>{f.sub}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-ds-neutral-700 leading-relaxed mb-2">{kpiContext.summary}</p>
                    <div className="flex flex-col gap-1">
                      {(kpiContext.points ?? []).map((pt, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-[10px] font-bold text-ds-dark-blue-600 shrink-0 mt-0.5">{i + 1}.</span>
                          <p className="text-[10px] text-ds-neutral-700 leading-snug">{pt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI-Recommended Actions */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldAlert size={12} className="text-ds-neutral-700" />
                    <p className="font-bold uppercase tracking-wider text-ds-neutral-700" style={{ fontSize: "var(--label-small-size)" }}>AI-Recommended Actions</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {AI_PRIORITY_ACTIONS.map((action, i) => {
                      const isCritical = action.urgency === "critical";
                      const isOpen = activeAction === i;
                      const cardBorder = isCritical
                        ? "1px solid var(--color-red-200)"
                        : "1px solid var(--color-neutral-200)";
                      const cardBg = isCritical
                        ? "var(--color-red-000)"
                        : "var(--color-base-white)";
                      return (
                        <div
                          key={i}
                          className={`rounded-lg overflow-hidden anim-fade-slide-up anim-delay-${i}`}
                          style={{ border: cardBorder, background: cardBg }}
                        >
                          {/* Card header row — clickable */}
                          <div
                            onClick={() => setActiveAction(prev => prev === i ? null : i)}
                            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveAction(prev => prev === i ? null : i); } }}
                            role="button"
                            tabIndex={0}
                            aria-expanded={activeAction === i}
                            aria-label={`${action.title}. ${action.context}`}
                            className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:brightness-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-dark-blue-600 rounded-t-lg"
                          >
                            {/* Urgency dot */}
                            <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${action.dot}`} aria-hidden="true" />
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-ds-neutral-900 leading-snug" style={{ fontSize: "var(--body-small-size)" }}>{action.title}</p>
                              <p className={`mt-0.5 leading-snug ${isCritical ? "text-ds-red-700" : "text-ds-neutral-600"}`} style={{ fontSize: "var(--label-small-size)" }}>{action.context}</p>
                            </div>
                            {/* Badges */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {i === 0 && (
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full font-medium"
                                  style={{ border: "1px solid var(--color-neutral-300)", color: "var(--color-neutral-700)", background: "var(--color-base-white)", fontSize: "var(--label-small-size)" }}
                                >
                                  Recommended
                                </span>
                              )}
                              <ChevronRight
                                size={13}
                                className="text-ds-neutral-400 transition-transform"
                                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                              />
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isOpen && ACTION_DETAILS[i] && (
                            <div
                              className="px-3 pb-3 anim-fade-slide-up anim-delay-0"
                              style={{ borderTop: "1px solid var(--color-neutral-100)" }}
                            >
                              <p className="font-bold text-ds-neutral-900 mt-2.5 mb-1.5" style={{ fontSize: "var(--body-small-size)" }}>
                                {ACTION_DETAILS[i].title}
                              </p>
                              <p className="leading-relaxed mb-1.5" style={{ fontSize: "var(--label-small-size)", color: "var(--color-neutral-800)" }}>
                                <span className="font-bold">Reasoning: </span>
                                {ACTION_DETAILS[i].reasoning}
                              </p>
                              <p className="leading-relaxed mb-2.5" style={{ fontSize: "var(--label-small-size)", color: "var(--color-neutral-800)" }}>
                                <span className="font-bold">Flagged for Risk: </span>
                                {ACTION_DETAILS[i].flaggedFor}
                              </p>
                              <div className="pt-2" style={{ borderTop: "1px solid var(--color-neutral-100)" }}>
                                <Link
                                  to={ACTION_DETAILS[i].actionTo}
                                  state={ACTION_DETAILS[i].actionState}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-ds-dark-blue-600 hover:underline transition-colors"
                                >
                                  {ACTION_DETAILS[i].actionLabel}
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

                {/* Follow-up thread */}
                <div>
                  <div className="h-px bg-ds-neutral-100 mb-3" />
                  <p className="font-semibold uppercase tracking-wider text-ds-neutral-700 mb-2" style={{ fontSize: "var(--label-small-size)", lineHeight: "var(--label-small-line-height)" }}>Ask a follow-up</p>

                  {/* Message thread */}
                  {followUpThread.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
                      {followUpThread.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          {msg.role === "agent" && (
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-1.5 mt-0.5" style={{ background: "linear-gradient(135deg, #00338D, #4F46E5)" }} aria-hidden="true">
                              <Zap size={9} className="text-white" aria-hidden="true" />
                            </div>
                          )}
                          <div
                            className="px-2.5 py-2 rounded-lg text-[11px] leading-relaxed max-w-[88%]"
                            style={{
                              background: msg.role === "user" ? "var(--color-dark-blue-600)" : "var(--color-neutral-000)",
                              color: msg.role === "user" ? "var(--color-base-white)" : "var(--color-neutral-800)",
                              border: msg.role === "agent" ? "1px solid var(--color-neutral-200)" : "none",
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {followUpThinking && (
                        <div className="flex justify-start">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-1.5 mt-0.5" style={{ background: "linear-gradient(135deg, #00338D, #4F46E5)" }}>
                            <Zap size={9} className="text-white" />
                          </div>
                          <div className="px-2.5 py-2 rounded-lg flex items-center gap-1" style={{ background: "var(--color-neutral-050, #fafafa)", border: "1px solid var(--color-neutral-200)" }}>
                            {[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-ds-neutral-300" style={{ animation: `pulse 1.2s ease-in-out ${d * 0.22}s infinite` }} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input */}
                  <div
                    className="rounded-lg flex flex-col gap-2 p-2"
                    style={{ border: "1px solid var(--color-dark-blue-200)" }}
                  >
                    <textarea
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFollowUp(); } }}
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
                      <Button variant="outlined" size="small" label="Ask" onClick={sendFollowUp} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Collaboration & Insights */}
            <div
              className="overflow-hidden"
              style={{ background: "var(--color-base-white)", border: "1px solid var(--color-neutral-200)", boxShadow: "var(--shadow-000)", borderRadius: 8, flex: "2 1 0", minHeight: 0 }}
            >
              <div className="px-4 pt-4 pb-3 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-bold text-ds-neutral-900">Collaboration & Insights</h2>
                  <button
                    onClick={() => setExpandedPanel("collab")}
                    className="w-6 h-6 flex items-center justify-center rounded text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors"
                    title="Expand panel"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {collab.map((c, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded ${c.bg} border border-ds-neutral-100 flex items-center justify-center shrink-0`}>
                        {c.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-ds-neutral-900 leading-snug">{c.text}</p>
                        <p className="text-[10px] text-ds-neutral-600 mt-0.5">{c.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
      {/* ── Expanded panel slide-over ── */}
      {expandedPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[180]"
            style={{ background: "rgba(0,20,60,0.3)", backdropFilter: "blur(2px)" }}
            onClick={() => setExpandedPanel(null)}
          />
          {/* Drawer */}
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
            {/* Drawer header */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-dark-blue-000)" }}
            >
              <div className="flex items-center gap-2">
                {expandedPanel === "ai" ? (
                  <>
                    <Activity size={14} className="text-ds-dark-blue-600" />
                    <span className="text-[14px] font-bold text-ds-neutral-900">AI Operations Context</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={14} className="text-ds-dark-blue-600" />
                    <span className="text-[14px] font-bold text-ds-neutral-900">Collaboration & Insights</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setExpandedPanel(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-ds-neutral-500 hover:text-ds-neutral-800 hover:bg-ds-neutral-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Drawer body — two-column layout for AI, spacious list for collab */}
            {expandedPanel === "ai" ? (
              <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-[1fr_1fr] divide-x divide-ds-neutral-100">

                {/* Left col: summary + recommended actions */}
                <div className="flex flex-col overflow-y-auto min-h-0 px-6 pt-5 pb-5 gap-5">
                  {/* Context summary */}
                  <div className="rounded-xl p-4" style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)" }}>
                    <p className="text-[13px] font-semibold text-ds-neutral-900 mb-1">Alex, your operations are at risk today.</p>
                    <p className="text-[12px] leading-relaxed text-ds-neutral-700">
                      AI has identified 3 SLA breaches within 24 hours, a growing Decision Support backlog, and 2 unresolved compliance alerts requiring immediate action.
                    </p>
                  </div>

                  {/* Recommended actions */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <ShieldAlert size={12} className="text-ds-neutral-700" />
                      <p className="font-bold uppercase tracking-wider text-ds-neutral-700 text-[10px]">AI-Recommended Actions</p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {AI_PRIORITY_ACTIONS.map((action, i) => {
                        const isCritical = action.urgency === "critical";
                        const isOpen = activeAction === i;
                        return (
                          <div
                            key={i}
                            className="rounded-lg overflow-hidden"
                            style={{
                              border: isCritical ? "1px solid var(--color-red-200)" : "1px solid var(--color-neutral-200)",
                              background: isCritical ? "var(--color-red-000)" : "var(--color-base-white)",
                            }}
                          >
                            <div
                              onClick={() => setActiveAction(prev => prev === i ? null : i)}
                              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:brightness-[0.97] transition-all"
                            >
                              <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${action.dot}`} aria-hidden="true" />
                              <div className="flex-1">
                                <p className="text-[13px] font-semibold text-ds-neutral-900">{action.title}</p>
                                <p className={`text-[12px] mt-0.5 leading-snug ${isCritical ? "text-ds-red-700" : "text-ds-neutral-600"}`}>{action.context}</p>
                              </div>
                              <ChevronRight size={13} className="text-ds-neutral-400 shrink-0 mt-0.5 transition-transform" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }} />
                            </div>
                            {isOpen && ACTION_DETAILS[i] && (
                              <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid var(--color-neutral-100)" }}>
                                <p className="text-[12px] font-bold text-ds-neutral-900 mb-1">{ACTION_DETAILS[i].title}</p>
                                <p className="text-[12px] leading-relaxed text-ds-neutral-700 mb-1">
                                  <span className="font-semibold">Reasoning: </span>{ACTION_DETAILS[i].reasoning}
                                </p>
                                <p className="text-[12px] leading-relaxed text-ds-neutral-700 mb-2.5">
                                  <span className="font-semibold">Flagged for Risk: </span>{ACTION_DETAILS[i].flaggedFor}
                                </p>
                                <div className="pt-2" style={{ borderTop: "1px solid var(--color-neutral-100)" }}>
                                  <Link
                                    to={ACTION_DETAILS[i].actionTo}
                                    state={ACTION_DETAILS[i].actionState}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-ds-dark-blue-600 hover:underline transition-colors"
                                  >
                                    {ACTION_DETAILS[i].actionLabel}
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
                </div>

                {/* Right col: follow-up chat */}
                <div className="flex flex-col min-h-0 px-6 pt-5 pb-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ds-neutral-700 mb-3">Ask a follow-up</p>

                  {/* Thread */}
                  <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 mb-4 pr-1">
                    {followUpThread.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00338D, #4F46E5)" }}>
                          <Zap size={16} className="text-white" />
                        </div>
                        <p className="text-[12px] font-semibold text-ds-neutral-700">Ask the AI agent a follow-up</p>
                        <p className="text-[11px] text-ds-neutral-500">Questions about SLA risk, case backlog, compliance alerts, and more.</p>
                      </div>
                    )}
                    {followUpThread.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "agent" && (
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5" style={{ background: "linear-gradient(135deg, #00338D, #4F46E5)" }}>
                            <Zap size={10} className="text-white" />
                          </div>
                        )}
                        <div
                          className="px-3 py-2.5 rounded-xl text-[12px] leading-relaxed max-w-[85%]"
                          style={{
                            background: msg.role === "user" ? "var(--color-dark-blue-600)" : "var(--color-neutral-050, #fafafa)",
                            color: msg.role === "user" ? "var(--color-base-white)" : "var(--color-neutral-800)",
                            border: msg.role === "agent" ? "1px solid var(--color-neutral-200)" : "none",
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {followUpThinking && (
                      <div className="flex justify-start">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5" style={{ background: "linear-gradient(135deg, #00338D, #4F46E5)" }}>
                          <Zap size={10} className="text-white" />
                        </div>
                        <div className="px-3 py-2.5 rounded-xl flex items-center gap-1.5" style={{ background: "var(--color-neutral-050, #fafafa)", border: "1px solid var(--color-neutral-200)" }}>
                          {[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-ds-neutral-300" style={{ animation: `pulse 1.2s ease-in-out ${d * 0.22}s infinite` }} />)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="shrink-0 rounded-xl flex flex-col gap-2 p-3" style={{ border: "1px solid var(--color-dark-blue-200)" }}>
                    <textarea
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFollowUp(); } }}
                      placeholder="Ask a follow-up question…"
                      rows={3}
                      className="w-full text-[13px] bg-transparent outline-none text-ds-neutral-700 placeholder:text-ds-neutral-400 resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between">
                      <button className="w-7 h-7 flex items-center justify-center rounded-md text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors" title="Attach file">
                        <Paperclip size={14} />
                      </button>
                      <Button variant="outlined" size="small" label="Send" onClick={sendFollowUp} />
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Collaboration expanded — full list, no truncation */
              <div className="flex-1 overflow-y-auto px-6 pt-5 pb-5">
                <div className="flex flex-col gap-0 divide-y divide-ds-neutral-100">
                  {collab.map((c, i) => (
                    <div key={i} className="flex items-start gap-4 py-4">
                      <div className={`w-9 h-9 rounded-lg ${c.bg} border border-ds-neutral-100 flex items-center justify-center shrink-0`}>
                        {c.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-ds-neutral-900 leading-relaxed">{c.text}</p>
                        <p className="text-[11px] text-ds-neutral-500 mt-1">{c.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
