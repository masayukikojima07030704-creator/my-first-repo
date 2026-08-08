import { applySafetyToDose } from "@/lib/actionParts/exerciseSafetyRules";
import type {
  ActionPartDefinition,
  ExerciseDose,
  ResolvedProfile,
} from "@/lib/actionParts/types";

function hasJointIssue(profile: ResolvedProfile): boolean {
  return (profile.jointProblems ?? []).some((j) => j !== "none");
}

function formatWalkActions(
  profile: ResolvedProfile,
  dose: ExerciseDose,
): string[] {
  const minutes = dose.durationMinutes ?? 10;
  const sessions = dose.sessionsPerDay ?? 1;
  const days = dose.frequencyPerWeek ?? 5;
  const intensity =
    dose.intensity === "brisk"
      ? "少し息が上がる速さ"
      : dose.intensity === "low"
        ? "会話できるゆっくりめ"
        : "普通の速さ";

  if ((dose.sessionsPerDay ?? 1) >= 2) {
    return [
      `歩行${minutes}分 × ${sessions}回/日（${intensity}）`,
      `週${days}日を目標にする`,
    ];
  }
  return [
    `歩行${minutes}分 × 週${days}日（${intensity}）`,
    profile.safetyMode === "startLow"
      ? "最初の2週間は短めから始め、体調を見て延ばす"
      : "連続が難しければ5〜10分に分割してよい",
  ];
}

