import {
  COMPASS_AXIS_ORDER,
  computeAxisScores,
  computeCompassScore,
} from "@/lib/scoreRules";
import type {
  CompassAxisScores,
  HealthDirection,
  Patient,
  TrendMetricKey,
  TrendMetricOption,
  YearlyVitals,
} from "@/lib/types";

export const TREND_METRIC_OPTIONS: TrendMetricOption[] = [
  { key: "weightKg", label: "体重", unit: "kg" },
  { key: "hba1c", label: "HbA1c", unit: "%" },
  { key: "sbp", label: "収縮期血圧", unit: "mmHg" },
  { key: "ldl", label: "LDL", unit: "mg/dL" },
  { key: "alt", label: "ALT", unit: "U/L" },
  { key: "egfr", label: "eGFR", unit: "mL/min/1.73m²" },
  { key: "ctrPercent", label: "CTR", unit: "%" },
];

export type YearScorePoint = {
  year: number;
  axes: CompassAxisScores;
  compassScore: number;
};

export function buildYearScoreSeries(patient: Patient): YearScorePoint[] {
  return patient.vitalsByYear.map((vitals) => {
    const axes = computeAxisScores(vitals, patient.heightCm);
    return {
      year: vitals.year,
      axes,
      compassScore: computeCompassScore(axes),
    };
  });
}

/**
 * Health Velocity: average yearly change in Compass Score.
 * Negative means the visualization score is declining (worsening trajectory).
 */
export function computeHealthVelocity(series: YearScorePoint[]): number {
  if (series.length < 2) return 0;
  const deltas: number[] = [];
  for (let i = 1; i < series.length; i += 1) {
    deltas.push(series[i].compassScore - series[i - 1].compassScore);
  }
  const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  return Math.round(avg * 10) / 10;
}

export function classifyDirection(velocity: number): HealthDirection {
  if (velocity >= 2) return "improving";
  if (velocity <= -2) return "worsening";
  return "stable";
}

export function directionLabel(direction: HealthDirection): string {
  switch (direction) {
    case "improving":
      return "改善";
    case "stable":
      return "安定";
    case "worsening":
      return "悪化";
  }
}

export function extractMetricSeries(
  vitalsByYear: YearlyVitals[],
  key: TrendMetricKey,
): { year: number; value: number }[] {
  return vitalsByYear.map((v) => ({ year: v.year, value: v[key] }));
}

export function ctrThreeYearDelta(vitalsByYear: YearlyVitals[]): number {
  const sorted = [...vitalsByYear].sort((a, b) => a.year - b.year);
  if (sorted.length < 2) return 0;
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return Math.round((last.ctrPercent - first.ctrPercent) * 10) / 10;
}

export function averageAxisDelta(
  current: CompassAxisScores,
  next: CompassAxisScores,
): number {
  const deltas = COMPASS_AXIS_ORDER.map((key) => next[key] - current[key]);
  return Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length);
}

export function latestVitals(patient: Patient): YearlyVitals {
  const sorted = [...patient.vitalsByYear].sort((a, b) => a.year - b.year);
  return sorted[sorted.length - 1];
}
