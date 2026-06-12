import { assert, test } from "vite-plus/test";

import type { SoraNotifyMessage } from "../types.ts";
import { cleanupSoraMediaState, isConnectionDestroyedNotify } from "./actions.ts";
import {
  fakeContents,
  localMediaStream,
  noiseSuppressionProcessor,
  remoteClients,
  virtualBackgroundProcessor,
} from "./signals.ts";

test("isConnectionDestroyedNotify は connection.destroyed かつ connection_id が string のとき true を返す", () => {
  const message = {
    type: "notify",
    event_type: "connection.destroyed",
    connection_id: "abc",
  } as SoraNotifyMessage;
  assert.equal(isConnectionDestroyedNotify(message), true);
});

test("isConnectionDestroyedNotify は connection_id が無いとき false を返す", () => {
  const message = {
    type: "notify",
    event_type: "connection.destroyed",
  } as SoraNotifyMessage;
  assert.equal(isConnectionDestroyedNotify(message), false);
});

test("isConnectionDestroyedNotify は connection_id が string でないとき false を返す", () => {
  const message = {
    type: "notify",
    event_type: "connection.destroyed",
    connection_id: 123,
  } as unknown as SoraNotifyMessage;
  assert.equal(isConnectionDestroyedNotify(message), false);
});

test("isConnectionDestroyedNotify は別の event_type のとき false を返す", () => {
  const message = {
    type: "notify",
    event_type: "connection.created",
    connection_id: "abc",
  } as SoraNotifyMessage;
  assert.equal(isConnectionDestroyedNotify(message), false);
});

// async 化後も呼び元が await できることと、初期状態 (null・空) では cleanup が状態を変えないこと
test("cleanupSoraMediaState は初期状態で await しても例外を投げない", async () => {
  remoteClients.value = [];
  localMediaStream.value = null;
  virtualBackgroundProcessor.value = null;
  noiseSuppressionProcessor.value = null;
  fakeContents.value = { worker: null, gainNode: null, audioContext: null };
  await cleanupSoraMediaState();
  assert.equal(localMediaStream.value, null);
  assert.equal(remoteClients.value.length, 0);
});

// 戻り値が Promise<void> である型上の契約を確認する (await が型エラーにならないこと自体が契約)
test("cleanupSoraMediaState は await 完了後に localMediaStream が null である", async () => {
  remoteClients.value = [];
  localMediaStream.value = null;
  virtualBackgroundProcessor.value = null;
  noiseSuppressionProcessor.value = null;
  fakeContents.value = { worker: null, gainNode: null, audioContext: null };
  await cleanupSoraMediaState();
  assert.equal(localMediaStream.value, null);
});

// async 化後も remoteClients 側の同期掃除 (clearRemoteMediaClients) が消失していないこと
test("cleanupSoraMediaState は await 完了後に remoteClients が空である", async () => {
  remoteClients.value = [];
  localMediaStream.value = null;
  virtualBackgroundProcessor.value = null;
  noiseSuppressionProcessor.value = null;
  fakeContents.value = { worker: null, gainNode: null, audioContext: null };
  await cleanupSoraMediaState();
  assert.equal(remoteClients.value.length, 0);
});

// disconnectSora 冒頭の await と SDK 主導 disconnect ハンドラの fire-and-forget が直列で重なる経路の冪等性
// in-flight (1 回目の完了前に 2 回目起動) の冪等性は本テストでは検証しない
test("cleanupSoraMediaState を 2 回連続で await しても例外を投げない", async () => {
  remoteClients.value = [];
  localMediaStream.value = null;
  virtualBackgroundProcessor.value = null;
  noiseSuppressionProcessor.value = null;
  fakeContents.value = { worker: null, gainNode: null, audioContext: null };
  await cleanupSoraMediaState();
  await cleanupSoraMediaState();
  assert.equal(localMediaStream.value, null);
  assert.equal(remoteClients.value.length, 0);
});
