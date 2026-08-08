import type { Patient, YearlyVitals } from "@/lib/types";
import { firstVitals, lastVitals } from "@/lib/patientHelpers";
import { classifyExerciseLevel } from "@/lib/actionParts/exerciseProfile";
import { assessExerciseSafety } from "@/lib/actionParts/exerciseSafetyRules";
import type {
  PatientProfile,
  ResolvedProfile,
  WeightTrend,
} from "@/lib/actionParts/types";

export function computeBmi(
  weightKg?: number,
  heightCm?: number,
): number | null {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function inferWeightTrend(
  vitalsByYear: YearlyVitals[],
): WeightTrend {
  if (vitalsByYear.length < 2) return "unknown";
  const sorted = [...vitalsByYear].sort((a, b) => a.year - b.year);
  const first = sorted[0].weightKg;
  const last = sorted[sorted.length - 1].weightKg;
  const delta = last - first;
  if (delta >= 2) return "increasing";
  if (delta <= -2) return "decreasing";
  return "stable";
}

/** Merge yearly vitals + optional profile enrichment into a resolved view. */
export function resolvePatientProfile(
  patient: Patient,
  enrichment?: PatientProfile,
): ResolvedProfile {
  const last = lastVitals(patient);
  const first = firstVitals(patient);
  const heightCm = enrichment?.heightCm ?? patient.heightCm;
  const weightKg = enrichment?.weightKg ?? last.weightKg;
  const bmi = enrichment?.bmi ?? computeBmi(weightKg, heightCm);
  const weightTrend =
    enrichment?.weightTrend ?? inferWeightTrend(patient.vitalsByYear);

  const base: PatientProfile = {
    age: enrichment?.age,
    sex: enrichment?.sex,
    heightCm,
    weightKg,
    bmi: bmi ?? undefined,
    weightTrend,
    adl: enrichment?.adl ?? "independent",
    activityLevel: enrichment?.activityLevel ?? "low",
    walkingAbility: enrichment?.walkingAbility ?? "normal",
    fallHistory: enrichment?.fallHistory ?? false,
    gripStrength: enrichment?.gripStrength ?? null,
    muscleMass: enrichment?.muscleMass ?? null,
    sarcopeniaStatus: enrichment?.sarcopeniaStatus ?? "unknown",
    jointProblems: enrichment?.jointProblems ?? ["none"],
    smoking: enrichment?.smoking ?? false,
    alcohol: enrichment?.alcohol ?? "unknown",
    bloodPressure: enrichment?.bloodPressure ?? { sbp: last.sbp },
    hba1c: enrichment?.hba1c ?? last.hba1c,
    ldl: enrichment?.ldl ?? last.ldl,
    tg: enrichment?.tg,
    egfr: enrichment?.egfr ?? last.egfr,
    ast: enrichment?.ast,
    alt: enrichment?.alt ?? last.alt,
    ggt: enrichment?.ggt,
    fattyLiver: enrichment?.fattyLiver ?? last.fattyLiver,
    weightGoalKg:
      enrichment?.weightGoalKg ??
      (bmi !== null && bmi >= 25
        ? Math.round((weightKg - 3) * 10) / 10
        : weightKg),
    flags: enrichment?.flags,
  };

  const flags = {
    diabetesSuspected:
      base.flags?.diabetesSuspected ??
      (base.hba1c !== undefined && base.hba1c >= 6.5),
    hypertensionSuspected:
      base.flags?.hypertensionSuspected ??
      (base.bloodPressure?.sbp !== undefined && base.bloodPressure.sbp >= 140),
    obesity: base.flags?.obesity ?? (bmi !== null && bmi >= 25),
    fattyLiverPresent:
      base.flags?.fattyLiverPresent ??
      (base.fattyLiver !== undefined && base.fattyLiver !== "none"),
    ckdAttention:
      base.flags?.ckdAttention ??
      (base.egfr !== undefined && base.egfr < 60),
    sarcopeniaAttention:
      base.flags?.sarcopeniaAttention ??
      (base.sarcopeniaStatus === "suspected" ||
        base.sarcopeniaStatus === "present"),
  };

  const withFlags: PatientProfile = { ...base, flags };
  const exerciseLevel = classifyExerciseLevel(withFlags);
  const safetyMode = assessExerciseSafety(withFlags, exerciseLevel);

  return {
    ...withFlags,
    bmi,
    exerciseLevel,
    safetyMode,
    displayName: patient.displayName,
    patientId: patient.id,
    // keep first-year reference available via vitals only in builders
    // weight delta context:
    ...(first && last
      ? {}
      : {}),
  };
}

export function profileProblemLines(profile: ResolvedProfile): string[] {
  const lines: string[] = [];
  if (profile.weightTrend === "increasing" && profile.weightKg) {
    lines.push(`体重増加傾向（現在 ${profile.weightKg}kg）`);
  }
  if (profile.bmi !== null && profile.bmi >= 25) {
    lines.push(`BMI ${profile.bmi}（体格の余裕あり）`);
  }
  if (profile.hba1c !== undefined && profile.hba1c >= 6.0) {
    lines.push(`HbA1c ${profile.hba1c}%`);
  }
  if (profile.bloodPressure?.sbp !== undefined && profile.bloodPressure.sbp >= 130) {
    lines.push(`収縮期血圧 ${profile.bloodPressure.sbp}mmHg`);
  }
  if (profile.ldl !== undefined && profile.ldl >= 140) {
    lines.push(`LDL ${profile.ldl}mg/dL`);
  }
  if (profile.fattyLiver && profile.fattyLiver !== "none") {
    lines.push(`脂肪肝（${profile.fattyLiver}）`);
  }
  if (profile.alt !== undefined && profile.alt >= 40) {
    lines.push(`ALT ${profile.alt}`);
  }
  if (profile.flags?.ckdAttention) {
    lines.push(`eGFR ${profile.egfr}（腎臓への配慮）`);
  }
  if (profile.flags?.sarcopeniaAttention) {
    lines.push("サルコペニア疑い／筋量低下への配慮");
  }
  if (profile.jointProblems?.some((j) => j !== "none")) {
    lines.push(
      `関節負担: ${profile.jointProblems.filter((j) => j !== "none").join(", ")}`,
    );
  }
  if (lines.length === 0) {
    lines.push("大きな問題フラグは少ない状態です（データ追加で個別化が向上します）");
  }
  return lines;
}