export const EXERCISE_PARTS: ActionPartDefinition[] = [
  {
    id: "ex-walk-usual",
    category: "exercise",
    title: "通常歩行",
    shortTitle: "通常歩行",
    description: "日常生活に組み込む通常歩行",
    targetConditions: ["Level A/B", "歩行能力正常"],
    basePriority: 70,
    goalTemplate: "歩行習慣を定着させる",
    monitoringItems: ["歩数", "実施日数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 5,
      sessionsPerDay: 1,
      durationMinutes: 20,
      intensity: "moderate",
    },
    isEligible: (p) =>
      (p.exerciseLevel === "A" || p.exerciseLevel === "B") &&
      (p.walkingAbility === "normal" || p.walkingAbility === "slow"),
    isExcluded: (p) =>
      p.walkingAbility === "difficult" || p.safetyMode === "needsClinicianReview",
    buildParams: (p) => {
      const dose = applySafetyToDose(
        {
          walkMinutes: p.exerciseLevel === "B" ? 15 : 20,
          walkDaysPerWeek: 5,
          walkSessionsPerDay: 1,
        },
        p.safetyMode,
      );
      return dose;
    },
    buildActions: (p, params) =>
      formatWalkActions(p, {
        durationMinutes: Number(params.walkMinutes ?? 20),
        frequencyPerWeek: Number(params.walkDaysPerWeek ?? 5),
        sessionsPerDay: Number(params.walkSessionsPerDay ?? 1),
        intensity: p.safetyMode === "startLow" ? "low" : "moderate",
      }),
  },
  {
    id: "ex-brisk-walk",
    category: "exercise",
    title: "速歩",
    shortTitle: "速歩",
    description: "息が少し上がる速歩",
    targetConditions: ["Level A", "代謝改善", "肥満（関節問題なし）"],
    basePriority: 75,
    goalTemplate: "速歩で代謝と心肺の刺激を増やす",
    monitoringItems: ["実施日数", "体重"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 5,
      durationMinutes: 20,
      intensity: "brisk",
    },
    isEligible: (p) =>
      p.exerciseLevel === "A" &&
      p.walkingAbility === "normal" &&
      !hasJointIssue(p) &&
      p.fallHistory !== true,
    isExcluded: (p) =>
      p.exerciseLevel === "D" ||
      p.safetyMode === "needsClinicianReview" ||
      hasJointIssue(p),
    buildParams: () => ({
      walkMinutes: 20,
      walkDaysPerWeek: 5,
      walkSessionsPerDay: 1,
    }),
    buildActions: (p, params) =>
      formatWalkActions(p, {
        durationMinutes: Number(params.walkMinutes ?? 20),
        frequencyPerWeek: Number(params.walkDaysPerWeek ?? 5),
        sessionsPerDay: 1,
        intensity: "brisk",
      }),
  },
  {
    id: "ex-split-walk",
    category: "exercise",
    title: "短時間分割歩行",
    shortTitle: "分割歩行",
    description: "まとまった時間が取れない／負担を分けたい人向け",
    targetConditions: ["Level C", "低活動", "忙しい人"],
    basePriority: 78,
    goalTemplate: "短い歩行を積み上げて総量を確保する",
    monitoringItems: ["実施回数", "歩数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 6,
      sessionsPerDay: 2,
      durationMinutes: 10,
      intensity: "low",
    },
    isEligible: (p) =>
      p.exerciseLevel === "C" ||
      p.activityLevel === "low" ||
      p.walkingAbility === "slow",
    isExcluded: (p) => p.walkingAbility === "difficult",
    buildParams: (p) => ({
      walkMinutes: p.safetyMode === "startLow" ? 8 : 10,
      walkSessionsPerDay: 2,
      walkDaysPerWeek: 5,
    }),
    buildActions: (p, params) =>
      formatWalkActions(p, {
        durationMinutes: Number(params.walkMinutes ?? 10),
        sessionsPerDay: Number(params.walkSessionsPerDay ?? 2),
        frequencyPerWeek: Number(params.walkDaysPerWeek ?? 5),
        intensity: "low",
      }),
  },
  {
    id: "ex-seated",
    category: "exercise",
    title: "座位中心運動",
    shortTitle: "座位運動",
    description: "立位負担を減らした運動",
    targetConditions: ["歩行困難", "Level D", "関節負担"],
    basePriority: 72,
    goalTemplate: "座ったまま体を動かす習慣をつくる",
    monitoringItems: ["実施日数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 5,
      sets: 2,
      repetitions: 10,
      intensity: "low",
    },
    isEligible: (p) =>
      p.exerciseLevel === "D" ||
      p.walkingAbility === "assistiveDevice" ||
      p.walkingAbility === "difficult" ||
      hasJointIssue(p),
    isExcluded: () => false,
    buildParams: () => ({
      chairStandReps: 0,
      strengthDaysPerWeek: 5,
    }),
    buildActions: () => [
      "椅子に座ったまま、その場足踏みを1分 × 3セット",
      "両腕の上げ下げ・肩回しを各10回 × 2セット（週5日）",
    ],
  },
  {
    id: "ex-chair-stand",
    category: "exercise",
    title: "椅子立ち上がり",
    shortTitle: "椅子立ち上がり",
    description: "下肢筋力の基本動作",
    targetConditions: ["Level B/C/D", "筋量低下", "低活動"],
    basePriority: 80,
    goalTemplate: "下肢筋力を安全に底上げする",
    monitoringItems: ["実施回数", "膝の痛み"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 4,
      sets: 2,
      repetitions: 10,
      intensity: "low",
    },
    isEligible: (p) =>
      p.exerciseLevel !== "A" ||
      !!p.flags?.sarcopeniaAttention ||
      p.activityLevel === "low",
    isExcluded: (p) =>
      p.jointProblems?.includes("knee") === true && p.exerciseLevel === "D"
        ? false
        : false,
    buildParams: (p) => {
      const reps = p.exerciseLevel === "D" ? 8 : 10;
      const sets = 2;
      return {
        chairStandReps: reps,
        chairStandSets: sets,
        strengthDaysPerWeek: p.exerciseLevel === "D" ? 3 : 4,
      };
    },
    buildActions: (_p, params) => [
      `椅子立ち上がり ${params.chairStandReps ?? 10}回 × ${params.chairStandSets ?? 2}セット`,
      `週${params.strengthDaysPerWeek ?? 4}日（痛みが出る場合は中止して相談）`,
    ],
  },
  {
    id: "ex-squat",
    category: "exercise",
    title: "スクワット",
    shortTitle: "スクワット",
    description: "膝に余裕がある人向けの下肢強化",
    targetConditions: ["Level A/B", "関節問題なし"],
    basePriority: 62,
    goalTemplate: "下肢筋力を強化する",
    monitoringItems: ["実施日数", "膝痛"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 3,
      sets: 2,
      repetitions: 10,
      intensity: "moderate",
    },
    isEligible: (p) =>
      (p.exerciseLevel === "A" || p.exerciseLevel === "B") &&
      !p.jointProblems?.includes("knee"),
    isExcluded: (p) =>
      !!p.jointProblems?.includes("knee") || p.exerciseLevel === "D",
    buildParams: () => ({
      chairStandReps: 10,
      chairStandSets: 2,
      strengthDaysPerWeek: 3,
    }),
    buildActions: (_p, params) => [
      `スクワット ${params.chairStandReps ?? 10}回 × ${params.chairStandSets ?? 2}セット`,
      `週${params.strengthDaysPerWeek ?? 3}日、椅子を支えにして浅い深さから`,
    ],
  },
  {
    id: "ex-calf-raise",
    category: "exercise",
    title: "かかと上げ",
    shortTitle: "かかと上げ",
    description: "ふくらはぎ強化・バランス補助",
    targetConditions: ["共通", "転倒予防", "Level B/C/D"],
    basePriority: 65,
    goalTemplate: "下肢末梢の筋力と安定性を高める",
    monitoringItems: ["実施日数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 5,
      sets: 2,
      repetitions: 15,
      intensity: "low",
    },
    isEligible: () => true,
    isExcluded: (p) => p.walkingAbility === "difficult",
    buildParams: (p) => ({
      calfRaiseReps: p.exerciseLevel === "D" ? 10 : 15,
      calfRaiseSets: 2,
      strengthDaysPerWeek: 5,
    }),
    buildActions: (_p, params) => [
      `かかと上げ ${params.calfRaiseReps ?? 15}回 × ${params.calfRaiseSets ?? 2}セット`,
      `週${params.strengthDaysPerWeek ?? 5}日、必要なら壁や椅子につかまって行う`,
    ],
  },
  {
    id: "ex-upper",
    category: "exercise",
    title: "上肢筋力運動",
    shortTitle: "上肢運動",
    description: "ペットボトル等を使った上肢刺激",
    targetConditions: ["Level B/D", "握力低下"],
    basePriority: 58,
    goalTemplate: "上肢・体幹まわりの動きを保つ",
    monitoringItems: ["実施日数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 3,
      sets: 2,
      repetitions: 10,
      intensity: "low",
    },
    isEligible: (p) =>
      p.exerciseLevel === "B" ||
      p.exerciseLevel === "D" ||
      (p.gripStrength !== null &&
        p.gripStrength !== undefined &&
        p.gripStrength < 30),
    isExcluded: () => false,
    buildParams: () => ({
      chairStandReps: 10,
      chairStandSets: 2,
      strengthDaysPerWeek: 3,
    }),
    buildActions: (_p, params) => [
      `ペットボトル等で腕の上げ下げ ${params.chairStandReps ?? 10}回 × ${params.chairStandSets ?? 2}セット`,
      `週${params.strengthDaysPerWeek ?? 3}日`,
    ],
  },
  {
    id: "ex-balance",
    category: "exercise",
    title: "バランス運動",
    shortTitle: "バランス",
    description: "片足立ちなど転倒予防のバランス練習",
    targetConditions: ["転倒歴", "高齢者", "Level B/D"],
    basePriority: 70,
    goalTemplate: "バランス能力を安全に維持する",
    monitoringItems: ["実施日数", "ふらつき"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 5,
      durationMinutes: 3,
      intensity: "low",
    },
    isEligible: (p) =>
      p.fallHistory === true ||
      (p.age ?? 0) >= 70 ||
      p.exerciseLevel === "D" ||
      p.exerciseLevel === "B",
    isExcluded: (p) => p.walkingAbility === "difficult",
    buildParams: () => ({ walkMinutes: 10 }),
    buildActions: () => [
      "支持物ありで片足立ち 10〜15秒 × 左右各3回",
      "週5日、転倒しない環境（壁・椅子のそば）で行う",
    ],
  },
  {
    id: "ex-flexibility",
    category: "exercise",
    title: "柔軟運動",
    shortTitle: "柔軟",
    description: "肩・股関節・足首の軽いストレッチ",
    targetConditions: ["共通", "肩こり腰痛"],
    basePriority: 45,
    goalTemplate: "動きやすさを保つ",
    monitoringItems: ["実施日数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 5,
      durationMinutes: 5,
      intensity: "low",
    },
    isEligible: () => true,
    isExcluded: () => false,
    buildParams: () => ({}),
    buildActions: () => [
      "全身の軽いストレッチを5分（呼吸を止めない）",
      "週5日、運動の前後どちらかで実施",
    ],
  },
  {
    id: "ex-elderly-multimodal",
    category: "exercise",
    title: "高齢者多要素運動",
    shortTitle: "多要素運動",
    description: "歩行＋筋力＋バランスを組み合わせる",
    targetConditions: ["Level B", "高齢者ADL自立"],
    basePriority: 77,
    goalTemplate: "歩行・筋力・バランスをバランスよく実施する",
    monitoringItems: ["実施日数", "歩数"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 4,
      durationMinutes: 15,
      sets: 2,
      repetitions: 10,
      intensity: "low",
    },
    isEligible: (p) => p.exerciseLevel === "B" || ((p.age ?? 0) >= 70 && p.adl === "independent"),
    isExcluded: (p) => p.exerciseLevel === "D" && p.fallHistory === true,
    buildParams: () => ({
      walkMinutes: 15,
      walkDaysPerWeek: 4,
      chairStandReps: 10,
      chairStandSets: 2,
    }),
    buildActions: (_p, params) => [
      `歩行 ${params.walkMinutes ?? 15}分 × 週${params.walkDaysPerWeek ?? 4}日`,
      `椅子立ち上がり ${params.chairStandReps ?? 10}回 × ${params.chairStandSets ?? 2}セット`,
      "支持物あり片足立ち 10秒 × 左右各3回",
    ],
  },
  {
    id: "ex-sarcopenia",
    category: "exercise",
    title: "サルコペニア向け運動",
    shortTitle: "サルコ運動",
    description: "低強度の筋力・バランス中心",
    targetConditions: ["Level D", "サルコペニア疑い"],
    basePriority: 86,
    goalTemplate: "筋量・筋力低下への配慮しながら動く",
    monitoringItems: ["実施日数", "痛み", "ふらつき"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 3,
      sets: 2,
      repetitions: 8,
      intensity: "low",
    },
    isEligible: (p) =>
      p.exerciseLevel === "D" || !!p.flags?.sarcopeniaAttention,
    isExcluded: (p) => p.safetyMode === "needsClinicianReview" && p.walkingAbility === "difficult",
    buildParams: () => ({
      chairStandReps: 8,
      chairStandSets: 2,
      calfRaiseReps: 10,
      calfRaiseSets: 2,
      strengthDaysPerWeek: 3,
    }),
    buildActions: (_p, params) => [
      `椅子立ち上がり ${params.chairStandReps ?? 8}回 × ${params.chairStandSets ?? 2}セット`,
      `かかと上げ ${params.calfRaiseReps ?? 10}回 × ${params.calfRaiseSets ?? 2}セット`,
      `週${params.strengthDaysPerWeek ?? 3}日、必ず低強度・支持物ありで開始`,
    ],
  },
  {
    id: "ex-joint-sparing",
    category: "exercise",
    title: "肥満・関節負担軽減運動",
    shortTitle: "関節負担軽減",
    description: "膝腰への衝撃を抑えた運動選択",
    targetConditions: ["Level C", "肥満", "膝・腰の問題"],
    basePriority: 82,
    goalTemplate: "関節にやさしい方法で活動量を増やす",
    monitoringItems: ["痛み", "実施日数", "体重"],
    followUpPeriod: "3か月後",
    doctorEditable: true,
    source: "HealthCompass Exercise Library",
    sourceVersion: "0.1.0",
    defaultExerciseDose: {
      frequencyPerWeek: 5,
      sessionsPerDay: 2,
      durationMinutes: 10,
      intensity: "low",
    },
    isEligible: (p) =>
      p.exerciseLevel === "C" ||
      hasJointIssue(p) ||
      ((p.bmi ?? 0) >= 27 && p.activityLevel === "low"),
    isExcluded: (p) => p.walkingAbility === "difficult",
    buildParams: () => ({
      walkMinutes: 10,
      walkSessionsPerDay: 2,
      walkDaysPerWeek: 5,
      chairStandReps: 8,
      chairStandSets: 2,
    }),
    buildActions: (_p, params) => [
      `歩行${params.walkMinutes ?? 10}分 × ${params.walkSessionsPerDay ?? 2}回/日（ゆっくり、週${params.walkDaysPerWeek ?? 5}日）`,
      `椅子立ち上がり ${params.chairStandReps ?? 8}回 × ${params.chairStandSets ?? 2}セット（膝痛時は中止）`,
      "ジャンプや長時間の坂道・階段の連続は避ける",
    ],
  },
];
