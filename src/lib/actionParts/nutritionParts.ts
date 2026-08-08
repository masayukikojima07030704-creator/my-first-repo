import type {
  ActionPartDefinition,
  PartParameters,
  ResolvedProfile,
} from "@/lib/actionParts/types";

function isOlder(profile: ResolvedProfile): boolean {
  return (profile.age ?? 0) >= 75;
}

function isLowBmiOrLosing(profile: ResolvedProfile): boolean {
  const lowBmi = profile.bmi !== null && profile.bmi < 20;
  const losing = profile.weightTrend === "decreasing";
  const sarco =
    profile.sarcopeniaStatus === "suspected" ||
    profile.sarcopeniaStatus === "present" ||
    !!profile.flags?.sarcopeniaAttention;
  return lowBmi || losing || sarco;
}

function energySurplusSignals(profile: ResolvedProfile): boolean {
  const highBmi = profile.bmi !== null && profile.bmi >= 25;
  const gaining = profile.weightTrend === "increasing";
  const hba1cUp = (profile.hba1c ?? 0) >= 6.0;
  const fatty =
    profile.fattyLiver !== undefined && profile.fattyLiver !== "none";
  return highBmi || gaining || hba1cUp || fatty;
}

function riceReduceGrams(profile: ResolvedProfile): number {
  // Parameterized — doctor editable. Not a universal prescription.
  if (isLowBmiOrLosing(profile)) return 0;
  if ((profile.bmi ?? 0) >= 28) return 70;
  if ((profile.bmi ?? 0) >= 25) return 50;
  if (profile.weightTrend === "increasing") return 40;
  return 30;
}

