"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  COMPASS_AXIS_LABELS,
  COMPASS_AXIS_ORDER,
} from "@/lib/scoreRules";
import type { CompassAxisScores } from "@/lib/types";

type RadarChartProps = {
  title?: string;
  scores: CompassAxisScores;
  compareScores?: CompassAxisScores;
  currentLabel?: string;
  compareLabel?: string;
};

export function RadarChart({
  title = "Health Compass",
  scores,
  compareScores,
  currentLabel = "現在",
  compareLabel = "変更後",
}: RadarChartProps) {
  const data = COMPASS_AXIS_ORDER.map((key) => ({
    axis: COMPASS_AXIS_LABELS[key],
    current: scores[key],
    compare: compareScores ? compareScores[key] : undefined,
  }));

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>{title}</h2>
        <p>高いほど、その視点では状態がよいイメージです。</p>
      </div>

      <div className="chart-panel radar-panel">
        <ResponsiveContainer width="100%" height={360}>
          <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#c5d4cf" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "#3d534c", fontSize: 14, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#7a8f88", fontSize: 11 }}
              tickCount={5}
            />
            <Radar
              name={currentLabel}
              dataKey="current"
              stroke="#2f6f5e"
              fill="#2f6f5e"
              fillOpacity={compareScores ? 0.2 : 0.35}
              strokeWidth={2}
            />
            {compareScores ? (
              <Radar
                name={compareLabel}
                dataKey="compare"
                stroke="#c47b3a"
                fill="#c47b3a"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            ) : null}
          </RechartsRadarChart>
        </ResponsiveContainer>

        {compareScores ? (
          <div className="legend-row">
            <span className="legend-item legend-current">{currentLabel}</span>
            <span className="legend-item legend-compare">{compareLabel}</span>
          </div>
        ) : null}
      </div>

      <p className="disclaimer">
        Compass
        Scoreは疾病発症確率ではなく、健康状態を理解するための可視化指標です。
      </p>
    </section>
  );
}
