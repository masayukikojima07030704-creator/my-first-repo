import type { ActionPartDefinition } from "@/lib/actionParts/types";

export const MEDICAL_FOLLOWUP_PARTS: ActionPartDefinition[] = [
  {
    id: "med-90day-labs",
    category: "medicalFollowUp",
    title: "90日後の検査再評価",
    shortTitle: "90日再評価",
    description: "次回確認する検査・測定項目",
    targetConditions: ["全例（個別項目はプロファイル依存）"],
    basePriority: 95,
    goalTemplate: "90日後に数値で振り返る",
    monitoringItems: ["体重", "HbA1c", "ALT", "LDL", "血圧"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Medical Follow-up Library",
    sourceVersion: "0.1.0",
    isEligible: () => true,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: (p) => {
      const items = ["体重", "血圧"];
      if ((p.hba1c ?? 0) >= 5.8) items.push("HbA1c");
      if ((p.alt ?? 0) >= 30 || (p.fattyLiver && p.fattyLiver !== "none")) {
        items.push("ALT");
      }
      if ((p.ldl ?? 0) >= 120) items.push("LDL-C");
      if ((p.egfr ?? 999) < 80) items.push("eGFR");
      return [`90日後に確認: ${items.join(" / ")}`];
    },
  },
  {
    id: "med-bp-review",
    category: "medicalFollowUp",
    title: "血圧治療方針の確認",
    shortTitle: "血圧方針確認",
    description: "家庭血圧記録をもとに医師と方針確認",
    targetConditions: ["高血圧疑い"],
    basePriority: 60,
    goalTemplate: "血圧の目標と生活・治療の方針をそろえる",
    monitoringItems: ["家庭血圧", "診察時SBP"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Medical Follow-up Library",
    sourceVersion: "0.1.0",
    isEligible: (p) =>
      (p.bloodPressure?.sbp ?? 0) >= 140 || !!p.flags?.hypertensionSuspected,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: () => [
      "家庭血圧記録を持参し、目標値と生活・薬の方針を医師と確認する",
    ],
  },
];
