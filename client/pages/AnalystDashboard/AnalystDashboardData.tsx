export type PriorityLevel2 = "High" | "Medium" | "Low";
export type CaseStatus =
  | "Escalated"
  | "Overdue"
  | "Pending Decision"
  | "Awaiting Client";

export type ActionDetail = {
  title: string;
  reasoning: string;
  flaggedFor: string;
  actionLabel: string;
  actionTo: string;
  actionState?: Record<string, string>;
};

export type AiPriorityAction = {
  urgency: "critical" | "high" | "medium";
  title: string;
  context: string;
  dot: string;
  timeClass: string;
};

export type CollabIconName = "message" | "globe" | "file";

export type CollabItem = {
  iconName: CollabIconName;
  bg: string;
  text: string;
  time: string;
};

export type PeriodMetrics = {
  attention: number;
  responseTime: string;
  complete: number;
  caseReview: number;
  overdue: number;
  decisions: number;
  pipeline: number;
  clientResp: number;
  compAlerts: number;
};

export type Period = {
  label: string;
  delta: {
    attention: string;
    responseTime: string;
    complete: string;
  };
  kpis: PeriodMetrics;
};

export type StatusDatum = {
  label: string;
  count: number;
  pct: number;
  color: string;
};

export type PriorityCase = {
  priority: PriorityLevel2;
  id: string;
  entity: string;
  status: CaseStatus;
  due: string;
  reason: string;
  priorityReason: string;
  effort: string;
};

export type CasesOverTimePoint = {
  day: string;
  new: number;
  completed: number;
  overdue: number;
};

export type ForecastPoint = {
  date: string;
  expected: number;
  actual: number | null;
};

export type ResponseTrendPoint = {
  day: string;
  avg: number;
  sla: number;
};

export const ACTION_DETAILS: Record<number, ActionDetail> = {
  0: {
    title: "Imminent SLA Breach Detected",
    reasoning:
      "KYC-2194 has been escalated and the SLA window closes in under 2 hours. AI has reviewed all attached documents and confirmed entity ownership is verified. No outstanding data gaps were identified.",
    flaggedFor:
      "Failure to sign off within the SLA window will trigger an automatic compliance flag and require a post-breach corrective action report, increasing regulatory exposure.",
    actionLabel: "Sign off on KYC-2194",
    actionTo: "/case",
    actionState: {
      caseId: "KYC-2194",
      entity: "BlackRock Advisors",
      priority: "High",
    },
  },
  1: {
    title: "Unresponsive Client — Escalation Required",
    reasoning:
      "KYC-2210 has had no client response for 5 consecutive days. AI has logged all outreach attempts and confirmed no documentation has been received since the initial submission.",
    flaggedFor:
      "Continued inaction risks a compliance hold on the account. Formal escalation is required to initiate the outreach protocol and preserve the audit trail.",
    actionLabel: "Escalate KYC-2210",
    actionTo: "/case",
    actionState: {
      caseId: "KYC-2210",
      entity: "BlackRock Institutional",
      priority: "High",
    },
  },
  2: {
    title: "Decision Support Backlog Identified",
    reasoning:
      "AI pre-screened all 13 Decision Support cases and identified 4 as low-risk based on document completeness and entity profile. The remaining 9 require human review before decisions can be finalized.",
    flaggedFor:
      "Delayed decisions increase average response time and contribute to SLA drift. Resolving the 4 low-risk cases now reduces overall backlog by 31%.",
    actionLabel: "Review Decision Support queue",
    actionTo: "/dashboard",
  },
  3: {
    title: "Unresolved Compliance Alerts",
    reasoning:
      "Two compliance alerts are currently active and unacknowledged. Both were triggered by sanctions screening flags that require analyst review and corrective action documentation.",
    flaggedFor:
      "Alerts unresolved by end of business will generate an automatic regulatory notification. Both must be acknowledged and archived to avoid a formal compliance breach.",
    actionLabel: "View compliance alerts",
    actionTo: "/dashboard",
  },
};

