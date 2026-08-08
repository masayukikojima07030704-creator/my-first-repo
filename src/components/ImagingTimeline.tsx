import { ctrThreeYearDelta } from "@/lib/trendCalculator";
import type { FattyLiverGrade, YearlyVitals } from "@/lib/types";

type ImagingTimelineProps = {
  vitalsByYear: YearlyVitals[];
};

const FATTY_LIVER_LABEL: Record<FattyLiverGrade, string> = {
  none: "なし",
  mild: "軽度",
  moderate: "中等度",
  severe: "高度",
};

export function ImagingTimeline({ vitalsByYear }: ImagingTimelineProps) {
  const sorted = [...vitalsByYear].sort((a, b) => a.year - b.year);
  const ctrDelta = ctrThreeYearDelta(sorted);
  const deltaText =
    ctrDelta > 0 ? `+${ctrDelta}` : ctrDelta === 0 ? "±0" : `${ctrDelta}`;

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>Imaging Findings</h2>
        <p>画像所見の時間的な変化を、数字と段階で並べて確認します。</p>
      </div>

      <div className="imaging-grid">
        <article className="imaging-card">
          <h3>脂肪肝</h3>
          <ol className="timeline-list">
            {sorted.map((v) => (
              <li key={`fatty-${v.year}`}>
                <span className="year">{v.year}</span>
                <span className={`grade grade-${v.fattyLiver}`}>
                  {FATTY_LIVER_LABEL[v.fattyLiver]}
                </span>
              </li>
            ))}
          </ol>
        </article>

        <article className="imaging-card">
          <h3>CTR</h3>
          <p className="ctr-flow">
            {sorted.map((v, index) => (
              <span key={`ctr-${v.year}`}>
                <span className="ctr-value">{v.ctrPercent}%</span>
                {index < sorted.length - 1 ? (
                  <span className="ctr-arrow" aria-hidden>
                    →
                  </span>
                ) : null}
              </span>
            ))}
          </p>
          <p className="ctr-delta">3年間 {deltaText}ポイント</p>
        </article>
      </div>
    </section>
  );
}
