import type { SessionsSearchParams } from "@/sessionsSearchParams";

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
    <form
      className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-6"
      onSubmit={handleSubmit}
      data-testid="session-filter"
    >
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-bs-secondary">channelId</span>
        <input
          name="channelId"
          type="text"
          className="rounded border border-bs-secondary px-2 py-1"
          defaultValue={value.channelId ?? ""}
          key={`channelId-${value.channelId ?? ""}`}
        />
      </label>
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-bs-secondary">sessionId</span>
        <input
          name="sessionId"
          type="text"
          className="rounded border border-bs-secondary px-2 py-1"
          defaultValue={value.sessionId ?? ""}
          key={`sessionId-${value.sessionId ?? ""}`}
        />
      </label>
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-bs-secondary">connectionId</span>
        <input
          name="connectionId"
          type="text"
          className="rounded border border-bs-secondary px-2 py-1"
          defaultValue={value.connectionId ?? ""}
          key={`connectionId-${value.connectionId ?? ""}`}
        />
      </label>
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-bs-secondary">from (UTC)</span>
        <input
          name="from"
          type="date"
          className="rounded border border-bs-secondary px-2 py-1"
          defaultValue={value.from ?? ""}
          key={`from-${value.from ?? ""}`}
        />
      </label>
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-bs-secondary">to (UTC)</span>
        <input
          name="to"
          type="date"
          className="rounded border border-bs-secondary px-2 py-1"
          defaultValue={value.to ?? ""}
          key={`to-${value.to ?? ""}`}
        />
      </label>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="rounded border border-bs-primary bg-bs-primary px-3 py-1 text-sm text-white"
        >
          絞り込み
        </button>
        <button
          type="button"
          className="rounded border border-bs-secondary px-3 py-1 text-sm"
          onClick={handleClear}
        >
          クリア
        </button>
      </div>
    </form>
  );
}
