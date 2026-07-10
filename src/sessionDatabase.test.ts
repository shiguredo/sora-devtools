import { assert, test } from "vite-plus/test";

import { maskSensitiveMetadata, normalizeNullableString } from "./sessionDatabase.ts";

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
