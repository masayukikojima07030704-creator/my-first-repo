import type {
  ExerciseLevel,
  ExerciseSafetyMode,
  PatientProfile,
} from "@/lib/actionParts/types";

/**
 * Explicit safety rules — no free-form AI contraindications.
 */
export function assessExerciseSafety(
  profile: PatientProfile,
  level: ExerciseLevel,
): ExerciseSafetyMode {
  if (profile.walkingAbility === "difficult" || profile.adl === "dependent") {
    return "needsClinicianReview";
  }

  if (profile.fallHistory === true) {
    return "needsClinicianReview";
  }

  if (profile.sarcopeniaStatus === "present") {
    return "startLow";
  }

  if (level === "D") {
    return "startLow";
  }

  if (
    profile.bloodPressure?.sbp !== undefined &&
    profile.bloodPressure.sbp >= 160
  ) {
    return "needsClinicianReview";
  }

  if (profile.walkingAbility === "assistiveDevice") {
    return "startLow";
  }

  if (level === "C") {
    return "startLow";
  }

  return "usual";
}

export const SAFETY_MODE_LABEL: Record<ExerciseSafetyMode, string> = {
  usual: "通常推薦",
  startLow: "低強度から開始",
  needsClinicianReview: "医師による確認が必要",
};

type DoseLike = {
  durationMinutes?: number;
  walkMinutes?: number;
  repetitions?: number;
  chairStandReps?: number;
  calfRaiseReps?: number;
  intensity?: string;
};

export function applySafetyToDose<T extends DoseLike>(
  dose: T,
  mode: ExerciseSafetyMode,
): T {
  if (mode === "usual") return dose;
  const next = { ...dose };
  if (typeof next.durationMinutes === "number") {
    next.durationMinutes = Math.max(5, Math.round(next.durationMinutes * 0.6));
  }
  if (typeof next.walkMinutes === "number") {
    next.walkMinutes = Math.max(5, Math.round(next.walkMinutes * 0.6));
  }
  if (typeof next.repetitions === "number") {
    next.repetitions = Math.max(5, Math.round(next.repetitions * 0.7));
  }
  if (typeof next.chairStandReps === "number") {
    next.chairStandReps = Math.max(5, Math.round(next.chairStandReps * 0.7));
  }
  if (typeof next.calfRaiseReps === "number") {
    next.calfRaiseReps = Math.max(5, Math.round(next.calfRaiseReps * 0.7));
  }
  if (next.intensity === "brisk" || next.intensity === "moderate") {
    next.intensity = "low";
  }
  return next;
}
