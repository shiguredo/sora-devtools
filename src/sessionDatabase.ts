// DuckDB-Wasm + OPFS によるセッション・接続メタデータの永続化
// 未初期化・初期化失敗時は各 API を no-op とし、既存の接続・デバッグ機能を継続させる

import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { setSoraErrorAlertMessage } from "@/app/signals";
import { computeStatsAggregates, computeStatsTimeseries } from "@/statsQuery";
import type { StatsAggregates, StatsSourceRow, StatsTimeseriesPoint } from "@/statsQuery";
import { computeStreamTimeseriesForId, listStatsStreams } from "@/statsStreamQuery";
import type {
  StatsStreamSummary,
  StatsStreamTimeseriesPoint,
  StreamSourceRow,
} from "@/statsStreamQuery";
import type {
  Json,
  LogMessage,
  NotifyMessage,
  PushMessage,
  SignalingMessage,
  TimelineMessage,
} from "@/types";
import { selectIdsToDeleteForSampling } from "@/webrtcStatsNormalizer";
import type { NormalizedWebrtcStat } from "@/webrtcStatsNormalizer";

// 読み取り API の戻り型（時刻は ISO 相当の文字列）
export interface SessionListRow {
  id: number;
  session_id: string | null;
  channel_id: string | null;
  role: string | null;
  started_at: string | null;
  ended_at: string | null;
}

export interface ConnectionListRow {
  id: number;
  session_db_id: number;
  session_id: string | null;
  connection_id: string | null;
  sora_client_id: string | null;
  channel_id: string | null;
  signaling_url: string | null;
  started_at: string | null;
  ended_at: string | null;
}

export interface SessionDetail {
  session: SessionListRow;
  connections: ConnectionListRow[];
}

export interface SessionListFilter {
  sessionId?: string;
  connectionId?: string;
  channelId?: string;
  from?: string;
  to?: string;
}

export interface StatsPageRow {
  id: number;
  timestamp_ms: number;
  stats_type: string | null;
  stats_id: string | null;
  kind: string | null;
  packets_received: number | null;
  packets_sent: number | null;
  bytes_received: number | null;
  bytes_sent: number | null;
  round_trip_time: number | null;
}

export interface StatsPageResult {
  rows: StatsPageRow[];
  totalCount: number;
}

export interface StatsTimeseriesOptions {
  intervalSec?: number;
}

export interface StatsPageOptions {
  limit?: number;
  offset?: number;
  // 指定時は stats_type で絞り込む
  statsType?: string;
  // 指定時は stats_id で絞り込む（statsType と併用可）
  statsId?: string;
}

export type StatsRawMetric =
  | "bytes_sent"
  | "bytes_received"
  | "packets_sent"
  | "packets_received"
  | "round_trip_time";

export interface StatsRawSeriesOptions {
  metric: StatsRawMetric;
  statsType: string;
  // 省略時は当該 type の全 stats_id（描画側で上限あり）
  statsId?: string;
}

export interface StatsRawSeriesPoint {
  timestamp_ms: number;
  stats_id: string;
  value: number;
}

export type { StatsAggregates, StatsTimeseriesPoint } from "@/statsQuery";
export type {
  StatsStreamSummary,
  StatsStreamTimeseriesPoint,
  StatsStreamType,
} from "@/statsStreamQuery";

// メッセージ種別。timeline / notify / signaling / log / push の 5 種
export type MessageKind = "timeline" | "notify" | "signaling" | "log" | "push";

export interface MessagePageOptions {
  limit?: number;
  offset?: number;
}

export interface TimelineMessagePageRow {
  id: number;
  session_db_id: number;
  connection_id: string | null;
  timestamp_ms: number;
  type: string | null;
  log_type: string | null;
  payload_json: Json;
}

export interface TimelineMessagePageResult {
  rows: TimelineMessagePageRow[];
  totalCount: number;
}

export interface NotifyMessagePageRow {
  id: number;
  session_db_id: number;
  connection_id: string | null;
  timestamp_ms: number;
  event_type: string | null;
  transport_type: string | null;
  payload_json: Json;
}

export interface NotifyMessagePageResult {
  rows: NotifyMessagePageRow[];
  totalCount: number;
}

export interface SignalingMessagePageRow {
  id: number;
  session_db_id: number;
  connection_id: string | null;
  timestamp_ms: number;
  type: string | null;
  transport_type: string | null;
  payload_json: Json;
}

export interface SignalingMessagePageResult {
  rows: SignalingMessagePageRow[];
  totalCount: number;
}

export interface LogMessagePageRow {
  id: number;
  session_db_id: number;
  connection_id: string | null;
  timestamp_ms: number;
  title: string | null;
  payload_json: Json;
}

export interface LogMessagePageResult {
  rows: LogMessagePageRow[];
  totalCount: number;
}

export interface PushMessagePageRow {
  id: number;
  session_db_id: number;
  connection_id: string | null;
  timestamp_ms: number;
  transport_type: string | null;
  payload_json: Json;
}

export interface PushMessagePageResult {
  rows: PushMessagePageRow[];
  totalCount: number;
}

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
// connections INSERT 成功時の connection_id。disconnect 明示パス用（SDK は callback 前に null 化する）
let currentConnectionId: string | null = null;
let checkpointTimerId: ReturnType<typeof setInterval> | null = null;
let lastAlertMessage: string | null = null;
let lastAlertAt = 0;
let initStarted = false;
// 履歴削除（OPFS 再作成）の実行中。この間 insertSession は DB へ書かない
let resetInProgress = false;
// AsyncDuckDBConnection は同一接続への並行 query を想定しないため、書き込みを直列化する
let writeChain: Promise<void> = Promise.resolve();

// webrtc_stats バッチ用。session_db_id 単位のバッファ
const STATS_FLUSH_COUNT = 1000;
const STATS_FLUSH_INTERVAL_MS = 5000;
const STATS_SOFT_LIMIT = 10_000;
const STATS_MAX_RETRIES = 3;

interface StatsBufferState {
  rows: NormalizedWebrtcStat[];
  firstEnqueueAt: number | null;
  flushTimerId: ReturnType<typeof setTimeout> | null;
  retryCount: number;
}

const statsBuffers = new Map<number, StatsBufferState>();

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

// LogMessage.message.description（stringify 済み JSON 文字列）をマスクする純粋関数
// JSON.parse に失敗した場合（すでにプレーンな文字列の場合）はそのまま返す
export function maskLogDescription(description: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(description);
  } catch {
    return description;
  }
  const masked = maskSensitiveMetadata(parsed);
  return JSON.stringify(masked);
}

// 種別ごとにマスク済み payload_json を組み立てる純粋関数
// timeline / notify / signaling / push はメッセージ全体をそのままマスクする
// （data が文字列の場合、maskSensitiveMetadata は非機密キーの文字列値をそのまま返すため identity になる）
// log は description が stringify 済み文字列のため maskLogDescription を個別に適用する
export function buildMaskedMessagePayload(kind: "timeline", message: TimelineMessage): Json;
export function buildMaskedMessagePayload(kind: "notify", message: NotifyMessage): Json;
export function buildMaskedMessagePayload(kind: "signaling", message: SignalingMessage): Json;
export function buildMaskedMessagePayload(kind: "log", message: LogMessage): Json;
export function buildMaskedMessagePayload(kind: "push", message: PushMessage): Json;
export function buildMaskedMessagePayload(
  kind: MessageKind,
  message: TimelineMessage | NotifyMessage | SignalingMessage | LogMessage | PushMessage,
): Json {
  if (kind === "log") {
    const logMessage = message as LogMessage;
    return {
      title: logMessage.message.title,
      description: maskLogDescription(logMessage.message.description),
    };
  }
  return maskSensitiveMetadata(message);
}

