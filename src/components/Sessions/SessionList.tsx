import type { FunctionComponent } from "preact";

import type { SessionListRow } from "@/sessionDatabase";
import { deriveSessionStatus, sessionStatusLabel } from "@/sessionStatus";

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
export const SessionList: FunctionComponent<SessionListProps> = ({
  sessions,
  currentSessionDbId,
  selectedSessionDbId,
  confirmingSessionDbId,
  onSelect,
  onRequestDelete,
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
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[24%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
        </colgroup>
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
            const confirming = confirmingSessionDbId === session.id;
            let rowClass = "border-b border-bs-light cursor-pointer hover:bg-bs-light";
            if (confirming) {
              rowClass = "border-b border-bs-light cursor-pointer bg-red-50";
            } else if (selected) {
              rowClass = "border-b border-bs-light cursor-pointer bg-[#e7f1ff]";
            }
            const showDeleteButton = status !== "connected";

            // 操作セルは常に同じ枠を確保し、接続中は空でも幅が変わらないようにする
            let actionContent = <span className="inline-block h-6 w-14" aria-hidden="true" />;
            if (showDeleteButton) {
              actionContent = (
                <button
                  type="button"
                  className="inline-block h-6 w-14 rounded border border-bs-secondary text-xs leading-5"
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
                <td className="truncate px-2 py-1">{displayOrDash(session.channel_id)}</td>
                <td className="truncate px-2 py-1 font-mono text-xs">
                  {displayOrDash(session.session_id)}
                </td>
                <td className="truncate px-2 py-1 font-mono text-xs">
                  {displayOrDash(session.started_at)}
                </td>
                <td className="truncate px-2 py-1 font-mono text-xs">
                  {displayOrDash(session.ended_at)}
                </td>
                <td className="truncate px-2 py-1" data-testid={`session-status-${session.id}`}>
                  {sessionStatusLabel(status)}
                </td>
                <td className="px-2 py-1 text-center">{actionContent}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
