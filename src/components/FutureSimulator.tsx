"use client";

import { useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  COMPASS_AXIS_LABELS,
  COMPASS_AXIS_ORDER,
  computeAxisScores,
  scoresFromSimulator,
} from "@/lib/scoreRules";
import type { SimulatorInputs, YearlyVitals } from "@/lib/types";

type FutureSimulatorProps = {
  currentVitals: YearlyVitals;
  heightCm: number;
};

export function FutureSimulator({
  currentVitals,
  heightCm,
}: FutureSimulatorProps) {
  const [inputs, setInputs] = useState<SimulatorInputs>({
    weightKg: currentVitals.weightKg,
    sbp: currentVitals.sbp,
    ldl: currentVitals.ldl,
    smoking: false,
  });

  const currentScores = useMemo(
    () => computeAxisScores(currentVitals, heightCm, { smoking: false }),
    [currentVitals, heightCm],
  );

  const newScores = useMemo(
    () => scoresFromSimulator(currentVitals, heightCm, inputs),
    [currentVitals, heightCm, inputs],
  );

  const chartData = COMPASS_AXIS_ORDER.map((key) => ({
    axis: COMPASS_AXIS_LABELS[key],
    current: currentScores[key],
    next: newScores[key],
  }));

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>未来を変えてみる</h2>
        <p>
          数値を動かして、Compass
          の見え方がどう変わるかを試します。疾病発症リスクの計算は行いません。
        </p>
      </div>

      <div className="simulator-layout">
        <div className="simulator-controls">
          <label className="control-field">
            <span>体重（kg）</span>
            <input
              type="range"
              min={55}
              max={100}
              step={1}
              value={inputs.weightKg}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  weightKg: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              min={55}
              max={100}
              value={inputs.weightKg}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  weightKg: Number(e.target.value),
                }))
              }
            />
          </label>

          <label className="control-field">
            <span>SBP（mmHg）</span>
            <input
              type="range"
              min={100}
              max={180}
              step={1}
              value={inputs.sbp}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  sbp: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              min={100}
              max={180}
              value={inputs.sbp}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  sbp: Number(e.target.value),
                }))
              }
            />
          </label>

          <label className="control-field">
            <span>LDL（mg/dL）</span>
            <input
              type="range"
              min={70}
              max={200}
              step={1}
              value={inputs.ldl}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  ldl: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              min={70}
              max={200}
              value={inputs.ldl}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  ldl: Number(e.target.value),
                }))
              }
            />
          </label>

          <div className="control-field smoking-toggle">
            <span>喫煙</span>
            <div className="toggle-row">
              <button
                type="button"
                className={!inputs.smoking ? "toggle active" : "toggle"}
                onClick={() => setInputs((prev) => ({ ...prev, smoking: false }))}
              >
                OFF
              </button>
              <button
                type="button"
                className={inputs.smoking ? "toggle active caution" : "toggle"}
                onClick={() => setInputs((prev) => ({ ...prev, smoking: true }))}
              >
                ON
              </button>
            </div>
          </div>
        </div>

        <div className="route-compare">
          <div className="route-label">CURRENT ROUTE</div>
          <div className="route-arrow" aria-hidden>
            ↓
          </div>
          <div className="route-label route-new">NEW ROUTE</div>

          <div className="chart-panel radar-panel compact">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsRadarChart data={chartData} cx="50%" cy="50%" outerRadius="68%">
                <PolarGrid stroke="#c5d4cf" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "#3d534c", fontSize: 13, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "#7a8f88", fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="CURRENT ROUTE"
                  dataKey="current"
                  stroke="#2f6f5e"
                  fill="#2f6f5e"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Radar
                  name="NEW ROUTE"
                  dataKey="next"
                  stroke="#c47b3a"
                  fill="#c47b3a"
                  fillOpacity={0.28}
                  strokeWidth={2}
                />
              </RechartsRadarChart>
            </ResponsiveContainer>
            <div className="legend-row">
              <span className="legend-item legend-current">CURRENT ROUTE</span>
              <span className="legend-item legend-compare">NEW ROUTE</span>
            </div>
          </div>

          <p className="disclaimer soft">
            表示しているのは Health Compass
            の見え方の比較のみです。発症リスクや治療効果の予測ではありません。
          </p>
        </div>
      </div>
    </section>
  );
}
