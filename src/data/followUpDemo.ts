import { buildFollowUpEvaluation } from "@/lib/followUp";
import type { ActionPlan, FollowUpEvaluation, YearlyVitals } from "@/lib/types";

/**
 * Demo-only preview for the Follow-up panel.
 * Simulates a mid-course check so status chips render with real logic.
 */
export function buildDemoFollowUpPreview(
  plan: ActionPlan,
  baseline: YearlyVitals,
): FollowUpEvaluation {
  const hypotheticalCurrent: YearlyVitals = {
    ...baseline,
    weightKg: baseline.weightKg - 1.5,
    sbp: baseline.sbp - 4,
    ldl: baseline.ldl + 2,
    hba1c: baseline.hba1c - 0.1,
  };

  return buildFollowUpEvaluation({
    plan,
    baseline,
    current: hypotheticalCurrent,
    evaluatedAt: "2026-11-09",
    evaluationId: `followup-demo-${plan.id}`,
  });
}
