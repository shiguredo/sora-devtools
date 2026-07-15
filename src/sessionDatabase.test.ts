import { assert, test } from "vite-plus/test";

import {
  buildMaskedMessagePayload,
  maskLogDescription,
  maskSensitiveMetadata,
  normalizeNullableString,
  selectMessageIdsToDelete,
} from "./sessionDatabase.ts";
import type {
  LogMessage,
  NotifyMessage,
  PushMessage,
  SignalingMessage,
  TimelineMessage,
} from "./types.ts";

// maskSensitiveMetadata: 機密キーの文字列値を "***" に置換する
test("maskSensitiveMetadata は access_token 文字列をマスクする", () => {
  assert.deepEqual(maskSensitiveMetadata({ access_token: "secret-value", channel: "demo" }), {
    access_token: "***",
    channel: "demo",
  });
});

// キャメルケースの apiKey も正規化して検出する
test("maskSensitiveMetadata は apiKey をマスクする", () => {
  assert.deepEqual(maskSensitiveMetadata({ apiKey: "k", keep: 1 }), {
    apiKey: "***",
    keep: 1,
  });
});

// ケバブケースの x-api-key も検出する
test("maskSensitiveMetadata は x-api-key をマスクする", () => {
  assert.deepEqual(maskSensitiveMetadata({ "x-api-key": "k" }), {
    "x-api-key": "***",
  });
});

// オブジェクト値は {"masked": true} に置換する
test("maskSensitiveMetadata は credentials オブジェクトをマスクする", () => {
  assert.deepEqual(maskSensitiveMetadata({ credentials: { user: "a", password: "b" } }), {
    credentials: { masked: true },
  });
});

// ネストしたオブジェクト内の機密キーも再帰的にマスクする
test("maskSensitiveMetadata はネストした password をマスクする", () => {
  assert.deepEqual(
    maskSensitiveMetadata({
      outer: {
        password: "p",
        nested: { token: "t", ok: true },
      },
    }),
    {
      outer: {
        password: "***",
        nested: { token: "***", ok: true },
      },
    },
  );
});

// 配列要素も再帰的に走査する
test("maskSensitiveMetadata は配列内の機密キーをマスクする", () => {
  assert.deepEqual(maskSensitiveMetadata([{ auth: "a" }, { role: "sendrecv" }]), [
    { auth: "***" },
    { role: "sendrecv" },
  ]);
});

// 非オブジェクト入力はそのまま返す（または null）
test("maskSensitiveMetadata はプリミティブをそのまま返す", () => {
  assert.equal(maskSensitiveMetadata("plain"), "plain");
  assert.equal(maskSensitiveMetadata(42), 42);
  assert.equal(maskSensitiveMetadata(null), null);
  assert.equal(maskSensitiveMetadata(true), true);
});

// undefined や関数など Json 外の値は null に落とす
test("maskSensitiveMetadata は Json 外の値を null にする", () => {
  const missing: unknown = void 0;
  assert.equal(maskSensitiveMetadata(missing), null);
  const notJson: unknown = () => 1;
  assert.equal(maskSensitiveMetadata(notJson), null);
});

// normalizeNullableString: 空文字は NULL、それ以外はそのまま
test("normalizeNullableString は空文字を null にする", () => {
  assert.equal(normalizeNullableString(""), null);
});

test("normalizeNullableString は非空文字をそのまま返す", () => {
  assert.equal(
    normalizeNullableString("wss://example.example/signaling"),
    "wss://example.example/signaling",
  );
});

// maskLogDescription: JSON.parse → maskSensitiveMetadata → stringify
test("maskLogDescription は JSON 文字列内の機密キーをマスクして再 stringify する", () => {
  const description = JSON.stringify({ access_token: "secret-value", channel: "demo" });
  assert.equal(
    maskLogDescription(description),
    JSON.stringify({ access_token: "***", channel: "demo" }),
  );
});

// stringify 済みでない配列 JSON も再帰的にマスクされる
test("maskLogDescription は配列内の機密キーもマスクする", () => {
  const description = JSON.stringify([{ token: "t" }, { role: "sendrecv" }]);
  assert.equal(
    maskLogDescription(description),
    JSON.stringify([{ token: "***" }, { role: "sendrecv" }]),
  );
});

// JSON.parse に失敗する（プレーンな文字列）場合は identity で返す
test("maskLogDescription は JSON として parse できない文字列をそのまま返す", () => {
  assert.equal(maskLogDescription("plain text description"), "plain text description");
});

// 機密キーを含まない JSON は再 stringify されるが値は変わらない
test("maskLogDescription は機密キーが無い JSON をそのまま再 stringify する", () => {
  const description = JSON.stringify({ channel: "demo", count: 3 });
  assert.equal(maskLogDescription(description), JSON.stringify({ channel: "demo", count: 3 }));
});

