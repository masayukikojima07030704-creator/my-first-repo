import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Compass プレゼン | 受講者向け説明",
  description:
    "卒業制作アプリ Health Compass を他の受講者に説明するための画像プレゼン",
};

type Slide = {
  id: string;
  kicker: string;
  title: string;
  points: string[];
  image?: {
    src: string;
    alt: string;
  };
};

const slides: Slide[] = [
  {
    id: "01",
    kicker: "Slide 1",
    title: "Health Compass とは？",
    points: [
      "医療クリニック向けの卒業制作Webアプリです",
      "病気を診断するツールではありません",
      "医師と患者が「現在地・方向・未来」を一緒に理解するための可視化アプリです",
    ],
  },
  {
    id: "02",
    kicker: "Slide 2",
    title: "画面で見る「健康の現在地」",
    points: [
      "Compass Score / Health Velocity / 方向（改善・安定・悪化）を上部に表示",
      "数字の羅列ではなく、いまどこにいるかが直感的にわかる構成",
      "iPad・PCの診察画面での共有を想定",
    ],
    image: {
      src: "/presentation/01-current-location.png",
      alt: "健康の現在地サマリー画面",
    },
  },
  {
    id: "03",
    kicker: "Slide 3",
    title: "5領域レーダーで状態を俯瞰",
    points: [
      "血管・代謝・肝臓・腎臓・がん予防の5軸",
      "Compass Score は疾病発症確率ではない（画面上にも明記）",
      "Risk Engine は将来用に分離し、今は計算しない",
    ],
    image: {
      src: "/presentation/02-radar-compass.png",
      alt: "Health Compass レーダーチャート",
    },
  },
  {
    id: "04",
    kicker: "Slide 4",
    title: "3年間の変化を一緒に見る",
    points: [
      "体重・HbA1c・血圧などを切り替えて折れ線表示",
      "「別々の異常」ではなく、時系列の流れとして共有できる",
    ],
    image: {
      src: "/presentation/03-three-year-trend.png",
      alt: "3年間の変化グラフ",
    },
  },
  {
    id: "05",
    kicker: "Slide 5",
    title: "Action Plan はAI一括生成ではない",
    points: [
      "Action Parts Library から必要なパーツを推薦",
      "医師がチェック・順序変更・数値編集して組み立てる",
      "左：問題 / 中央：Parts / 右：A4プレビュー の3ペイン",
    ],
    image: {
      src: "/presentation/04-action-builder.png",
      alt: "Action Prescription Builder",
    },
  },
  {
    id: "06",
    kicker: "Slide 6",
    title: "患者が持ち帰る90日プラン",
    points: [
      "「明日から何をするか」が具体的にわかるA4用紙",
      "食事・運動・毎日チェック・90日後の確認項目",
      "抽象的な「バランスよく」「適度に」は使わない",
    ],
    image: {
      src: "/presentation/05-a4-plan-preview.png",
      alt: "90日健康プランのA4プレビュー",
    },
  },
  {
    id: "07",
    kicker: "Slide 7",
    title: "Dashboard 全体の流れ",
    points: [
      "現在地 → レーダー → 推移 → 画像所見 → Action Builder → メッセージ",
      "診察の説明から、持ち帰りのプラン作成までを一つの画面でつなぐ",
    ],
    image: {
      src: "/presentation/00-dashboard-overview.png",
      alt: "Dashboard 全体概要",
    },
  },
  {
    id: "08",
    kicker: "Slide 8",
    title: "実際に触ってみてください",
    points: [
      "デモ患者A（体重増加・代謝悪化の架空データ）で動作確認できます",
      "アプリ本体とこのプレゼンは同じサイトで公開しています",
    ],
  },
];

export default function PresentationPage() {
  return (
    <main className="deck-shell">
      <header className="deck-top">
        <div>
          <p className="deck-brand">Health Compass</p>
          <h1>受講者向けプレゼン（画像スライド）</h1>
          <p className="deck-lead">
            卒業制作アプリの目的・画面・Action
            Planの考え方を、画像付きで短く説明します。
          </p>
        </div>
        <div className="deck-links">
          <Link href="/" className="deck-btn">
            アプリを開く
          </Link>
          <a
            className="deck-btn secondary"
            href="https://github.com/masayukikojima07030704-creator/my-first-repo"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="deck-slides">
        {slides.map((slide, index) => (
          <article key={slide.id} className="deck-slide" id={`slide-${slide.id}`}>
            <div className="deck-slide-copy">
              <p className="deck-kicker">
                {slide.kicker} / {index + 1} of {slides.length}
              </p>
              <h2>{slide.title}</h2>
              <ul>
                {slide.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {slide.id === "08" ? (
                <p className="deck-cta">
                  <Link href="/">→ デモアプリへ</Link>
                </p>
              ) : null}
            </div>
            {slide.image ? (
              <figure className="deck-slide-media">
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={1440}
                  height={900}
                  className="deck-image"
                  unoptimized
                />
                <figcaption>{slide.image.alt}</figcaption>
              </figure>
            ) : (
              <div className="deck-slide-media deck-slide-end">
                <p>デモ患者Aで、現在地から90日プランまで一通り体験できます。</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
