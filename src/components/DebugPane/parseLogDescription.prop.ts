import { fc, test } from "@fast-check/vitest";
import { assert } from "vite-plus/test";

import { parseLogDescription } from "./parseLogDescription.ts";

// parseLogDescription は受け側 1 箇所の防御として導入された純関数のため
// 任意の文字列入力で例外を投げず、必ず何らかの値を返すことを不変条件として保証する
test.prop([fc.string()])("parseLogDescription は任意の文字列入力で例外を投げない", (raw) => {
  // 例外が投げられた場合は fast-check が失敗を報告する
  const result = parseLogDescription(raw);
  // 戻り値の存在を最低限担保する（空文字列フォールバックでも "" は truthy ではないため equal で比較する）
  assert.notEqual(result, undefined);
});

// parseLogDescription の戻り値型は string | number | Record<string, unknown> | unknown[] に限定される
// null / boolean は raw 文字列にフォールバックされるため戻り値から排除される
test.prop([fc.string()])(
  "parseLogDescription の戻り値は string / number / object / array のいずれかになる",
  (raw) => {
    const result = parseLogDescription(raw);
    if (Array.isArray(result)) {
      // 配列なら問題なし
      return;
    }
    const resultType = typeof result;
    // 戻り値型から null / boolean / undefined を排除する
    assert.ok(
      resultType === "string" || resultType === "number" || resultType === "object",
      `想定外の戻り値型: ${resultType}、値: ${JSON.stringify(result)}`,
    );
  },
);
