// DuckDB-Wasm + OPFS によるセッション・接続メタデータの永続化
// 未初期化・初期化失敗時は各 API を no-op とし、既存の接続・デバッグ機能を継続させる

import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { setSoraErrorAlertMessage } from "@/app/signals";
import type { Json } from "@/types";

// OPFS 上の DuckDB データベースパス（signaling-url-candidates.json と衝突しない名前）
const OPFS_DB_PATH = "opfs://sora-devtools-sessions.db";
const OPFS_DB_FILE_NAME = "sora-devtools-sessions.db";

// 定期 CHECKPOINT 間隔（耐久性の補助。完了条件の必須検証対象ではない）
const CHECKPOINT_INTERVAL_MS = 60_000;

// 同一原因の永続化失敗 alert を連打しないための簡易デバウンス
const ALERT_DEBOUNCE_MS = 5000;

// 機密キー判定用。大文字小文字・スネーク / ケバブ / キャメルを正規化して比較する
const SENSITIVE_KEY_NORMALIZED = new Set([
  "apikey",
  "xapikey",
  "authorization",
  "auth",
  "token",
  "accesstoken",
  "refreshtoken",
  "password",
  "secret",
  "credential",
  "credentials",
]);

// モジュールレベルシングルトン状態
let duckdbInstance: AsyncDuckDB | null = null;
let duckdbConnection: AsyncDuckDBConnection | null = null;
let currentSessionDbId: number | null = null;
let checkpointTimerId: ReturnType<typeof setInterval> | null = null;
let lastAlertMessage: string | null = null;
let lastAlertAt = 0;
let initStarted = false;

// whenReady() 用の共有 Promise。成功・失敗いずれでも settle する
let readyResolve: (() => void) | null = null;
let readyPromise = new Promise<void>((resolve) => {
  readyResolve = resolve;
});

function resetReadyPromise(): void {
  readyPromise = new Promise<void>((resolve) => {
    readyResolve = resolve;
  });
}

function settleReady(): void {
  if (readyResolve !== null) {
    readyResolve();
    readyResolve = null;
  }
}

// キー名を小文字化し、`_` / `-` を除去して機密キー集合と照合する
function normalizeMetadataKey(key: string): string {
  return key.toLowerCase().replaceAll(/[_-]/gu, "");
}

function isSensitiveMetadataKey(key: string): boolean {
  return SENSITIVE_KEY_NORMALIZED.has(normalizeMetadataKey(key));
}

// 機密キー配下の値をマスクする。文字列は "***"、オブジェクト（配列含む）は {"masked": true}
function maskSensitiveValue(value: Json): Json {
  if (typeof value === "string") {
    return "***";
  }
  if (typeof value === "object" && value !== null) {
    return { masked: true };
  }
  // number / boolean / null も機密値として残さない
  return "***";
}

// metadata 内の機密情報を再帰的にマスクする純粋関数
export function maskSensitiveMetadata(metadata: unknown): Json {
  if (metadata === null || typeof metadata !== "object") {
    if (
      metadata === null ||
      typeof metadata === "boolean" ||
      typeof metadata === "number" ||
      typeof metadata === "string"
    ) {
      return metadata;
    }
    return null;
  }

  if (Array.isArray(metadata)) {
    return metadata.map((item) => maskSensitiveMetadata(item));
  }

  const result: Record<string, Json | undefined> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) {
      continue;
    }
    if (isSensitiveMetadataKey(key)) {
      result[key] = maskSensitiveValue(value as Json);
      continue;
    }
    result[key] = maskSensitiveMetadata(value);
  }
  return result;
}

// 空文字列を SQL NULL 用の null に変換する純粋関数
export function normalizeNullableString(value: string): string | null {
  if (value === "") {
    return null;
  }
  return value;
}

export function getCurrentSessionDbId(): number | null {
  return currentSessionDbId;
}

export async function whenReady(): Promise<void> {
  return readyPromise;
}

function warnUnavailable(action: string): void {
  console.warn(`Session database is unavailable; skipped ${action}`);
}

function notifyPersistenceError(message: string): void {
  const now = Date.now();
  if (lastAlertMessage === message && now - lastAlertAt < ALERT_DEBOUNCE_MS) {
    return;
  }
  lastAlertMessage = message;
  lastAlertAt = now;
  setSoraErrorAlertMessage(message);
}

function isOpfsSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "storage" in navigator &&
    typeof navigator.storage.getDirectory === "function"
  );
}

