/**
 * Health Compass Score rules (visualization only).
 *
 * These mappings help patients and clinicians see "where we are" on a 0–100
 * radar. They are NOT disease onset probabilities and are NOT a validated
 * medical risk model. Adjust thresholds here without touching UI code.
 */

import type {
  CompassAxisKey,
  CompassAxisScores,
  FattyLiverGrade,
  SimulatorInputs,
  YearlyVitals,
} from "@/lib/types";

export const COMPASS_AXIS_LABELS: Record<CompassAxisKey, string> = {
  vascular: "血管",
  metabolic: "代謝",
  liver: "肝臓",
  kidney: "腎臓",
  cancerPrevention: "がん予防",
};

export const COMPASS_AXIS_ORDER: CompassAxisKey[] = [
  "vascular",
  "metabolic",
  "liver",
  "kidney",
  "cancerPrevention",
];

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Linear map: value at `best` → 100, at `worst` → 0 (and beyond). */
function scoreLinear(value: number, best: number, worst: number): number {
  if (best === worst) return 50;
  const t = (worst - value) / (worst - best);
  return clamp(Math.round(t * 100), 0, 100);
}

function bmiKgM2(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

const FATTY_LIVER_SCORE: Record<FattyLiverGrade, number> = {
  none: 100,
  mild: 70,
  moderate: 45,
  severe: 20,
};

/**
 * Visualization heuristics for each axis.
 * Tunable constants live here so clinical collaborators can revise later.
 */
export function computeAxisScores(
  vitals: YearlyVitals,
  heightCm: number,
  options?: { smoking?: boolean },
): CompassAxisScores {
  const bmi = bmiKgM2(vitals.weightKg, heightCm);

  const vascular = Math.round(
    (scoreLinear(vitals.sbp, 110, 160) + scoreLinear(vitals.ldl, 100, 180)) / 2,
  );

  const metabolic = Math.round(
    (scoreLinear(bmi, 22, 32) + scoreLinear(vitals.hba1c, 5.4, 7.5)) / 2,
  );

  const liver = Math.round(
    (scoreLinear(vitals.alt, 20, 80) + FATTY_LIVER_SCORE[vitals.fattyLiver]) /
      2,
  );

  // Higher eGFR → better visualization score in this demo mapping.
  const kidney = scoreLinear(vitals.egfr, 95, 45);

  // Lifestyle-facing axis for communication. Smoking strongly lowers the demo
  // score; BMI is a soft secondary signal. Not a cancer incidence model.
  const smokingPenalty = options?.smoking ? 35 : 0;
  const cancerPrevention = clamp(
    Math.round(scoreLinear(bmi, 22, 33) - smokingPenalty),
    0,
    100,
  );

  return {
    vascular,
    metabolic,
    liver,
    kidney,
    cancerPrevention,
  };
}

export function computeCompassScore(axes: CompassAxisScores): number {
  const values = COMPASS_AXIS_ORDER.map((key) => axes[key]);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.round(avg);
}

export function applySimulatorToVitals(
  base: YearlyVitals,
  sim: SimulatorInputs,
): YearlyVitals {
  return {
    ...base,
    weightKg: sim.weightKg,
    sbp: sim.sbp,
    ldl: sim.ldl,
  };
}

export function scoresFromSimulator(
  base: YearlyVitals,
  heightCm: number,
  sim: SimulatorInputs,
): CompassAxisScores {
  const adjusted = applySimulatorToVitals(base, sim);
  return computeAxisScores(adjusted, heightCm, { smoking: sim.smoking });
}
