import { createPortal } from "preact/compat";
import { useEffect } from "preact/hooks";

import type { SessionListRow } from "@/sessionDatabase";

import styles from "./SessionsDeleteConfirmPanel.module.css";

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
      <p className={styles.detail} title={detail}>
        {detail}
      </p>
    );
  }

  return (
    <div
      className={styles.overlay}
      data-testid="sessions-delete-confirm-panel"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sessions-delete-confirm-title"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h3 id="sessions-delete-confirm-title" className={styles.dialogTitle}>
          {title}
        </h3>
        {detailParagraph}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            data-testid={cancelTestId}
            disabled={confirmDisabled}
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            className={styles.confirmButton}
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
