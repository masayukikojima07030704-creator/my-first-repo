import type { ActionPartDefinition } from "@/lib/actionParts/types";

export const MONITORING_PARTS: ActionPartDefinition[] = [
  {
    id: "mon-weight-bp-steps",
    category: "monitoring",
    title: "体重・血圧・歩数の毎日チェック",
    shortTitle: "毎日チェック",
    description: "家庭で続ける基本モニタリング",
    targetConditions: ["体重増加", "高血圧", "活動量低下"],
    basePriority: 90,
    goalTemplate: "毎日の記録で変化に早く気づく",
    monitoringItems: ["体重", "家庭血圧", "歩数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Monitoring Library",
    sourceVersion: "0.1.0",
    isEligible: () => true,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: (p) => {
      const lines = ["毎朝、同じ条件で体重を測って記録する"];
      if ((p.bloodPressure?.sbp ?? 0) >= 130 || p.flags?.hypertensionSuspected) {
        lines.push("家庭血圧を朝晩、各2回測って平均を記録する");
      } else {
        lines.push("週3日以上、家庭血圧を測って記録する");
      }
      lines.push("歩数（または歩行分）を毎日メモする");
      return lines;
    },
  },
  {
    id: "mon-glucose-aware",
    category: "monitoring",
    title: "血糖関連の生活記録",
    shortTitle: "血糖生活記録",
    description: "HbA1c悪化時の食事・間食メモ",
    targetConditions: ["HbA1c悪化", "糖尿病疑い"],
    basePriority: 70,
    goalTemplate: "血糖に影響しやすい行動を見える化する",
    monitoringItems: ["間食", "甘味飲料", "体重"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Monitoring Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => (p.hba1c ?? 0) >= 6.0 || !!p.flags?.diabetesSuspected,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: () => [
      "甘い飲料・間食をした日に○を付けるだけの簡易カレンダーをつける",
      "夕食後から就寝までの飲食を特に意識して記録する",
    ],
  },
];
