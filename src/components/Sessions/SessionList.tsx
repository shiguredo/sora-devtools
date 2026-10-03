import type { SessionListRow } from "@/sessionDatabase";
import { deriveSessionStatus, sessionStatusLabel } from "@/sessionStatus";

import styles from "./SessionList.module.css";

export interface SessionListProps {
  sessions: SessionListRow[];
  currentSessionDbId: number | null;
  selectedSessionDbId: number | undefined;
  confirmingSessionDbId: number | null;
  onSelect: (sessionDbId: number) => void;
  onRequestDelete: (sessionDbId: number) => void;
  deleteActionsDisabled: boolean;
}

function displayOrDash(value: string | null): string {
  if (value === null || value === "") {
    return "—";
  }
  return value;
}

// セッション一覧テーブル（session 行単位。connectionId は出さない）
// 削除確認はオーバーレイ側。ここは常に同じ列構成・同じセル内容でレイアウトを固定する
export function SessionList({
  sessions,
  currentSessionDbId,
  selectedSessionDbId,
  confirmingSessionDbId,
  onSelect,
  onRequestDelete,
  deleteActionsDisabled,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <p className={styles.empty} data-testid="session-list-empty">
        保存されたセッションはありません
      </p>
    );
  }

  return (
    <div className={styles.scrollArea} data-testid="session-list">
      <table className={styles.table}>
        <colgroup>
          <col className={styles.colChannelId} />
          <col className={styles.colSessionId} />
          <col className={styles.colStartedAt} />
          <col className={styles.colEndedAt} />
          <col className={styles.colStatus} />
          <col className={styles.colActions} />
        </colgroup>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.cell}>channelId</th>
            <th className={styles.cell}>session_id</th>
            <th className={styles.cell}>started_at</th>
            <th className={styles.cell}>ended_at</th>
            <th className={styles.cell}>状態</th>
            <th className={styles.cell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const status = deriveSessionStatus(session.ended_at, session.id, currentSessionDbId);
            const selected = selectedSessionDbId === session.id;
            const confirming = confirmingSessionDbId === session.id;
            let rowClass = `${styles.row} ${styles.rowHover}`;
            if (confirming) {
              rowClass = `${styles.row} ${styles.rowConfirming}`;
            } else if (selected) {
              rowClass = `${styles.row} ${styles.rowSelected}`;
            }
            const showDeleteButton = status !== "connected";

            // 操作セルは常に同じ枠を確保し、接続中は空でも幅が変わらないようにする
            let actionContent = <span className={styles.actionPlaceholder} aria-hidden="true" />;
            if (showDeleteButton) {
              actionContent = (
                <button
                  type="button"
                  className={styles.deleteButton}
                  data-testid={`session-delete-${session.id}`}
                  disabled={deleteActionsDisabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRequestDelete(session.id);
                  }}
                >
                  削除
                </button>
              );
            }

            return (
              <tr
                key={session.id}
                className={rowClass}
                data-testid={`session-row-${session.id}`}
                data-session-db-id={String(session.id)}
                onClick={() => {
                  onSelect(session.id);
                }}
              >
                <td className={`${styles.cell} ${styles.truncatedCell}`}>
                  {displayOrDash(session.channel_id)}
                </td>
                <td className={`${styles.cell} ${styles.truncatedCell} ${styles.monoCell}`}>
                  {displayOrDash(session.session_id)}
                </td>
                <td className={`${styles.cell} ${styles.truncatedCell} ${styles.monoCell}`}>
                  {displayOrDash(session.started_at)}
                </td>
                <td className={`${styles.cell} ${styles.truncatedCell} ${styles.monoCell}`}>
                  {displayOrDash(session.ended_at)}
                </td>
                <td
                  className={`${styles.cell} ${styles.truncatedCell}`}
                  data-testid={`session-status-${session.id}`}
                >
                  {sessionStatusLabel(status)}
                </td>
                <td className={`${styles.cell} ${styles.centerCell}`}>{actionContent}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
