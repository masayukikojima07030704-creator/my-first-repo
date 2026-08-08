import type { HealthTypeInfo } from "@/lib/types";

type HealthTypeProps = {
  healthType: HealthTypeInfo;
};

export function HealthType({ healthType }: HealthTypeProps) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>Health Type</h2>
        <p>会話のきっかけとしてのタイプ表現です。</p>
      </div>

      <div className="health-type-panel">
        <p className="health-type-badge">
          <span aria-hidden>{healthType.emoji}</span>
          「{healthType.label}」
        </p>
        <p className="health-type-desc">{healthType.description}</p>
        <p className="disclaimer soft">
          これは医学的診断ではなく、患者が課題を理解するためのコミュニケーション表現です。
        </p>
      </div>
    </section>
  );
}
