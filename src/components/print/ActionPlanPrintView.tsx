import { ActionPlanPreview } from "@/components/prescription/ActionPlanPreview";
import type { ActionPrescription } from "@/lib/actionParts/types";

type ActionPlanPrintViewProps = {
  patientName: string;
  prescription: ActionPrescription | null;
};

export function ActionPlanPrintView({
  patientName,
  prescription,
}: ActionPlanPrintViewProps) {
  if (!prescription) {
    return (
      <section className="print-sheet print-action">
        <p>Action Plan がまだ組み立てられていません。</p>
      </section>
    );
  }

  return (
    <ActionPlanPreview
      patientName={patientName}
      prescription={prescription}
      variant="print"
    />
  );
}
