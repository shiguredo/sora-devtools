import type { FunctionComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";

import { SessionDetail } from "@/components/Sessions/SessionDetail";
import { SessionFilter } from "@/components/Sessions/SessionFilter";
import { SessionList } from "@/components/Sessions/SessionList";
import { getCurrentSessionDbId, listSessions, whenReady } from "@/sessionDatabase";
import type { SessionListRow } from "@/sessionDatabase";
import { buildSessionsPath, parseSessionsSearchParams } from "@/sessionsSearchParams";
import type { SessionsSearchParams } from "@/sessionsSearchParams";

// 不正な QS が落ちたときだけ URL を正規化する（パラメータ順の差では置換しない）
function shouldNormalizeSearch(search: string, parsed: SessionsSearchParams): boolean {
  const normalized = search.startsWith("?") ? search.slice(1) : search;
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

const Sessions: FunctionComponent = () => {
  const { url, route } = useLocation();
  const [searchParams, setSearchParams] = useState<SessionsSearchParams>(() =>
    parseSessionsSearchParams(globalThis.location.search),
  );
  const [sessions, setSessions] = useState<SessionListRow[]>([]);
  const [currentSessionDbId, setCurrentSessionDbId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // URL 変更に追従してフィルタ状態を同期し、不正値は正規化する
  useEffect(() => {
    const searchIndex = url.indexOf("?");
    const { search: locationSearch } = globalThis.location;
    let search = locationSearch;
    if (searchIndex !== -1) {
      search = url.slice(searchIndex);
    }
    const parsed = parseSessionsSearchParams(search);
    setSearchParams(parsed);

    if (shouldNormalizeSearch(search, parsed)) {
      route(buildSessionsPath(parsed), true);
    }
  }, [url, route]);

  // マウント時・フィルタ変更時に一覧を再取得する
  useEffect(() => {
    const active = { cancelled: false };
    setLoading(true);
    setErrorMessage(null);

    void (async () => {
      try {
        await whenReady();
        if (active.cancelled) {
          return;
        }
        const filter = {
          ...(searchParams.sessionId !== undefined ? { sessionId: searchParams.sessionId } : {}),
          ...(searchParams.connectionId !== undefined
            ? { connectionId: searchParams.connectionId }
            : {}),
          ...(searchParams.channelId !== undefined ? { channelId: searchParams.channelId } : {}),
          ...(searchParams.from !== undefined ? { from: searchParams.from } : {}),
          ...(searchParams.to !== undefined ? { to: searchParams.to } : {}),
        };
        const rows = await listSessions(filter);
        // await 中に cleanup で cancelled が立つ可能性がある
        // oxlint-disable-next-line typescript/no-unnecessary-condition
        if (active.cancelled) {
          return;
        }
        setSessions(rows);
        setCurrentSessionDbId(getCurrentSessionDbId());
        setLoading(false);
      } catch (error) {
        if (active.cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to load session list";
        console.warn(`Session list load failed: ${message}`);
        setErrorMessage(message);
        setLoading(false);
      }
    })();

    return () => {
      active.cancelled = true;
    };
  }, [
    searchParams.sessionId,
    searchParams.connectionId,
    searchParams.channelId,
    searchParams.from,
    searchParams.to,
  ]);

  const applySearchParams = (next: SessionsSearchParams): void => {
    const path = buildSessionsPath(next);
    route(path, true);
  };

  const handleSelect = (sessionDbId: number): void => {
    applySearchParams({ ...searchParams, sessionDbId });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-4" data-testid="sessions-page">
      <h1 className="mb-3 text-2xl font-semibold">Sessions</h1>
      <PrivacyNotice />

      {errorMessage !== null ? (
        <div
          className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800"
          data-testid="sessions-page-error"
          role="alert"
        >
          セッション一覧の読み取りに失敗しました: {errorMessage}
        </div>
      ) : null}

      <SessionFilter value={searchParams} onChange={applySearchParams} />

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">一覧</h2>
        {loading ? (
          <p className="text-bs-secondary" data-testid="session-list-loading">
            読み込み中…
          </p>
        ) : (
          <SessionList
            sessions={sessions}
            currentSessionDbId={currentSessionDbId}
            selectedSessionDbId={searchParams.sessionDbId}
            onSelect={handleSelect}
          />
        )}
      </section>

      <section>
        <SessionDetail
          key={searchParams.sessionDbId === undefined ? "none" : String(searchParams.sessionDbId)}
          sessionDbId={searchParams.sessionDbId}
        />
      </section>
    </main>
  );
};

export default Sessions;
