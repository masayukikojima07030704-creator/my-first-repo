import { EXERCISE_PARTS } from "@/lib/actionParts/exerciseParts";
import { MEDICAL_FOLLOWUP_PARTS } from "@/lib/actionParts/medicalFollowUpParts";
import { MONITORING_PARTS } from "@/lib/actionParts/monitoringParts";
import { NUTRITION_PARTS } from "@/lib/actionParts/nutritionParts";
import type { ActionPartDefinition } from "@/lib/actionParts/types";

export const ACTION_PARTS_LIBRARY: ActionPartDefinition[] = [
  ...NUTRITION_PARTS,
  ...EXERCISE_PARTS,
  ...MONITORING_PARTS,
  ...MEDICAL_FOLLOWUP_PARTS,
];

export function getActionPartById(
  id: string,
): ActionPartDefinition | undefined {
  return ACTION_PARTS_LIBRARY.find((p) => p.id === id);
}
