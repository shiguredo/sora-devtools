import { assert, test } from "vite-plus/test";

import {
  createSessionDatabase,
  enqueueStats,
  flushStatsBuffer,
  getCurrentConnectionId,
  getCurrentSessionDbId,
  insertConnection,
  insertSession,
  updateConnectionEndedAt,
  updateSessionEndedAt,
  updateSessionIdAndConnectionId,
} from "./sessionDatabaseLoader.ts";

// ラッパーの no-op 契約を検証するテスト
// 無効ビルド（VITE_ENABLE_SESSIONS 未設定）では全 API が no-op になる。
// 有効ビルドでは実モジュールへ委譲されるため no-op の検証は skip し、
// 実モジュール側の挙動は sessionDatabase.test.ts で検証する
const sessionsEnabled = __SESSIONS_ENABLED__;

// 初期状態の確認はビルドモードに依らず成立する
test("getCurrentSessionDbId は初期状態で null を返す", () => {
  assert.equal(getCurrentSessionDbId(), null);
});

test("getCurrentConnectionId は初期状態で null を返す", () => {
  assert.equal(getCurrentConnectionId(), null);
});

test("enqueueStats は未ロード状態でも例外を投げない", () => {
  // 無効ビルドではガードで no-op、有効ビルドでもモジュール未ロード時は no-op
  enqueueStats([], 1, null, null, "channel-id");
});

test.skipIf(sessionsEnabled)("createSessionDatabase は無効ビルドで no-op になる", async () => {
  await createSessionDatabase();
});

test.skipIf(sessionsEnabled)("insertSession は無効ビルドで null を返す", async () => {
  const result = await insertSession("channel-id", "sendrecv", {});
  assert.equal(result, null);
});

test.skipIf(sessionsEnabled)(
  "updateSessionIdAndConnectionId は無効ビルドで no-op になる",
  async () => {
    await updateSessionIdAndConnectionId(1, "session-id", "connection-id");
  },
);

test.skipIf(sessionsEnabled)("insertConnection は無効ビルドで false を返す", async () => {
  const result = await insertConnection(
    1,
    "session-id",
    "connection-id",
    "sora-client-id",
    "channel-id",
    "wss://example.com/signaling",
  );
  assert.equal(result, false);
});

test.skipIf(sessionsEnabled)("updateSessionEndedAt は無効ビルドで no-op になる", async () => {
  await updateSessionEndedAt(1);
});

test.skipIf(sessionsEnabled)("updateConnectionEndedAt は無効ビルドで no-op になる", async () => {
  await updateConnectionEndedAt("connection-id");
});

test.skipIf(sessionsEnabled)("flushStatsBuffer は無効ビルドで no-op になる", async () => {
  await flushStatsBuffer();
});