// OPFS 上の DB ファイルを削除する（破損時の再作成用）
async function deleteOpfsDatabaseFile(): Promise<void> {
  if (!isOpfsSupported()) {
    return;
  }
  const root = await navigator.storage.getDirectory();
  // DuckDB が付随ファイルを作る場合に備え、候補名を順に削除する
  const candidates = [OPFS_DB_FILE_NAME, `${OPFS_DB_FILE_NAME}.wal`, `${OPFS_DB_FILE_NAME}.tmp`];
  for (const name of candidates) {
    try {
      await root.removeEntry(name, { recursive: true });
    } catch {
      // 存在しない場合は無視する
    }
  }
}

async function runCheckpoint(): Promise<void> {
  if (duckdbConnection === null) {
    return;
  }
  try {
    await duckdbConnection.query("CHECKPOINT");
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to checkpoint session database: ${error.message}`
        : "Failed to checkpoint session database";
    console.warn(message);
  }
}

function startCheckpointTimer(): void {
  stopCheckpointTimer();
  checkpointTimerId = setInterval(() => {
    void runCheckpoint();
  }, CHECKPOINT_INTERVAL_MS);
}

function stopCheckpointTimer(): void {
  if (checkpointTimerId !== null) {
    clearInterval(checkpointTimerId);
    checkpointTimerId = null;
  }
}

async function createSchema(connection: AsyncDuckDBConnection): Promise<void> {
  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_sessions_id");
  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_connections_id");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY DEFAULT nextval('seq_sessions_id'),
      session_id VARCHAR,
      connection_id VARCHAR,
      channel_id VARCHAR,
      role VARCHAR,
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY DEFAULT nextval('seq_connections_id'),
      session_db_id INTEGER,
      session_id VARCHAR,
      connection_id VARCHAR,
      sora_client_id VARCHAR,
      channel_id VARCHAR,
      signaling_url VARCHAR,
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function openDatabase(db: AsyncDuckDB): Promise<AsyncDuckDBConnection> {
  const duckdb = await import("@duckdb/duckdb-wasm");
  // OPFS では READ_WRITE を明示しないと不正な空ファイルが残ることがある
  await db.open({
    path: OPFS_DB_PATH,
    accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
  });
  const connection = await db.connect();
  await createSchema(connection);
  return connection;
}

async function loadDuckDBBundleUrls(): Promise<{
  mvpWasm: string;
  mvpWorker: string;
  ehWasm: string;
  ehWorker: string;
}> {
  // Vite では WASM / Worker を ?url import で URL 文字列として渡す
  const mvpWasmModule = await import("@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url");
  const mvpWorkerModule = await import("@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url");
  const ehWasmModule = await import("@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url");
  const ehWorkerModule = await import("@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url");
  return {
    mvpWasm: mvpWasmModule.default,
    mvpWorker: mvpWorkerModule.default,
    ehWasm: ehWasmModule.default,
    ehWorker: ehWorkerModule.default,
  };
}

async function instantiateDuckDB(): Promise<AsyncDuckDB> {
  const duckdb = await import("@duckdb/duckdb-wasm");
  const urls = await loadDuckDBBundleUrls();

  const bundle = await duckdb.selectBundle({
    mvp: {
      mainModule: urls.mvpWasm,
      mainWorker: urls.mvpWorker,
    },
    eh: {
      mainModule: urls.ehWasm,
      mainWorker: urls.ehWorker,
    },
  });

  // DuckDBBundle.mainWorker は string | null
  const { mainWorker } = bundle;
  if (mainWorker === null || mainWorker === "") {
    throw new Error("DuckDB-Wasm bundle mainWorker is missing");
  }

  const worker = new Worker(mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  return db;
}

async function initializeDatabase(): Promise<void> {
  if (!isOpfsSupported()) {
    console.warn("OPFS is not supported; session persistence is disabled");
    return;
  }

  // 複数タブ同時書き込みはサポート外である旨を初期化時に警告する（UI 文言は別担当）
  console.warn(
    "Session database does not support concurrent writes from multiple tabs; use a single tab",
  );

  const db = await instantiateDuckDB();

  try {
    const connection = await openDatabase(db);
    duckdbInstance = db;
    duckdbConnection = connection;
    startCheckpointTimer();
    return;
  } catch (openError) {
    const openMessage =
      openError instanceof Error
        ? `Failed to open session database: ${openError.message}`
        : "Failed to open session database";
    console.warn(openMessage);
    // 破損時は削除して再作成する
    try {
      await db.terminate();
    } catch {
      // terminate 失敗は無視して削除へ進む
    }
    await deleteOpfsDatabaseFile();
  }

  const retryDb = await instantiateDuckDB();
  try {
    const connection = await openDatabase(retryDb);
    duckdbInstance = retryDb;
    duckdbConnection = connection;
    startCheckpointTimer();
  } catch (retryError) {
    const retryMessage =
      retryError instanceof Error
        ? `Failed to recreate session database: ${retryError.message}`
        : "Failed to recreate session database";
    console.warn(retryMessage);
    try {
      await retryDb.terminate();
    } catch {
      // 再作成失敗時の terminate 失敗は無視する
    }
  }
}

// App マウント時に呼ぶ。失敗しても既存機能は継続する
export async function createSessionDatabase(): Promise<void> {
  if (initStarted) {
    await readyPromise;
    return;
  }
  // close 後の再初期化では、既に settle 済みの Promise を差し替える
  if (readyResolve === null) {
    resetReadyPromise();
  }
  initStarted = true;
  try {
    await initializeDatabase();
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to initialize session database: ${error.message}`
        : "Failed to initialize session database";
    console.warn(message);
  } finally {
    settleReady();
  }
}

