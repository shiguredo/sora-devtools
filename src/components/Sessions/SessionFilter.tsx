import type { SessionsSearchParams } from "@/sessionsSearchParams";

import styles from "./SessionFilter.module.css";

export interface SessionFilterProps {
  value: SessionsSearchParams;
  onChange: (next: SessionsSearchParams) => void;
}

// 一覧絞り込みフォーム。適用時に親へ SessionsSearchParams を渡す
export function SessionFilter({ value, onChange }: SessionFilterProps) {
  const handleSubmit = (event: Event): void => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const data = new FormData(form);
    const next: SessionsSearchParams = {};
    const sessionId = data.get("sessionId");
    if (typeof sessionId === "string" && sessionId !== "") {
      next.sessionId = sessionId;
    }
    const connectionId = data.get("connectionId");
    if (typeof connectionId === "string" && connectionId !== "") {
      next.connectionId = connectionId;
    }
    const channelId = data.get("channelId");
    if (typeof channelId === "string" && channelId !== "") {
      next.channelId = channelId;
    }
    const from = data.get("from");
    if (typeof from === "string" && from !== "") {
      next.from = from;
    }
    const to = data.get("to");
    if (typeof to === "string" && to !== "") {
      next.to = to;
    }
    // 詳細選択はフィルタ変更で維持する
    if (value.sessionDbId !== undefined) {
      next.sessionDbId = value.sessionDbId;
    }
    onChange(next);
  };

  const handleClear = (): void => {
    const next: SessionsSearchParams = {};
    if (value.sessionDbId !== undefined) {
      next.sessionDbId = value.sessionDbId;
    }
    onChange(next);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} data-testid="session-filter">
      <label className={styles.field}>
        <span className={styles.fieldLabel}>channelId</span>
        <input
          name="channelId"
          type="text"
          className={styles.input}
          defaultValue={value.channelId ?? ""}
          key={`channelId-${value.channelId ?? ""}`}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>sessionId</span>
        <input
          name="sessionId"
          type="text"
          className={styles.input}
          defaultValue={value.sessionId ?? ""}
          key={`sessionId-${value.sessionId ?? ""}`}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>connectionId</span>
        <input
          name="connectionId"
          type="text"
          className={styles.input}
          defaultValue={value.connectionId ?? ""}
          key={`connectionId-${value.connectionId ?? ""}`}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>from (UTC)</span>
        <input
          name="from"
          type="date"
          className={styles.input}
          defaultValue={value.from ?? ""}
          key={`from-${value.from ?? ""}`}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>to (UTC)</span>
        <input
          name="to"
          type="date"
          className={styles.input}
          defaultValue={value.to ?? ""}
          key={`to-${value.to ?? ""}`}
        />
      </label>
      <div className={styles.actions}>
        <button type="submit" className={styles.submitButton}>
          絞り込み
        </button>
        <button type="button" className={styles.clearButton} onClick={handleClear}>
          クリア
        </button>
      </div>
    </form>
  );
}