// 容量上限超過分の削除対象 id を選ぶ純粋関数
// sortedIdsOldestFirst は timestamp_ms 昇順（同値は id 昇順）で渡すこと
// totalCount が limit 以下なら削除不要（空配列）、超過分は古い側から limit を超えた件数だけ返す
export function selectMessageIdsToDelete(
  sortedIdsOldestFirst: number[],
  totalCount: number,
  limit: number,
): number[] {
  if (totalCount <= limit) {
    return [];
  }
  const deleteCount = totalCount - limit;
  return sortedIdsOldestFirst.slice(0, deleteCount);
}

export function getCurrentSessionDbId(): number | null {
  return currentSessionDbId;
}

// connections INSERT 成功時に保持する connection_id。SDK は disconnect コールバック前に
// soraConnection.connectionId を null 化するため、明示パス・フックはこの値を使う
export function getCurrentConnectionId(): string | null {
  return currentConnectionId;
}

export async function whenReady(): Promise<void> {
  return readyPromise;
}

// 初期化試行後に DuckDB 接続が利用可能か。whenReady() 後に呼ぶこと
export function isSessionDatabaseAvailable(): boolean {
  return duckdbConnection !== null;
}

function warnUnavailable(action: string): void {
  console.warn(`Session database is unavailable; skipped ${action}`);
}

// 書き込み API / CHECKPOINT / close を 1 本のチェーンに載せて並行実行を防ぐ
async function enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
  const previous = writeChain;
  let release!: () => void;
  writeChain = new Promise<void>((resolve) => {
    release = resolve;
  });
  return (async () => {
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  })();
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

