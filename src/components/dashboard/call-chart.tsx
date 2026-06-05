"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DayData {
  day: string;
  Completed: number;
  "No Answer": number;
  Failed: number;
}

interface CallChartProps {
  data: DayData[];
}

const TOOLTIP_STYLE = {
  background: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#f1f5f9",
  fontSize: 12,
};

export function CallChart({ data }: CallChartProps) {
  const hasData = data.some((d) => d.Completed + d["No Answer"] + d.Failed > 0);

  return (
    <div className="glass rounded-2xl">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h2 className="font-display font-bold text-lg text-white">Call Analytics</h2>
        <p className="font-body text-xs mt-1 text-slate-500">Last 7 days</p>
      </div>
      <div className="px-6 py-5">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="font-body text-sm text-slate-400">No call data yet.</p>
            <p className="font-body text-xs mt-1 text-slate-600">
              Call history will appear here once reminders run.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barCategoryGap="30%">
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 12 }}
              />
              <Bar dataKey="Completed" fill="#4ade80" radius={[3, 3, 0, 0]} />
              <Bar dataKey="No Answer" fill="#fbbf24" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Failed" fill="#f87171" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
