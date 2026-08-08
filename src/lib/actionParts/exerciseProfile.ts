import type { ExerciseLevel, PatientProfile } from "@/lib/actionParts/types";

/**
 * Internal banding to pick exercise parts.
 * Not a diagnosis — do not show Level labels as patient disease names.
 */
export function classifyExerciseLevel(profile: PatientProfile): ExerciseLevel {
  const age = profile.age ?? 50;
  const adl = profile.adl ?? "independent";
  const activity = profile.activityLevel ?? "moderate";
  const walking = profile.walkingAbility ?? "normal";
  const sarcopenia =
    profile.sarcopeniaStatus === "suspected" ||
    profile.sarcopeniaStatus === "present" ||
    profile.flags?.sarcopeniaAttention;
  const lowMuscle =
    (profile.muscleMass !== null &&
      profile.muscleMass !== undefined &&
      profile.muscleMass < 0) || // placeholder sentinel unused
    false;
  const frailSignals =
    sarcopenia ||
    profile.fallHistory === true ||
    adl === "dependent" ||
    walking === "difficult" ||
    (profile.gripStrength !== null &&
      profile.gripStrength !== undefined &&
      profile.gripStrength < 28);

  if (frailSignals || lowMuscle || adl === "partiallyLimited" && sarcopenia) {
    return "D";
  }

  const joints = profile.jointProblems?.filter((j) => j !== "none") ?? [];
  const bmi = profile.bmi ?? null;
  const obese =
    (bmi !== null && bmi >= 27) || Boolean(profile.flags?.obesity);
  const lowActive = activity === "low";
  const jointLoad = joints.length > 0 || walking === "slow" || walking === "assistiveDevice";

  if ((obese && (lowActive || jointLoad)) || (lowActive && jointLoad)) {
    return "C";
  }

  if (age >= 70 && adl === "independent" && !sarcopenia) {
    return "B";
  }

  if (activity === "high" || (activity === "moderate" && walking === "normal" && age < 70)) {
    return "A";
  }

  if (age >= 65 && adl === "independent") {
    return "B";
  }

  return lowActive ? "C" : "A";
}

export const EXERCISE_LEVEL_LABEL: Record<ExerciseLevel, string> = {
  A: "Level A（活動性良好）",
  B: "Level B（高齢だがADL自立）",
  C: "Level C（低活動・肥満・関節負担）",
  D: "Level D（フレイル・筋量低下配慮）",
};
