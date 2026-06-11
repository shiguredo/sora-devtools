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

test("cleanupSoraMediaState は初期状態で呼んでも例外を投げない", () => {
  remoteClients.value = [];
  localMediaStream.value = null;
  virtualBackgroundProcessor.value = null;
  noiseSuppressionProcessor.value = null;
  fakeContents.value = { worker: null, gainNode: null, audioContext: null };
  cleanupSoraMediaState();
  assert.equal(localMediaStream.value, null);
  assert.equal(remoteClients.value.length, 0);
});
