# Health Compass（卒業制作版）

医療クリニックで、医師と患者が一緒に健康の「現在地」「方向」「未来」を理解するための可視化アプリです。

## 重要

- **Health Compass Score は疾病発症確率ではありません**
- 医学的リスク計算は `lib/riskEngine.ts` に分離（現段階は interface のみ）
- 外部 DB / 外部 AI API は未使用（架空患者データ）

## 公開URL

- アプリ: https://masayukikojima07030704-creator.github.io/my-first-repo/
- 受講者向けプレゼン（スライド）: https://health-compass-pres.surge.sh/
- 図解資料版（長尺）: https://health-compass-deck.surge.sh/
- デモアプリ: https://masayukikojima07030704-creator.github.io/my-first-repo/
- リポジトリ: https://github.com/masayukikojima07030704-creator/my-first-repo

## 起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 構成

- `src/data/demoPatients.ts` … 架空患者A
- `src/lib/scoreRules.ts` … Compass Score（可視化指標）
- `src/lib/riskEngine.ts` … Risk Engine（仮 interface）
- `src/lib/trendCalculator.ts` … 方向・velocity・差分
- `src/lib/actionParts/*` … Action Parts Library（栄養・運動・安全・修飾・推薦）
- `src/components/ActionPrescriptionBuilder.tsx` … 医師がパーツを選ぶ3ペインUI
- `src/lib/actionRules.ts` … 旧テーマ別プラン（Follow-upデモ接続用）
- `src/lib/followUp.ts` … 次回来院時の達成判定ロジック
- `src/components/print/*` … A4印刷（結果 / アクションプラン）
- `src/components/*` … Dashboard 各セクション

## 印刷

画面上部のボタンから印刷します。

- **結果を印刷** … Health Compass Result（現在地）A4縦1枚
- **アクションプランを印刷** … 90-Day Action Plan A4縦1枚
