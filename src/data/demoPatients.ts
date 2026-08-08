import type { Patient } from "@/lib/types";

/**
 * Demo patient A only (graduation build).
 * Values are fictional for visualization demos — not clinical records.
 */
export const patientA: Patient = {
  id: "patient-a",
  displayName: "患者A",
  heightCm: 167,
  vitalsByYear: [
    {
      year: 2024,
      weightKg: 70,
      hba1c: 5.8,
      sbp: 128,
      ldl: 125,
      alt: 24,
      egfr: 82,
      ctrPercent: 49,
      fattyLiver: "none",
    },
    {
      year: 2025,
      weightKg: 74,
      hba1c: 6.2,
      sbp: 136,
      ldl: 142,
      alt: 39,
      egfr: 78,
      ctrPercent: 51,
      fattyLiver: "mild",
    },
    {
      year: 2026,
      weightKg: 78,
      hba1c: 6.8,
      sbp: 148,
      ldl: 158,
      alt: 58,
      egfr: 74,
      ctrPercent: 54,
      fattyLiver: "moderate",
    },
  ],
  healthType: {
    label: "ためこみクマ型",
    emoji: "🐻",
    description:
      "体重、血糖、脂質、脂肪肝など代謝系の項目に改善余地があります。",
  },
  doctorMessageTemplate:
    "3年前と比較して体重、血糖、血圧が上昇しています。一方、これらは今から改善できる項目です。まず体重と血圧の改善から取り組みましょう。",
  profile: {
    age: 58,
    sex: "male",
    heightCm: 167,
    weightKg: 78,
    weightTrend: "increasing",
    adl: "independent",
    activityLevel: "low",
    walkingAbility: "normal",
    fallHistory: false,
    gripStrength: 36,
    muscleMass: null,
    sarcopeniaStatus: "none",
    jointProblems: ["knee"],
    smoking: false,
    alcohol: "moderate",
    bloodPressure: { sbp: 148, dbp: 88 },
    hba1c: 6.8,
    ldl: 158,
    tg: 180,
    egfr: 74,
    ast: 42,
    alt: 58,
    ggt: 55,
    fattyLiver: "moderate",
    weightGoalKg: 75,
  },
};

export const demoPatients: Patient[] = [patientA];

export function getDemoPatient(id = "patient-a"): Patient {
  const found = demoPatients.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Demo patient not found: ${id}`);
  }
  return found;
}
