import { fc, test } from "@fast-check/vitest";
import { assert } from "vite-plus/test";

import { maskSensitiveMetadata } from "./sessionDatabase.ts";

// 機密キー候補（正規化後に一致するもの）
const sensitiveKeyArb = fc.constantFrom(
  "api_key",
  "apikey",
  "apiKey",
  "x_api_key",
  "x-api-key",
  "authorization",
  "auth",
  "token",
  "access_token",
  "refresh_token",
  "password",
  "secret",
  "credential",
  "credentials",
  "API_KEY",
  "Access-Token",
);

// 非機密キー
const safeKeyArb = fc.string({ minLength: 1, maxLength: 12 }).filter((key) => {
  const normalized = key.toLowerCase().replaceAll(/[_-]/gu, "");
  return (
    normalized !== "" &&
    ![
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
    ].includes(normalized)
  );
});

// 任意深度の metadata 風オブジェクトを生成する
const metadataArb: fc.Arbitrary<unknown> = fc.letrec((tie) => ({
  json: fc.oneof(
    { depthSize: "small" },
    fc.constant(null),
    fc.boolean(),
    fc.integer(),
    fc.string(),
    fc.array(tie("json"), { maxLength: 3 }),
    fc.dictionary(fc.oneof(sensitiveKeyArb, safeKeyArb), tie("json"), { maxKeys: 4 }),
  ),
})).json;

// オブジェクトを再帰走査し、機密キー配下の値がマスク済みであることを検証する
function assertSensitiveKeysMasked(value: unknown): void {
  if (value === null || typeof value !== "object") {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      assertSensitiveKeysMasked(item);
    }
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replaceAll(/[_-]/gu, "");
    const isSensitive = [
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
    ].includes(normalized);
    if (isSensitive) {
      if (typeof child === "string") {
        assert.equal(child, "***");
      } else if (typeof child === "object" && child !== null) {
        assert.deepEqual(child, { masked: true });
      } else {
        assert.equal(child, "***");
      }
      continue;
    }
    assertSensitiveKeysMasked(child);
  }
}

test.prop([metadataArb])(
  "maskSensitiveMetadata は任意ネストの機密キーをすべてマスクする",
  (metadata) => {
    const masked = maskSensitiveMetadata(metadata);
    assertSensitiveKeysMasked(masked);
  },
);

test.prop([metadataArb])("maskSensitiveMetadata は任意入力で例外を投げない", (metadata) => {
  maskSensitiveMetadata(metadata);
});
