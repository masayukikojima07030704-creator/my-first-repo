"use client";

import { useEffect, useMemo, useState } from "react";
import {
  composePrescription,
  toSelectedInstance,
  trimSelectedForPrint,
} from "@/lib/actionParts/buildPrescription";
import { getActionPartById } from "@/lib/actionParts/library";
import { EXERCISE_LEVEL_LABEL } from "@/lib/actionParts/exerciseProfile";
import { SAFETY_MODE_LABEL } from "@/lib/actionParts/exerciseSafetyRules";
import { profileProblemLines } from "@/lib/actionParts/patientProfile";
import {
  defaultSelectedIds,
  recommendActionParts,
} from "@/lib/actionParts/recommendParts";
import type {
  ActionPrescription,
  ActionPartCategory,
  RecommendedPart,
  ResolvedProfile,
  SelectedPartInstance,
} from "@/lib/actionParts/types";
import { ActionPlanPreview } from "@/components/prescription/ActionPlanPreview";

type ActionPrescriptionBuilderProps = {
  profile: ResolvedProfile;
  onPrescriptionChange?: (prescription: ActionPrescription) => void;
};

const CATEGORY_LABEL: Record<ActionPartCategory, string> = {
  nutrition: "食事",
  exercise: "運動",
  monitoring: "モニタリング",
  medicalFollowUp: "再評価・医療",
};

const CATEGORY_ORDER: ActionPartCategory[] = [
  "nutrition",
  "exercise",
  "monitoring",
  "medicalFollowUp",
];

function rebuildInstance(
  partId: string,
  profile: ResolvedProfile,
  recommendedMap: Map<string, RecommendedPart>,
  existing?: SelectedPartInstance,
): SelectedPartInstance | null {
  const rec = recommendedMap.get(partId);
  const def = getActionPartById(partId);
  if (!def) return null;

  if (existing) {
    const actions = def.buildActions(profile, existing.params);
    return {
      ...existing,
      actions,
      goal: existing.goal,
    };
  }

  if (rec) return toSelectedInstance(rec, 0);

  const params = def.buildParams(profile);
  return {
    instanceId: `${partId}-manual`,
    partId,
    category: def.category,
    title: def.title,
    shortTitle: def.shortTitle,
    goal: def.goalTemplate,
    actions: def.buildActions(profile, params),
    monitoringItems: [...def.monitoringItems],
    followUpPeriod: def.followUpPeriod,
    params,
    exerciseDose: def.defaultExerciseDose
      ? { ...def.defaultExerciseDose }
      : undefined,
    recommended: false,
    safetyMode: profile.safetyMode,
  };
}

