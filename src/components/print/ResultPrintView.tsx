import { PrintRadar, PrintTrend } from "@/components/print/PrintCharts";
import { formatEvaluationDate } from "@/lib/patientHelpers";
import {
  classifyDirection,
  directionLabel,
  type YearScorePoint,
} from "@/lib/trendCalculator";
import type { KeyChange, Patient } from "@/lib/types";

type ResultPrintViewProps = {
  patient: Patient;
  evaluationDate: string;
  series: YearScorePoint[];
  velocity: number;
  keyChanges: KeyChange[];
};

export function ResultPrintView({
  patient,
  evaluationDate,
  series,
  velocity,
  keyChanges,
}: ResultPrintViewProps) {
  const latest = series[series.length - 1];
  const direction = directionLabel(classifyDirection(velocity));
  const scores = latest?.axes;

  return (
    <section className="print-sheet print-result" aria-label="Health Compass Result">
      <header className="print-header">
        <div>
          <p className="print-kicker">Health Compass Result</p>
          <h1>健康評価結果</h1>
        </div>
        <div className="print-meta">
          <p>
            <span>患者</span>
            {patient.displayName}
          </p>
          <p>
            <span>評価日</span>
            {formatEvaluationDate(evaluationDate)}
          </p>
        </div>
      </header>

      <p className="print-purpose">
        この1枚で「いまの健康の現在地」を共有します。疾病の発症確率ではありません。
      </p>

      <div className="print-score-row">
        <div className="print-score-box">
          <p className="label">Compass Score</p>
          <p className="value">{latest?.compassScore ?? "—"}</p>
        </div>
        <div className="print-score-box">
          <p className="label">Health Velocity</p>
          <p className="value">
            {velocity > 0 ? `+${velocity}` : velocity}
            <small>/年</small>
          </p>
        </div>
        <div className="print-score-box">
          <p className="label">現在の方向</p>
          <p className="value">{direction}</p>
        </div>
      </div>

      <div className="print-two-col">
        <div>
          <h2>5領域レーダー</h2>
          {scores ? <PrintRadar scores={scores} /> : null}
        </div>
        <div>
          <h2>最も重要な変化（3つ）</h2>
          <ol className="print-key-changes">
            {keyChanges.map((change, index) => (
              <li key={change.id}>
                <p className="change-title">
                  {index + 1}. {change.title}
                </p>
                <p className="change-summary">{change.summary}</p>
                <ul>
                  {change.evidence.slice(0, 4).map((line) => (
                    <li key={`${change.id}-${line.label}`}>
                      {line.label}: {line.from} → {line.to}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="print-block">
        <h2>3年間の主要トレンド</h2>
        <PrintTrend vitalsByYear={patient.vitalsByYear} />
      </div>

      <div className="print-comment">
        <h2>医師からの総合コメント</h2>
        <p>{patient.doctorMessageTemplate}</p>
      </div>

      <footer className="print-footer">
        Compass Scoreは健康状態を理解するための可視化指標です（発症確率ではありません）。
      </footer>
    </section>
  );
}
