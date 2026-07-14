import type { FunctionComponent } from "preact";

import type { SessionListRow } from "@/sessionDatabase";
import { deriveSessionStatus, sessionStatusLabel } from "@/sessionStatus";

export interface SessionListProps {
  sessions: SessionListRow[];
  currentSessionDbId: number | null;
  selectedSessionDbId: number | undefined;
  onSelect: (sessionDbId: number) => void;
  onRequestDelete: (sessionDbId: number) => void;
  onConfirmDelete: (sessionDbId: number) => void;
  onCancelDelete: () => void;
  confirmingSessionDbId: number | null;
  deletingSessionDbId: number | null;
  deleteActionsDisabled: boolean;
}

function displayOrDash(value: string | null): string {
  if (value === null || value === "") {
    return "—";
  }
  return value;
}

// セッション一覧テーブル（session 行単位。connectionId は出さない）
export const SessionList: FunctionComponent<SessionListProps> = ({
  sessions,
  currentSessionDbId,
  selectedSessionDbId,
  onSelect,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  confirmingSessionDbId,
  deletingSessionDbId,
  deleteActionsDisabled,
}) => {
  if (sessions.length === 0) {
    return (
      <p className="text-bs-secondary" data-testid="session-list-empty">
        保存されたセッションはありません
      </p>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="session-list">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-bs-secondary">
            <th className="px-2 py-1">channelId</th>
            <th className="px-2 py-1">session_id</th>
            <th className="px-2 py-1">started_at</th>
            <th className="px-2 py-1">ended_at</th>
            <th className="px-2 py-1">状態</th>
            <th className="px-2 py-1">操作</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const status = deriveSessionStatus(session.ended_at, session.id, currentSessionDbId);
            const selected = selectedSessionDbId === session.id;
            let rowClass = "border-b border-bs-light cursor-pointer hover:bg-bs-light";
            if (selected) {
              rowClass = "border-b border-bs-light cursor-pointer bg-[#e7f1ff]";
            }
            const confirming = confirmingSessionDbId === session.id;
            const deleting = deletingSessionDbId === session.id;
            const showDeleteButton = status !== "connected";

            let actionCell = null;
            if (showDeleteButton) {
              if (confirming) {
                actionCell = (
                  <div
                    className="flex flex-wrap items-center gap-1"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <span className="text-xs text-bs-secondary">本当に削除しますか？</span>
                    <button
                      type="button"
                      className="rounded border border-red-400 px-2 py-0.5 text-xs text-red-700"
                      data-testid={`session-delete-confirm-${session.id}`}
                      disabled={deleting || deleteActionsDisabled}
                      onClick={() => {
                        onConfirmDelete(session.id);
                      }}
                    >
                      削除する
                    </button>
                    <button
                      type="button"
                      className="rounded border border-bs-secondary px-2 py-0.5 text-xs"
                      data-testid={`session-delete-cancel-${session.id}`}
                      disabled={deleting || deleteActionsDisabled}
                      onClick={() => {
                        onCancelDelete();
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                );
              } else {
                actionCell = (
                  <div
                    className="flex flex-wrap items-center gap-1"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <button
                      type="button"
                      className="rounded border border-bs-secondary px-2 py-0.5 text-xs"
                      data-testid={`session-delete-${session.id}`}
                      disabled={deleteActionsDisabled}
                      onClick={() => {
                        onRequestDelete(session.id);
                      }}
                    >
                      削除
                    </button>
                  </div>
                );
              }
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
                <td className="px-2 py-1">{displayOrDash(session.channel_id)}</td>
                <td className="px-2 py-1 font-mono text-xs">{displayOrDash(session.session_id)}</td>
                <td className="px-2 py-1 font-mono text-xs">{displayOrDash(session.started_at)}</td>
                <td className="px-2 py-1 font-mono text-xs">{displayOrDash(session.ended_at)}</td>
                <td className="px-2 py-1" data-testid={`session-status-${session.id}`}>
                  {sessionStatusLabel(status)}
                </td>
                <td className="px-2 py-1">{actionCell}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
