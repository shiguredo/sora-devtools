// DuckDB-Wasm + OPFS によるセッション・接続メタデータの永続化
// 未初期化・初期化失敗時は各 API を no-op とし、既存の接続・デバッグ機能を継続させる

import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { setSoraErrorAlertMessage } from "@/app/signals";
import type { Json } from "@/types";
import { selectIdsToDeleteForSampling } from "@/webrtcStatsNormalizer";
import type { NormalizedWebrtcStat } from "@/webrtcStatsNormalizer";

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
  return enqueueWrite(async () => {
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
    if (duckdbConnection === null) {
      warnUnavailable("flushStatsBuffer");
      // close 済みで map から外れている場合は orphan 復元しない
      if (!statsBuffers.has(targetId)) {
        return;
      }
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