async function runCheckpointUnlocked(): Promise<void> {
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

// タイマーからの定期 CHECKPOINT もキュー経由にする
async function runCheckpoint(): Promise<void> {
  await enqueueWrite(async () => {
    await runCheckpointUnlocked();
  });
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
  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_webrtc_stats_id");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS webrtc_stats (
      id BIGINT PRIMARY KEY DEFAULT nextval('seq_webrtc_stats_id'),
      session_db_id INTEGER,
      session_id VARCHAR,
      connection_id VARCHAR,
      channel_id VARCHAR,
      timestamp_ms DOUBLE,
      stats_type VARCHAR,
      stats_id VARCHAR,
      kind VARCHAR,
      ssrc UBIGINT,
      track_identifier VARCHAR,
      transport_id VARCHAR,
      codec_id VARCHAR,
      mid VARCHAR,
      remote_id VARCHAR,
      packets_received BIGINT,
      packets_lost BIGINT,
      packets_sent BIGINT,
      bytes_received BIGINT,
      bytes_sent BIGINT,
      header_bytes_sent BIGINT,
      retransmitted_packets_sent BIGINT,
      retransmitted_bytes_sent BIGINT,
      total_packet_send_delay DOUBLE,
      nack_count BIGINT,
      frame_width INTEGER,
      frame_height INTEGER,
      frames_per_second DOUBLE,
      frames_received BIGINT,
      round_trip_time DOUBLE,
      total_round_trip_time DOUBLE,
      available_outgoing_bitrate DOUBLE,
      available_incoming_bitrate DOUBLE,
      local_candidate_id VARCHAR,
      remote_candidate_id VARCHAR,
      candidate_pair_state VARCHAR,
      nominated BOOLEAN,
      selected_candidate_pair_id VARCHAR,
      raw_json JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_webrtc_stats_session_db_id
    ON webrtc_stats(session_db_id)
  `);

  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_timeline_messages_id");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS timeline_messages (
      id BIGINT PRIMARY KEY DEFAULT nextval('seq_timeline_messages_id'),
      session_db_id INTEGER,
      connection_id VARCHAR,
      timestamp_ms DOUBLE,
      type VARCHAR,
      log_type VARCHAR,
      payload_json JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_timeline_messages_session_db_id
    ON timeline_messages(session_db_id)
  `);

  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_notify_messages_id");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notify_messages (
      id BIGINT PRIMARY KEY DEFAULT nextval('seq_notify_messages_id'),
      session_db_id INTEGER,
      connection_id VARCHAR,
      timestamp_ms DOUBLE,
      event_type VARCHAR,
      transport_type VARCHAR,
      payload_json JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_notify_messages_session_db_id
    ON notify_messages(session_db_id)
  `);

  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_signaling_messages_id");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS signaling_messages (
      id BIGINT PRIMARY KEY DEFAULT nextval('seq_signaling_messages_id'),
      session_db_id INTEGER,
      connection_id VARCHAR,
      timestamp_ms DOUBLE,
      type VARCHAR,
      transport_type VARCHAR,
      payload_json JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_signaling_messages_session_db_id
    ON signaling_messages(session_db_id)
  `);

  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_log_messages_id");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS log_messages (
      id BIGINT PRIMARY KEY DEFAULT nextval('seq_log_messages_id'),
      session_db_id INTEGER,
      connection_id VARCHAR,
      timestamp_ms DOUBLE,
      title VARCHAR,
      payload_json JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_log_messages_session_db_id
    ON log_messages(session_db_id)
  `);

  await connection.query("CREATE SEQUENCE IF NOT EXISTS seq_push_messages_id");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS push_messages (
      id BIGINT PRIMARY KEY DEFAULT nextval('seq_push_messages_id'),
      session_db_id INTEGER,
      connection_id VARCHAR,
      timestamp_ms DOUBLE,
      transport_type VARCHAR,
      payload_json JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_push_messages_session_db_id
    ON push_messages(session_db_id)
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
  // 初期化完了前の Connect で no-op にならないよう、書き込み前に初期化を待つ
  await whenReady();
  return enqueueWrite(async () => {
    if (duckdbConnection === null || resetInProgress) {
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
      await runCheckpointUnlocked();
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
  });
}

export async function updateSessionIdAndConnectionId(
  id: number,
  sessionId: string,
  connectionId: string,
): Promise<void> {
  await whenReady();
  await enqueueWrite(async () => {
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
      await runCheckpointUnlocked();
    } catch (error) {
      const message =
        error instanceof Error
          ? `Failed to update session identifiers: ${error.message}`
          : "Failed to update session identifiers";
      console.warn(message);
      notifyPersistenceError(message);
    }
  });
}

export async function insertConnection(
  sessionDbId: number,
  sessionId: string,
  connectionId: string,
  soraClientId: string,
  channelId: string,
  signalingUrl: string,
): Promise<boolean> {
  await whenReady();
  return enqueueWrite(async () => {
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
      await runCheckpointUnlocked();
      currentConnectionId = connectionId;
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
  });
}

export async function updateSessionEndedAt(id: number): Promise<void> {
  await whenReady();
  await enqueueWrite(async () => {
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
      await runCheckpointUnlocked();
    } catch (error) {
      const message =
        error instanceof Error
          ? `Failed to update session ended_at: ${error.message}`
          : "Failed to update session ended_at";
      console.warn(message);
      notifyPersistenceError(message);
    }
  });
}

export async function updateConnectionEndedAt(connectionId: string): Promise<void> {
  if (!connectionId) {
    return;
  }
  await whenReady();
  await enqueueWrite(async () => {
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
      if (currentConnectionId === connectionId) {
        currentConnectionId = null;
      }
      await runCheckpointUnlocked();
    } catch (error) {
      const message =
        error instanceof Error
          ? `Failed to update connection ended_at: ${error.message}`
          : "Failed to update connection ended_at";
      console.warn(message);
      notifyPersistenceError(message);
    }
  });
}

// E2E クリーンアップおよび明示的 teardown 用。beforeunload では呼ばない
// 公式 OPFS テストの close 手順に合わせ、再 open 可能な状態でハンドルを解放する
export async function close(): Promise<void> {
  stopCheckpointTimer();
  // E2E の list 経路が close するため、未 flush の stats を先に書き出してから解放する
  await flushStatsBuffer();
  // 進行中の書き込みを待ってからハンドルを解放する
  await enqueueWrite(async () => {
    const connection = duckdbConnection;
    const instance = duckdbInstance;
    duckdbConnection = null;
    duckdbInstance = null;
    currentSessionDbId = null;
    currentConnectionId = null;
    // 同一ドキュメントで再初期化できるようにする（whenReady は settle 済みのまま）
    initStarted = false;
    for (const buffer of statsBuffers.values()) {
      if (buffer.flushTimerId !== null) {
        clearTimeout(buffer.flushTimerId);
      }
    }
    statsBuffers.clear();

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
  });
}

function getOrCreateStatsBuffer(sessionDbId: number): StatsBufferState {
  const existing = statsBuffers.get(sessionDbId);
  if (existing !== undefined) {
    return existing;
  }
  const created: StatsBufferState = {
    rows: [],
    firstEnqueueAt: null,
    flushTimerId: null,
    retryCount: 0,
  };
  statsBuffers.set(sessionDbId, created);
  return created;
}

function scheduleStatsFlush(sessionDbId: number): void {
  const buffer = statsBuffers.get(sessionDbId);
  if (buffer === undefined || buffer.flushTimerId !== null) {
    return;
  }
  buffer.flushTimerId = setTimeout(() => {
    buffer.flushTimerId = null;
    void flushStatsBuffer(sessionDbId);
  }, STATS_FLUSH_INTERVAL_MS);
}

// 正規化済み stats を session_db_id 単位バッファへ追加する
export function enqueueStats(
  normalizedStats: NormalizedWebrtcStat[],
  sessionDbId: number,
  sessionId: string | null,
  connectionId: string | null,
  channelId: string,
): void {
  if (normalizedStats.length === 0) {
    return;
  }
  if (duckdbConnection === null && !initStarted) {
    warnUnavailable("enqueueStats");
    return;
  }
  const buffer = getOrCreateStatsBuffer(sessionDbId);
  for (const row of normalizedStats) {
    buffer.rows.push({
      ...row,
      session_db_id: sessionDbId,
      session_id: sessionId,
      connection_id: connectionId,
      channel_id: channelId,
    });
  }
  if (buffer.firstEnqueueAt === null) {
    buffer.firstEnqueueAt = Date.now();
    scheduleStatsFlush(sessionDbId);
  }
  if (buffer.rows.length >= STATS_FLUSH_COUNT) {
    void flushStatsBuffer(sessionDbId);
  }
}

async function insertStatsRowsUnlocked(rows: NormalizedWebrtcStat[]): Promise<void> {
  if (duckdbConnection === null || rows.length === 0) {
    return;
  }
  const statement = await duckdbConnection.prepare(`
    INSERT INTO webrtc_stats (
      session_db_id, session_id, connection_id, channel_id, timestamp_ms,
      stats_type, stats_id, kind, ssrc, track_identifier, transport_id, codec_id,
      mid, remote_id, packets_received, packets_lost, packets_sent, bytes_received,
      bytes_sent, header_bytes_sent, retransmitted_packets_sent, retransmitted_bytes_sent,
      total_packet_send_delay, nack_count, frame_width, frame_height, frames_per_second,
      frames_received, round_trip_time, total_round_trip_time, available_outgoing_bitrate,
      available_incoming_bitrate, local_candidate_id, remote_candidate_id,
      candidate_pair_state, nominated, selected_candidate_pair_id, raw_json
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, CAST(? AS JSON)
    )
  `);
  try {
    for (const row of rows) {
      await statement.query(
        row.session_db_id,
        row.session_id,
        row.connection_id,
        row.channel_id,
        row.timestamp_ms,
        row.stats_type,
        row.stats_id,
        row.kind,
        row.ssrc,
        row.track_identifier,
        row.transport_id,
        row.codec_id,
        row.mid,
        row.remote_id,
        row.packets_received,
        row.packets_lost,
        row.packets_sent,
        row.bytes_received,
        row.bytes_sent,
        row.header_bytes_sent,
        row.retransmitted_packets_sent,
        row.retransmitted_bytes_sent,
        row.total_packet_send_delay,
        row.nack_count,
        row.frame_width,
        row.frame_height,
        row.frames_per_second,
        row.frames_received,
        row.round_trip_time,
        row.total_round_trip_time,
        row.available_outgoing_bitrate,
        row.available_incoming_bitrate,
        row.local_candidate_id,
        row.remote_candidate_id,
        row.candidate_pair_state,
        row.nominated,
        row.selected_candidate_pair_id,
        JSON.stringify(row.raw_json),
      );
    }
  } finally {
    await statement.close();
  }
}

function isPermanentStatsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  return lower.includes("quota") || lower.includes("enospc") || lower.includes("quotaexceeded");
}

async function applyStatsSamplingUnlocked(sessionDbId: number): Promise<void> {
  if (duckdbConnection === null) {
    return;
  }
  const countTable = await duckdbConnection.query(
    `SELECT COUNT(*) AS count FROM webrtc_stats WHERE session_db_id = ${sessionDbId}`,
  );
  const countColumn = countTable.getChildAt(0);
  const rawCount: unknown = countColumn === null ? 0 : countColumn.get(0);
  let count = 0;
  if (typeof rawCount === "bigint") {
    count = Number(rawCount);
  } else if (typeof rawCount === "number") {
    count = rawCount;
  }
  if (count <= STATS_SOFT_LIMIT) {
    return;
  }
  const idTable = await duckdbConnection.query(
    `SELECT id, timestamp_ms FROM webrtc_stats WHERE session_db_id = ${sessionDbId}`,
  );
  const idColumn = idTable.getChildAt(0);
  const tsColumn = idTable.getChildAt(1);
  if (idColumn === null || tsColumn === null) {
    return;
  }
  const rows: Array<{ id: number; timestamp_ms: number }> = [];
  for (let index = 0; index < idColumn.length; index += 1) {
    const rawId: unknown = idColumn.get(index);
    const rawTs: unknown = tsColumn.get(index);
    let id = 0;
    let timestampMs = 0;
    if (typeof rawId === "bigint") {
      id = Number(rawId);
    } else if (typeof rawId === "number") {
      id = rawId;
    }
    if (typeof rawTs === "number") {
      timestampMs = rawTs;
    }
    rows.push({ id, timestamp_ms: timestampMs });
  }
  const toDelete = selectIdsToDeleteForSampling(rows, STATS_SOFT_LIMIT);
  if (toDelete.length === 0) {
    return;
  }
  // id リストを分割して DELETE する
  const chunkSize = 500;
  for (let offset = 0; offset < toDelete.length; offset += chunkSize) {
    const chunk = toDelete.slice(offset, offset + chunkSize);
    const list = chunk.join(",");
    await duckdbConnection.query(`DELETE FROM webrtc_stats WHERE id IN (${list})`);
  }
}

async function flushOneStatsBuffer(targetId: number, buffer: StatsBufferState): Promise<void> {
  if (buffer.rows.length === 0) {
    return;
  }
  if (buffer.flushTimerId !== null) {
    clearTimeout(buffer.flushTimerId);
    buffer.flushTimerId = null;
  }
  const { rows } = buffer;
  buffer.rows = [];
  buffer.firstEnqueueAt = null;
  await enqueueWrite(async () => {
    // 削除済み session の抽出済みバッチは INSERT しない（孤児行を残さない）
    if (!statsBuffers.has(targetId)) {
      return;
    }
    if (duckdbConnection === null) {
      warnUnavailable("flushStatsBuffer");
      buffer.rows = [...rows, ...buffer.rows];
      scheduleStatsFlush(targetId);
      return;
    }
    try {
      await insertStatsRowsUnlocked(rows);
      await applyStatsSamplingUnlocked(targetId);
      await runCheckpointUnlocked();
      buffer.retryCount = 0;
    } catch (error) {
      const message =
        error instanceof Error
          ? `Failed to flush webrtc stats: ${error.message}`
          : "Failed to flush webrtc stats";
      console.warn(message);
      notifyPersistenceError(message);
      if (isPermanentStatsError(error) || buffer.retryCount >= STATS_MAX_RETRIES) {
        buffer.retryCount = 0;
        return;
      }
      buffer.retryCount += 1;
      buffer.rows = [...rows, ...buffer.rows];
      scheduleStatsFlush(targetId);
    }
  });
}

// バッファをバルク INSERT する。sessionDbId 省略時は全バッファ
export async function flushStatsBuffer(sessionDbId?: number): Promise<void> {
  let targets: number[];
  if (sessionDbId === undefined) {
    targets = [...statsBuffers.keys()];
  } else if (statsBuffers.has(sessionDbId)) {
    targets = [sessionDbId];
  } else {
    targets = [];
  }
  for (const targetId of targets) {
    const buffer = statsBuffers.get(targetId);
    if (buffer === undefined) {
      continue;
    }
    await flushOneStatsBuffer(targetId, buffer);
  }
}

// 指定 session_db_id のバッファを破棄する（flush せず捨ててよい場合のみ）
export function clearStatsBuffers(sessionDbId: number): void {
  const buffer = statsBuffers.get(sessionDbId);
  if (buffer === undefined) {
    return;
  }
  if (buffer.flushTimerId !== null) {
    clearTimeout(buffer.flushTimerId);
  }
  statsBuffers.delete(sessionDbId);
}

// --- メッセージ永続化 API (timeline / notify / signaling / log / push) ---
//
// stats のようなバッファは持たず、都度 1 行 INSERT する（イベント頻度が stats より低いため）。
// INSERT 成功直後に当該 session_db_id の件数を数え、上限超過分を古い側から削除する。
// runCheckpointUnlocked は呼ばない（切断時の ended_at / stats flush とのキュー競合を避けるため）。

// 種別ごとの上限件数（session_db_id 単位）
const MESSAGE_LIMIT_PER_KIND = 1000;

// notify メッセージから event_type を実行時に取り出す（無ければ null）
function extractNotifyEventType(message: NotifyMessage["message"]): string | null {
  const eventType = (message as unknown as Record<string, unknown>).event_type;
  if (typeof eventType === "string") {
    return eventType;
  }
  return null;
}

// 指定メッセージテーブルの当該 session_db_id 件数が上限を超えたら、古い側から超過分を削除する
async function pruneMessageTableUnlocked(table: string, sessionDbId: number): Promise<void> {
  if (duckdbConnection === null) {
    return;
  }
  const countTable = await duckdbConnection.query(
    `SELECT COUNT(*) AS count FROM ${table} WHERE session_db_id = ${sessionDbId}`,
  );
  const countColumn = countTable.getChildAt(0);
  const rawCount: unknown = countColumn === null ? 0 : countColumn.get(0);
  let totalCount = 0;
  if (typeof rawCount === "bigint") {
    totalCount = Number(rawCount);
  } else if (typeof rawCount === "number") {
    totalCount = rawCount;
  }
  if (totalCount <= MESSAGE_LIMIT_PER_KIND) {
    return;
  }
  const idTable = await duckdbConnection.query(
    `SELECT id FROM ${table} WHERE session_db_id = ${sessionDbId} ORDER BY timestamp_ms ASC, id ASC`,
  );
  const idColumn = idTable.getChildAt(0);
  if (idColumn === null) {
    return;
  }
  const sortedIds: number[] = [];
  for (let index = 0; index < idColumn.length; index += 1) {
    const rawId: unknown = idColumn.get(index);
    if (typeof rawId === "bigint") {
      sortedIds.push(Number(rawId));
    } else if (typeof rawId === "number") {
      sortedIds.push(rawId);
    }
  }
  const toDelete = selectMessageIdsToDelete(sortedIds, totalCount, MESSAGE_LIMIT_PER_KIND);
  if (toDelete.length === 0) {
    return;
  }
  // id リストを分割して DELETE する（webrtc_stats のサンプリング削除と同方針）
  const chunkSize = 500;
  for (let offset = 0; offset < toDelete.length; offset += chunkSize) {
    const chunk = toDelete.slice(offset, offset + chunkSize);
    const list = chunk.join(",");
    await duckdbConnection.query(`DELETE FROM ${table} WHERE id IN (${list})`);
  }
}

function buildMessageInsertErrorMessage(action: string, error: unknown): string {
  if (error instanceof Error) {
    return `Failed to insert ${action}: ${error.message}`;
  }
  return `Failed to insert ${action}`;
}

export async function insertTimelineMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: TimelineMessage,
): Promise<void> {
  await whenReady();
  await enqueueWrite(async () => {
    if (duckdbConnection === null || resetInProgress) {
      warnUnavailable("insertTimelineMessage");
      return;
    }
    try {
      const payloadJson = JSON.stringify(buildMaskedMessagePayload("timeline", message));
      const statement = await duckdbConnection.prepare(`
        INSERT INTO timeline_messages (
          session_db_id, connection_id, timestamp_ms, type, log_type, payload_json
        ) VALUES (?, ?, ?, ?, ?, CAST(? AS JSON))
      `);
      try {
        await statement.query(
          sessionDbId,
          connectionId,
          message.timestamp,
          message.type,
          message.logType,
          payloadJson,
        );
      } finally {
        await statement.close();
      }
      await pruneMessageTableUnlocked("timeline_messages", sessionDbId);
    } catch (error) {
      const errorMessage = buildMessageInsertErrorMessage("timeline message", error);
      console.warn(errorMessage);
      notifyPersistenceError(errorMessage);
    }
  });
}

export async function insertNotifyMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: NotifyMessage,
): Promise<void> {
  await whenReady();
  await enqueueWrite(async () => {
    if (duckdbConnection === null || resetInProgress) {
      warnUnavailable("insertNotifyMessage");
      return;
    }
    try {
      const payloadJson = JSON.stringify(buildMaskedMessagePayload("notify", message));
      const eventType = extractNotifyEventType(message.message);
      const statement = await duckdbConnection.prepare(`
        INSERT INTO notify_messages (
          session_db_id, connection_id, timestamp_ms, event_type, transport_type, payload_json
        ) VALUES (?, ?, ?, ?, ?, CAST(? AS JSON))
      `);
      try {
        await statement.query(
          sessionDbId,
          connectionId,
          message.timestamp,
          eventType,
          message.transportType,
          payloadJson,
        );
      } finally {
        await statement.close();
      }
      await pruneMessageTableUnlocked("notify_messages", sessionDbId);
    } catch (error) {
      const errorMessage = buildMessageInsertErrorMessage("notify message", error);
      console.warn(errorMessage);
      notifyPersistenceError(errorMessage);
    }
  });
}

export async function insertSignalingMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: SignalingMessage,
): Promise<void> {
  await whenReady();
  await enqueueWrite(async () => {
    if (duckdbConnection === null || resetInProgress) {
      warnUnavailable("insertSignalingMessage");
      return;
    }
    try {
      const payloadJson = JSON.stringify(buildMaskedMessagePayload("signaling", message));
      const statement = await duckdbConnection.prepare(`
        INSERT INTO signaling_messages (
          session_db_id, connection_id, timestamp_ms, type, transport_type, payload_json
        ) VALUES (?, ?, ?, ?, ?, CAST(? AS JSON))
      `);
      try {
        await statement.query(
          sessionDbId,
          connectionId,
          message.timestamp,
          message.type,
          message.transportType,
          payloadJson,
        );
      } finally {
        await statement.close();
      }
      await pruneMessageTableUnlocked("signaling_messages", sessionDbId);
    } catch (error) {
      const errorMessage = buildMessageInsertErrorMessage("signaling message", error);
      console.warn(errorMessage);
      notifyPersistenceError(errorMessage);
    }
  });
}

export async function insertLogMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: LogMessage,
): Promise<void> {
  await whenReady();
  await enqueueWrite(async () => {
    if (duckdbConnection === null || resetInProgress) {
      warnUnavailable("insertLogMessage");
      return;
    }
    try {
      const payloadJson = JSON.stringify(buildMaskedMessagePayload("log", message));
      const statement = await duckdbConnection.prepare(`
        INSERT INTO log_messages (
          session_db_id, connection_id, timestamp_ms, title, payload_json
        ) VALUES (?, ?, ?, ?, CAST(? AS JSON))
      `);
      try {
        await statement.query(
          sessionDbId,
          connectionId,
          message.timestamp,
          message.message.title,
          payloadJson,
        );
      } finally {
        await statement.close();
      }
      await pruneMessageTableUnlocked("log_messages", sessionDbId);
    } catch (error) {
      const errorMessage = buildMessageInsertErrorMessage("log message", error);
      console.warn(errorMessage);
      notifyPersistenceError(errorMessage);
    }
  });
}

export async function insertPushMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: PushMessage,
): Promise<void> {
  await whenReady();
  await enqueueWrite(async () => {
    if (duckdbConnection === null || resetInProgress) {
      warnUnavailable("insertPushMessage");
      return;
    }
    try {
      const payloadJson = JSON.stringify(buildMaskedMessagePayload("push", message));
      const statement = await duckdbConnection.prepare(`
        INSERT INTO push_messages (
          session_db_id, connection_id, timestamp_ms, transport_type, payload_json
        ) VALUES (?, ?, ?, ?, CAST(? AS JSON))
      `);
      try {
        await statement.query(
          sessionDbId,
          connectionId,
          message.timestamp,
          message.transportType,
          payloadJson,
        );
      } finally {
        await statement.close();
      }
      await pruneMessageTableUnlocked("push_messages", sessionDbId);
    } catch (error) {
      const errorMessage = buildMessageInsertErrorMessage("push message", error);
      console.warn(errorMessage);
      notifyPersistenceError(errorMessage);
    }
  });
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

// 当該 session_db_id のメッセージ 5 テーブル / webrtc_stats / connections / sessions を削除する
export async function deleteSession(sessionDbId: number): Promise<void> {
  await whenReady();
  if (sessionDbId === getCurrentSessionDbId()) {
    throw new Error(`Cannot delete session: sessionDbId ${sessionDbId} is the current session`);
  }
  await enqueueWrite(async () => {
    if (duckdbConnection === null) {
      throw new Error("Cannot delete session: session database is unavailable");
    }
    clearStatsBuffers(sessionDbId);
    // メッセージ 5 テーブルは webrtc_stats より前に削除する（固定の削除順）
    const messageTables = [
      "timeline_messages",
      "notify_messages",
      "signaling_messages",
      "log_messages",
      "push_messages",
    ];
    for (const table of messageTables) {
      const deleteMessages = await duckdbConnection.prepare(
        `DELETE FROM ${table} WHERE session_db_id = ?`,
      );
      await deleteMessages.query(sessionDbId);
      await deleteMessages.close();
    }
    const deleteStats = await duckdbConnection.prepare(
      "DELETE FROM webrtc_stats WHERE session_db_id = ?",
    );
    await deleteStats.query(sessionDbId);
    await deleteStats.close();
    const deleteConnections = await duckdbConnection.prepare(
      "DELETE FROM connections WHERE session_db_id = ?",
    );
    await deleteConnections.query(sessionDbId);
    await deleteConnections.close();
    const deleteSessions = await duckdbConnection.prepare("DELETE FROM sessions WHERE id = ?");
    await deleteSessions.query(sessionDbId);
    await deleteSessions.close();
    await runCheckpointUnlocked();
  });
}

// OPFS 上の DB を削除して空のデータベースを開き直す
export async function resetSessionDatabase(): Promise<void> {
  if (getCurrentSessionDbId() !== null) {
    throw new Error("Cannot reset session database: a session is in progress");
  }
  resetInProgress = true;
  try {
    await close();
    await deleteOpfsDatabaseFile();
    await createSessionDatabase();
    await whenReady();
    if (!isSessionDatabaseAvailable()) {
      throw new Error("Cannot reset session database: failed to reopen empty database");
    }
  } finally {
    resetInProgress = false;
  }
}

// --- 読み取り API（書き込みと同じ直列化キュー経由） ---

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "bigint") {
    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) {
      return null;
    }
    return asNumber;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  // DuckDB TIMESTAMP が Date で返る場合
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return null;
}

function requireNumber(value: unknown, label: string): number {
  const numberValue = toFiniteNumber(value);
  if (numberValue === null) {
    throw new Error(`${label} is not a finite number: ${JSON.stringify(value)}`);
  }
  return numberValue;
}

function arrowTableToRecords(table: { toArray: () => unknown[] }): Array<Record<string, unknown>> {
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
}

function mapSessionListRow(record: Record<string, unknown>): SessionListRow {
  return {
    id: requireNumber(record.id, "sessions.id"),
    session_id: toNullableString(record.session_id),
    channel_id: toNullableString(record.channel_id),
    role: toNullableString(record.role),
    started_at: toNullableString(record.started_at),
    ended_at: toNullableString(record.ended_at),
  };
}

function mapConnectionListRow(record: Record<string, unknown>): ConnectionListRow {
  return {
    id: requireNumber(record.id, "connections.id"),
    session_db_id: requireNumber(record.session_db_id, "connections.session_db_id"),
    session_id: toNullableString(record.session_id),
    connection_id: toNullableString(record.connection_id),
    sora_client_id: toNullableString(record.sora_client_id),
    channel_id: toNullableString(record.channel_id),
    signaling_url: toNullableString(record.signaling_url),
    started_at: toNullableString(record.started_at),
    ended_at: toNullableString(record.ended_at),
  };
}

// YYYY-MM-DD を UTC 当日 00:00:00 の TIMESTAMP 文字列にする
function dateOnlyToUtcTimestamp(dateOnly: string): string {
  return `${dateOnly} 00:00:00`;
}

// YYYY-MM-DD の翌日 00:00:00 UTC（to の exclusive end）
function dateOnlyToExclusiveEndTimestamp(dateOnly: string): string {
  const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u.exec(dateOnly);
  if (match?.groups === undefined) {
    throw new Error(`Invalid date-only value: ${dateOnly}`);
  }
  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const yyyy = String(next.getUTCFullYear()).padStart(4, "0");
  const mm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(next.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 00:00:00`;
}

