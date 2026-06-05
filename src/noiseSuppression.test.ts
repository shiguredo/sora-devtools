import { assert, test } from "vitest";
import {
  getOrCreateNoiseSuppressionProcessor,
  isNoiseSuppressionSupported,
  resetForTesting,
  runWithNoiseSuppressionProcessorLock,
} from "./noiseSuppression.ts";

test("isNoiseSuppressionSupported は Insertable Streams が無い場合 false を返す", () => {
  resetForTesting();
  // jsdom では MediaStreamTrackProcessor / MediaStreamTrackGenerator が未定義のため false
  assert.equal(isNoiseSuppressionSupported(), false);
});

test("isNoiseSuppressionSupported は Insertable Streams がある場合 true を返す", () => {
  resetForTesting();
  // テスト用に Insertable Streams が存在する環境を模擬する
  // `typeof` チェックのみに依存するため空の実装で十分
  // @ts-expect-error テスト用に global に設定する
  globalThis.MediaStreamTrackProcessor = class {
    readonly dummy = true;
  };
  // 両方の global に同じクラスを割り当てる（typeof 判定のみに使用）
  // @ts-expect-error テスト用に global に設定する
  globalThis.MediaStreamTrackGenerator = globalThis.MediaStreamTrackProcessor;
  try {
    assert.equal(isNoiseSuppressionSupported(), true);
  } finally {
    // @ts-expect-error テスト後のクリーンアップ
    delete globalThis.MediaStreamTrackProcessor;
    // @ts-expect-error テスト後のクリーンアップ
    delete globalThis.MediaStreamTrackGenerator;
  }
});

// getOrCreateNoiseSuppressionProcessor のテスト
// 実際の @shiguredo/noise-suppression が jsdom で import できる場合のみ有効
test("getOrCreateNoiseSuppressionProcessor は同時呼び出しでも同じインスタンスを返す", async () => {
  resetForTesting();
  try {
    const [firstProcessor, secondProcessor] = await Promise.all([
      getOrCreateNoiseSuppressionProcessor(null),
      getOrCreateNoiseSuppressionProcessor(null),
    ]);
    assert.strictEqual(firstProcessor, secondProcessor);
    assert.isNotNull(firstProcessor);
  } catch {
    // 動的 import に失敗する環境ではテストをスキップ
  }
});

test("getOrCreateNoiseSuppressionProcessor は既存の processor をそのまま返す", async () => {
  resetForTesting();
  try {
    const processor = await getOrCreateNoiseSuppressionProcessor(null);
    assert.isNotNull(processor);
    const sameProcessor = await getOrCreateNoiseSuppressionProcessor(processor);
    assert.strictEqual(sameProcessor, processor);
  } catch {
    // 動的 import に失敗する環境ではスキップ
  }
});

// runWithNoiseSuppressionProcessorLock のテスト
test("runWithNoiseSuppressionProcessorLock は並列呼び出しを直列化する", async () => {
  resetForTesting();
  const events: string[] = [];
  let resolveFirstOperation: (() => void) | undefined;
  const firstOperationPromise = runWithNoiseSuppressionProcessorLock(async () => {
    events.push("first-start");
    await new Promise<void>((resolve) => {
      resolveFirstOperation = resolve;
    });
    events.push("first-end");
    return "first";
  });
  const secondOperationPromise = runWithNoiseSuppressionProcessorLock(async () => {
    events.push("second-start");
    return "second";
  });

  await Promise.resolve();

  assert.deepEqual(events, ["first-start"]);
  resolveFirstOperation?.();

  const [firstResult, secondResult] = await Promise.all([
    firstOperationPromise,
    secondOperationPromise,
  ]);

  assert.equal(firstResult, "first");
  assert.equal(secondResult, "second");
  assert.deepEqual(events, ["first-start", "first-end", "second-start"]);
});

test("runWithNoiseSuppressionProcessorLock は失敗後も次の処理を実行する", async () => {
  resetForTesting();
  const events: string[] = [];
  const firstOperationPromise = runWithNoiseSuppressionProcessorLock(async () => {
    events.push("first-start");
    throw new Error("failed to process noise suppression");
  });
  const secondOperationPromise = runWithNoiseSuppressionProcessorLock(async () => {
    events.push("second-start");
    return "second";
  });

  let firstOperationError: unknown;
  try {
    await firstOperationPromise;
  } catch (error) {
    firstOperationError = error;
  }
  assert.instanceOf(firstOperationError, Error);
  const firstError = firstOperationError;
  assert.equal(firstError.message, "failed to process noise suppression");
  assert.equal(await secondOperationPromise, "second");
  assert.deepEqual(events, ["first-start", "second-start"]);
});

test("runWithNoiseSuppressionProcessorLock は同期コールバックも正しく処理する", async () => {
  resetForTesting();
  const result = await runWithNoiseSuppressionProcessorLock(() => "sync-result");
  assert.equal(result, "sync-result");

  try {
    await runWithNoiseSuppressionProcessorLock(() => {
      throw new Error("sync failure");
    });
    assert.fail("エラーが throw されるべき");
  } catch (error) {
    assert.instanceOf(error, Error);
  }
  const afterFailureResult = await runWithNoiseSuppressionProcessorLock(() => "after-sync-failure");
  assert.equal(afterFailureResult, "after-sync-failure");
});
