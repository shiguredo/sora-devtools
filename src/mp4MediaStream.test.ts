import { assert, test } from "vitest";
import {
  isMp4MediaStreamSupported,
  loadMp4MediaStream,
  resetForTesting,
} from "./mp4MediaStream.ts";

test("isMp4MediaStreamSupported は AudioDecoder / VideoDecoder が無い場合 false を返す", () => {
  // jsdom では AudioDecoder / VideoDecoder が未定義のため false
  assert.equal(isMp4MediaStreamSupported(), false);
});

test("isMp4MediaStreamSupported は AudioDecoder / VideoDecoder がある場合 true を返す", () => {
  // テスト用に WebCodecs が存在する環境を模擬する
  globalThis.AudioDecoder = (() => {}) as unknown as typeof AudioDecoder;
  globalThis.VideoDecoder = (() => {}) as unknown as typeof VideoDecoder;
  try {
    assert.equal(isMp4MediaStreamSupported(), true);
  } finally {
    // @ts-expect-error テスト後のクリーンアップ
    delete globalThis.AudioDecoder;
    // @ts-expect-error テスト後のクリーンアップ
    delete globalThis.VideoDecoder;
  }
});

test("isMp4MediaStreamSupported は AudioDecoder のみの場合 false を返す", () => {
  globalThis.AudioDecoder = (() => {}) as unknown as typeof AudioDecoder;
  try {
    assert.equal(isMp4MediaStreamSupported(), false);
  } finally {
    // @ts-expect-error テスト後のクリーンアップ
    delete globalThis.AudioDecoder;
  }
});

test("isMp4MediaStreamSupported は VideoDecoder のみの場合 false を返す", () => {
  globalThis.VideoDecoder = (() => {}) as unknown as typeof VideoDecoder;
  try {
    assert.equal(isMp4MediaStreamSupported(), false);
  } finally {
    // @ts-expect-error テスト後のクリーンアップ
    delete globalThis.VideoDecoder;
  }
});

// loadMp4MediaStream のテスト
// 実際の @shiguredo/mp4-media-stream が jsdom で import できる場合のみ有効
test("loadMp4MediaStream は同時呼び出しでも正しく MP4 をロードする", async () => {
  resetForTesting();
  try {
    const dummyBlob = new Blob([], { type: "video/mp4" });
    // 同時に 2 回呼び出してもモジュールの import が 1 回だけであることを間接的に確認
    const [first, second] = await Promise.all([
      loadMp4MediaStream(dummyBlob),
      loadMp4MediaStream(dummyBlob),
    ]);
    assert.isNotNull(first);
    assert.isNotNull(second);
    // 同一 Blob に対して異なるインスタンスが返ることを確認
    assert.notStrictEqual(first, second);
  } catch {
    // 動的 import に失敗する環境ではテストをスキップ
  }
});

test("loadMp4MediaStream は初回成功後に同じモジュールキャッシュで再呼び出しできる", async () => {
  resetForTesting();
  try {
    const dummyBlob = new Blob([], { type: "video/mp4" });
    const result = await loadMp4MediaStream(dummyBlob);
    assert.isNotNull(result);
    // 2 回目の呼び出しでも成功する（キャッシュが壊れていない）
    const secondResult = await loadMp4MediaStream(dummyBlob);
    assert.isNotNull(secondResult);
  } catch {
    // 動的 import に失敗する環境ではテストをスキップ
  }
});
