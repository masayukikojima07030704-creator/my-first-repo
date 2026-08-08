import { DashboardApp } from "@/components/DashboardApp";
import { getDemoPatient } from "@/data/demoPatients";

const EVALUATION_DATE = "2026-08-09";

export default function HomePage() {
  const patient = getDemoPatient("patient-a");

  return <DashboardApp patient={patient} evaluationDate={EVALUATION_DATE} />;
}
