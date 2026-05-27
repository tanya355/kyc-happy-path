import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TopNav } from "@/components/kyc/TopNav";

// ── Chart data ────────────────────────────────────────────────────────

const STATUS_DATA = [
  { label: "Not Started",      count: 2, pct: 20, color: "var(--color-neutral-400)" },
  { label: "In Progress",      count: 3, pct: 30, color: "var(--color-dark-blue-600)" },
  { label: "Pending Feedback", count: 3, pct: 30, color: "var(--color-dark-blue-300)" },
  { label: "Complete",         count: 2, pct: 20, color: "var(--color-green-700)" },
];

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
  { day: "Feb",    new: 210, completed: 185, overdue: 42 },
  { day: "Mar 1",  new: 240, completed: 210, overdue: 51 },
  { day: "Mar 15", new: 228, completed: 232, overdue: 48 },
  { day: "Apr 1",  new: 265, completed: 248, overdue: 55 },
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
    { date: "May", expected: 119, actual: 119 },
    { date: "Jun", expected: 95,  actual: null },
    { date: "Jul", expected: 72,  actual: null },
    { date: "Aug", expected: 50,  actual: null },
    { date: "Sep", expected: 30,  actual: null },
    { date: "Oct", expected: 12,  actual: null },
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

// ── Shared tooltip style ──────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: { fontSize: 11, background: "#ffffff", border: "1px solid #E5E5E5", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  labelStyle: { fontWeight: 700, color: "#00338D" },
  itemStyle: { color: "#666666" },
};

const card: React.CSSProperties = {
  background: "var(--color-base-white)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: 8,
};

// ── Page ──────────────────────────────────────────────────────────────

export default function Reports() {
  const [chartRange, setChartRange] = useState("Last 7 Days");
  const [forecastRange, setForecastRange] = useState("30d");

  const totalActive = STATUS_DATA.filter(s => s.label !== "Complete").reduce((a, b) => a + b.count, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNav />

      <main className="flex-1 px-6 py-6 overflow-y-auto">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-ds-neutral-900 leading-tight">Reports</h1>
          <p className="text-[12px] mt-0.5 text-ds-neutral-700">Operational analytics and AI-generated forecasts</p>
        </div>

        <div className="flex flex-col gap-4">

          {/* ── Top row: Cases by Status + Cases Over Time ── */}
          <div className="grid grid-cols-[280px_1fr] gap-4">

            {/* Cases by Status — pie */}
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

              <div className="flex-1 min-h-0" role="img" aria-label="Pie chart showing case distribution by status">
                <ResponsiveContainer width="100%" height={220}>
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

            {/* Cases Over Time */}
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
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={chartRange === "Last 30 Days" ? CASES_OVER_TIME_30D : chartRange === "Last 90 Days" ? CASES_OVER_TIME_90D : CASES_OVER_TIME_7D}
                  margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                >
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

          </div>

          {/* ── Response Time Trend — full width ── */}
          <div style={card} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[13px] font-semibold text-ds-neutral-900">Response Time Trend</h2>
                <p className="text-[10px] text-ds-neutral-800 mt-0.5">Avg days vs SLA target</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-ds-neutral-600">
                <span className="flex items-center gap-1">
                  <span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: "var(--color-neutral-600)" }} />
                  SLA
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={RESPONSE_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="" stroke="#E5E5E5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#666666" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={{ stroke: "#666666" }} />
                <YAxis tick={{ fontSize: 10, fill: "#666666" }} axisLine={false} tickLine={false} domain={[2, 4.5]} />
                <Tooltip {...tooltipStyle} />
                <ReferenceLine y={3} stroke="var(--color-neutral-600)" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "SLA", position: "right", fontSize: 9, fill: "var(--color-neutral-600)" }} />
                <Line type="monotone" dataKey="avg" stroke="var(--color-dark-blue-600)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-dark-blue-600)", strokeWidth: 0 }} name="Avg (days)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Operational Forecast — full width ── */}
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
            <ResponsiveContainer width="100%" height={200}>
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
      </main>
    </div>
  );
}
