import type { ActionPlan } from "@/lib/types";

type ActionPrioritiesProps = {
  plan: ActionPlan;
};

export function ActionPriorities({ plan }: ActionPrioritiesProps) {
  return (
    <section className="section-block no-print">
      <div className="section-heading">
        <h2>90-Day Action Plan</h2>
        <p>
          「これから何をするか」を、最大3つの優先課題に絞っています。個別の数値異常を並べるのではなく、まとまったテーマとして示します。
        </p>
      </div>

      <div className="action-plan-list">
        {plan.items.map((item) => (
          <article key={item.id} className="action-plan-card">
            <header className="action-plan-header">
              <span className="priority-pill">Priority {item.priority}</span>
              <h3>{item.problem}</h3>
            </header>

            <div className="action-plan-grid">
              <div>
                <h4>WHY</h4>
                <p>{item.reason}</p>
                <ul className="evidence-list">
                  {item.evidence.map((line) => (
                    <li key={`${item.id}-${line.label}`}>
                      <strong>{line.label}</strong>
                      <span>
                        {line.from} → {line.to}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4>GOAL</h4>
                <p className="goal-text">{item.goal}</p>
                <h4>ACTION</h4>
                <ul className="plain-list">
                  {item.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4>CHECK</h4>
                <p>{item.checkItems.join(" / ")}</p>
                <h4>WHEN</h4>
                <p className="when-text">{item.followUpPeriod}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
