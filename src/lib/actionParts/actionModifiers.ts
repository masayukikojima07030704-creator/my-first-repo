import type {
  ActionPartDefinition,
  ResolvedProfile,
} from "@/lib/actionParts/types";

export type ModifierResult = {
  delta: number;
  reasons: string[];
};

/**
 * Disease / condition modifiers adjust priority across the whole patient,
 * instead of generating separate plans per disease.
 */
export function applyActionModifiers(
  part: ActionPartDefinition,
  profile: ResolvedProfile,
): ModifierResult {
  let delta = 0;
  const reasons: string[] = [];

  const boost = (amount: number, reason: string) => {
    delta += amount;
    reasons.push(reason);
  };
  const penalize = (amount: number, reason: string) => {
    delta -= amount;
    reasons.push(reason);
  };

  // Diabetes / glycemic
  if (profile.flags?.diabetesSuspected || (profile.hba1c ?? 0) >= 6.5) {
    if (
      part.id === "nut-sweet-drinks" ||
      part.id === "nut-night-snack" ||
      part.id === "nut-staple-adjust" ||
      part.id === "mon-glucose-aware"
    ) {
      boost(12, "血糖関連の優先度を上げる");
    }
  }

  // Hypertension
  if (profile.flags?.hypertensionSuspected || (profile.bloodPressure?.sbp ?? 0) >= 140) {
    if (part.id === "nut-salt" || part.id === "mon-weight-bp-steps" || part.id === "med-bp-review") {
      boost(14, "血圧関連の優先度を上げる");
    }
    if (part.category === "exercise" && part.id === "ex-brisk-walk") {
      boost(6, "血圧改善に向けた有酸素をやや優先");
    }
  }

  // Obesity / weight gain
  if (profile.flags?.obesity || profile.weightTrend === "increasing") {
    if (
      part.id === "nut-staple-adjust" ||
      part.id === "nut-night-snack" ||
      part.id === "nut-fatty-liver" ||
      part.id === "ex-split-walk" ||
      part.id === "ex-joint-sparing"
    ) {
      boost(16, "体重・エネルギー過多への介入を優先");
    }
    if (
      part.id === "nut-elderly-undernutrition" ||
      part.id === "nut-sarcopenia"
    ) {
      penalize(20, "減量不要な低栄養パーツの優先度を下げる");
    }
  }

  // Fatty liver
  if (profile.flags?.fattyLiverPresent) {
    if (
      part.id === "nut-fatty-liver" ||
      part.id === "nut-alcohol" ||
      part.id === "nut-sweet-drinks"
    ) {
      boost(14, "脂肪肝関連の食事パーツを優先");
    }
  }

  // CKD
  if (profile.flags?.ckdAttention) {
    if (part.id === "nut-ckd" || part.id === "nut-salt") {
      boost(18, "腎臓への配慮を優先");
    }
    if (part.id === "nut-protein" && (profile.egfr ?? 999) < 45) {
      penalize(8, "CKDではタンパク強調を控えめに（医師確認）");
    }
  }

  // Sarcopenia / undernutrition protection
  if (profile.flags?.sarcopeniaAttention || profile.weightTrend === "decreasing") {
    if (
      part.id === "nut-staple-adjust" ||
      part.id === "nut-night-snack" ||
      part.id === "nut-fatty-liver"
    ) {
      penalize(40, "食事量を減らす系パーツの優先度を大きく下げる");
    }
    if (
      part.id === "nut-sarcopenia" ||
      part.id === "nut-protein" ||
      part.id === "ex-sarcopenia" ||
      part.id === "ex-chair-stand"
    ) {
      boost(20, "筋肉を守る栄養・運動を優先");
    }
  }

  // Older adults
  if ((profile.age ?? 0) >= 75) {
    if (part.id === "nut-staple-adjust") {
      penalize(25, "高齢者では主食減量の優先度を下げる");
    }
    if (part.id === "ex-elderly-multimodal" || part.id === "ex-balance") {
      boost(10, "高齢者向け多要素・バランスを優先");
    }
  }

  return { delta, reasons };
}
