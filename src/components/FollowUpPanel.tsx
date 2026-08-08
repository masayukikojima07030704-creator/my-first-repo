import { GOAL_STATUS_LABEL } from "@/lib/followUp";
import type { ActionPlan, FollowUpEvaluation } from "@/lib/types";

type FollowUpPanelProps = {
  plan: ActionPlan;
  /** Demo / scaffold evaluation for next-visit comparison */
  evaluation: FollowUpEvaluation | null;
};

/**
 * Scaffold for next-visit comparison.
 * Data model + status labels are ready; full visit workflow comes later.
 */
export function FollowUpPanel({ plan, evaluation }: FollowUpPanelProps) {
  return (
    <section className="section-block no-print">
      <div className="section-heading">
        <h2>Follow-up（次回来院時）</h2>
        <p>
          前回の Action Plan
          と今回の結果を比較し、各目標を「達成 / 改善 / 変化なし /
          悪化」で見られる構造です。現時点は UI とデータ構造のプレビューです。
        </p>
      </div>

      <div className="followup-panel">
        <div className="followup-meta">
          <p>
            <strong>対象プラン:</strong> {plan.id}
          </p>
          <p>
            <strong>作成日:</strong> {plan.evaluationDate}
          </p>
          <p>
            <strong>再評価予定:</strong> {plan.followUpDueLabel}
          </p>
        </div>

        {evaluation ? (
          <ul className="followup-list">
            {plan.items.map((item) => {
              const result = evaluation.itemResults.find(
                (r) => r.actionId === item.id,
              );
              const status = result?.status ?? "unchanged";
              return (
                <li key={item.id} className="followup-item">
                  <div>
                    <span className="priority-pill small">
                      Priority {item.priority}
                    </span>
                    <h3>{item.problem}</h3>
                    <p className="muted-line">
                      目標: {item.goal}
                      {result
                        ? ` ／ 基準 ${result.baselineDisplay} → 今回 ${result.currentDisplay}`
                        : null}
                    </p>
                  </div>
                  <span className={`status-chip status-${status}`}>
                    {GOAL_STATUS_LABEL[status]}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="followup-empty">
            次回来院時に、ここに前回プランとの比較結果が表示されます。
          </p>
        )}
      </div>
    </section>
  );
}
