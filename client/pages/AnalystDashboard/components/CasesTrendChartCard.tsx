import type { CSSProperties } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CasesOverTimePoint } from "../AnalystDashboardData";

const cardStyle: CSSProperties = {
  background: "var(--color-base-white)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: 8,
};

const tooltipStyle = {
  contentStyle: {
    fontSize: 11,
    background: "#ffffff",
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  labelStyle: { fontWeight: 700, color: "#00338D" },
  itemStyle: { color: "#666666" },
};

type CasesTrendChartCardProps = {
  range: string;
  onRangeChange: (range: string) => void;
  data: CasesOverTimePoint[];
};

export function CasesTrendChartCard({
  range,
  onRangeChange,
  data,
}: CasesTrendChartCardProps) {
  return (
    <div style={cardStyle} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[13px] font-semibold text-ds-neutral-900">
            Cases Over Time
          </h2>
          <p className="text-[10px] text-ds-neutral-800 mt-0.5">
            New, completed, and overdue
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
          aria-label="Select chart date range"
          className="text-[10px] font-semibold text-ds-neutral-600 bg-ds-neutral-100 border-none rounded px-2 py-1 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ds-dark-blue-600"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          style={{ background: "#ffffff" }}
        >
          <CartesianGrid strokeDasharray="" stroke="#E5E5E5" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#666666" }}
            axisLine={{ stroke: "#E5E5E5" }}
            tickLine={{ stroke: "#666666" }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#666666" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip {...tooltipStyle} />
          <Legend
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 10, paddingTop: 8, color: "#666666" }}
          />
          <Line
            type="monotone"
            dataKey="new"
            stroke="var(--color-dark-blue-600)"
            strokeWidth={2}
            dot={false}
            name="New Cases"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="var(--color-green-700)"
            strokeWidth={2}
            dot={false}
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="overdue"
            stroke="var(--color-neutral-600)"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            name="Overdue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
