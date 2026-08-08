import type { ActionPrescription } from "@/lib/actionParts/types";

type ActionPlanPreviewProps = {
  patientName: string;
  prescription: ActionPrescription;
  variant?: "screen" | "print";
};

export function ActionPlanPreview({
  patientName,
  prescription,
  variant = "screen",
}: ActionPlanPreviewProps) {
  const nutrition = prescription.selected.filter(
    (s) => s.category === "nutrition",
  );
  const exercise = prescription.selected.filter(
    (s) => s.category === "exercise",
  );
  const rootClass =
    variant === "print"
      ? "print-sheet print-action a4-plan"
      : "a4-plan a4-plan-screen";

  return (
    <article className={rootClass} aria-label="あなたの90日健康プラン">
      <header className="a4-plan-header">
        <div>
          <p className="print-kicker">あなたの90日健康プラン</p>
          <h1>明日から何をするか</h1>
        </div>
        <div className="print-meta">
          <p>
            <span>患者</span>
            {patientName}
          </p>
          <p>
            <span>作成日</span>
            {prescription.createdAt}
          </p>
          <p>
            <span>承認</span>
            {prescription.approvedByDoctor ? "医師確認済" : "未承認"}
          </p>
        </div>
      </header>

      <section className="a4-block">
        <h2>あなたの90日目標</h2>
        {prescription.goals.weightFromKg !== undefined &&
        prescription.goals.weightToKg !== undefined ? (
          <p className="a4-goal-main">
            体重 {prescription.goals.weightFromKg}kg →{" "}
            {prescription.goals.weightToKg}kg
          </p>
        ) : (
          <p className="a4-goal-main">体重目標は医師と設定してください</p>
        )}
        {prescription.goals.extraGoals.length > 0 ? (
          <ul className="a4-extra-goals">
            {prescription.goals.extraGoals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="a4-block">
        <h2>食事プラン</h2>
        {nutrition.length === 0 ? (
          <p className="a4-empty">食事パーツが未選択です</p>
        ) : (
          <ol className="a4-item-list">
            {nutrition.map((item) => (
              <li key={item.instanceId}>
                <strong>{item.shortTitle}</strong>
                <ul>
                  {item.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="a4-block">
        <h2>運動プラン</h2>
        {exercise.length === 0 ? (
          <p className="a4-empty">運動パーツが未選択です</p>
        ) : (
          <ol className="a4-item-list">
            {exercise.map((item) => (
              <li key={item.instanceId}>
                <strong>{item.shortTitle}</strong>
                {item.exerciseDose ? (
                  <p className="a4-dose">
                    {[
                      item.exerciseDose.durationMinutes
                        ? `${item.exerciseDose.durationMinutes}分`
                        : null,
                      item.exerciseDose.sessionsPerDay
                        ? `${item.exerciseDose.sessionsPerDay}回/日`
                        : null,
                      item.exerciseDose.frequencyPerWeek
                        ? `週${item.exerciseDose.frequencyPerWeek}日`
                        : null,
                      item.exerciseDose.repetitions
                        ? `${item.exerciseDose.repetitions}回`
                        : null,
                      item.exerciseDose.sets
                        ? `${item.exerciseDose.sets}セット`
                        : null,
                      item.exerciseDose.intensity
                        ? `強度:${item.exerciseDose.intensity}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
                <ul>
                  {item.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="a4-block a4-two">
        <div>
          <h2>毎日のチェック</h2>
          <ul className="a4-chips">
            {prescription.dailyChecks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>90日後に確認する項目</h2>
          <ul className="a4-chips">
            {prescription.reevaluationItems.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="print-footer">
        このプランは医師が Action Parts
        を選択・編集して作成しています。体調不良時は無理せず相談してください。
      </footer>
    </article>
  );
}
