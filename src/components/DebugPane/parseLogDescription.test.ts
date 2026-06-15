import { assert, test } from "vite-plus/test";

import { parseLogDescription } from "./parseLogDescription.ts";

// JSON オブジェクト文字列を plain object としてパースする
test("JSON オブジェクト文字列をオブジェクトとして返す", () => {
  const result = parseLogDescription('{"a":1}');
  assert.deepEqual(result, { a: 1 });
});

// JSON 数値文字列を number としてパースする
test("JSON 数値文字列を数値として返す", () => {
  const result = parseLogDescription("42");
  assert.equal(result, 42);
});

// JSON 文字列リテラル（引用符付き）はパース後に引用符が剥がれる
test("JSON 文字列リテラルは引用符を剥がした文字列として返す", () => {
  const result = parseLogDescription('"foo"');
  assert.equal(result, "foo");
});

// 素のエラー文字列は JSON.parse に失敗するため raw 文字列にフォールバックする
test("素のエラー文字列を raw 文字列として返す", () => {
  const result = parseLogDescription("failed to do X");
  assert.equal(result, "failed to do X");
});

// 空文字列は JSON.parse に失敗するため raw 文字列にフォールバックする
test("空文字列を raw 文字列として返す", () => {
  const result = parseLogDescription("");
  assert.equal(result, "");
});

// JSON の null は Message.tsx で意味のある描画ができないため raw 文字列にフォールバックする
test('JSON の null は raw 文字列 "null" にフォールバックする', () => {
  const result = parseLogDescription("null");
  // 4 文字の文字列リテラル "null" を期待する。String(null) ではない
  assert.equal(result, "null");
});

// JSON の true は Message.tsx で意味のある描画ができないため raw 文字列にフォールバックする
test('JSON の true は raw 文字列 "true" にフォールバックする', () => {
  const result = parseLogDescription("true");
  assert.equal(result, "true");
});

// JSON の false は Message.tsx で意味のある描画ができないため raw 文字列にフォールバックする
test('JSON の false は raw 文字列 "false" にフォールバックする', () => {
  const result = parseLogDescription("false");
  assert.equal(result, "false");
});

// JSON 配列は配列のまま返す（signalingUrlCandidates 等の既存表示維持のため）
test("JSON 配列を配列として返す", () => {
  const result = parseLogDescription("[1,2]");
  assert.deepEqual(result, [1, 2]);
});