export async function insertSession(
  channelId: string,
  role: string,
  metadata: Json | undefined,
): Promise<number | null> {
  if (duckdbConnection === null) {
    warnUnavailable("insertSession");
    return null;
  }
  try {
    const maskedMetadata = metadata === undefined ? null : maskSensitiveMetadata(metadata);
    const metadataJson = maskedMetadata === null ? null : JSON.stringify(maskedMetadata);
    const statement = await duckdbConnection.prepare(`
      INSERT INTO sessions (channel_id, role, started_at, metadata)
      VALUES (?, ?, CURRENT_TIMESTAMP, CASE WHEN ? IS NULL THEN NULL ELSE CAST(? AS JSON) END)
      RETURNING id
    `);
    const table = await statement.query(channelId, role, metadataJson, metadataJson);
    await statement.close();
    const idColumn = table.getChildAt(0);
    const rawId: unknown = idColumn === null ? undefined : idColumn.get(0);
    let id: number | null = null;
    if (typeof rawId === "bigint") {
      id = Number(rawId);
    } else if (typeof rawId === "number") {
      id = rawId;
    }
    if (id === null || !Number.isFinite(id)) {
      throw new Error(`insertSession RETURNING id is not a number: ${String(rawId)}`);
    }
    currentSessionDbId = id;
    await runCheckpoint();
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to insert session: ${error.message}`
        : "Failed to insert session";
    console.warn(message);
    notifyPersistenceError(message);
    return null;
  }
}

export async function updateSessionIdAndConnectionId(
  id: number,
  sessionId: string,
  connectionId: string,
): Promise<void> {
  if (duckdbConnection === null) {
    warnUnavailable("updateSessionIdAndConnectionId");
    return;
  }
  try {
    const statement = await duckdbConnection.prepare(`
      UPDATE sessions
      SET session_id = ?, connection_id = ?
      WHERE id = ?
    `);
    await statement.query(sessionId, connectionId, id);
    await statement.close();
    await runCheckpoint();
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to update session identifiers: ${error.message}`
        : "Failed to update session identifiers";
    console.warn(message);
    notifyPersistenceError(message);
  }
}