const SESSION_LIST_SELECT = `
  SELECT
    id,
    session_id,
    channel_id,
    role,
    CAST(started_at AS VARCHAR) AS started_at,
    CAST(ended_at AS VARCHAR) AS ended_at
  FROM sessions
`;

// 一覧（session 行単位）。未初期化時は空配列
export async function listSessions(filter: SessionListFilter = {}): Promise<SessionListRow[]> {
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return [];
    }
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (filter.sessionId !== undefined) {
      conditions.push("session_id = ?");
      params.push(filter.sessionId);
    }
    if (filter.channelId !== undefined) {
      conditions.push("channel_id = ?");
      params.push(filter.channelId);
    }
    if (filter.from !== undefined) {
      conditions.push("started_at >= CAST(? AS TIMESTAMP)");
      params.push(dateOnlyToUtcTimestamp(filter.from));
    }
    if (filter.to !== undefined) {
      conditions.push("started_at < CAST(? AS TIMESTAMP)");
      params.push(dateOnlyToExclusiveEndTimestamp(filter.to));
    }
    if (filter.connectionId !== undefined) {
      conditions.push(`EXISTS (
        SELECT 1 FROM connections c
        WHERE c.session_db_id = sessions.id AND c.connection_id = ?
      )`);
      params.push(filter.connectionId);
    }
    let sql = SESSION_LIST_SELECT;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }
    sql += " ORDER BY started_at DESC NULLS LAST, id DESC";
    const statement = await duckdbConnection.prepare(sql);
    try {
      const table = await statement.query(...params);
      return arrowTableToRecords(table).map((record) => mapSessionListRow(record));
    } finally {
      await statement.close();
    }
  });
}

