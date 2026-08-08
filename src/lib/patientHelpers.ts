import type { FattyLiverGrade, Patient, YearlyVitals } from "@/lib/types";

export const FATTY_LIVER_LABEL_JA: Record<FattyLiverGrade, string> = {
  none: "なし",
  mild: "軽度",
  moderate: "中等度",
  severe: "高度",
};

export function sortedVitals(patient: Patient): YearlyVitals[] {
  return [...patient.vitalsByYear].sort((a, b) => a.year - b.year);
}

export function firstVitals(patient: Patient): YearlyVitals {
  return sortedVitals(patient)[0];
}

export function lastVitals(patient: Patient): YearlyVitals {
  const list = sortedVitals(patient);
  return list[list.length - 1];
}

export function formatEvaluationDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}
