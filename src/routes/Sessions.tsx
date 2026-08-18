import { useEffect, useRef, useState } from "preact/hooks";
import { useLocation } from "preact-iso";

import { connectionStatus } from "@/app/signals";
import { SessionDetail } from "@/components/Sessions/SessionDetail";
import { SessionFilter } from "@/components/Sessions/SessionFilter";
import { SessionList } from "@/components/Sessions/SessionList";
import { SessionsDeleteConfirmPanel } from "@/components/Sessions/SessionsDeleteConfirmPanel";
import {
  deleteSession,
  getCurrentSessionDbId,
  isSessionDatabaseAvailable,
  listSessions,
  resetSessionDatabase,
  whenReady,
} from "@/sessionDatabase";
import type { SessionListFilter, SessionListRow } from "@/sessionDatabase";
import { buildSessionsPath, parseSessionsSearchParams } from "@/sessionsSearchParams";
import type { SessionsSearchParams } from "@/sessionsSearchParams";

type SessionsErrorKind = "list" | "delete" | "reset";

function findSessionById(
  sessions: SessionListRow[],
  sessionDbId: number | null,
): SessionListRow | null {
  if (sessionDbId === null) {
    return null;
  }
  for (const session of sessions) {
    if (session.id === sessionDbId) {
      return session;
    }
  }
  return null;
}

// 不正な QS が落ちたときだけ URL を正規化する（パラメータ順の差では置換しない）
function shouldNormalizeSearch(search: string, parsed: SessionsSearchParams): boolean {
  let normalized = search;
  if (search.startsWith("?")) {
    normalized = search.slice(1);
  }
  const raw = new URLSearchParams(normalized);

  const rawSessionDbId = raw.get("sessionDbId");
  if (rawSessionDbId !== null && rawSessionDbId !== "" && parsed.sessionDbId === undefined) {
    return true;
  }

  const rawFrom = raw.get("from");
  const rawTo = raw.get("to");
  if (rawFrom !== null && rawFrom !== "" && parsed.from === undefined) {
    return true;
  }
  if (rawTo !== null && rawTo !== "" && parsed.to === undefined) {
    return true;
  }

  return false;
}

function errorPrefix(kind: SessionsErrorKind): string {
  if (kind === "delete") {
    return "セッションの削除に失敗しました: ";
  }
  if (kind === "reset") {
    return "履歴の削除に失敗しました: ";
  }
  return "セッション一覧の読み取りに失敗しました: ";
}