// 詳細（session + connections）。無ければ null。未初期化時も null
export async function getSession(sessionDbId: number): Promise<SessionDetail | null> {
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return null;
    }
    const sessionStatement = await duckdbConnection.prepare(`
      ${SESSION_LIST_SELECT}
      WHERE id = ?
    `);
    let sessionRow: SessionListRow | null = null;
    try {
      const sessionTable = await sessionStatement.query(sessionDbId);
      const sessionRecords = arrowTableToRecords(sessionTable);
      if (sessionRecords.length === 0) {
        return null;
      }
      const [first] = sessionRecords;
      sessionRow = mapSessionListRow(first);
    } finally {
      await sessionStatement.close();
    }

    const connectionStatement = await duckdbConnection.prepare(`
      SELECT
        id,
        session_db_id,
        session_id,
        connection_id,
        sora_client_id,
        channel_id,
        signaling_url,
        CAST(started_at AS VARCHAR) AS started_at,
        CAST(ended_at AS VARCHAR) AS ended_at
      FROM connections
      WHERE session_db_id = ?
      ORDER BY started_at ASC NULLS LAST, id ASC
    `);
    try {
      const connectionTable = await connectionStatement.query(sessionDbId);
      const connections = arrowTableToRecords(connectionTable).map((record) =>
        mapConnectionListRow(record),
      );
      return { session: sessionRow, connections };
    } finally {
      await connectionStatement.close();
    }
  });
}

