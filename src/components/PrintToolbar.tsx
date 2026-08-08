"use client";

import { useEffect } from "react";

type PrintTarget = "result" | "action";

type PrintToolbarProps = {
  actionDisabled?: boolean;
  actionDisabledReason?: string;
};

function setPrintTarget(target: PrintTarget) {
  document.body.dataset.print = target;
}

function clearPrintTarget() {
  delete document.body.dataset.print;
}

export function PrintToolbar({
  actionDisabled = false,
  actionDisabledReason,
}: PrintToolbarProps) {
  useEffect(() => {
    const onAfterPrint = () => clearPrintTarget();
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const handlePrint = (target: PrintTarget) => {
    if (target === "action" && actionDisabled) return;
    setPrintTarget(target);
    requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <div className="print-toolbar no-print">
      <div>
        <p className="print-toolbar-title">診察終了時の印刷</p>
        <p className="print-toolbar-note">
          A4縦1枚ずつ。結果は「現在地」、アクションプランは医師承認後に印刷します。
        </p>
      </div>
      <div className="print-toolbar-actions">
        <button
          type="button"
          className="print-btn"
          onClick={() => handlePrint("result")}
        >
          結果を印刷
        </button>
        <button
          type="button"
          className="print-btn secondary"
          disabled={actionDisabled}
          title={actionDisabled ? actionDisabledReason : undefined}
          onClick={() => handlePrint("action")}
        >
          アクションプランを印刷
        </button>
      </div>
    </div>
  );
}