function errorMessageFromUnknown(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

function buildListFilter(params: SessionsSearchParams): SessionListFilter {
  const filter: SessionListFilter = {};
  if (params.sessionId !== undefined) {
    filter.sessionId = params.sessionId;
  }
  if (params.connectionId !== undefined) {
    filter.connectionId = params.connectionId;
  }
  if (params.channelId !== undefined) {
    filter.channelId = params.channelId;
  }
  if (params.from !== undefined) {
    filter.from = params.from;
  }
  if (params.to !== undefined) {
    filter.to = params.to;
  }
  return filter;
}

function withoutSessionDbId(params: SessionsSearchParams): SessionsSearchParams {
  const next: SessionsSearchParams = { ...params };
  delete next.sessionDbId;
  return next;
}

function isHistoryResetDisabled(
  deleteActionsDisabled: boolean,
  liveCurrent: number | null,
  connectionStatusValue: string,
): boolean {
  if (deleteActionsDisabled) {
    return true;
  }
  if (liveCurrent !== null) {
    return true;
  }
  if (connectionStatusValue !== "disconnected") {
    return true;
  }
  return false;
}

// プライバシー文言（端末内 OPFS・端末情報・複数タブ注意）
function PrivacyNotice() {
  return (
    <aside
      className="mb-4 rounded border border-bs-secondary bg-bs-light p-3 text-sm"
      data-testid="sessions-privacy-notice"
    >
      <ul className="list-disc space-y-1 pl-5">
        <li>データは端末内の OPFS に保存され、外部サーバーには送信されません</li>
        <li>接続記録に端末情報（IP アドレス等）が含まれることがあります</li>
        <li>複数タブで同時に開くとデータ破損のリスクがあります。1 つのタブだけを使ってください</li>
      </ul>
    </aside>
  );
}

function Sessions() {
  const { url, route } = useLocation();
  const connectionStatusValue = connectionStatus.value;
  const [searchParams, setSearchParams] = useState<SessionsSearchParams>(() =>
    parseSessionsSearchParams(globalThis.location.search),
  );
  const [sessions, setSessions] = useState<SessionListRow[]>([]);
  const [currentSessionDbId, setCurrentSessionDbId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);
  const [errorKind, setErrorKind] = useState<SessionsErrorKind>("list");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmingSessionDbId, setConfirmingSessionDbId] = useState<number | null>(null);
  const [deletingSessionDbId, setDeletingSessionDbId] = useState<number | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const loadGenerationRef = useRef(0);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const applySearchParams = (next: SessionsSearchParams): void => {
    route(buildSessionsPath(next), true);
  };

  const loadSessions = async (options?: { clearError?: boolean }): Promise<void> => {
    const generation = loadGenerationRef.current + 1;
    loadGenerationRef.current = generation;
    setLoading(true);
    if (options?.clearError === true) {
      setErrorMessage(null);
    }
    try {
      await whenReady();
      if (generation !== loadGenerationRef.current) {
        return;
      }
      const available = isSessionDatabaseAvailable();
      setDatabaseAvailable(available);
      if (!available) {
        setSessions([]);
        setCurrentSessionDbId(null);
        setLoading(false);
        return;
      }
      const rows = await listSessions(buildListFilter(searchParamsRef.current));
      if (generation !== loadGenerationRef.current) {
        return;
      }
      setSessions(rows);
      setCurrentSessionDbId(getCurrentSessionDbId());
      setLoading(false);
    } catch (error) {
      if (generation !== loadGenerationRef.current) {
        return;
      }
      const message = errorMessageFromUnknown(error, "Failed to load session list");
      console.warn(`Session list load failed: ${message}`);
      setErrorKind("list");
      setErrorMessage(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchIndex = url.indexOf("?");
    let search = "";
    if (searchIndex !== -1) {
      search = url.slice(searchIndex);
    }
    const parsed = parseSessionsSearchParams(search);
    setSearchParams(parsed);
    if (shouldNormalizeSearch(search, parsed)) {
      route(buildSessionsPath(parsed), true);
    }
  }, [url, route]);

  useEffect(() => {
    void loadSessions({ clearError: true });
  }, [
    searchParams.sessionId,
    searchParams.connectionId,
    searchParams.channelId,
    searchParams.from,
    searchParams.to,
  ]);

  const handleConfirmDelete = (sessionDbId: number): void => {
    void (async () => {
      if (getCurrentSessionDbId() === sessionDbId) {
        setErrorKind("delete");
        setErrorMessage(`Cannot delete session: sessionDbId ${sessionDbId} is the current session`);
        setConfirmingSessionDbId(null);
        return;
      }
      setDeletingSessionDbId(sessionDbId);
      setErrorMessage(null);
      try {
        await deleteSession(sessionDbId);
        setConfirmingSessionDbId(null);
        if (searchParams.sessionDbId === sessionDbId) {
          applySearchParams(withoutSessionDbId(searchParams));
        }
        await loadSessions();
      } catch (error) {
        const message = errorMessageFromUnknown(error, "Failed to delete session");
        console.warn(`Session delete failed: ${message}`);
        setErrorKind("delete");
        setErrorMessage(message);
      } finally {
        setDeletingSessionDbId(null);
      }
    })();
  };

  const handleConfirmReset = (): void => {
    void (async () => {
      if (getCurrentSessionDbId() !== null) {
        setErrorKind("reset");
        setErrorMessage("Cannot reset session database: a session is in progress");
        setConfirmingReset(false);
        return;
      }
      setResetting(true);
      setErrorMessage(null);
      try {
        await resetSessionDatabase();
        setConfirmingReset(false);
        if (searchParams.sessionDbId !== undefined) {
          applySearchParams(withoutSessionDbId(searchParams));
        }
        await loadSessions();
      } catch (error) {
        const message = errorMessageFromUnknown(error, "Failed to reset session database");
        console.warn(`Session database reset failed: ${message}`);
        setErrorKind("reset");
        setErrorMessage(message);
        setConfirmingReset(false);
        if (searchParams.sessionDbId !== undefined) {
          applySearchParams(withoutSessionDbId(searchParams));
        }
        const available = isSessionDatabaseAvailable();
        setDatabaseAvailable(available);
        if (!available) {
          setSessions([]);
          setCurrentSessionDbId(null);
        } else {
          await loadSessions();
        }
      } finally {
        setResetting(false);
      }
    })();
  };

  const deleteActionsDisabled = deletingSessionDbId !== null || resetting;
  const resetDisabled = isHistoryResetDisabled(
    deleteActionsDisabled,
    getCurrentSessionDbId(),
    connectionStatusValue,
  );
  const showDeleteUi = !loading && databaseAvailable;

  let errorAlert = null;
  if (errorMessage !== null) {
    errorAlert = (
      <div
        className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800"
        data-testid="sessions-page-error"
        role="alert"
      >
        {errorPrefix(errorKind)}
        {errorMessage}
      </div>
    );
  }

  const confirmingSession = findSessionById(sessions, confirmingSessionDbId);

  let listBody = null;
  if (loading) {
    listBody = (
      <p className="text-bs-secondary" data-testid="session-list-loading">
        読み込み中…
      </p>
    );
  } else if (!databaseAvailable) {
    listBody = (
      <p className="text-bs-secondary" data-testid="session-database-unavailable">
        セッション永続化が利用できません（OPFS 非対応、またはデータベース初期化に失敗しています）
      </p>
    );
  } else {
    listBody = (
      <SessionList
        sessions={sessions}
        currentSessionDbId={currentSessionDbId}
        selectedSessionDbId={searchParams.sessionDbId}
        confirmingSessionDbId={confirmingSessionDbId}
        onSelect={(sessionDbId) => {
          applySearchParams({ ...searchParams, sessionDbId });
        }}
        onRequestDelete={(sessionDbId) => {
          setConfirmingReset(false);
          setConfirmingSessionDbId(sessionDbId);
        }}
        deleteActionsDisabled={deleteActionsDisabled}
      />
    );
  }

  let resetButton = null;
  if (showDeleteUi) {
    resetButton = (
      <button
        type="button"
        className="rounded border border-bs-secondary px-2 py-0.5 text-sm"
        data-testid="sessions-reset-database"
        disabled={resetDisabled}
        onClick={() => {
          setConfirmingSessionDbId(null);
          setConfirmingReset(true);
        }}
      >
        履歴を削除
      </button>
    );
  }

  let detailKey = "none";
  if (searchParams.sessionDbId !== undefined) {
    detailKey = String(searchParams.sessionDbId);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-4" data-testid="sessions-page">
      <h1 className="mb-3 text-2xl font-semibold">Sessions</h1>
      <PrivacyNotice />
      {errorAlert}
      <SessionFilter value={searchParams} onChange={applySearchParams} />
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="text-lg font-semibold">一覧</h2>
          {resetButton}
        </div>
        <SessionsDeleteConfirmPanel
          confirmingReset={confirmingReset}
          confirmingSessionDbId={confirmingSessionDbId}
          confirmingSession={confirmingSession}
          deleteActionsDisabled={deleteActionsDisabled}
          resetting={resetting}
          deletingSessionDbId={deletingSessionDbId}
          onConfirmReset={handleConfirmReset}
          onCancelReset={() => {
            setConfirmingReset(false);
          }}
          onConfirmDelete={handleConfirmDelete}
          onCancelDelete={() => {
            setConfirmingSessionDbId(null);
          }}
        />
        {listBody}
      </section>
      <section>
        <SessionDetail key={detailKey} sessionDbId={searchParams.sessionDbId} />
      </section>
    </main>
  );
}

export default Sessions;