async function loadStatsSourceRowsUnlocked(sessionDbId: number): Promise<StatsSourceRow[]> {
  if (duckdbConnection === null) {
    return [];
  }
  const statement = await duckdbConnection.prepare(`
    SELECT
      id,
      timestamp_ms,
      stats_type,
      stats_id,
      packets_received,
      packets_lost,
      packets_sent,
      bytes_received,
      bytes_sent,
      round_trip_time
    FROM webrtc_stats
    WHERE session_db_id = ?
    ORDER BY timestamp_ms ASC, id ASC
  `);
  try {
    const table = await statement.query(sessionDbId);
    return arrowTableToRecords(table).map((record) => {
      const statsType = toNullableString(record.stats_type);
      const statsId = toNullableString(record.stats_id);
      return {
        id: requireNumber(record.id, "webrtc_stats.id"),
        timestamp_ms: requireNumber(record.timestamp_ms, "webrtc_stats.timestamp_ms"),
        stats_type: statsType ?? "",
        stats_id: statsId ?? "",
        packets_received: toFiniteNumber(record.packets_received),
        packets_lost: toFiniteNumber(record.packets_lost),
        packets_sent: toFiniteNumber(record.packets_sent),
        bytes_received: toFiniteNumber(record.bytes_received),
        bytes_sent: toFiniteNumber(record.bytes_sent),
        round_trip_time: toFiniteNumber(record.round_trip_time),
      };
    });
  } finally {
    await statement.close();
  }
}

// 集計値。未初期化時は全フィールド null
export async function queryStatsAggregates(sessionDbId: number): Promise<StatsAggregates> {
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return computeStatsAggregates([]);
    }
    const rows = await loadStatsSourceRowsUnlocked(sessionDbId);
    return computeStatsAggregates(rows);
  });
}

// 時系列サンプリング。intervalSec は 1 / 10 / 60（省略時 1。収集間隔に合わせた 1 秒が既定）
export async function queryStatsTimeseries(
  sessionDbId: number,
  options: StatsTimeseriesOptions = {},
): Promise<StatsTimeseriesPoint[]> {
  const intervalSec = options.intervalSec ?? 1;
  if (intervalSec !== 1 && intervalSec !== 10 && intervalSec !== 60) {
    throw new Error(`intervalSec must be 1, 10, or 60, got ${String(intervalSec)}`);
  }
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return [];
    }
    const rows = await loadStatsSourceRowsUnlocked(sessionDbId);
    return computeStatsTimeseries(rows, intervalSec);
  });
}

// ページネーション付き生データ
export async function queryStatsPage(
  sessionDbId: number,
  options: StatsPageOptions = {},
): Promise<StatsPageResult> {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const { statsType } = options;
  const { statsId } = options;
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new Error(`limit must be an integer in 1..200, got ${String(limit)}`);
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error(`offset must be a non-negative integer, got ${String(offset)}`);
  }
  if (statsType !== undefined && statsType === "") {
    throw new Error("statsType must be a non-empty string when provided");
  }
  if (statsId !== undefined && statsId === "") {
    throw new Error("statsId must be a non-empty string when provided");
  }
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return { rows: [], totalCount: 0 };
    }

    const filters: string[] = ["session_db_id = ?"];
    const filterParams: Array<number | string> = [sessionDbId];
    if (statsType !== undefined) {
      filters.push("stats_type = ?");
      filterParams.push(statsType);
    }
    if (statsId !== undefined) {
      filters.push("stats_id = ?");
      filterParams.push(statsId);
    }
    const whereClause = filters.join(" AND ");

    const countStatement = await duckdbConnection.prepare(`
      SELECT COUNT(*) AS total_count
      FROM webrtc_stats
      WHERE ${whereClause}
    `);
    let totalCount = 0;
    try {
      const countTable = await countStatement.query(...filterParams);
      const countRecords = arrowTableToRecords(countTable);
      if (countRecords.length > 0) {
        const [first] = countRecords;
        totalCount = requireNumber(first.total_count, "webrtc_stats total_count");
      }
    } finally {
      await countStatement.close();
    }

    const pageStatement = await duckdbConnection.prepare(`
      SELECT
        id,
        timestamp_ms,
        stats_type,
        stats_id,
        kind,
        packets_received,
        packets_sent,
        bytes_received,
        bytes_sent,
        round_trip_time
      FROM webrtc_stats
      WHERE ${whereClause}
      ORDER BY timestamp_ms ASC, id ASC
      LIMIT ?
      OFFSET ?
    `);
    try {
      const pageTable = await pageStatement.query(...filterParams, limit, offset);
      const rows = arrowTableToRecords(pageTable).map(
        (record): StatsPageRow => ({
          id: requireNumber(record.id, "webrtc_stats.id"),
          timestamp_ms: requireNumber(record.timestamp_ms, "webrtc_stats.timestamp_ms"),
          stats_type: toNullableString(record.stats_type),
          stats_id: toNullableString(record.stats_id),
          kind: toNullableString(record.kind),
          packets_received: toFiniteNumber(record.packets_received),
          packets_sent: toFiniteNumber(record.packets_sent),
          bytes_received: toFiniteNumber(record.bytes_received),
          bytes_sent: toFiniteNumber(record.bytes_sent),
          round_trip_time: toFiniteNumber(record.round_trip_time),
        }),
      );
      return { rows, totalCount };
    } finally {
      await pageStatement.close();
    }
  });
}

