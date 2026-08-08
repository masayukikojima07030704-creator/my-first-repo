import {
  classifyDirection,
  directionLabel,
  type YearScorePoint,
} from "@/lib/trendCalculator";

type HealthSummaryProps = {
  patientName: string;
  currentYear: number;
  series: YearScorePoint[];
  velocity: number;
};

export function HealthSummary({
  patientName,
  currentYear,
  series,
  velocity,
}: HealthSummaryProps) {
  const latest = series[series.length - 1];
  const direction = classifyDirection(velocity);
  const directionText = directionLabel(direction);

  const directionTone =
    direction === "improving"
      ? "tone-good"
      : direction === "worsening"
        ? "tone-caution"
        : "tone-neutral";

  return (
    <section className="section-block">
      <p className="eyebrow">Health Compass · {patientName}</p>
      <h1 className="hero-title">あなたの健康の現在地</h1>
      <p className="hero-lead">
        {currentYear}
        年のデータを地図のように見渡して、いまの位置と進み方を一緒に確認します。
      </p>

      <div className="summary-grid">
        <article className="summary-card">
          <p className="summary-label">Compass Score</p>
          <p className="summary-value">{latest?.compassScore ?? "—"}</p>
          <p className="summary-note">5つの視点の総合イメージ（0–100）</p>
        </article>

        <article className="summary-card">
          <p className="summary-label">Health Velocity</p>
          <p className="summary-value">
            {velocity > 0 ? `+${velocity}` : velocity}
            <span className="summary-unit"> /年</span>
          </p>
          <p className="summary-note">Compass Score の年平均の変化</p>
        </article>

        <article className={`summary-card ${directionTone}`}>
          <p className="summary-label">現在の方向</p>
          <p className="summary-value direction-value">{directionText}</p>
          <p className="summary-note">
            {direction === "worsening"
              ? "ここ数年は注意が必要な流れです"
              : direction === "improving"
                ? "よい流れが続いています"
                : "大きな変化は少ない状態です"}
          </p>
        </article>
      </div>
    </section>
  );
}
