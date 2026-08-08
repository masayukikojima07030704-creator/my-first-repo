import type { PatientProfile } from "@/lib/actionParts/types";

export type FattyLiverGrade = "none" | "mild" | "moderate" | "severe";

export type HealthYear = 2024 | 2025 | 2026;

export type YearlyVitals = {
  year: HealthYear;
  weightKg: number;
  hba1c: number;
  sbp: number;
  ldl: number;
  alt: number;
  egfr: number;
  ctrPercent: number;
  fattyLiver: FattyLiverGrade;
};

export type CompassAxisKey =
  | "vascular"
  | "metabolic"
  | "liver"
  | "kidney"
  | "cancerPrevention";

export type CompassAxisScores = Record<CompassAxisKey, number>;

export type HealthDirection = "improving" | "stable" | "worsening";

export type HealthTypeInfo = {
  label: string;
  emoji: string;
  description: string;
};

export type Patient = {
  id: string;
  displayName: string;
  heightCm: number;
  vitalsByYear: YearlyVitals[];
  healthType: HealthTypeInfo;
  doctorMessageTemplate: string;
  /** Optional enrichment for Action Parts personalization */
  profile?: PatientProfile;
};

/** Inputs that Future Simulator can adjust (visualization only). */
export type SimulatorInputs = {
  weightKg: number;
  sbp: number;
  ldl: number;
  smoking: boolean;
};

export type TrendMetricKey =
  | "weightKg"
  | "hba1c"
  | "sbp"
  | "ldl"
  | "alt"
  | "egfr"
  | "ctrPercent";

export type TrendMetricOption = {
  key: TrendMetricKey;
  label: string;
  unit: string;
};

/** Evidence line shown in Action Plan WHY section. */
export type EvidenceLine = {
  label: string;
  from: string;
  to: string;
};

export type ActionPriority = 1 | 2 | 3;

export type ActionItem = {
  id: string;
  priority: ActionPriority;
  /** 課題（まとまったテーマ） */
  problem: string;
  /** WHY の短い説明 */
  reason: string;
  evidence: EvidenceLine[];
  /** 例: 78kg → 75kg */
  goal: string;
  /** 計測可能な目標（Follow-up 判定用） */
  goalMetric?: {
    key: TrendMetricKey | "homeBp" | "fattyLiver";
    label: string;
    targetValue: number;
    unit: string;
    /** lower = 数値が下がれば改善 */
    direction: "lower-is-better" | "higher-is-better";
    /** 達成判定の許容幅 */
    achieveTolerance?: number;
  };
  actions: string[];
  checkItems: string[];
  followUpPeriod: string;
};

export type ActionPlan = {
  id: string;
  patientId: string;
  createdAt: string;
  evaluationDate: string;
  followUpDueLabel: string;
  items: ActionItem[];
};

/** 結果画面用：最も重要な変化 */
export type KeyChange = {
  id: string;
  title: string;
  summary: string;
  evidence: EvidenceLine[];
};

/** Follow-up: 目標ごとの達成判定 */
export type GoalStatus = "achieved" | "improved" | "unchanged" | "worsened";

export type FollowUpItemResult = {
  actionId: string;
  status: GoalStatus;
  baselineDisplay: string;
  currentDisplay: string;
  targetDisplay: string;
  note?: string;
};

export type FollowUpEvaluation = {
  id: string;
  planId: string;
  patientId: string;
  evaluatedAt: string;
  itemResults: FollowUpItemResult[];
};