export async function insertConnection(
  sessionDbId: number,
  sessionId: string,
  connectionId: string,
  soraClientId: string,
  channelId: string,
  signalingUrl: string,
): Promise<boolean> {
  if (duckdbConnection === null) {
    warnUnavailable("insertConnection");
    return false;
  }
  try {
    const normalizedSignalingUrl = normalizeNullableString(signalingUrl);
    const statement = await duckdbConnection.prepare(`
      INSERT INTO connections (
        session_db_id, session_id, connection_id, sora_client_id,
        channel_id, signaling_url, started_at
      )
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    await statement.query(
      sessionDbId,
      sessionId,
      connectionId,
      soraClientId,
      channelId,
      normalizedSignalingUrl,
    );
    await statement.close();
    await runCheckpoint();
    return true;
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to insert connection: ${error.message}`
        : "Failed to insert connection";
    console.warn(message);
    notifyPersistenceError(message);
    return false;
  }
}

export async function updateSessionEndedAt(id: number): Promise<void> {
  if (duckdbConnection === null) {
    warnUnavailable("updateSessionEndedAt");
    return;
  }
  try {
    const statement = await duckdbConnection.prepare(`
      UPDATE sessions
      SET ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    await statement.query(id);
    await statement.close();
    // 成功時、当該 id が current と一致するときだけ clear する（無条件 clear 禁止）
    if (currentSessionDbId === id) {
      currentSessionDbId = null;
    }
    await runCheckpoint();
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to update session ended_at: ${error.message}`
        : "Failed to update session ended_at";
    console.warn(message);
    notifyPersistenceError(message);
  }
}

export async function updateConnectionEndedAt(connectionId: string): Promise<void> {
  if (!connectionId) {
    return;
  }
  if (duckdbConnection === null) {
    warnUnavailable("updateConnectionEndedAt");
    return;
  }
  try {
    const statement = await duckdbConnection.prepare(`
      UPDATE connections
      SET ended_at = CURRENT_TIMESTAMP
      WHERE connection_id = ?
    `);
    await statement.query(connectionId);
    await statement.close();
    await runCheckpoint();
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to update connection ended_at: ${error.message}`
        : "Failed to update connection ended_at";
    console.warn(message);
    notifyPersistenceError(message);
  }
}

// E2E クリーンアップおよび明示的 teardown 用。beforeunload では呼ばない
// 公式 OPFS テストの close 手順に合わせ、再 open 可能な状態でハンドルを解放する
export async function close(): Promise<void> {
  stopCheckpointTimer();
  const connection = duckdbConnection;
  const instance = duckdbInstance;
  duckdbConnection = null;
  duckdbInstance = null;
  currentSessionDbId = null;
  // 同一ドキュメントで再初期化できるようにする（whenReady は settle 済みのまま）
  initStarted = false;

  if (connection !== null) {
    try {
      await connection.query("CHECKPOINT");
    } catch {
      // close 前の CHECKPOINT 失敗は無視する
    }
    try {
      await connection.close();
    } catch (error) {
      console.warn(
        error instanceof Error
          ? `Failed to close session database connection: ${error.message}`
          : "Failed to close session database connection",
      );
    }
  }

  if (instance !== null) {
    try {
      await instance.flushFiles();
    } catch {
      // flush 失敗は reset / dropFiles へ進む
    }
    try {
      await instance.reset();
    } catch {
      // reset 失敗は dropFiles / terminate へ進む
    }
    try {
      await instance.dropFiles();
    } catch {
      // dropFiles 失敗は terminate へ進む
    }
    try {
      await instance.terminate();
    } catch (error) {
      console.warn(
        error instanceof Error
          ? `Failed to terminate session database: ${error.message}`
          : "Failed to terminate session database",
      );
    }
  }
}

// E2E 専用: アプリ側 close 済み前提で OPFS DB を一時 open して SQL を実行する
export async function querySessionDatabaseForE2e(
  sql: string,
): Promise<Array<Record<string, unknown>>> {
  if (duckdbConnection !== null || duckdbInstance !== null) {
    throw new Error("Session database must be closed before E2E query");
  }
  const duckdb = await import("@duckdb/duckdb-wasm");
  const db = await instantiateDuckDB();
  try {
    await db.open({
      path: OPFS_DB_PATH,
      accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
    });
    const connection = await db.connect();
    try {
      const table = await connection.query(sql);
      return table.toArray().map((row) => {
        if (typeof row !== "object" || row === null) {
          return {};
        }
        if ("toJSON" in row && typeof (row as { toJSON?: unknown }).toJSON === "function") {
          const json: unknown = (row as { toJSON: () => unknown }).toJSON();
          if (typeof json === "object" && json !== null) {
            return json as Record<string, unknown>;
          }
        }
        return row as Record<string, unknown>;
      });
    } finally {
      try {
        await connection.query("CHECKPOINT");
      } catch {
        // ignore
      }
      await connection.close();
    }
  } finally {
    try {
      await db.flushFiles();
    } catch {
      // ignore
    }
    try {
      await db.reset();
    } catch {
      // ignore
    }
    try {
      await db.dropFiles();
    } catch {
      // ignore
    }
    await db.terminate();
  }
}

// E2E ヘルパーから OPFS 上の DB ファイルを削除するために export する
export async function deleteSessionDatabaseFiles(): Promise<void> {
  await deleteOpfsDatabaseFile();
}
