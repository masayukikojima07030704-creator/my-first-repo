/**
 * Risk Engine (placeholder)
 *
 * IMPORTANT:
 * - This is intentionally NOT implemented in the graduation build.
 * - Health Compass Score must never be treated as disease onset probability.
 * - Do not add ad-hoc points from CTR or fatty liver into cardiovascular event risk.
 * - Future validated models should plug in here without changing UI score logic.
 */

import type { YearlyVitals } from "@/lib/types";

/** Reserved input shape for a future validated risk model. */
export type RiskEngineInput = {
  vitals: YearlyVitals;
  ageYears?: number;
  sex?: "female" | "male" | "other" | "unspecified";
  smoking?: boolean;
};

/**
 * Opaque result type for future use.
 * No numeric disease probabilities are produced today.
 */
export type RiskEngineResult = {
  modelId: string;
  version: string;
  /** Intentionally empty until a validated model is registered. */
  estimates: Record<string, never>;
  disclaimer: string;
};

/**
 * Interface only — no clinical calculation in this build.
 */
export interface RiskEngine {
  readonly modelId: string;
  readonly version: string;
  /**
   * Future entry point for validated models.
   * Current build must not call this for patient-facing numbers.
   */
  estimate?(input: RiskEngineInput): RiskEngineResult;
}

/** Stub engine that refuses to invent unverified risk numbers. */
export const stubRiskEngine: RiskEngine = {
  modelId: "stub-unvalidated",
  version: "0.0.0",
};
