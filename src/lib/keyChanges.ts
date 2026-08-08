/**
 * Picks the most important multi-year changes for the Result page.
 * Communication-focused heuristics — not a validated clinical ranking.
 */

import { FATTY_LIVER_LABEL_JA, firstVitals, lastVitals } from "@/lib/patientHelpers";
import type { KeyChange, Patient } from "@/lib/types";

type Candidate = {
  id: string;
  score: number;
  change: KeyChange;
};

export function buildKeyChanges(patient: Patient, limit = 3): KeyChange[] {
  const first = firstVitals(patient);
  const last = lastVitals(patient);
  const candidates: Candidate[] = [];

  const weightDelta = last.weightKg - first.weightKg;
  const hba1cDelta = last.hba1c - first.hba1c;
  const altDelta = last.alt - first.alt;
  const fattyWorsened =
    (["none", "mild", "moderate", "severe"] as const).indexOf(last.fattyLiver) >
    (["none", "mild", "moderate", "severe"] as const).indexOf(first.fattyLiver);

  if (weightDelta >= 3 && (hba1cDelta >= 0.4 || altDelta >= 15 || fattyWorsened)) {
    candidates.push({
      id: "metabolic-cluster",
      score: 100 + weightDelta + hba1cDelta * 10,
      change: {
        id: "metabolic-cluster",
        title: "体重増加に伴う代謝悪化",
        summary: "体重・血糖・肝臓まわりが同じ方向へ動いています。",
        evidence: [
          {
            label: "体重",
            from: `${first.weightKg}kg`,
            to: `${last.weightKg}kg`,
          },
          {
            label: "HbA1c",
            from: `${first.hba1c}%`,
            to: `${last.hba1c}%`,
          },
          {
            label: "ALT",
            from: `${first.alt}`,
            to: `${last.alt}`,
          },
          {
            label: "脂肪肝",
            from: FATTY_LIVER_LABEL_JA[first.fattyLiver],
            to: FATTY_LIVER_LABEL_JA[last.fattyLiver],
          },
        ],
      },
    });
  }

  const sbpDelta = last.sbp - first.sbp;
  if (sbpDelta >= 8) {
    candidates.push({
      id: "bp-rise",
      score: 70 + sbpDelta,
      change: {
        id: "bp-rise",
        title: "収縮期血圧の上昇",
        summary: "血圧が年々上がる流れが続いています。",
        evidence: [
          {
            label: "SBP",
            from: `${first.sbp}mmHg`,
            to: `${last.sbp}mmHg`,
          },
        ],
      },
    });
  }

  const ldlDelta = last.ldl - first.ldl;
  if (ldlDelta >= 15) {
    candidates.push({
      id: "ldl-rise",
      score: 60 + ldlDelta,
      change: {
        id: "ldl-rise",
        title: "LDLコレステロールの上昇",
        summary: "脂質の数値が悪化方向へ動いています。",
        evidence: [
          {
            label: "LDL",
            from: `${first.ldl}mg/dL`,
            to: `${last.ldl}mg/dL`,
          },
        ],
      },
    });
  }

  const egfrDelta = first.egfr - last.egfr;
  if (egfrDelta >= 5) {
    candidates.push({
      id: "egfr-decline",
      score: 40 + egfrDelta,
      change: {
        id: "egfr-decline",
        title: "eGFRの低下傾向",
        summary: "腎臓の指標が緩やかに下がっています。",
        evidence: [
          {
            label: "eGFR",
            from: `${first.egfr}`,
            to: `${last.egfr}`,
          },
        ],
      },
    });
  }

  const ctrDelta = last.ctrPercent - first.ctrPercent;
  if (ctrDelta >= 3) {
    candidates.push({
      id: "ctr-rise",
      score: 35 + ctrDelta * 2,
      change: {
        id: "ctr-rise",
        title: "CTRの増加",
        summary: "心胸郭比が3年で広がっています。",
        evidence: [
          {
            label: "CTR",
            from: `${first.ctrPercent}%`,
            to: `${last.ctrPercent}%`,
          },
        ],
      },
    });
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((c) => c.change);
}
