import type { CSSProperties } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ResponseTrendPoint } from "../AnalystDashboardData";

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

type ResponseTrendCardProps = {
  data: ResponseTrendPoint[];
};

export function ResponseTrendCard({ data }: ResponseTrendCardProps) {
  return (
    <div style={cardStyle} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[13px] font-semibold text-ds-neutral-900">
            Response Time Trend
          </h2>
          <p className="text-[10px] text-ds-neutral-800 mt-0.5">
            Avg days vs SLA target
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-ds-neutral-600">
          <span className="flex items-center gap-1">
            <span
              className="w-4 border-t-2 border-dashed inline-block"
              style={{ borderColor: "var(--color-neutral-600)" }}
            />
            SLA
          </span>
        </div>
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
            domain={[2, 4.5]}
          />
          <Tooltip {...tooltipStyle} />
          <ReferenceLine
            y={3}
            stroke="var(--color-neutral-600)"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: "SLA",
              position: "right",
              fontSize: 9,
              fill: "var(--color-neutral-600)",
            }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="var(--color-dark-blue-600)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-dark-blue-600)", strokeWidth: 0 }}
            name="Avg (days)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
