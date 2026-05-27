import type { CSSProperties } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint } from "../AnalystDashboardData";

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

type ForecastChartCardProps = {
  range: string;
  onRangeChange: (range: string) => void;
  data: ForecastPoint[];
};

export function ForecastChartCard({
  range,
  onRangeChange,
  data,
}: ForecastChartCardProps) {
  return (
    <div style={cardStyle} className="px-4 pt-4 pb-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-[13px] font-bold text-ds-neutral-900">
            Operational Forecast
          </h2>
          <p className="text-[10px] text-ds-neutral-800 mt-0.5">
            AI-generated projection based on operational workflow trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[10px] text-ds-neutral-600">
            <span className="flex items-center gap-1.5">
              <span
                className="w-5 h-[2px] inline-block rounded"
                style={{ background: "var(--color-neutral-800)" }}
              />
              Projected
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-5 h-[2px] inline-block rounded"
                style={{ background: "var(--color-neutral-400)" }}
              />
              Actual
            </span>
          </div>
          <select
            value={range}
            onChange={(e) => onRangeChange(e.target.value)}
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
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="projectedFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-neutral-800)"
                stopOpacity={0.08}
              />
              <stop
                offset="95%"
                stopColor="var(--color-neutral-800)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-neutral-500)"
                stopOpacity={0.12}
              />
              <stop
                offset="95%"
                stopColor="var(--color-neutral-500)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="var(--color-neutral-150, #ebebeb)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 10,
              fill: "var(--color-neutral-600)",
              fontWeight: 500,
            }}
            axisLine={{ stroke: "var(--color-neutral-300)" }}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tick={{
              fontSize: 10,
              fill: "var(--color-neutral-600)",
              fontWeight: 500,
            }}
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
            label={{
              value: "Today",
              position: "insideTopRight",
              fontSize: 9,
              fill: "var(--color-neutral-700)",
              dy: -2,
            }}
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
      <p
        className="text-[9px] mt-1.5"
        style={{ color: "var(--color-neutral-600)" }}
      >
        * Projections are estimates. Accuracy depends on a configured capacity
        model — values shown are illustrative until your model is set up.
      </p>
    </div>
  );
}