const RAW_METRIC_COLUMNS: Record<StatsRawMetric, string> = {
  bytes_sent: "bytes_sent",
  bytes_received: "bytes_received",
  packets_sent: "packets_sent",
  packets_received: "packets_received",
  round_trip_time: "round_trip_time",
};

// 生データグラフ用: 指定 type / metric の時系列（最大 20000 点）
export async function queryStatsRawSeries(
  sessionDbId: number,
  options: StatsRawSeriesOptions,
): Promise<StatsRawSeriesPoint[]> {
  const column = RAW_METRIC_COLUMNS[options.metric];
  if (options.statsType === "") {
    throw new Error("statsType must be a non-empty string");
  }
  if (options.statsId !== undefined && options.statsId === "") {
    throw new Error("statsId must be a non-empty string when provided");
  }
  const hasStatsId = options.statsId !== undefined;
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return [];
    }
    // カラム名はホワイトリスト済み。プレースホルダには入れられない
    const sql = hasStatsId
      ? `
      SELECT timestamp_ms, stats_id, ${column} AS value
      FROM webrtc_stats
      WHERE session_db_id = ?
        AND stats_type = ?
        AND stats_id = ?
        AND ${column} IS NOT NULL
      ORDER BY timestamp_ms ASC, id ASC
      LIMIT 20000
    `
      : `
      SELECT timestamp_ms, stats_id, ${column} AS value
      FROM webrtc_stats
      WHERE session_db_id = ?
        AND stats_type = ?
        AND ${column} IS NOT NULL
      ORDER BY timestamp_ms ASC, id ASC
      LIMIT 20000
    `;
    const statement = await duckdbConnection.prepare(sql);
    try {
      const table = hasStatsId
        ? await statement.query(sessionDbId, options.statsType, options.statsId)
        : await statement.query(sessionDbId, options.statsType);
      const points: StatsRawSeriesPoint[] = [];
      for (const record of arrowTableToRecords(table)) {
        const statsId = toNullableString(record.stats_id);
        const value = toFiniteNumber(record.value);
        if (statsId === null || value === null) {
          continue;
        }
        points.push({
          timestamp_ms: requireNumber(record.timestamp_ms, "webrtc_stats.timestamp_ms"),
          stats_id: statsId,
          value,
        });
      }
      return points;
    } finally {
      await statement.close();
    }
  });
}

// セッション内の stats_type 一覧（生データ絞り込み用）
export async function listStatsTypes(sessionDbId: number): Promise<string[]> {
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return [];
    }
    const statement = await duckdbConnection.prepare(`
      SELECT DISTINCT stats_type
      FROM webrtc_stats
      WHERE session_db_id = ?
        AND stats_type IS NOT NULL
      ORDER BY stats_type ASC
    `);
    try {
      const table = await statement.query(sessionDbId);
      const types: string[] = [];
      for (const record of arrowTableToRecords(table)) {
        const statsType = toNullableString(record.stats_type);
        if (statsType !== null) {
          types.push(statsType);
        }
      }
      return types;
    } finally {
      await statement.close();
    }
  });
}

// 指定 stats_type 内の stats_id 一覧
export async function listStatsIds(sessionDbId: number, statsType: string): Promise<string[]> {
  if (statsType === "") {
    throw new Error("statsType must be a non-empty string");
  }
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return [];
    }
    const statement = await duckdbConnection.prepare(`
      SELECT DISTINCT stats_id
      FROM webrtc_stats
      WHERE session_db_id = ?
        AND stats_type = ?
        AND stats_id IS NOT NULL
      ORDER BY stats_id ASC
    `);
    try {
      const table = await statement.query(sessionDbId, statsType);
      const ids: string[] = [];
      for (const record of arrowTableToRecords(table)) {
        const statsId = toNullableString(record.stats_id);
        if (statsId !== null) {
          ids.push(statsId);
        }
      }
      return ids;
    } finally {
      await statement.close();
    }
  });
}

async function loadStreamSourceRowsUnlocked(sessionDbId: number): Promise<StreamSourceRow[]> {
  if (duckdbConnection === null) {
    return [];
  }
  const statement = await duckdbConnection.prepare(`
    SELECT
      id,
      timestamp_ms,
      stats_type,
      stats_id,
      kind,
      packets_received,
      packets_sent,
      bytes_received,
      bytes_sent,
      round_trip_time
    FROM webrtc_stats
    WHERE session_db_id = ?
      AND stats_type IN ('outbound-rtp', 'inbound-rtp', 'candidate-pair')
    ORDER BY timestamp_ms ASC, id ASC
  `);
  try {
    const table = await statement.query(sessionDbId);
    return arrowTableToRecords(table).map((record) => {
      const statsType = toNullableString(record.stats_type);
      const statsId = toNullableString(record.stats_id);
      return {
        id: requireNumber(record.id, "webrtc_stats.id"),
        timestamp_ms: requireNumber(record.timestamp_ms, "webrtc_stats.timestamp_ms"),
        stats_type: statsType ?? "",
        stats_id: statsId ?? "",
        kind: toNullableString(record.kind),
        packets_received: toFiniteNumber(record.packets_received),
        packets_sent: toFiniteNumber(record.packets_sent),
        bytes_received: toFiniteNumber(record.bytes_received),
        bytes_sent: toFiniteNumber(record.bytes_sent),
        round_trip_time: toFiniteNumber(record.round_trip_time),
      };
    });
  } finally {
    await statement.close();
  }
}

// ストリーム一覧（outbound / inbound / candidate-pair）
export async function queryStatsStreams(sessionDbId: number): Promise<StatsStreamSummary[]> {
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return [];
    }
    const rows = await loadStreamSourceRowsUnlocked(sessionDbId);
    return listStatsStreams(rows);
  });
}

// 1 ストリームの差分時系列
export async function queryStatsStreamTimeseries(
  sessionDbId: number,
  statsId: string,
): Promise<StatsStreamTimeseriesPoint[]> {
  if (statsId === "") {
    throw new Error("statsId must be a non-empty string");
  }
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return [];
    }
    const rows = await loadStreamSourceRowsUnlocked(sessionDbId);
    return computeStreamTimeseriesForId(rows, statsId);
  });
}

// --- メッセージ読み取り API (timeline / notify / signaling / log / push) ---
//
// 命名・契約は queryStatsPage / StatsPageRow に揃えるが、並びは
// ORDER BY timestamp_ms DESC, id DESC（デバッグ閲覧は新しい順。queryStatsPage の ASC とは意図的に異なる）

function validateMessagePageOptions(options: MessagePageOptions): {
  limit: number;
  offset: number;
} {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new Error(`limit must be an integer in 1..200, got ${String(limit)}`);
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error(`offset must be a non-negative integer, got ${String(offset)}`);
  }
  return { limit, offset };
}

// payload_json を Json へ正規化する。文字列なら JSON.parse を試み、失敗時は文字列のまま返す
function normalizePayloadJson(value: unknown): Json {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Json;
    } catch {
      return value;
    }
  }
  if (value === null || value === undefined) {
    return null;
  }
  return value as Json;
}

