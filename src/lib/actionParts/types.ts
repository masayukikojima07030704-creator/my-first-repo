/**
 * Action Parts Library types.
 * Medical logic lives in part definitions + modifiers + safety rules.
 * AI (future) may only paraphrase patient-facing wording — never invent doses.
 */

export type ActionPartCategory =
  | "nutrition"
  | "exercise"
  | "monitoring"
  | "medicalFollowUp";

export type Sex = "female" | "male" | "other" | "unspecified";

export type AdlLevel = "independent" | "partiallyLimited" | "dependent";

export type ActivityLevel = "low" | "moderate" | "high";

export type WalkingAbility =
  | "normal"
  | "slow"
  | "assistiveDevice"
  | "difficult";

export type SarcopeniaStatus = "none" | "suspected" | "present" | "unknown";

export type JointProblem = "knee" | "hip" | "back" | "none";

export type AlcoholLevel = "none" | "moderate" | "heavy" | "unknown";

export type WeightTrend = "increasing" | "stable" | "decreasing" | "unknown";

export type FattyLiverGrade = "none" | "mild" | "moderate" | "severe";

/** Optional enrichment — more fields ⇒ finer personalization. */
export type PatientProfile = {
  age?: number;
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  /** Computed when height+weight exist; may also be stored. */
  bmi?: number;
  weightTrend?: WeightTrend;

  adl?: AdlLevel;
  activityLevel?: ActivityLevel;
  walkingAbility?: WalkingAbility;
  fallHistory?: boolean;
  gripStrength?: number | null;
  muscleMass?: number | null;
  sarcopeniaStatus?: SarcopeniaStatus;
  jointProblems?: JointProblem[];

  smoking?: boolean;
  alcohol?: AlcoholLevel;

  bloodPressure?: {
    sbp?: number;
    dbp?: number;
  };
  hba1c?: number;
  ldl?: number;
  tg?: number;
  egfr?: number;
  ast?: number;
  alt?: number;
  ggt?: number;
  fattyLiver?: FattyLiverGrade;

  /** Optional clinical flags for modifiers (not formal diagnoses in UI). */
  flags?: {
    diabetesSuspected?: boolean;
    hypertensionSuspected?: boolean;
    obesity?: boolean;
    fattyLiverPresent?: boolean;
    ckdAttention?: boolean;
    sarcopeniaAttention?: boolean;
  };

  /** Doctor-set 90-day weight goal (kg), editable. */
  weightGoalKg?: number;
};

/** Internal exercise banding — NOT a medical diagnosis label for patients. */
export type ExerciseLevel = "A" | "B" | "C" | "D";

export type ExerciseSafetyMode =
  | "usual"
  | "startLow"
  | "needsClinicianReview";

export type ExerciseDose = {
  frequencyPerWeek?: number;
  sessionsPerDay?: number;
  durationMinutes?: number;
  sets?: number;
  repetitions?: number;
  intensity?: "low" | "moderate" | "brisk";
  notes?: string;
};

/** Tunable numbers doctors can edit (not AI free-text doses). */
export type PartParameters = {
  riceReduceGrams?: number;
  snackCurfewHour?: number;
  snackMaxPerWeek?: number;
  vegServingsAdd?: number;
  proteinAddons?: string[];
  walkMinutes?: number;
  walkSessionsPerDay?: number;
  walkDaysPerWeek?: number;
  chairStandReps?: number;
  chairStandSets?: number;
  calfRaiseReps?: number;
  calfRaiseSets?: number;
  strengthDaysPerWeek?: number;
  [key: string]: string | number | string[] | undefined;
};

export type ActionPartSource = {
  source: string;
  sourceVersion: string;
};

export type ActionPartDefinition = ActionPartSource & {
  id: string;
  category: ActionPartCategory;
  title: string;
  shortTitle: string;
  description: string;
  /** Human-readable targeting hints for clinicians */
  targetConditions: string[];
  basePriority: number;
  goalTemplate: string;
  monitoringItems: string[];
  followUpPeriod: string;
  doctorEditable: boolean;
  defaultExerciseDose?: ExerciseDose;
  /** Build default parameters from profile */
  buildParams: (profile: ResolvedProfile) => PartParameters;
  /** Concrete patient actions from parameters */
  buildActions: (
    profile: ResolvedProfile,
    params: PartParameters,
  ) => string[];
  /** Eligibility: return false to hide from library recommendations */
  isEligible: (profile: ResolvedProfile) => boolean;
  /** Hard exclusion (e.g. calorie restriction in sarcopenia) */
  isExcluded: (profile: ResolvedProfile) => boolean;
};

export type ResolvedProfile = Omit<PatientProfile, "bmi"> & {
  bmi: number | null;
  exerciseLevel: ExerciseLevel;
  safetyMode: ExerciseSafetyMode;
  displayName: string;
  patientId: string;
};

export type RecommendedPart = {
  part: ActionPartDefinition;
  /** After modifiers */
  score: number;
  recommended: boolean;
  reasons: string[];
  safetyMode: ExerciseSafetyMode;
  params: PartParameters;
  actions: string[];
  goal: string;
  exerciseDose?: ExerciseDose;
};

/** Doctor-selected & possibly edited instance */
export type SelectedPartInstance = {
  instanceId: string;
  partId: string;
  category: ActionPartCategory;
  title: string;
  shortTitle: string;
  goal: string;
  actions: string[];
  monitoringItems: string[];
  followUpPeriod: string;
  params: PartParameters;
  exerciseDose?: ExerciseDose;
  doctorNotes?: string;
  recommended: boolean;
  safetyMode: ExerciseSafetyMode;
};

export type NinetyDayGoals = {
  weightFromKg?: number;
  weightToKg?: number;
  extraGoals: string[];
};

export type ActionPrescription = {
  id: string;
  patientId: string;
  createdAt: string;
  approvedByDoctor: boolean;
  goals: NinetyDayGoals;
  selected: SelectedPartInstance[];
  dailyChecks: string[];
  reevaluationItems: string[];
};
