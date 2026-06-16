import { fc, test } from "@fast-check/vitest";
import { assert } from "vite-plus/test";

import { parseUrlEntriesFromText } from "./opfs.ts";

// parseUrlEntriesFromText の入力 Arbitrary。
// 任意 string と valid JSON 文字列を fc.oneof で混在させて、JSON.parse 失敗ブランチと
// 構造検証ブランチの両方を踏ませる。fc.string() 単独だと大半が JSON.parse 失敗で
// 早期 return に落ち、要素検証ロジックの不変条件を踏み込めないため fc.json() を混ぜる。
const parseInputArb = fc.oneof(fc.string(), fc.json());

// parseUrlEntriesFromText の不変条件 PBT。
// 任意の文字列入力に対して例外を投げず、戻り値が常に UrlEntry[] の形状を持つことを保証する。
test.prop([parseInputArb])("parseUrlEntriesFromText は任意の文字列入力で例外を投げない", (text) => {
  parseUrlEntriesFromText(text);
});

test.prop([parseInputArb])(
  "parseUrlEntriesFromText の戻り値は常に UrlEntry[] の形状を持つ",
  (text) => {
    // 戻り値型 UrlEntry[] を unknown 経由で受けて narrow を解除し、実行時形状を再検査する。
    // 戻り値型のまま entry.url / entry.enabled を typeof で検査すると型情報そのままのトートロジーになり、
    // 「実装が as UrlEntry[] 等で型を偽装したまま実行時形状が崩れた場合」を捕捉できない。
    const result: unknown = parseUrlEntriesFromText(text);
    assert.isTrue(Array.isArray(result));
    if (!Array.isArray(result)) {
      return;
    }
    for (const entry of result) {
      assert.isTrue(typeof entry === "object" && entry !== null);
      assert.isTrue(typeof (entry as { url?: unknown }).url === "string");
      assert.isTrue(typeof (entry as { enabled?: unknown }).enabled === "boolean");
    }
  },
);
