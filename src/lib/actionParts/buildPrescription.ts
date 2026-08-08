import type {
  ActionPrescription,
  NinetyDayGoals,
  RecommendedPart,
  ResolvedProfile,
  SelectedPartInstance,
} from "@/lib/actionParts/types";

export function toSelectedInstance(
  rec: RecommendedPart,
  orderIndex: number,
): SelectedPartInstance {
  return {
    instanceId: `${rec.part.id}-${orderIndex}`,
    partId: rec.part.id,
    category: rec.part.category,
    title: rec.part.title,
    shortTitle: rec.part.shortTitle,
    goal: rec.goal,
    actions: [...rec.actions],
    monitoringItems: [...rec.part.monitoringItems],
    followUpPeriod: rec.part.followUpPeriod,
    params: { ...rec.params },
    exerciseDose: rec.exerciseDose ? { ...rec.exerciseDose } : undefined,
    recommended: rec.recommended,
    safetyMode: rec.safetyMode,
  };
}

export function buildGoals(profile: ResolvedProfile): NinetyDayGoals {
  const extraGoals: string[] = [];
  if (profile.bloodPressure?.sbp && profile.bloodPressure.sbp >= 140) {
    extraGoals.push(
      `血圧 ${profile.bloodPressure.sbp} → ${Math.min(profile.bloodPressure.sbp - 10, 135)}mmHg 前後`,
    );
  }
  if (profile.ldl && profile.ldl >= 140) {
    extraGoals.push(`LDL ${profile.ldl} → ${profile.ldl - 18}mg/dL 前後`);
  }

  return {
    weightFromKg: profile.weightKg,
    weightToKg: profile.weightGoalKg,
    extraGoals,
  };
}

export function buildDailyChecks(selected: SelectedPartInstance[]): string[] {
  const set = new Set<string>();
  for (const item of selected) {
    if (item.category === "monitoring") {
      item.monitoringItems.forEach((m) => set.add(m));
      item.actions.forEach((a) => {
        if (a.includes("体重")) set.add("体重");
        if (a.includes("血圧")) set.add("血圧");
        if (a.includes("歩数")) set.add("歩数");
      });
    }
  }
  if (set.size === 0) {
    ["体重", "血圧", "歩数"].forEach((x) => set.add(x));
  }
  return Array.from(set);
}

export function buildReevaluationItems(
  selected: SelectedPartInstance[],
  profile: ResolvedProfile,
): string[] {
  const fromParts = selected
    .filter((s) => s.category === "medicalFollowUp")
    .flatMap((s) => s.monitoringItems);
  if (fromParts.length > 0) return Array.from(new Set(fromParts));

  const items = ["体重", "血圧"];
  if ((profile.hba1c ?? 0) >= 5.8) items.push("HbA1c");
  if ((profile.alt ?? 0) >= 30) items.push("ALT");
  if ((profile.ldl ?? 0) >= 120) items.push("LDL-C");
  return items;
}

export function composePrescription(params: {
  profile: ResolvedProfile;
  selected: SelectedPartInstance[];
  approvedByDoctor?: boolean;
  createdAt?: string;
}): ActionPrescription {
  const createdAt = params.createdAt ?? "2026-08-09";
  return {
    id: `rx-${params.profile.patientId}-${createdAt}`,
    patientId: params.profile.patientId,
    createdAt,
    approvedByDoctor: params.approvedByDoctor ?? false,
    goals: buildGoals(params.profile),
    selected: params.selected,
    dailyChecks: buildDailyChecks(params.selected),
    reevaluationItems: buildReevaluationItems(
      params.selected,
      params.profile,
    ),
  };
}

/** Soft caps for A4 readability */
export function trimSelectedForPrint(
  selected: SelectedPartInstance[],
): SelectedPartInstance[] {
  const nutrition = selected.filter((s) => s.category === "nutrition").slice(0, 3);
  const exercise = selected.filter((s) => s.category === "exercise").slice(0, 2);
  const monitoring = selected.filter((s) => s.category === "monitoring").slice(0, 1);
  const medical = selected.filter((s) => s.category === "medicalFollowUp").slice(0, 1);
  return [...nutrition, ...exercise, ...monitoring, ...medical];
}
