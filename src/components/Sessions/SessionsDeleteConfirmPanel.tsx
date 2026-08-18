import { createPortal } from "preact/compat";
import { useEffect } from "preact/hooks";

import type { SessionListRow } from "@/sessionDatabase";

export interface SessionsDeleteConfirmPanelProps {
  confirmingReset: boolean;
  confirmingSessionDbId: number | null;
  confirmingSession: SessionListRow | null;
  deleteActionsDisabled: boolean;
  resetting: boolean;
  deletingSessionDbId: number | null;
  onConfirmReset: () => void;
  onCancelReset: () => void;
  onConfirmDelete: (sessionDbId: number) => void;
  onCancelDelete: () => void;
}

function labelOrDash(value: string | null): string {
  if (value === null || value === "") {
    return "—";
  }
  return value;
}

interface ConfirmDialogBodyProps {
  title: string;
  detail: string | null;
  confirmTestId: string;
  cancelTestId: string;
  confirmDisabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// 画面中央の確認ダイアログ本体（一覧のレイアウトには影響しない）
function ConfirmDialogBody({
  title,
  detail,
  confirmTestId,
  cancelTestId,
  confirmDisabled,
  onConfirm,
  onCancel,
}: ConfirmDialogBodyProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !confirmDisabled) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmDisabled, onCancel]);

  let detailParagraph = null;
  if (detail !== null) {
    detailParagraph = (
      <p className="mb-4 truncate font-mono text-xs text-bs-secondary" title={detail}>
        {detail}
      </p>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="sessions-delete-confirm-panel"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded border border-bs-secondary bg-white p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sessions-delete-confirm-title"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h3
          id="sessions-delete-confirm-title"
          className="mb-2 text-base font-semibold text-red-800"
        >
          {title}
        </h3>
        {detailParagraph}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="w-24 rounded border border-bs-secondary bg-white px-2 py-1 text-sm"
            data-testid={cancelTestId}
            disabled={confirmDisabled}
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="w-20 rounded border border-red-400 bg-red-50 px-2 py-1 text-sm text-red-700"
            data-testid={confirmTestId}
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}

// 削除確認は portal のオーバーレイで出す。一覧の列幅・縦位置を動かさない
export function SessionsDeleteConfirmPanel({
  confirmingReset,
  confirmingSessionDbId,
  confirmingSession,
  deleteActionsDisabled,
  resetting,
  deletingSessionDbId,
  onConfirmReset,
  onCancelReset,
  onConfirmDelete,
  onCancelDelete,
}: SessionsDeleteConfirmPanelProps) {
  if (typeof document === "undefined") {
    return null;
  }

  if (confirmingReset) {
    return createPortal(
      <ConfirmDialogBody
        title="保存されたセッション履歴がすべて削除されます"
        detail={null}
        confirmTestId="sessions-reset-confirm"
        cancelTestId="sessions-reset-cancel"
        confirmDisabled={resetting || deleteActionsDisabled}
        onConfirm={onConfirmReset}
        onCancel={onCancelReset}
      />,
      document.body,
    );
  }

  if (confirmingSessionDbId === null) {
    return null;
  }

  let channelLabel = "—";
  let sessionIdLabel = "—";
  if (confirmingSession !== null) {
    channelLabel = labelOrDash(confirmingSession.channel_id);
    sessionIdLabel = labelOrDash(confirmingSession.session_id);
  }

  return createPortal(
    <ConfirmDialogBody
      title="このセッションを削除しますか？"
      detail={`channelId: ${channelLabel} / session_id: ${sessionIdLabel}`}
      confirmTestId={`session-delete-confirm-${confirmingSessionDbId}`}
      cancelTestId={`session-delete-cancel-${confirmingSessionDbId}`}
      confirmDisabled={deletingSessionDbId !== null || deleteActionsDisabled}
      onConfirm={() => {
        onConfirmDelete(confirmingSessionDbId);
      }}
      onCancel={onCancelDelete}
    />,
    document.body,
  );
}
