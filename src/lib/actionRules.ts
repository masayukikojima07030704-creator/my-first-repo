/**
 * Action Plan generation rules (editable by clinicians later).
 *
 * - UI must not hardcode priorities.
 * - Rules cluster related findings into one problem theme.
 * - Max 3 actions. Not disease-risk probabilities.
 */

import { FATTY_LIVER_LABEL_JA, firstVitals, lastVitals } from "@/lib/patientHelpers";
import type {
  ActionItem,
  ActionPlan,
  ActionPriority,
  Patient,
} from "@/lib/types";

export type ActionRuleContext = {
  patient: Patient;
  first: ReturnType<typeof firstVitals>;
  last: ReturnType<typeof lastVitals>;
  evaluationDate: string;
};

export type ActionRule = {
  /** Stable id for follow-up linking */
  id: string;
  /** Human-readable name for rule editors */
  name: string;
  /**
   * Higher = more urgent. Return 0 (or negative) to skip.
   * Tune thresholds here without touching components.
   */
  score: (ctx: ActionRuleContext) => number;
  build: (ctx: ActionRuleContext) => Omit<ActionItem, "priority">;
};

const fattyRank = { none: 0, mild: 1, moderate: 2, severe: 3 } as const;

/**
 * Edit this list to change clinical communication priorities.
 * Order in the array does not matter — `score()` decides ranking.
 */
