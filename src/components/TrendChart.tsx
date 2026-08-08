"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  extractMetricSeries,
  TREND_METRIC_OPTIONS,
} from "@/lib/trendCalculator";
import type { TrendMetricKey, YearlyVitals } from "@/lib/types";

type TrendChartProps = {
  vitalsByYear: YearlyVitals[];
};

export function TrendChart({ vitalsByYear }: TrendChartProps) {
  const [metric, setMetric] = useState<TrendMetricKey>("weightKg");

  const selected = useMemo(
    () => TREND_METRIC_OPTIONS.find((m) => m.key === metric) ?? TREND_METRIC_OPTIONS[0],
    [metric],
  );

  const data = useMemo(
    () => extractMetricSeries(vitalsByYear, metric),
    [vitalsByYear, metric],
  );

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>3年間の変化</h2>
        <p>見たい項目を選ぶと、2024〜2026年の流れが折れ線でわかります。</p>
      </div>

      <div className="metric-tabs" role="tablist" aria-label="推移を見る項目">
        {TREND_METRIC_OPTIONS.map((option) => {
          const active = option.key === metric;
          return (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? "metric-tab active" : "metric-tab"}
              onClick={() => setMetric(option.key)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="chart-panel">
        <p className="chart-caption">
          {selected.label}
          <span className="muted">（{selected.unit}）</span>
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#d7e3de" strokeDasharray="4 4" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#3d534c", fontSize: 13 }}
              axisLine={{ stroke: "#b7c9c2" }}
            />
            <YAxis
              tick={{ fill: "#6b8079", fontSize: 12 }}
              axisLine={{ stroke: "#b7c9c2" }}
              width={48}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #c9d8d2",
                background: "#fbfefc",
              }}
              formatter={(value) => [
                `${value} ${selected.unit}`,
                selected.label,
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2f6f5e"
              strokeWidth={3}
              dot={{ r: 5, fill: "#2f6f5e", strokeWidth: 0 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
