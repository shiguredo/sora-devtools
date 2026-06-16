import { assert, test } from "vite-plus/test";

import { parseUrlEntriesFromText } from "./opfs.ts";

// parseUrlEntriesFromText の異常系・回帰防止テスト
// OPFS ファイルが壊れている / 不正な要素を含む場合に空配列を返し、SDK 経路に不正値が流れないことを確認する
test("parseUrlEntriesFromText は invalid JSON 文字列を渡されたとき空配列を返す", () => {
  // JSON.parse 例外は catch で空配列に落とす
  assert.deepEqual(parseUrlEntriesFromText("{invalid}"), []);
});

test("parseUrlEntriesFromText は urlEntries が無い JSON を渡されたとき空配列を返す", () => {
  // urlEntries キー欠落は in 演算子で false になるので空配列
  assert.deepEqual(parseUrlEntriesFromText("{}"), []);
});

test("parseUrlEntriesFromText は urlEntries が空配列の JSON を渡されたとき空配列を返す", () => {
  // every は空配列で true を返すため受理されるが、結果としては空配列のまま
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":[]}'), []);
});

test("parseUrlEntriesFromText は urlEntries が null の JSON を渡されたとき空配列を返す", () => {
  // null は Array.isArray で false
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":null}'), []);
});

test("parseUrlEntriesFromText は url が number の要素を含む JSON を渡されたとき空配列を返す", () => {
  // url が string でなければ全体破棄 (本丸: number を URL として扱う経路を遮断)
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":[{"url":42,"enabled":true}]}'), []);
});

test("parseUrlEntriesFromText は enabled が string の要素を含む JSON を渡されたとき空配列を返す", () => {
  // enabled が boolean でなければ全体破棄
  assert.deepEqual(
    parseUrlEntriesFromText('{"urlEntries":[{"url":"wss://x","enabled":"yes"}]}'),
    [],
  );
});

test("parseUrlEntriesFromText は enabled が欠落した要素を含む JSON を渡されたとき空配列を返す", () => {
  // 必須フィールド欠落は in 演算子で false になるので全体破棄
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":[{"url":"wss://x"}]}'), []);
});

test("parseUrlEntriesFromText は null 要素を含む JSON を渡されたとき空配列を返す", () => {
  // null は typeof === "object" を満たすが !== null で弾かれる
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":[null]}'), []);
});

test("parseUrlEntriesFromText は正常要素と不正要素が混在する JSON を渡されたとき空配列を返す", () => {
  // 1 件でも不正なら全体破棄 (部分救済しない)
  assert.deepEqual(
    parseUrlEntriesFromText(
      '{"urlEntries":[{"url":"wss://valid","enabled":true},{"url":42,"enabled":true}]}',
    ),
    [],
  );
});

test("parseUrlEntriesFromText は正常な要素のみの JSON を渡されたとき要素配列を返す（既存挙動の回帰防止）", () => {
  // 正常な配列は受理して同形の配列を返す
  assert.deepEqual(
    parseUrlEntriesFromText(
      '{"urlEntries":[{"url":"wss://a","enabled":true},{"url":"wss://b","enabled":false}]}',
    ),
    [
      { url: "wss://a", enabled: true },
      { url: "wss://b", enabled: false },
    ],
  );
});
