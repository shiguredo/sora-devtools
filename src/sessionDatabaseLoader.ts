// Sessions 機能（DuckDB-Wasm + OPFS 永続化）のビルド時切り替えラッパー
//
// 無効ビルドでは各 API が no-op となり、既存の接続・デバッグ機能はそのまま動作する。
// ガードには constants の SESSIONS_ENABLED ではなくビルド時定数 __SESSIONS_ENABLED__ を
// 直接使う。クロスモジュールの定数経由だとバンドラのデッドコード除去が効かず、
// 動的 import の対象が chunk として出力されてしまうため。
// ここの import("@/sessionDatabase") がデッドコードになれば、
// DuckDB-Wasm / Apache Arrow / uPlot の chunk は無効ビルドに含まれない。
//
// 動的 import が失敗した場合（デプロイ後のキャッシュ切れによる旧 chunk の 404 等）は
// 各 API が no-op にフォールバックする。永続化が失敗しても接続自体は継続する、
// という従来の createSessionDatabase の契約を維持するため。

import type * as sessionDatabaseModule from "@/sessionDatabase";
import type {
  Json,
  LogMessage,
  NotifyMessage,
  PushMessage,
  SignalingMessage,
  TimelineMessage,
} from "@/types";
import type { NormalizedWebrtcStat } from "@/webrtcStatsNormalizer";

type SessionDatabaseModule = typeof sessionDatabaseModule;

// 動的 import したモジュールのキャッシュ。同期 API はこのキャッシュ経由で応答する
let databaseModule: SessionDatabaseModule | null = null;
let loadPromise: Promise<SessionDatabaseModule | null> | null = null;

async function loadSessionDatabase(): Promise<SessionDatabaseModule | null> {
  loadPromise ??= (async () => {
    try {
      const loaded = await import("@/sessionDatabase");
      databaseModule = loaded;
      // 初期化をここで開始しておく。これを呼ばないと実モジュール側の whenReady() が
      // settle せず、insertSession 等の書き込み API が永久に待機する。
      // 実モジュール側は initStarted ガードで冪等なので、App からの呼び出しと重複してもよい
      void loaded.createSessionDatabase();
      return loaded;
    } catch (error) {
      // 失敗時はキャッシュをリセットして次回呼び出しで再試行できるようにする
      console.warn("Failed to load session database module", error);
      loadPromise = null;
      return null;
    }
  })();
  return loadPromise;
}

// 有効ビルドではモジュール評価時に読み込みを開始し、接続開始までにロードを済ませる
if (__SESSIONS_ENABLED__) {
  void loadSessionDatabase();
}

// App マウント時に呼ぶ
export async function createSessionDatabase(): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.createSessionDatabase();
}

export function getCurrentSessionDbId(): number | null {
  return databaseModule?.getCurrentSessionDbId() ?? null;
}

export function getCurrentConnectionId(): string | null {
  return databaseModule?.getCurrentConnectionId() ?? null;
}

export async function insertSession(
  channelId: string,
  role: string,
  metadata: Json | undefined,
): Promise<number | null> {
  if (!__SESSIONS_ENABLED__) {
    return null;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return null;
  }
  return sessionDatabase.insertSession(channelId, role, metadata);
}

export async function updateSessionIdAndConnectionId(
  id: number,
  sessionId: string,
  connectionId: string,
): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.updateSessionIdAndConnectionId(id, sessionId, connectionId);
}

export async function insertConnection(
  sessionDbId: number,
  sessionId: string,
  connectionId: string,
  soraClientId: string,
  channelId: string,
  signalingUrl: string,
): Promise<boolean> {
  if (!__SESSIONS_ENABLED__) {
    return false;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return false;
  }
  return sessionDatabase.insertConnection(
    sessionDbId,
    sessionId,
    connectionId,
    soraClientId,
    channelId,
    signalingUrl,
  );
}

export async function updateSessionEndedAt(id: number): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.updateSessionEndedAt(id);
}

export async function updateConnectionEndedAt(connectionId: string): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.updateConnectionEndedAt(connectionId);
}

export async function flushStatsBuffer(sessionDbId?: number): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.flushStatsBuffer(sessionDbId);
}

export async function insertTimelineMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: TimelineMessage,
): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.insertTimelineMessage(sessionDbId, connectionId, message);
}

export async function insertNotifyMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: NotifyMessage,
): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.insertNotifyMessage(sessionDbId, connectionId, message);
}

export async function insertSignalingMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: SignalingMessage,
): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.insertSignalingMessage(sessionDbId, connectionId, message);
}

export async function insertLogMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: LogMessage,
): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.insertLogMessage(sessionDbId, connectionId, message);
}

export async function insertPushMessage(
  sessionDbId: number,
  connectionId: string | null,
  message: PushMessage,
): Promise<void> {
  if (!__SESSIONS_ENABLED__) {
    return;
  }
  const sessionDatabase = await loadSessionDatabase();
  if (sessionDatabase === null) {
    return;
  }
  await sessionDatabase.insertPushMessage(sessionDbId, connectionId, message);
}

// 同期 API。モジュール未ロード時は no-op とする
// 有効ビルドではトップレベルで preload しているため、接続後の呼び出しではロード済み
export function enqueueStats(
  normalizedStats: NormalizedWebrtcStat[],
  sessionDbId: number,
  sessionId: string | null,
  connectionId: string | null,
  channelId: string,
): void {
  if (!__SESSIONS_ENABLED__ || databaseModule === null) {
    return;
  }
  databaseModule.enqueueStats(normalizedStats, sessionDbId, sessionId, connectionId, channelId);
}
