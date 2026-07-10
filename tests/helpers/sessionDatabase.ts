import type { Page } from "@playwright/test";

// アプリ側 sessionDatabase モジュールの URL（Vite が配信するソース）
const SESSION_DATABASE_MODULE_URL = "/src/sessionDatabase.ts";

// E2E で参照するセッション行の最小形状
export interface SessionRow {
  id: number;
  session_id: string | null;
  connection_id: string | null;
  channel_id: string | null;
  role: string | null;
  ended_at: string | null;
}

// E2E で参照する接続行の最小形状
export interface ConnectionRow {
  id: number;
  session_db_id: number;
  session_id: string | null;
  connection_id: string | null;
  channel_id: string | null;
  ended_at: string | null;
}

// アプリ側シングルトンの初期化完了を待つ
export async function awaitSessionDatabaseReady(page: Page): Promise<void> {
  await page.evaluate(async (moduleUrl) => {
    const loaded: unknown = await import(/* @vite-ignore */ moduleUrl);
    const mod = loaded as {
      whenReady: () => Promise<void>;
    };
    await mod.whenReady();
  }, SESSION_DATABASE_MODULE_URL);
}

// アプリ側シングルトンを close する（再 open 前の排他解除）
export async function closeAppSessionDatabase(page: Page): Promise<void> {
  await page.evaluate(async (moduleUrl) => {
    const loaded: unknown = await import(/* @vite-ignore */ moduleUrl);
    const mod = loaded as {
      close: () => Promise<void>;
    };
    await mod.close();
  }, SESSION_DATABASE_MODULE_URL);
}

// E2E の list / wait で close したあと、アプリ側シングルトンを再度開く
export async function reopenAppSessionDatabase(page: Page): Promise<void> {
  await page.evaluate(async (moduleUrl) => {
    const loaded: unknown = await import(/* @vite-ignore */ moduleUrl);
    const mod = loaded as {
      createSessionDatabase: () => Promise<void>;
      whenReady: () => Promise<void>;
    };
    await mod.createSessionDatabase();
    await mod.whenReady();
  }, SESSION_DATABASE_MODULE_URL);
}

// OPFS 上のセッション DB ファイルを削除する（close 後に呼ぶ）
export async function deleteSessionDatabaseFiles(page: Page): Promise<void> {
  await page.evaluate(async (moduleUrl) => {
    const loaded: unknown = await import(/* @vite-ignore */ moduleUrl);
    const mod = loaded as {
      deleteSessionDatabaseFiles: () => Promise<void>;
    };
    await mod.deleteSessionDatabaseFiles();
  }, SESSION_DATABASE_MODULE_URL);
}

// アプリ側 close → OPFS ファイル削除。既存 E2E の teardown からも利用する
export async function cleanupSessionDatabase(page: Page): Promise<void> {
  // Vite の /src/* を解決できるよう、アプリオリジンへ遷移してから操作する
  const currentUrl = page.url();
  if (!currentUrl.startsWith("http://localhost:3333")) {
    await page.goto("http://localhost:3333/devtools/");
  }
  await closeAppSessionDatabase(page);
  await deleteSessionDatabaseFiles(page);
}

async function querySessionDatabase<T>(page: Page, sql: string): Promise<T[]> {
  await closeAppSessionDatabase(page);
  // Vite 配信モジュール経由で再 open + SQL する（page.evaluate に duckdb 初期化を埋め込まない）
  const rows = await page.evaluate(
    async ({ moduleUrl, query }) => {
      const loaded: unknown = await import(/* @vite-ignore */ moduleUrl);
      const mod = loaded as {
        querySessionDatabaseForE2e: (sql: string) => Promise<Array<Record<string, unknown>>>;
      };
      return mod.querySessionDatabaseForE2e(query);
    },
    { moduleUrl: SESSION_DATABASE_MODULE_URL, query: sql },
  );
  return rows as T[];
}

// sessions 全行を取得する
export async function listSessionRows(page: Page): Promise<SessionRow[]> {
  return querySessionDatabase<SessionRow>(
    page,
    "SELECT id, session_id, connection_id, channel_id, role, CAST(ended_at AS VARCHAR) AS ended_at FROM sessions ORDER BY id",
  );
}

// connections 全行を取得する
export async function listConnectionRows(page: Page): Promise<ConnectionRow[]> {
  return querySessionDatabase<ConnectionRow>(
    page,
    "SELECT id, session_db_id, session_id, connection_id, channel_id, CAST(ended_at AS VARCHAR) AS ended_at FROM connections ORDER BY id",
  );
}

// fire-and-forget の ended_at 更新が反映されるまで待つ
export async function waitForEndedAt(
  page: Page,
  options: {
    connectionId: string;
    timeoutMs?: number;
  },
): Promise<{ session: SessionRow; connection: ConnectionRow }> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const deadline = Date.now() + timeoutMs;
  let lastSession: SessionRow | undefined;
  let lastConnection: ConnectionRow | undefined;

  while (Date.now() < deadline) {
    const sessions = await listSessionRows(page);
    const connections = await listConnectionRows(page);
    lastSession = sessions.find((row) => row.connection_id === options.connectionId);
    lastConnection = connections.find((row) => row.connection_id === options.connectionId);
    if (lastSession?.ended_at && lastConnection?.ended_at) {
      return { session: lastSession, connection: lastConnection };
    }
    // list* は DB を close するため、次のポーリング前にアプリ側を再初期化する
    await reopenAppSessionDatabase(page);
    await page.waitForTimeout(200);
  }

  throw new Error(
    `ended_at was not set within ${timeoutMs}ms ` +
      `(session=${String(lastSession?.ended_at)}, connection=${String(lastConnection?.ended_at)})`,
  );
}