// buildMaskedMessagePayload: timeline はメッセージ全体をマスクする
test("buildMaskedMessagePayload は timeline のメッセージ全体をマスクする", () => {
  const message: TimelineMessage = {
    timestamp: 1000,
    type: "connect",
    logType: "sora-devtools",
    data: { access_token: "secret", channel_id: "demo" },
  };
  assert.deepEqual(buildMaskedMessagePayload("timeline", message), {
    timestamp: 1000,
    type: "connect",
    logType: "sora-devtools",
    data: { access_token: "***", channel_id: "demo" },
  });
});

// timeline の data が文字列（SDP 等）の場合、そのフィールドは identity のまま残る
test("buildMaskedMessagePayload は timeline の文字列 data をそのまま残す", () => {
  const message = {
    timestamp: 1000,
    type: "offer-sdp",
    logType: "sora-devtools",
    data: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n",
  } as unknown as TimelineMessage;
  assert.deepEqual(buildMaskedMessagePayload("timeline", message), {
    timestamp: 1000,
    type: "offer-sdp",
    logType: "sora-devtools",
    data: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n",
  });
});

// notify は { timestamp, message, transportType } 全体をマスクする
test("buildMaskedMessagePayload は notify の message 内の機密キーをマスクする", () => {
  const message = {
    timestamp: 2000,
    message: {
      type: "notify",
      event_type: "connection.created",
      role: "sendrecv",
      minutes: 0,
      channel_connections: 1,
      metadata: { access_token: "secret" },
    },
    transportType: "websocket",
  } as unknown as NotifyMessage;
  assert.deepEqual(buildMaskedMessagePayload("notify", message), {
    timestamp: 2000,
    message: {
      type: "notify",
      event_type: "connection.created",
      role: "sendrecv",
      minutes: 0,
      channel_connections: 1,
      metadata: { access_token: "***" },
    },
    transportType: "websocket",
  });
});

// signaling は { timestamp, type, transportType, data } 全体をマスクする
test("buildMaskedMessagePayload は signaling の data 内の機密キーをマスクする", () => {
  const message: SignalingMessage = {
    timestamp: 3000,
    type: "offer",
    transportType: "websocket",
    data: { authorization: "secret", channel_id: "demo" },
  };
  assert.deepEqual(buildMaskedMessagePayload("signaling", message), {
    timestamp: 3000,
    type: "offer",
    transportType: "websocket",
    data: { authorization: "***", channel_id: "demo" },
  });
});

// push は { timestamp, message, transportType } 全体をマスクする
test("buildMaskedMessagePayload は push の message 内の機密キーをマスクする", () => {
  const message: PushMessage = {
    timestamp: 4000,
    message: { type: "push", data: { secret: "s", channel: "demo" } },
    transportType: "datachannel",
  };
  assert.deepEqual(buildMaskedMessagePayload("push", message), {
    timestamp: 4000,
    message: { type: "push", data: { secret: "***", channel: "demo" } },
    transportType: "datachannel",
  });
});

// log は title をマスク対象外とし、description のみ maskLogDescription を適用する
test("buildMaskedMessagePayload は log の description のみをマスクする", () => {
  const message: LogMessage = {
    timestamp: 5000,
    message: {
      title: "access_token error",
      description: JSON.stringify({ access_token: "secret" }),
    },
  };
  assert.deepEqual(buildMaskedMessagePayload("log", message), {
    title: "access_token error",
    description: JSON.stringify({ access_token: "***" }),
  });
});

// log の description が JSON として parse できない場合はそのまま残る
test("buildMaskedMessagePayload は log の description が parse できないときそのまま残す", () => {
  const message: LogMessage = {
    timestamp: 6000,
    message: { title: "info", description: "plain text" },
  };
  assert.deepEqual(buildMaskedMessagePayload("log", message), {
    title: "info",
    description: "plain text",
  });
});

// selectMessageIdsToDelete: totalCount が limit 以下なら削除対象は無い
test("selectMessageIdsToDelete は totalCount が limit 以下のとき空配列を返す", () => {
  assert.deepEqual(selectMessageIdsToDelete([1, 2, 3], 3, 1000), []);
});

test("selectMessageIdsToDelete は totalCount が limit と等しいとき空配列を返す", () => {
  assert.deepEqual(selectMessageIdsToDelete([1, 2, 3], 3, 3), []);
});

// totalCount が limit を超えた分だけ、古い側（配列先頭）から id を返す
test("selectMessageIdsToDelete は超過分だけ古い側の id を返す", () => {
  assert.deepEqual(selectMessageIdsToDelete([10, 11, 12, 13, 14], 5, 3), [10, 11]);
});

// 超過が 1 件のときは最も古い 1 件のみを返す
test("selectMessageIdsToDelete は超過が 1 件のとき最古の 1 件のみを返す", () => {
  assert.deepEqual(selectMessageIdsToDelete([10, 11, 12], 3, 2), [10]);
});