export const ACTION_RULES: ActionRule[] = [
  {
    id: "metabolic-weight-cluster",
    name: "体重増加と代謝悪化クラスター",
    score: ({ first, last }) => {
      const weightUp = last.weightKg - first.weightKg;
      const hba1cUp = last.hba1c - first.hba1c;
      const altUp = last.alt - first.alt;
      const fattyUp =
        fattyRank[last.fattyLiver] - fattyRank[first.fattyLiver];
      if (weightUp < 3 && hba1cUp < 0.4) return 0;
      return 50 + weightUp * 4 + hba1cUp * 20 + altUp * 0.5 + fattyUp * 8;
    },
    build: ({ first, last }) => {
      const targetKg = Math.max(60, last.weightKg - 3);
      return {
        id: "metabolic-weight-cluster",
        problem: "体重増加と代謝悪化",
        reason:
          "体重、血糖、肝臓の数値が同じ方向へ動いており、別々の異常ではなく一連の代謝の流れとして捉えると改善の手がかりがはっきりします。",
        evidence: [
          {
            label: "体重",
            from: `${first.weightKg}kg`,
            to: `${last.weightKg}kg`,
          },
          {
            label: "HbA1c",
            from: `${first.hba1c}%`,
            to: `${last.hba1c}%`,
          },
          {
            label: "ALT",
            from: `${first.alt}`,
            to: `${last.alt}`,
          },
          {
            label: "脂肪肝",
            from: FATTY_LIVER_LABEL_JA[first.fattyLiver],
            to: FATTY_LIVER_LABEL_JA[last.fattyLiver],
          },
        ],
        goal: `${last.weightKg}kg → ${targetKg}kg`,
        goalMetric: {
          key: "weightKg",
          label: "体重",
          targetValue: targetKg,
          unit: "kg",
          direction: "lower-is-better",
          achieveTolerance: 0.3,
        },
        actions: [
          "毎朝、同じ条件で体重を測定し記録する",
          "夜間の間食を週の半分以上は控える",
          "週5日、20〜30分の歩行を続ける",
        ],
        checkItems: ["体重", "HbA1c", "ALT", "家庭血圧"],
        followUpPeriod: "3か月後",
      };
    },
  },
  {
    id: "blood-pressure-trend",
    name: "血圧上昇トレンド",
    score: ({ first, last }) => {
      const delta = last.sbp - first.sbp;
      if (delta < 8 && last.sbp < 140) return 0;
      return 30 + delta + (last.sbp >= 140 ? 15 : 0);
    },
    build: ({ first, last }) => {
      const target = Math.min(last.sbp - 10, 135);
      return {
        id: "blood-pressure-trend",
        problem: "血圧の上昇トレンド",
        reason:
          "収縮期血圧が年々上がっており、体重や塩分・活動量の見直しと合わせて整える価値が高い項目です。",
        evidence: [
          {
            label: "SBP",
            from: `${first.sbp}mmHg`,
            to: `${last.sbp}mmHg`,
          },
        ],
        goal: `診察時 SBP ${last.sbp} → ${target}mmHg 前後`,
        goalMetric: {
          key: "sbp",
          label: "SBP",
          targetValue: target,
          unit: "mmHg",
          direction: "lower-is-better",
          achieveTolerance: 3,
        },
        actions: [
          "家庭血圧を朝晩記録する（各2回測定の平均）",
          "汁物・加工食品の塩分を意識して減らす",
          "歩行など有酸素の習慣を血圧記録とセットで続ける",
        ],
        checkItems: ["家庭血圧", "診察時SBP", "体重"],
        followUpPeriod: "3か月後",
      };
    },
  },
  {
    id: "ldl-trend",
    name: "LDL上昇トレンド",
    score: ({ first, last }) => {
      const delta = last.ldl - first.ldl;
      if (delta < 15 && last.ldl < 140) return 0;
      return 20 + delta * 0.8 + (last.ldl >= 140 ? 10 : 0);
    },
    build: ({ first, last }) => {
      const target = Math.max(100, last.ldl - 18);
      return {
        id: "ldl-trend",
        problem: "LDLコレステロールの上昇",
        reason:
          "LDLが上昇傾向にあり、食事内容の見直しと、必要なら治療方針の相談につながる重要指標です。",
        evidence: [
          {
            label: "LDL",
            from: `${first.ldl}mg/dL`,
            to: `${last.ldl}mg/dL`,
          },
        ],
        goal: `LDL ${last.ldl} → ${target}mg/dL 前後`,
        goalMetric: {
          key: "ldl",
          label: "LDL",
          targetValue: target,
          unit: "mg/dL",
          direction: "lower-is-better",
          achieveTolerance: 5,
        },
        actions: [
          "肉の脂身・菓子パンなど飽和脂肪が多い食品を減らす",
          "食物繊維（野菜・海藻・豆）を毎食どれか1品増やす",
          "次回診察で脂質の目標値と治療方針を医師と確認する",
        ],
        checkItems: ["LDL", "体重", "食事記録（簡易）"],
        followUpPeriod: "3か月後",
      };
    },
  },
  {
    id: "kidney-watch",
    name: "eGFR低下の見守り",
    score: ({ first, last }) => {
      const drop = first.egfr - last.egfr;
      if (drop < 6) return 0;
      return 10 + drop;
    },
    build: ({ first, last }) => ({
      id: "kidney-watch",
      problem: "腎臓指標のゆるやかな低下",
      reason:
        "eGFRが低下傾向です。急な悪化ではない場合でも、血圧・体重とあわせて経過を見る価値があります。",
      evidence: [
        {
          label: "eGFR",
          from: `${first.egfr}`,
          to: `${last.egfr}`,
        },
      ],
      goal: "eGFRの低下ペースを抑え、次回も同程度以上を維持",
      goalMetric: {
        key: "egfr",
        label: "eGFR",
        targetValue: last.egfr,
        unit: "",
        direction: "higher-is-better",
        achieveTolerance: 2,
      },
      actions: [
        "血圧・体重の記録を続ける",
        "脱水になりやすい日は水分摂取を意識する",
        "市販薬やサプリを始める前に医師・薬剤師へ相談する",
      ],
      checkItems: ["eGFR", "SBP", "体重"],
      followUpPeriod: "3か月後",
    }),
  },
];

function assignPriorities(
  items: Omit<ActionItem, "priority">[],
): ActionItem[] {
  return items.slice(0, 3).map((item, index) => ({
    ...item,
    priority: (index + 1) as ActionPriority,
  }));
}

export function buildActionPlan(
  patient: Patient,
  options?: { evaluationDate?: string; planId?: string },
): ActionPlan {
  const evaluationDate = options?.evaluationDate ?? "2026-08-09";
  const ctx: ActionRuleContext = {
    patient,
    first: firstVitals(patient),
    last: lastVitals(patient),
    evaluationDate,
  };

  const ranked = ACTION_RULES.map((rule) => ({
    rule,
    score: rule.score(ctx),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const built = ranked.map((entry) => entry.rule.build(ctx));
  const items = assignPriorities(built);

  return {
    id: options?.planId ?? `plan-${patient.id}-${evaluationDate}`,
    patientId: patient.id,
    createdAt: evaluationDate,
    evaluationDate,
    followUpDueLabel: items[0]?.followUpPeriod ?? "3か月後",
    items,
  };
}
