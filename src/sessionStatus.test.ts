import { assert, test } from "vite-plus/test";

import { deriveSessionStatus, sessionStatusLabel } from "./sessionStatus.ts";

// ended_at があれば常に切断済み
test("deriveSessionStatus は ended_at があるとき切断済みを返す", () => {
  assert.equal(deriveSessionStatus("2026-07-11 12:00:00", 1, 1), "ended");
  assert.equal(deriveSessionStatus("2026-07-11 12:00:00", 1, null), "ended");
});

// ended_at がなく current と一致すれば接続中
test("deriveSessionStatus は ended_at がなく current と一致するとき接続中を返す", () => {
  assert.equal(deriveSessionStatus(null, 42, 42), "connected");
});

// ended_at がなく current 不一致・null なら切断不確定
test("deriveSessionStatus は ended_at がなく current 不一致のとき切断不確定を返す", () => {
  assert.equal(deriveSessionStatus(null, 1, 2), "uncertain");
  assert.equal(deriveSessionStatus(null, 1, null), "uncertain");
});

// ラベルは 3 状態を日本語で返す
test("sessionStatusLabel は 3 状態の日本語ラベルを返す", () => {
  assert.equal(sessionStatusLabel("ended"), "切断済み");
  assert.equal(sessionStatusLabel("connected"), "接続中");
  assert.equal(sessionStatusLabel("uncertain"), "切断不確定");
});
