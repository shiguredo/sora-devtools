import { assert, test } from "vite-plus/test";

import type { SoraNotifyMessage } from "../types.ts";
import { cleanupSoraMediaState, handleTrackEvent, isConnectionDestroyedNotify } from "./actions.ts";
import {
  fakeContents,
  localMediaStream,
  noiseSuppressionProcessor,
  remoteClients,
  timelineMessages,
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

// handleTrackEvent の空配列ガードのテスト
// RTCTrackEvent は jsdom にコンストラクタが無いため、必須プロパティのみのリテラルを型キャストして渡す
test("handleTrackEvent は streams が空配列のとき例外を投げない", () => {
  remoteClients.value = [];
  timelineMessages.value = [];
  const emptyEvent = {
    streams: [],
    track: { id: "t1", kind: "audio" },
  } as unknown as RTCTrackEvent;
  // assert.doesNotThrow で「例外を投げない」契約を直接表現する
  assert.doesNotThrow(() => {
    handleTrackEvent(emptyEvent, null, null);
  });
});

test("handleTrackEvent は streams が空配列のとき remoteClients を変更しない", () => {
  remoteClients.value = [];
  timelineMessages.value = [];
  const emptyEvent = {
    streams: [],
    track: { id: "t1", kind: "audio" },
  } as unknown as RTCTrackEvent;
  handleTrackEvent(emptyEvent, null, null);
  assert.equal(remoteClients.value.length, 0);
});

test("handleTrackEvent は streams が空配列のとき event-on-track の timeline メッセージを 2 件追加する", () => {
  remoteClients.value = [];
  timelineMessages.value = [];
  const beforeLength = timelineMessages.value.length;
  const emptyEvent = {
    streams: [],
    track: { id: "t1", kind: "audio" },
  } as unknown as RTCTrackEvent;
  handleTrackEvent(emptyEvent, null, null);
  const after = timelineMessages.value.slice(beforeLength);
  // 差分 2 件: 冒頭の無条件 event-on-track と空配列ガード時の event-on-track (data 付き)
  assert.equal(after.length, 2);
  // 1 件目: type === "event-on-track" かつ data === undefined
  assert.equal(after[0].type, "event-on-track");
  assert.equal(after[0].data, undefined);
  // 2 件目: type === "event-on-track" かつ data オブジェクトで emptyStreams / trackId / kind を持つ
  assert.equal(after[1].type, "event-on-track");
  const secondData = after[1].data;
  // TimelineMessage.data は Record<string, unknown> | undefined のため、まず undefined でないことを確認してから個別キーをアサートする
  assert.exists(secondData);
  assert.equal(secondData.emptyStreams, true);
  assert.equal(secondData.trackId, "t1");
  assert.equal(secondData.kind, "audio");
});