export const AI_PRIORITY_ACTIONS: AiPriorityAction[] = [
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

export const collab: CollabItem[] = [
  {
    iconName: "message",
    bg: "bg-ds-dark-blue-000",
    text: "Quinn Doe commented on the existing document",
    time: "Today, 7:08 AM",
  },
  {
    iconName: "globe",
    bg: "bg-ds-dark-blue-000",
    text: "AI Agent linked 3 new documents",
    time: "Yesterday, 3:12 PM",
  },
  {
    iconName: "file",
    bg: "bg-ds-neutral-100",
    text: 'You rejected "The Exception" entity',
    time: "April 22, 2026, 7:18 AM",
  },
  {
    iconName: "message",
    bg: "bg-ds-dark-blue-000",
    text: "Quinn Doe commented on the existing document",
    time: "April 22, 2026, 6:03 AM",
  },
];

export const PERIODS: Period[] = [
  {
    label: "Today",
    delta: {
      attention: "+2 since yesterday",
      responseTime: "↑ 0.4d vs yesterday",
      complete: "↓ 3% vs yesterday",
    },
    kpis: {
      attention: 2,
      responseTime: "3.2",
      complete: 48,
      caseReview: 25,
      overdue: 7,
      decisions: 13,
      pipeline: 5,
      clientResp: 3,
      compAlerts: 2,
    },
  },
  {
    label: "This Week",
    delta: {
      attention: "+5 vs last week",
      responseTime: "↓ 0.3d vs last week",
      complete: "↑ 8% vs last week",
    },
    kpis: {
      attention: 11,
      responseTime: "2.8",
      complete: 61,
      caseReview: 52,
      overdue: 14,
      decisions: 28,
      pipeline: 19,
      clientResp: 8,
      compAlerts: 5,
    },
  },
  {
    label: "This Month",
    delta: {
      attention: "+12 vs last month",
      responseTime: "↑ 0.1d vs last month",
      complete: "↑ 12% vs last month",
    },
    kpis: {
      attention: 34,
      responseTime: "3.1",
      complete: 74,
      caseReview: 168,
      overdue: 31,
      decisions: 87,
      pipeline: 52,
      clientResp: 22,
      compAlerts: 11,
    },
  },
];

export const STATUS_DATA: StatusDatum[] = [
  { label: "Not Started", count: 2, pct: 20, color: "var(--color-neutral-400)" },
  { label: "In Progress", count: 3, pct: 30, color: "var(--color-dark-blue-600)" },
  { label: "Pending Feedback", count: 3, pct: 30, color: "var(--color-dark-blue-300)" },
  { label: "Complete", count: 2, pct: 20, color: "var(--color-green-700)" },
];

export const PRIORITY_CASES: PriorityCase[] = [
  {
    priority: "High",
    id: "KYC-2194",
    entity: "BlackRock Advisors",
    status: "Escalated",
    due: "2 hrs",
    effort: "45 min",
    reason: "Sanctions flag unresolved — SLA window closes in 2 hours.",
    priorityReason:
      "High: active SLA breach risk with unresolved sanctions match requiring immediate analyst action.",
  },
  {
    priority: "High",
    id: "KYC-2210",
    entity: "BlackRock Institutional",
    status: "Overdue",
    due: "Today",
    effort: "30 min",
    reason: "Client unreachable for 5 days — escalation path required.",
    priorityReason:
      "High: client non-responsive beyond SLA threshold; escalation is the only remaining resolution path.",
  },
  {
    priority: "Medium",
    id: "KYC-2188",
    entity: "BlackRock Institutional",
    status: "Pending Decision",
    due: "Tomorrow",
    effort: "20 min",
    reason: "Analyst sign-off needed before SLA closes tomorrow.",
    priorityReason:
      "Medium: pending analyst decision with SLA due tomorrow; no blockers, action needed today.",
  },
  {
    priority: "Medium",
    id: "KYC-2203",
    entity: "Entity 13",
    status: "Pending Decision",
    due: "Friday",
    effort: "1.5 hrs",
    reason: "Ownership discrepancy flagged during periodic refresh.",
    priorityReason:
      "Medium: ownership structure discrepancy requires review before periodic refresh cycle closes.",
  },
  {
    priority: "Low",
    id: "KYC-2215",
    entity: "BlackRock Advisors",
    status: "Awaiting Client",
    due: "Next Week",
    effort: "15 min",
    reason: "Outstanding document request — follow-up due next week.",
    priorityReason:
      "Low: awaiting client-submitted documents; no analyst action required until response received.",
  },
];

export const CASES_OVER_TIME_7D: CasesOverTimePoint[] = [
  { day: "Mon", new: 12, completed: 8, overdue: 3 },
  { day: "Tue", new: 18, completed: 14, overdue: 4 },
  { day: "Wed", new: 15, completed: 16, overdue: 3 },
  { day: "Thu", new: 21, completed: 13, overdue: 6 },
  { day: "Fri", new: 17, completed: 19, overdue: 4 },
  { day: "Sat", new: 9, completed: 11, overdue: 2 },
  { day: "Sun", new: 11, completed: 15, overdue: 3 },
];

export const CASES_OVER_TIME_30D: CasesOverTimePoint[] = [
  { day: "Apr 7", new: 28, completed: 22, overdue: 7 },
  { day: "Apr 10", new: 32, completed: 27, overdue: 8 },
  { day: "Apr 13", new: 25, completed: 30, overdue: 6 },
  { day: "Apr 16", new: 38, completed: 28, overdue: 9 },
  { day: "Apr 19", new: 41, completed: 35, overdue: 11 },
  { day: "Apr 22", new: 36, completed: 39, overdue: 8 },
  { day: "Apr 25", new: 29, completed: 33, overdue: 7 },
  { day: "Apr 28", new: 44, completed: 38, overdue: 10 },
  { day: "May 1", new: 39, completed: 42, overdue: 9 },
  { day: "May 4", new: 51, completed: 44, overdue: 12 },
  { day: "May 7", new: 47, completed: 49, overdue: 8 },
];

export const CASES_OVER_TIME_90D: CasesOverTimePoint[] = [
  { day: "Feb", new: 210, completed: 185, overdue: 42 },
  { day: "Mar 1", new: 240, completed: 210, overdue: 51 },
  { day: "Mar 15", new: 228, completed: 232, overdue: 48 },
  { day: "Apr 1", new: 265, completed: 248, overdue: 55 },
  { day: "Apr 15", new: 289, completed: 271, overdue: 61 },
  { day: "May 1", new: 312, completed: 295, overdue: 67 },
  { day: "May 7", new: 298, completed: 310, overdue: 58 },
];

export const FORECAST_DATA: Record<string, ForecastPoint[]> = {
  "30d": [
    { date: "May 1", expected: 119, actual: 119 },
    { date: "May 5", expected: 102, actual: 98 },
    { date: "May 7", expected: 90, actual: 87 },
    { date: "May 10", expected: 75, actual: null },
    { date: "May 15", expected: 55, actual: null },
    { date: "May 20", expected: 34, actual: null },
    { date: "May 25", expected: 14, actual: null },
    { date: "May 31", expected: 0, actual: null },
  ],
  "60d": [
    { date: "May 1", expected: 119, actual: 119 },
    { date: "May 7", expected: 90, actual: 87 },
    { date: "May 15", expected: 70, actual: null },
    { date: "May 22", expected: 55, actual: null },
    { date: "Jun 1", expected: 40, actual: null },
    { date: "Jun 10", expected: 28, actual: null },
    { date: "Jun 20", expected: 15, actual: null },
    { date: "Jun 30", expected: 5, actual: null },
  ],
  "90d": [
    { date: "May 1", expected: 119, actual: 119 },
    { date: "May 15", expected: 95, actual: null },
    { date: "Jun 1", expected: 75, actual: null },
    { date: "Jun 15", expected: 58, actual: null },
    { date: "Jul 1", expected: 42, actual: null },
    { date: "Jul 15", expected: 25, actual: null },
    { date: "Aug 1", expected: 10, actual: null },
    { date: "Aug 7", expected: 0, actual: null },
  ],
  "6m": [
    { date: "May", expected: 119, actual: 119 },
    { date: "Jun", expected: 95, actual: null },
    { date: "Jul", expected: 72, actual: null },
    { date: "Aug", expected: 50, actual: null },
    { date: "Sep", expected: 30, actual: null },
    { date: "Oct", expected: 12, actual: null },
  ],
  "1y": [
    { date: "May 25", expected: 119, actual: 119 },
    { date: "Jul 25", expected: 95, actual: null },
    { date: "Sep 25", expected: 72, actual: null },
    { date: "Nov 25", expected: 50, actual: null },
    { date: "Jan 26", expected: 30, actual: null },
    { date: "Mar 26", expected: 15, actual: null },
    { date: "May 26", expected: 5, actual: null },
  ],
};

export const RESPONSE_TREND: ResponseTrendPoint[] = [
  { day: "Mon", avg: 3.8, sla: 3.0 },
  { day: "Tue", avg: 3.5, sla: 3.0 },
  { day: "Wed", avg: 3.2, sla: 3.0 },
  { day: "Thu", avg: 3.6, sla: 3.0 },
  { day: "Fri", avg: 2.9, sla: 3.0 },
  { day: "Sat", avg: 2.7, sla: 3.0 },
  { day: "Sun", avg: 3.1, sla: 3.0 },
];

export const AGENT_STATUSES: string[] = [
  "Monitoring active cases...",
  "Analyzing SLA risk patterns...",
  "Scanning compliance signals...",
  "Reviewing Decision Support queue...",
  "Projecting case volume trends...",
  "Evaluating PEP & sanctions flags...",
];

export const FOLLOW_UP_RESPONSES: Record<string, string> = {
  default:
    "Based on today's case data, I've analyzed your queue and identified the following key insights: 3 cases are at immediate SLA risk, with KYC-2194 requiring escalation before end of day. Decision Support backlog has grown 14% since Monday — clearing those 13 items should be your priority after handling urgent escalations. Would you like me to prioritize your queue based on SLA impact?",
  sla: "Your current SLA compliance rate is 82%. Two cases — KYC-2194 and KYC-2210 — are at high breach risk today. I recommend escalating KYC-2194 immediately and reassigning KYC-2210 to ensure a second outreach attempt before 5pm. Addressing these two cases alone would bring your SLA rate to 94%.",
  risk: "Of your 48 active cases, 6 are rated High Risk. Three are in the Decision Support queue awaiting your sign-off. KYC-2194 has an unresolved sanctions flag that requires senior approval before closure. I recommend prioritizing these flagged cases before end of week to avoid compliance exposure.",
  overdue:
    "You currently have 2 overdue cases: KYC-2194 (overdue by 6 hours) and KYC-2210 (overdue since yesterday). Both have had at least one outreach attempt. For KYC-2210, client response has not been received — I recommend formal escalation to your supervisor with documentation of the outreach history.",
  summary:
    "Here is today's operational summary: 3 urgent cases requiring attention, 13 Decision Support items pending your decision, 5 cases ready to close, and 3 cases unblocked by recent client submissions. Avg response time is 3.2 days — slightly above the 72-hour SLA target. Completing the 5 near-close cases today would improve your completion rate from 48% to 58%.",
};

export type AnalystDashboardViewModel = {
  actionDetails: Record<number, ActionDetail>;
  aiPriorityActions: AiPriorityAction[];
  collab: CollabItem[];
  periods: Period[];
  statusData: StatusDatum[];
  priorityCases: PriorityCase[];
  casesOverTime7d: CasesOverTimePoint[];
  casesOverTime30d: CasesOverTimePoint[];
  casesOverTime90d: CasesOverTimePoint[];
  forecastData: Record<string, ForecastPoint[]>;
  responseTrend: ResponseTrendPoint[];
  agentStatuses: string[];
  followUpResponses: Record<string, string>;
};

// TODO: replace with TanStack Query API call
export function getAnalystDashboardViewModel(): AnalystDashboardViewModel {
  return {
    actionDetails: ACTION_DETAILS,
    aiPriorityActions: AI_PRIORITY_ACTIONS,
    collab,
    periods: PERIODS,
    statusData: STATUS_DATA,
    priorityCases: PRIORITY_CASES,
    casesOverTime7d: CASES_OVER_TIME_7D,
    casesOverTime30d: CASES_OVER_TIME_30D,
    casesOverTime90d: CASES_OVER_TIME_90D,
    forecastData: FORECAST_DATA,
    responseTrend: RESPONSE_TREND,
    agentStatuses: AGENT_STATUSES,
    followUpResponses: FOLLOW_UP_RESPONSES,
  };
}