export const NUTRITION_PARTS: ActionPartDefinition[] = [
  {
    id: "nut-staple-adjust",
    category: "nutrition",
    title: "主食量調整",
    shortTitle: "主食調整",
    description: "夕食のご飯量など、主食の具体的な調整",
    targetConditions: ["BMI高値", "体重増加", "HbA1c悪化", "脂肪肝"],
    basePriority: 80,
    goalTemplate: "主食量を意識し、体重目標に近づける",
    monitoringItems: ["体重", "食事記録（主食）"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => energySurplusSignals(p) && !isLowBmiOrLosing(p),
    isExcluded: (p) =>
      isLowBmiOrLosing(p) || (isOlder(p) && (p.bmi ?? 99) < 22),
    buildParams: (p) => ({
      riceReduceGrams: riceReduceGrams(p),
    }),
    buildActions: (_p, params) => {
      const g = Number(params.riceReduceGrams ?? 50);
      return [
        `夕食のご飯を現在より約${g}g減らす（目安：お茶碗からひと口〜二口分）`,
        "外食・コンビニでは「大盛り」を「普通盛り」に変更する",
      ];
    },
  },
  {
    id: "nut-night-snack",
    category: "nutrition",
    title: "夜間間食改善",
    shortTitle: "夜間間食",
    description: "夜遅い時間帯のお菓子・間食の頻度を具体的に制限",
    targetConditions: ["体重増加", "HbA1c悪化", "脂肪肝"],
    basePriority: 78,
    goalTemplate: "夜間間食をルール化し、エネルギー過多を抑える",
    monitoringItems: ["体重", "間食回数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => energySurplusSignals(p),
    isExcluded: (p) => isLowBmiOrLosing(p),
    buildParams: (p) => ({
      snackCurfewHour: 21,
      snackMaxPerWeek: (p.bmi ?? 0) >= 27 ? 1 : 2,
    }),
    buildActions: (_p, params) => {
      const hour = Number(params.snackCurfewHour ?? 21);
      const max = Number(params.snackMaxPerWeek ?? 2);
      return [
        `${hour}時以降のお菓子・アイスを週${max}回以内にする`,
        "どうしても食べたい日は、分量を手のひらサイズまでに決めておく",
      ];
    },
  },
  {
    id: "nut-sweet-drinks",
    category: "nutrition",
    title: "甘味飲料改善",
    shortTitle: "甘味飲料",
    description: "加糖飲料を無糖へ置き換える",
    targetConditions: ["HbA1c悪化", "体重増加", "脂肪肝"],
    basePriority: 74,
    goalTemplate: "加糖飲料をやめ、血糖・体重への余分な負荷を減らす",
    monitoringItems: ["体重", "HbA1c"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => energySurplusSignals(p) || (p.hba1c ?? 0) >= 5.8,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: () => [
      "加糖飲料（ジュース・甘いコーヒー・炭酸）を水・お茶・無糖飲料へ変更する",
      "どうしても甘いものが欲しいときは、飲料ではなく小さな菓子1個に置き換える",
    ],
  },
  {
    id: "nut-veg-increase",
    category: "nutrition",
    title: "野菜増量",
    shortTitle: "野菜増量",
    description: "毎食の野菜・食物繊維を具体的に増やす",
    targetConditions: ["血圧", "LDL", "体重増加", "共通"],
    basePriority: 60,
    goalTemplate: "野菜を増やして食事の満足感と塩分・脂質の相対比率を整える",
    monitoringItems: ["食事内容"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: () => true,
    isExcluded: () => false,
    buildParams: () => ({ vegServingsAdd: 1 }),
    buildActions: (_p, params) => {
      const n = Number(params.vegServingsAdd ?? 1);
      return [
        `毎食、野菜・海藻・きのこを皿${n}品追加する（コンビニならサラダやカット野菜でも可）`,
        "先に野菜から食べ、ご飯・麺の食べすぎを防ぐ",
      ];
    },
  },
  {
    id: "nut-protein",
    category: "nutrition",
    title: "タンパク質確保",
    shortTitle: "タンパク確保",
    description: "朝食などのタンパク源を具体的に追加",
    targetConditions: ["サルコペニア", "高齢者", "筋肉量低下", "共通"],
    basePriority: 70,
    goalTemplate: "筋肉を守るためのタンパク源を毎日確保する",
    monitoringItems: ["体重", "握力（あれば）"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: () => true,
    isExcluded: () => false,
    buildParams: (p) => ({
      proteinAddons:
        isOlder(p) || isLowBmiOrLosing(p)
          ? ["卵", "納豆", "無糖ヨーグルト", "豆腐"]
          : ["卵", "納豆", "無糖ヨーグルト"],
    }),
    buildActions: (_p, params) => {
      const items = (params.proteinAddons as string[] | undefined) ?? [
        "卵",
        "納豆",
        "無糖ヨーグルト",
      ];
      return [
        `朝食がパンやご飯だけの場合は、${items.join("・")}などのタンパク源を1品追加する`,
        "夕食にも手のひらサイズの魚・肉・大豆製品のいずれかを入れる",
      ];
    },
  },
  {
    id: "nut-salt",
    category: "nutrition",
    title: "減塩",
    shortTitle: "減塩",
    description: "汁物・加工食品の塩分を具体的に減らす",
    targetConditions: ["高血圧", "CKD"],
    basePriority: 72,
    goalTemplate: "食塩摂取を減らし血圧管理を助ける",
    monitoringItems: ["家庭血圧", "体重"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) =>
      (p.bloodPressure?.sbp ?? 0) >= 130 || !!p.flags?.ckdAttention,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: () => [
      "味噌汁・スープは1日1杯まで、具を増やして汁を残す",
      "ハム・漬物・インスタント麺は週3回以内にする",
    ],
  },
  {
    id: "nut-lipid",
    category: "nutrition",
    title: "脂質改善",
    shortTitle: "脂質改善",
    description: "飽和脂肪の多い食品を具体的に減らす",
    targetConditions: ["LDL高値", "脂肪肝", "体重増加"],
    basePriority: 68,
    goalTemplate: "LDLと体重に影響しやすい脂質のとり方を変える",
    monitoringItems: ["LDL", "体重"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => (p.ldl ?? 0) >= 120 || energySurplusSignals(p),
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: () => [
      "菓子パン・揚げ物・脂身の多い肉を週3回以内にする",
      "調理は焼く・蒸す・茹でるを優先し、ドレッシングは半分にする",
    ],
  },
  {
    id: "nut-alcohol",
    category: "nutrition",
    title: "飲酒改善",
    shortTitle: "飲酒改善",
    description: "飲酒日数・量の具体的な上限",
    targetConditions: ["飲酒あり", "脂肪肝", "血圧", "TG"],
    basePriority: 66,
    goalTemplate: "肝臓と血圧への負担を減らす飲酒ルールを作る",
    monitoringItems: ["ALT", "血圧", "体重"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) =>
      p.alcohol === "moderate" ||
      p.alcohol === "heavy" ||
      (p.fattyLiver !== undefined && p.fattyLiver !== "none"),
    isExcluded: (p) => p.alcohol === "none",
    buildParams: (p) => ({
      drinkDaysPerWeek: p.alcohol === "heavy" ? 2 : 3,
    }),
    buildActions: (_p, params) => {
      const days = Number(params.drinkDaysPerWeek ?? 3);
      return [
        `飲酒は週${days}日以内、休肝日を週2日以上つくる`,
        "飲む日はビール中瓶1本（または日本酒1合）までを目安にする",
      ];
    },
  },
  {
    id: "nut-fatty-liver",
    category: "nutrition",
    title: "脂肪肝向け食事",
    shortTitle: "脂肪肝食事",
    description: "果糖・夜食・油ものを具体的に抑える",
    targetConditions: ["脂肪肝", "ALT上昇", "体重増加"],
    basePriority: 76,
    goalTemplate: "脂肪肝と関連しやすい食習慣を具体的に変える",
    monitoringItems: ["ALT", "体重", "腹囲（あれば）"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) =>
      (p.fattyLiver !== undefined && p.fattyLiver !== "none") ||
      (p.alt ?? 0) >= 40,
    isExcluded: (p) => isLowBmiOrLosing(p),
    buildParams: (p) => ({
      riceReduceGrams: Math.max(30, riceReduceGrams(p) - 10),
      snackCurfewHour: 21,
    }),
    buildActions: (_p, params) => {
      const g = Number(params.riceReduceGrams ?? 40);
      const hour = Number(params.snackCurfewHour ?? 21);
      return [
        `夕食の主食を約${g}g減らし、野菜とタンパクを先に食べる`,
        `${hour}時以降の甘い物・揚げ物を避ける`,
        "果糖の多い清涼飲料・果汁飲料をやめる",
      ];
    },
  },
  {
    id: "nut-elderly-undernutrition",
    category: "nutrition",
    title: "高齢者低栄養予防",
    shortTitle: "低栄養予防",
    description: "高齢で食事量が落ちている場合の栄養確保",
    targetConditions: ["高齢者", "低BMI", "体重減少"],
    basePriority: 85,
    goalTemplate: "食事量を無理に減らさず、必要栄養を確保する",
    monitoringItems: ["体重", "食欲", "タンパク摂取"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => isOlder(p) || (p.bmi !== null && p.bmi < 21),
    isExcluded: (p) =>
      energySurplusSignals(p) && (p.bmi ?? 0) >= 27 && !isLowBmiOrLosing(p),
    buildParams: () => ({}),
    buildActions: () => [
      "食事量を減らす指示は行わない。3食を欠かさない",
      "食べにくい日は、牛乳・ヨーグルト・豆腐・卵などで栄養を補う",
      "間食は禁止せず、チーズやヨーグルトなどタンパク寄りを選ぶ",
    ],
  },
  {
    id: "nut-sarcopenia",
    category: "nutrition",
    title: "サルコペニア栄養",
    shortTitle: "サルコ栄養",
    description: "筋量低下が疑われる場合のタンパク・エネルギー確保",
    targetConditions: ["サルコペニア疑い", "筋量低下", "握力低下"],
    basePriority: 88,
    goalTemplate: "筋肉を守る食事を優先し、減量食は避ける",
    monitoringItems: ["体重", "握力", "歩行"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => isLowBmiOrLosing(p),
    isExcluded: (p) =>
      !isLowBmiOrLosing(p) && (p.bmi ?? 0) >= 28 && p.weightTrend === "increasing",
    buildParams: () => ({
      proteinAddons: ["卵", "魚", "肉", "大豆製品", "乳製品"],
    }),
    buildActions: (_p, params) => {
      const items = (params.proteinAddons as string[] | undefined)?.join("・");
      return [
        `毎食、${items}のいずれかを必ず入れる（減量目的で食事全体を減らさない）`,
        "朝食にタンパク源1品を追加する（卵・納豆・無糖ヨーグルトなど）",
      ];
    },
  },
  {
    id: "nut-ckd",
    category: "nutrition",
    title: "CKD注意",
    shortTitle: "CKD注意",
    description: "腎臓への配慮（自己流の極端な制限はしない）",
    targetConditions: ["eGFR低下", "CKD"],
    basePriority: 64,
    goalTemplate: "塩分と体重・血圧管理を中心に腎臓へ配慮する",
    monitoringItems: ["eGFR", "血圧", "体重"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Nutrition Library",
    sourceVersion: "0.1.0",
    isEligible: (p) => !!p.flags?.ckdAttention || (p.egfr ?? 999) < 60,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: () => [
      "減塩（汁物は1日1杯まで、加工食品を控える）を優先する",
      "たんぱく質の極端な制限や市販の「腎臓ダイエット」は自己判断で始めない",
      "サプリ・痛み止めの飲み合わせは医師・薬剤師に確認する",
    ],
  },
];

export function renderGoal(
  template: string,
  profile: ResolvedProfile,
  _params: PartParameters,
): string {
  if (profile.weightKg && profile.weightGoalKg) {
    return template.replace(
      "体重目標",
      `${profile.weightKg}kg → ${profile.weightGoalKg}kg`,
    );
  }
  return template;
}