export function ActionPrescriptionBuilder({
  profile,
  onPrescriptionChange,
}: ActionPrescriptionBuilderProps) {
  const recommended = useMemo(
    () => recommendActionParts(profile),
    [profile],
  );
  const recommendedMap = useMemo(
    () => new Map(recommended.map((r) => [r.part.id, r])),
    [recommended],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    defaultSelectedIds(recommended),
  );
  const [overrides, setOverrides] = useState<
    Record<string, SelectedPartInstance>
  >({});
  const [approved, setApproved] = useState(false);

  const problems = profileProblemLines(profile);

  const selected = useMemo(() => {
    return selectedIds
      .map((id, index) => {
        const inst = rebuildInstance(
          id,
          profile,
          recommendedMap,
          overrides[id],
        );
        if (!inst) return null;
        return { ...inst, instanceId: `${id}-${index}` };
      })
      .filter((x): x is SelectedPartInstance => x !== null);
  }, [selectedIds, profile, recommendedMap, overrides]);

  const prescription = useMemo(
    () =>
      composePrescription({
        profile,
        selected: trimSelectedForPrint(selected),
        approvedByDoctor: approved,
      }),
    [profile, selected, approved],
  );

  useEffect(() => {
    onPrescriptionChange?.(prescription);
  }, [prescription, onPrescriptionChange]);

  const toggle = (partId: string) => {
    setApproved(false);
    setSelectedIds((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId],
    );
  };

  const move = (partId: string, direction: -1 | 1) => {
    setApproved(false);
    setSelectedIds((prev) => {
      const index = prev.indexOf(partId);
      if (index < 0) return prev;
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  };

  const updateParam = (
    partId: string,
    key: string,
    value: number | string,
  ) => {
    setApproved(false);
    const current =
      overrides[partId] ??
      rebuildInstance(partId, profile, recommendedMap) ??
      undefined;
    if (!current) return;
    const params = {
      ...current.params,
      [key]: typeof value === "string" && value !== "" ? Number(value) || value : value,
    };
    const def = getActionPartById(partId);
    const actions = def ? def.buildActions(profile, params) : current.actions;
    const exerciseDose = current.exerciseDose
      ? {
          ...current.exerciseDose,
          durationMinutes:
            key === "walkMinutes"
              ? Number(value)
              : current.exerciseDose.durationMinutes,
          frequencyPerWeek:
            key === "walkDaysPerWeek"
              ? Number(value)
              : current.exerciseDose.frequencyPerWeek,
          sessionsPerDay:
            key === "walkSessionsPerDay"
              ? Number(value)
              : current.exerciseDose.sessionsPerDay,
          repetitions:
            key === "chairStandReps" || key === "calfRaiseReps"
              ? Number(value)
              : current.exerciseDose.repetitions,
          sets:
            key === "chairStandSets" || key === "calfRaiseSets"
              ? Number(value)
              : current.exerciseDose.sets,
        }
      : current.exerciseDose;

    setOverrides((prev) => ({
      ...prev,
      [partId]: {
        ...current,
        params,
        actions,
        exerciseDose,
      },
    }));
  };

  const updateActionText = (partId: string, index: number, text: string) => {
    setApproved(false);
    const current =
      overrides[partId] ??
      rebuildInstance(partId, profile, recommendedMap) ??
      undefined;
    if (!current) return;
    const actions = [...current.actions];
    actions[index] = text;
    setOverrides((prev) => ({
      ...prev,
      [partId]: { ...current, actions },
    }));
  };

  return (
    <section className="section-block no-print">
      <div className="section-heading">
        <h2>Action Prescription Builder</h2>
        <p>
          Library
          から必要なパーツを推薦し、医師が選んで90日プランを組み立てます。AIが治療内容を決定する画面ではありません。
        </p>
      </div>

      <div className="rx-builder">
        {/* Left */}
        <aside className="rx-pane rx-left">
          <h3>患者の現在の問題</h3>
          <ul className="rx-problem-list">
            {problems.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h3>個別化に使う情報</h3>
          <dl className="rx-profile-dl">
            <div>
              <dt>年齢 / 性別</dt>
              <dd>
                {profile.age ?? "—"}歳 / {profile.sex ?? "—"}
              </dd>
            </div>
            <div>
              <dt>身長 / 体重 / BMI</dt>
              <dd>
                {profile.heightCm ?? "—"}cm / {profile.weightKg ?? "—"}kg /{" "}
                {profile.bmi ?? "—"}
              </dd>
            </div>
            <div>
              <dt>体重トレンド</dt>
              <dd>{profile.weightTrend ?? "—"}</dd>
            </div>
            <div>
              <dt>ADL / 活動量 / 歩行</dt>
              <dd>
                {profile.adl ?? "—"} / {profile.activityLevel ?? "—"} /{" "}
                {profile.walkingAbility ?? "—"}
              </dd>
            </div>
            <div>
              <dt>転倒歴 / サルコペニア</dt>
              <dd>
                {profile.fallHistory ? "あり" : "なし"} /{" "}
                {profile.sarcopeniaStatus ?? "—"}
              </dd>
            </div>
            <div>
              <dt>関節</dt>
              <dd>{(profile.jointProblems ?? ["none"]).join(", ")}</dd>
            </div>
            <div>
              <dt>喫煙 / 飲酒</dt>
              <dd>
                {profile.smoking ? "あり" : "なし"} / {profile.alcohol ?? "—"}
              </dd>
            </div>
            <div>
              <dt>SBP / HbA1c / LDL</dt>
              <dd>
                {profile.bloodPressure?.sbp ?? "—"} / {profile.hba1c ?? "—"} /{" "}
                {profile.ldl ?? "—"}
              </dd>
            </div>
            <div>
              <dt>ALT / eGFR / 脂肪肝</dt>
              <dd>
                {profile.alt ?? "—"} / {profile.egfr ?? "—"} /{" "}
                {profile.fattyLiver ?? "—"}
              </dd>
            </div>
            <div>
              <dt>Exercise Level（内部）</dt>
              <dd>{EXERCISE_LEVEL_LABEL[profile.exerciseLevel]}</dd>
            </div>
            <div>
              <dt>運動Safety</dt>
              <dd>{SAFETY_MODE_LABEL[profile.safetyMode]}</dd>
            </div>
          </dl>
          <p className="rx-note">
            未入力項目があっても動作します。データが増えるほど推薦の精度が上がります。
          </p>
        </aside>

        {/* Center */}
        <div className="rx-pane rx-center">
          <h3>推奨 Action Parts</h3>
          <p className="rx-note">
            Recommended
            は自動推薦です。最終決定はチェック・順序・数値・文章の編集で行います。
          </p>

          {CATEGORY_ORDER.map((category) => {
            const items = recommended.filter(
              (r) => r.part.category === category,
            );
            if (items.length === 0) return null;
            return (
              <div key={category} className="rx-cat-block">
                <h4>{CATEGORY_LABEL[category]}</h4>
                <ul className="rx-part-list">
                  {items.map((item) => {
                    const checked = selectedIds.includes(item.part.id);
                    return (
                      <li key={item.part.id} className="rx-part-item">
                        <label className="rx-check-row">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(item.part.id)}
                          />
                          <span>
                            <strong>{item.part.title}</strong>
                            {item.recommended ? (
                              <em className="rx-badge">Recommended</em>
                            ) : null}
                            {item.part.category === "exercise" ? (
                              <em className="rx-badge safety">
                                {SAFETY_MODE_LABEL[item.safetyMode]}
                              </em>
                            ) : null}
                          </span>
                        </label>
                        <p>{item.part.description}</p>
                        {checked ? (
                          <div className="rx-edit-box">
                            <div className="rx-order-btns">
                              <button
                                type="button"
                                onClick={() => move(item.part.id, -1)}
                              >
                                上へ
                              </button>
                              <button
                                type="button"
                                onClick={() => move(item.part.id, 1)}
                              >
                                下へ
                              </button>
                            </div>
                            {item.part.doctorEditable ? (
                              <div className="rx-param-grid">
                                {"riceReduceGrams" in item.params ? (
                                  <label>
                                    主食減量(g)
                                    <input
                                      type="number"
                                      value={Number(
                                        overrides[item.part.id]?.params
                                          .riceReduceGrams ??
                                          item.params.riceReduceGrams ??
                                          0,
                                      )}
                                      onChange={(e) =>
                                        updateParam(
                                          item.part.id,
                                          "riceReduceGrams",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </label>
                                ) : null}
                                {"snackMaxPerWeek" in item.params ? (
                                  <label>
                                    間食 週上限
                                    <input
                                      type="number"
                                      value={Number(
                                        overrides[item.part.id]?.params
                                          .snackMaxPerWeek ??
                                          item.params.snackMaxPerWeek ??
                                          2,
                                      )}
                                      onChange={(e) =>
                                        updateParam(
                                          item.part.id,
                                          "snackMaxPerWeek",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </label>
                                ) : null}
                                {"walkMinutes" in item.params ? (
                                  <label>
                                    歩行(分)
                                    <input
                                      type="number"
                                      value={Number(
                                        overrides[item.part.id]?.params
                                          .walkMinutes ??
                                          item.params.walkMinutes ??
                                          10,
                                      )}
                                      onChange={(e) =>
                                        updateParam(
                                          item.part.id,
                                          "walkMinutes",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </label>
                                ) : null}
                                {"walkDaysPerWeek" in item.params ? (
                                  <label>
                                    週日数
                                    <input
                                      type="number"
                                      value={Number(
                                        overrides[item.part.id]?.params
                                          .walkDaysPerWeek ??
                                          item.params.walkDaysPerWeek ??
                                          5,
                                      )}
                                      onChange={(e) =>
                                        updateParam(
                                          item.part.id,
                                          "walkDaysPerWeek",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </label>
                                ) : null}
                                {"chairStandReps" in item.params ? (
                                  <label>
                                    回数
                                    <input
                                      type="number"
                                      value={Number(
                                        overrides[item.part.id]?.params
                                          .chairStandReps ??
                                          item.params.chairStandReps ??
                                          10,
                                      )}
                                      onChange={(e) =>
                                        updateParam(
                                          item.part.id,
                                          "chairStandReps",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </label>
                                ) : null}
                                {"calfRaiseReps" in item.params ? (
                                  <label>
                                    かかと上げ回数
                                    <input
                                      type="number"
                                      value={Number(
                                        overrides[item.part.id]?.params
                                          .calfRaiseReps ??
                                          item.params.calfRaiseReps ??
                                          15,
                                      )}
                                      onChange={(e) =>
                                        updateParam(
                                          item.part.id,
                                          "calfRaiseReps",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </label>
                                ) : null}
                              </div>
                            ) : null}
                            {(overrides[item.part.id]?.actions ?? item.actions).map(
                              (action, actionIndex) => (
                                <input
                                  key={`${item.part.id}-a-${actionIndex}`}
                                  className="rx-action-input"
                                  value={action}
                                  onChange={(e) =>
                                    updateActionText(
                                      item.part.id,
                                      actionIndex,
                                      e.target.value,
                                    )
                                  }
                                />
                              ),
                            )}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Right */}
        <aside className="rx-pane rx-right">
          <div className="rx-approve-row">
            <h3>A4 Action Plan Preview</h3>
            <label className="rx-approve">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
              />
              医師が内容を確認・承認
            </label>
          </div>
          {!approved ? (
            <p className="rx-warn">
              印刷前に承認チェックを入れてください（未承認でもプレビューは更新されます）。
            </p>
          ) : null}
          <ActionPlanPreview
            patientName={profile.displayName}
            prescription={prescription}
          />
        </aside>
      </div>
    </section>
  );
}