async function countMessagesUnlocked(table: string, sessionDbId: number): Promise<number> {
  if (duckdbConnection === null) {
    return 0;
  }
  const statement = await duckdbConnection.prepare(
    `SELECT COUNT(*) AS total_count FROM ${table} WHERE session_db_id = ?`,
  );
  try {
    const countTable = await statement.query(sessionDbId);
    const records = arrowTableToRecords(countTable);
    if (records.length === 0) {
      return 0;
    }
    const [first] = records;
    return requireNumber(first.total_count, `${table} total_count`);
  } finally {
    await statement.close();
  }
}

// timeline_messages のページネーション付き読み取り。未初期化時は空
export async function queryTimelineMessagesPage(
  sessionDbId: number,
  options: MessagePageOptions = {},
): Promise<TimelineMessagePageResult> {
  const { limit, offset } = validateMessagePageOptions(options);
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return { rows: [], totalCount: 0 };
    }
    const totalCount = await countMessagesUnlocked("timeline_messages", sessionDbId);
    const statement = await duckdbConnection.prepare(`
      SELECT id, session_db_id, connection_id, timestamp_ms, type, log_type, payload_json
      FROM timeline_messages
      WHERE session_db_id = ?
      ORDER BY timestamp_ms DESC, id DESC
      LIMIT ?
      OFFSET ?
    `);
    try {
      const pageTable = await statement.query(sessionDbId, limit, offset);
      const rows = arrowTableToRecords(pageTable).map(
        (record): TimelineMessagePageRow => ({
          id: requireNumber(record.id, "timeline_messages.id"),
          session_db_id: requireNumber(record.session_db_id, "timeline_messages.session_db_id"),
          connection_id: toNullableString(record.connection_id),
          timestamp_ms: requireNumber(record.timestamp_ms, "timeline_messages.timestamp_ms"),
          type: toNullableString(record.type),
          log_type: toNullableString(record.log_type),
          payload_json: normalizePayloadJson(record.payload_json),
        }),
      );
      return { rows, totalCount };
    } finally {
      await statement.close();
    }
  });
}

// notify_messages のページネーション付き読み取り。未初期化時は空
export async function queryNotifyMessagesPage(
  sessionDbId: number,
  options: MessagePageOptions = {},
): Promise<NotifyMessagePageResult> {
  const { limit, offset } = validateMessagePageOptions(options);
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return { rows: [], totalCount: 0 };
    }
    const totalCount = await countMessagesUnlocked("notify_messages", sessionDbId);
    const statement = await duckdbConnection.prepare(`
      SELECT id, session_db_id, connection_id, timestamp_ms, event_type, transport_type, payload_json
      FROM notify_messages
      WHERE session_db_id = ?
      ORDER BY timestamp_ms DESC, id DESC
      LIMIT ?
      OFFSET ?
    `);
    try {
      const pageTable = await statement.query(sessionDbId, limit, offset);
      const rows = arrowTableToRecords(pageTable).map(
        (record): NotifyMessagePageRow => ({
          id: requireNumber(record.id, "notify_messages.id"),
          session_db_id: requireNumber(record.session_db_id, "notify_messages.session_db_id"),
          connection_id: toNullableString(record.connection_id),
          timestamp_ms: requireNumber(record.timestamp_ms, "notify_messages.timestamp_ms"),
          event_type: toNullableString(record.event_type),
          transport_type: toNullableString(record.transport_type),
          payload_json: normalizePayloadJson(record.payload_json),
        }),
      );
      return { rows, totalCount };
    } finally {
      await statement.close();
    }
  });
}

// signaling_messages のページネーション付き読み取り。未初期化時は空
export async function querySignalingMessagesPage(
  sessionDbId: number,
  options: MessagePageOptions = {},
): Promise<SignalingMessagePageResult> {
  const { limit, offset } = validateMessagePageOptions(options);
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return { rows: [], totalCount: 0 };
    }
    const totalCount = await countMessagesUnlocked("signaling_messages", sessionDbId);
    const statement = await duckdbConnection.prepare(`
      SELECT id, session_db_id, connection_id, timestamp_ms, type, transport_type, payload_json
      FROM signaling_messages
      WHERE session_db_id = ?
      ORDER BY timestamp_ms DESC, id DESC
      LIMIT ?
      OFFSET ?
    `);
    try {
      const pageTable = await statement.query(sessionDbId, limit, offset);
      const rows = arrowTableToRecords(pageTable).map(
        (record): SignalingMessagePageRow => ({
          id: requireNumber(record.id, "signaling_messages.id"),
          session_db_id: requireNumber(record.session_db_id, "signaling_messages.session_db_id"),
          connection_id: toNullableString(record.connection_id),
          timestamp_ms: requireNumber(record.timestamp_ms, "signaling_messages.timestamp_ms"),
          type: toNullableString(record.type),
          transport_type: toNullableString(record.transport_type),
          payload_json: normalizePayloadJson(record.payload_json),
        }),
      );
      return { rows, totalCount };
    } finally {
      await statement.close();
    }
  });
}

// log_messages のページネーション付き読み取り。未初期化時は空
export async function queryLogMessagesPage(
  sessionDbId: number,
  options: MessagePageOptions = {},
): Promise<LogMessagePageResult> {
  const { limit, offset } = validateMessagePageOptions(options);
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return { rows: [], totalCount: 0 };
    }
    const totalCount = await countMessagesUnlocked("log_messages", sessionDbId);
    const statement = await duckdbConnection.prepare(`
      SELECT id, session_db_id, connection_id, timestamp_ms, title, payload_json
      FROM log_messages
      WHERE session_db_id = ?
      ORDER BY timestamp_ms DESC, id DESC
      LIMIT ?
      OFFSET ?
    `);
    try {
      const pageTable = await statement.query(sessionDbId, limit, offset);
      const rows = arrowTableToRecords(pageTable).map(
        (record): LogMessagePageRow => ({
          id: requireNumber(record.id, "log_messages.id"),
          session_db_id: requireNumber(record.session_db_id, "log_messages.session_db_id"),
          connection_id: toNullableString(record.connection_id),
          timestamp_ms: requireNumber(record.timestamp_ms, "log_messages.timestamp_ms"),
          title: toNullableString(record.title),
          payload_json: normalizePayloadJson(record.payload_json),
        }),
      );
      return { rows, totalCount };
    } finally {
      await statement.close();
    }
  });
}

// push_messages のページネーション付き読み取り。未初期化時は空
export async function queryPushMessagesPage(
  sessionDbId: number,
  options: MessagePageOptions = {},
): Promise<PushMessagePageResult> {
  const { limit, offset } = validateMessagePageOptions(options);
  return enqueueWrite(async () => {
    if (duckdbConnection === null) {
      return { rows: [], totalCount: 0 };
    }
    const totalCount = await countMessagesUnlocked("push_messages", sessionDbId);
    const statement = await duckdbConnection.prepare(`
      SELECT id, session_db_id, connection_id, timestamp_ms, transport_type, payload_json
      FROM push_messages
      WHERE session_db_id = ?
      ORDER BY timestamp_ms DESC, id DESC
      LIMIT ?
      OFFSET ?
    `);
    try {
      const pageTable = await statement.query(sessionDbId, limit, offset);
      const rows = arrowTableToRecords(pageTable).map(
        (record): PushMessagePageRow => ({
          id: requireNumber(record.id, "push_messages.id"),
          session_db_id: requireNumber(record.session_db_id, "push_messages.session_db_id"),
          connection_id: toNullableString(record.connection_id),
          timestamp_ms: requireNumber(record.timestamp_ms, "push_messages.timestamp_ms"),
          transport_type: toNullableString(record.transport_type),
          payload_json: normalizePayloadJson(record.payload_json),
        }),
      );
      return { rows, totalCount };
    } finally {
      await statement.close();
    }
  });
}
