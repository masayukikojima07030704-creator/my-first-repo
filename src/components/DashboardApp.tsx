"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ActionPrescriptionBuilder } from "@/components/ActionPrescriptionBuilder";
import { FollowUpPanel } from "@/components/FollowUpPanel";
import { FutureSimulator } from "@/components/FutureSimulator";
import { HealthSummary } from "@/components/HealthSummary";
import { HealthType } from "@/components/HealthType";
import { ImagingTimeline } from "@/components/ImagingTimeline";
import { PatientMessage } from "@/components/PatientMessage";
import { PrintToolbar } from "@/components/PrintToolbar";
import { ActionPlanPrintView } from "@/components/print/ActionPlanPrintView";
import { ResultPrintView } from "@/components/print/ResultPrintView";
import { RadarChart } from "@/components/RadarChart";
import { TrendChart } from "@/components/TrendChart";
import { buildDemoFollowUpPreview } from "@/data/followUpDemo";
import { resolvePatientProfile } from "@/lib/actionParts/patientProfile";
import type { ActionPrescription } from "@/lib/actionParts/types";
import { buildActionPlan } from "@/lib/actionRules";
import { buildKeyChanges } from "@/lib/keyChanges";
import type { Patient } from "@/lib/types";
import {
  buildYearScoreSeries,
  computeHealthVelocity,
  latestVitals,
  type YearScorePoint,
} from "@/lib/trendCalculator";

type DashboardAppProps = {
  patient: Patient;
  evaluationDate: string;
};

export function DashboardApp({ patient, evaluationDate }: DashboardAppProps) {
  const series: YearScorePoint[] = useMemo(
    () => buildYearScoreSeries(patient),
    [patient],
  );
  const velocity = computeHealthVelocity(series);
  const current = latestVitals(patient);
  const latestScores = series[series.length - 1]?.axes;
  const keyChanges = buildKeyChanges(patient, 3);

  const profile = useMemo(
    () => resolvePatientProfile(patient, patient.profile),
    [patient],
  );

  // Legacy thematic plan kept for Follow-up structure demo
  const legacyPlan = useMemo(
    () => buildActionPlan(patient, { evaluationDate }),
    [patient, evaluationDate],
  );
  const followUpPreview = buildDemoFollowUpPreview(legacyPlan, current);

  const [prescription, setPrescription] = useState<ActionPrescription | null>(
    null,
  );

  const handlePrescriptionChange = useCallback((next: ActionPrescription) => {
    setPrescription(next);
  }, []);

  return (
    <>
      <main className="page-shell no-print">
        <header className="app-header app-header-row">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <div>
              <p className="brand-name">Health Compass</p>
              <p className="brand-sub">
                卒業制作版 · 診察室で一緒に見る健康の地図
              </p>
            </div>
          </div>
          <Link className="deck-btn secondary" href="/presentation">
            受講者向けプレゼン
          </Link>
        </header>

        <PrintToolbar
          actionDisabled={!prescription?.approvedByDoctor}
          actionDisabledReason="アクションプラン印刷には、Builder での医師承認が必要です"
        />

        <HealthSummary
          patientName={patient.displayName}
          currentYear={current.year}
          series={series}
          velocity={velocity}
        />

        {latestScores ? <RadarChart scores={latestScores} /> : null}

        <TrendChart vitalsByYear={patient.vitalsByYear} />

        <ImagingTimeline vitalsByYear={patient.vitalsByYear} />

        <HealthType healthType={patient.healthType} />

        <ActionPrescriptionBuilder
          profile={profile}
          onPrescriptionChange={handlePrescriptionChange}
        />

        <FollowUpPanel plan={legacyPlan} evaluation={followUpPreview} />

        <FutureSimulator currentVitals={current} heightCm={patient.heightCm} />

        <PatientMessage message={patient.doctorMessageTemplate} />

        <footer className="app-footer">
          <p>
            Action Plan は Action Parts Library
            からの推薦と医師の選択・編集で組み立てます。食事量・運動量はパーツ定義とパラメータで管理し、AIがゼロから自由生成しません。
          </p>
        </footer>
      </main>

      <div className="print-stage" aria-hidden>
        <ResultPrintView
          patient={patient}
          evaluationDate={evaluationDate}
          series={series}
          velocity={velocity}
          keyChanges={keyChanges}
        />
        <ActionPlanPrintView
          patientName={patient.displayName}
          prescription={prescription}
        />
      </div>
    </>
  );
}
