import { fc, test } from "@fast-check/vitest";
import { assert } from "vite-plus/test";
import { resetForTesting, runWithNoiseSuppressionProcessorLock } from "./noiseSuppression.ts";

// テストごとにモジュールレベルの状態をリセットする
function resetModuleState(): void {
  resetForTesting();
}

// runWithNoiseSuppressionProcessorLock は同時実行数を 1 に保つ
test.prop([
  fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 2, maxLength: 10 }),
  fc.array(fc.boolean(), { minLength: 2, maxLength: 10 }),
])(
  "runWithNoiseSuppressionProcessorLock は任意の並列操作で同時実行数を 1 に保つ",
  async (delays, shouldThrowFlags) => {
    resetModuleState();
    let activeCount = 0;
    let maxConcurrent = 0;

    const promises = delays.map(async (delay, i) => {
      const shouldThrow = shouldThrowFlags[i % shouldThrowFlags.length];
      return (async () => {
        try {
          await runWithNoiseSuppressionProcessorLock(async () => {
            activeCount += 1;
            if (activeCount > maxConcurrent) {
              maxConcurrent = activeCount;
            }
            if (delay > 0) {
              await new Promise<void>((resolve) => {
                setTimeout(resolve, delay);
              });
            }
            if (shouldThrow) {
              activeCount -= 1;
              throw new Error("operation failed");
            }
            activeCount -= 1;
          });
        } catch {
          // 失敗は意図的
        }
      })();
    });

    await Promise.all(promises);

    // 同時実行数が 1 を超えないこと
    assert.equal(maxConcurrent, 1);
    // 全操作完了後に activeCount が 0 に戻っていること
    assert.equal(activeCount, 0);
  },
  10_000,
);

// runWithNoiseSuppressionProcessorLock は失敗後も次の処理を実行する
test.prop([fc.nat({ max: 5 })])(
  "runWithNoiseSuppressionProcessorLock は任意の数の失敗後も後続の処理を実行する",
  async (failCount) => {
    resetModuleState();
    const events: string[] = [];

    // 指定数だけ失敗させる（await せずに fire-and-forget で起動）
    for (let i = 0; i <= failCount; i++) {
      void (async () => {
        try {
          await runWithNoiseSuppressionProcessorLock(async () => {
            events.push(`fail-${i}-start`);
            throw new Error(`operation ${i} failed`);
          });
        } catch {
          // 失敗は意図的
        }
      })();
    }

    // 最後に成功させる
    const successResult = await runWithNoiseSuppressionProcessorLock(async () => {
      events.push("success-start");
      return "success";
    });

    assert.equal(successResult, "success");
    assert.isTrue(events.includes("success-start"));
  },
);

// runWithNoiseSuppressionProcessorLock は同期コールバックも直列化する
const noiseSuppressionOperationArb = fc.record({
  value: fc.string({ minLength: 1, maxLength: 5 }),
  shouldThrow: fc.boolean(),
});

test.prop([fc.array(noiseSuppressionOperationArb, { minLength: 2, maxLength: 10 })])(
  "runWithNoiseSuppressionProcessorLock は任意の同期コールバックの並びを直列化し結果を正しく返す",
  async (operations) => {
    resetModuleState();
    const executionOrder: string[] = [];

    const promises = operations.map(async (op) =>
      (async () => {
        try {
          const result = await runWithNoiseSuppressionProcessorLock(() => {
            executionOrder.push(op.value);
            if (op.shouldThrow) {
              throw new Error(`operation ${op.value} failed`);
            }
            return op.value;
          });
          assert.equal(result, op.value);
        } catch {
          // 失敗は意図的
        }
      })(),
    );

    await Promise.all(promises);

    // 全操作が実行されたこと
    assert.equal(executionOrder.length, operations.length);
  },
);
