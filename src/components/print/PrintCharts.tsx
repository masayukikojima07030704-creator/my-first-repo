"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  COMPASS_AXIS_LABELS,
  COMPASS_AXIS_ORDER,
} from "@/lib/scoreRules";
import type { CompassAxisScores, YearlyVitals } from "@/lib/types";

type PrintRadarProps = {
  scores: CompassAxisScores;
};

export function PrintRadar({ scores }: PrintRadarProps) {
  const data = COMPASS_AXIS_ORDER.map((key) => ({
    axis: COMPASS_AXIS_LABELS[key],
    value: scores[key],
  }));

  return (
    <div className="print-chart-box">
      <ResponsiveContainer width="100%" height={190}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
          <PolarGrid stroke="#999" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#111", fontSize: 11, fontWeight: 700 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#444", fontSize: 9 }}
            tickCount={4}
          />
          <Radar
            dataKey="value"
            stroke="#111"
            fill="#666"
            fillOpacity={0.25}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

type PrintTrendProps = {
  vitalsByYear: YearlyVitals[];
};

export function PrintTrend({ vitalsByYear }: PrintTrendProps) {
  const sorted = [...vitalsByYear].sort((a, b) => a.year - b.year);
  const base = sorted[0];

  const data = sorted.map((v) => ({
    year: String(v.year),
    weight: Math.round((v.weightKg / base.weightKg) * 100),
    hba1c: Math.round((v.hba1c / base.hba1c) * 100),
    sbp: Math.round((v.sbp / base.sbp) * 100),
  }));

  return (
    <div className="print-chart-box">
      <p className="print-chart-caption">
        主要3指標の相対変化（{base.year}年 = 100）
      </p>
      <ResponsiveContainer width="100%" height={132}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fill: "#111", fontSize: 10 }} />
          <YAxis tick={{ fill: "#444", fontSize: 9 }} width={28} domain={[90, "auto"]} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#111"
            strokeWidth={1.8}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="hba1c"
            stroke="#555"
            strokeWidth={1.6}
            strokeDasharray="4 2"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="sbp"
            stroke="#333"
            strokeWidth={1.4}
            strokeDasharray="2 2"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="print-legend">
        <span>実線: 体重</span>
        <span>破線: HbA1c</span>
        <span>点線: SBP</span>
      </div>
      <table className="print-mini-table">
        <thead>
          <tr>
            <th>項目</th>
            {sorted.map((v) => (
              <th key={v.year}>{v.year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>体重</td>
            {sorted.map((v) => (
              <td key={`w-${v.year}`}>{v.weightKg}kg</td>
            ))}
          </tr>
          <tr>
            <td>HbA1c</td>
            {sorted.map((v) => (
              <td key={`h-${v.year}`}>{v.hba1c}%</td>
            ))}
          </tr>
          <tr>
            <td>SBP</td>
            {sorted.map((v) => (
              <td key={`s-${v.year}`}>{v.sbp}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
