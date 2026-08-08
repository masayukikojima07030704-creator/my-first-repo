import { applyActionModifiers } from "@/lib/actionParts/actionModifiers";
import { ACTION_PARTS_LIBRARY } from "@/lib/actionParts/library";
import { renderGoal } from "@/lib/actionParts/nutritionParts";
import { applySafetyToDose } from "@/lib/actionParts/exerciseSafetyRules";
import type {
  ActionPartCategory,
  RecommendedPart,
  ResolvedProfile,
} from "@/lib/actionParts/types";

const CATEGORY_AUTO_SELECT: Record<ActionPartCategory, number> = {
  nutrition: 3,
  exercise: 2,
  monitoring: 1,
  medicalFollowUp: 1,
};

export function recommendActionParts(
  profile: ResolvedProfile,
): RecommendedPart[] {
  const scored: RecommendedPart[] = [];

  for (const part of ACTION_PARTS_LIBRARY) {
    if (part.isExcluded(profile) || !part.isEligible(profile)) continue;

    const mod = applyActionModifiers(part, profile);
    const score = part.basePriority + mod.delta;
    if (score <= 0) continue;

    const params = part.buildParams(profile);
    const actions = part.buildActions(profile, params);
    const goal = renderGoal(part.goalTemplate, profile, params);

    let exerciseDose = part.defaultExerciseDose
      ? applySafetyToDose({ ...part.defaultExerciseDose }, profile.safetyMode)
      : undefined;

    if (exerciseDose && params.walkMinutes) {
      exerciseDose = {
        ...exerciseDose,
        durationMinutes: Number(params.walkMinutes),
        frequencyPerWeek: Number(params.walkDaysPerWeek ?? exerciseDose.frequencyPerWeek),
        sessionsPerDay: Number(
          params.walkSessionsPerDay ?? exerciseDose.sessionsPerDay ?? 1,
        ),
      };
    }

    scored.push({
      part,
      score,
      recommended: false,
      reasons: mod.reasons,
      safetyMode:
        part.category === "exercise" ? profile.safetyMode : "usual",
      params,
      actions,
      goal,
      exerciseDose,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  // Mark top-N per category as recommended (doctor still decides).
  const counts: Partial<Record<ActionPartCategory, number>> = {};
  for (const item of scored) {
    const cat = item.part.category;
    const used = counts[cat] ?? 0;
    const limit = CATEGORY_AUTO_SELECT[cat];
    if (used < limit) {
      item.recommended = true;
      counts[cat] = used + 1;
    }
  }

  return scored;
}

export function defaultSelectedIds(recommended: RecommendedPart[]): string[] {
  return recommended.filter((r) => r.recommended).map((r) => r.part.id);
}
