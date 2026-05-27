import type { CSSProperties } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { StatusDatum } from "../AnalystDashboardData";

type CasesByStatusCardProps = {
  data: StatusDatum[];
};

const cardStyle: CSSProperties = {
  background: "var(--color-base-white)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: 8,
};

export function CasesByStatusCard({ data }: CasesByStatusCardProps) {
  const totalActive = data
    .filter((s) => s.label !== "Complete")
    .reduce((a, b) => a + b.count, 0);

  return (
    <div style={cardStyle} className="p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-[13px] font-semibold text-ds-neutral-900">
            Cases by Status
          </h2>
          <p className="text-[10px] text-ds-neutral-800 mt-0.5">
            Operational workload distribution
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-ds-neutral-800 font-medium uppercase tracking-wider">
            Total Active
          </p>
          <p className="text-[24px] font-bold text-ds-neutral-900 leading-none">
            {totalActive}
          </p>
        </div>
      </div>
      <div
        className="flex-1 min-h-0"
        role="img"
        aria-label="Pie chart showing case distribution by status: Not Started 20%, In Progress 30%, Pending Feedback 30%, Complete 20%"
      >
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
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
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={700}
                  >
                    {payload.pct}%
                  </text>
                );
              }}
              labelLine={false}
            >
              {data.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _: string, entry: any) => [
                `${value} cases (${entry.payload.pct}%)`,
                entry.payload.label,
              ]}
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: "1px solid var(--color-neutral-200)",
                boxShadow: "var(--shadow-400)",
              }}
              itemStyle={{ color: "var(--color-neutral-800)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex flex-col gap-2 pt-2"
        style={{ borderTop: "1px solid var(--color-neutral-100)" }}
      >
        {data.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-[11px] text-ds-neutral-700 flex-1">
              {s.label}
            </span>
            <span className="text-[11px] font-bold text-ds-neutral-900 tabular-nums">
              {s.count}
            </span>
            <span className="text-[10px] text-ds-neutral-500 tabular-nums w-8 text-right">
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
