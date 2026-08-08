/**
 * Follow-up evaluation helpers.
 *
 * Structure is ready for next-visit comparison.
 * Current graduation build exposes UI + types; live visit flow can plug in later.
 */

import type {
  ActionItem,
  ActionPlan,
  FollowUpEvaluation,
  FollowUpItemResult,
  GoalStatus,
  YearlyVitals,
} from "@/lib/types";

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  achieved: "達成",
  improved: "改善",
  unchanged: "変化なし",
  worsened: "悪化",
};

function readMetric(
  vitals: YearlyVitals,
  key: NonNullable<ActionItem["goalMetric"]>["key"],
): number | null {
  switch (key) {
    case "weightKg":
      return vitals.weightKg;
    case "hba1c":
      return vitals.hba1c;
    case "sbp":
      return vitals.sbp;
    case "ldl":
      return vitals.ldl;
    case "alt":
      return vitals.alt;
    case "egfr":
      return vitals.egfr;
    case "ctrPercent":
      return vitals.ctrPercent;
    case "homeBp":
    case "fattyLiver":
      return null;
    default:
      return null;
  }
}

/**
 * Compare baseline → current against a goal metric.
 * Returns one of: 達成 / 改善 / 変化なし / 悪化
 */
export function evaluateGoalStatus(params: {
  item: ActionItem;
  baseline: YearlyVitals;
  current: YearlyVitals;
}): GoalStatus {
  const metric = params.item.goalMetric;
  if (!metric) return "unchanged";

  const baselineValue = readMetric(params.baseline, metric.key);
  const currentValue = readMetric(params.current, metric.key);
  if (baselineValue === null || currentValue === null) return "unchanged";

  const tolerance = metric.achieveTolerance ?? 0;
  const target = metric.targetValue;

  if (metric.direction === "lower-is-better") {
    if (currentValue <= target + tolerance) return "achieved";
    if (currentValue < baselineValue - tolerance) return "improved";
    if (Math.abs(currentValue - baselineValue) <= tolerance) return "unchanged";
    return "worsened";
  }

  // higher-is-better
  if (currentValue >= target - tolerance) return "achieved";
  if (currentValue > baselineValue + tolerance) return "improved";
  if (Math.abs(currentValue - baselineValue) <= tolerance) return "unchanged";
  return "worsened";
}

export function buildFollowUpEvaluation(params: {
  plan: ActionPlan;
  baseline: YearlyVitals;
  current: YearlyVitals;
  evaluatedAt: string;
  evaluationId?: string;
}): FollowUpEvaluation {
  const itemResults: FollowUpItemResult[] = params.plan.items.map((item) => {
    const status = evaluateGoalStatus({
      item,
      baseline: params.baseline,
      current: params.current,
    });
    const metric = item.goalMetric;
    const baselineValue = metric
      ? readMetric(params.baseline, metric.key)
      : null;
    const currentValue = metric
      ? readMetric(params.current, metric.key)
      : null;

    return {
      actionId: item.id,
      status,
      baselineDisplay:
        baselineValue !== null && metric
          ? `${baselineValue}${metric.unit}`
          : "—",
      currentDisplay:
        currentValue !== null && metric
          ? `${currentValue}${metric.unit}`
          : "—",
      targetDisplay: metric
        ? `${metric.targetValue}${metric.unit}`
        : item.goal,
    };
  });

  return {
    id: params.evaluationId ?? `followup-${params.plan.id}`,
    planId: params.plan.id,
    patientId: params.plan.patientId,
    evaluatedAt: params.evaluatedAt,
    itemResults,
  };
}
