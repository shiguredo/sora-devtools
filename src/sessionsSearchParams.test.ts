import { assert, test } from "vite-plus/test";

import {
  buildSessionsPath,
  buildSessionsSearchParams,
  isValidDateOnly,
  parseSessionDbId,
  parseSessionsSearchParams,
} from "./sessionsSearchParams.ts";

// YYYY-MM-DD の妥当性
test("isValidDateOnly は正しい日付のみ true を返す", () => {
  assert.isTrue(isValidDateOnly("2026-07-11"));
  assert.isTrue(isValidDateOnly("2024-02-29"));
  assert.isFalse(isValidDateOnly("2026-7-11"));
  assert.isFalse(isValidDateOnly("2026-13-01"));
  assert.isFalse(isValidDateOnly("2026-02-30"));
  assert.isFalse(isValidDateOnly("not-a-date"));
});

// sessionDbId は正の整数のみ
test("parseSessionDbId は正の整数のみ受け付ける", () => {
  assert.equal(parseSessionDbId("1"), 1);
  assert.equal(parseSessionDbId("42"), 42);
  assert.equal(parseSessionDbId(null), undefined);
  assert.equal(parseSessionDbId(""), undefined);
  assert.equal(parseSessionDbId("0"), undefined);
  assert.equal(parseSessionDbId("-1"), undefined);
  assert.equal(parseSessionDbId("1.5"), undefined);
  assert.equal(parseSessionDbId("abc"), undefined);
});

// 正常な QS を読む
test("parseSessionsSearchParams は有効なフィルタを読む", () => {
  const parsed = parseSessionsSearchParams(
    "?sessionId=s1&connectionId=c1&channelId=ch&from=2026-07-01&to=2026-07-11&sessionDbId=3",
  );
  assert.deepEqual(parsed, {
    sessionId: "s1",
    connectionId: "c1",
    channelId: "ch",
    from: "2026-07-01",
    to: "2026-07-11",
    sessionDbId: 3,
  });
});

// 不正な from/to/sessionDbId は落とす
test("parseSessionsSearchParams は不正な日付と sessionDbId を未指定にする", () => {
  const parsed = parseSessionsSearchParams("from=2026-13-01&to=bad&sessionDbId=nope&channelId=ok");
  assert.deepEqual(parsed, { channelId: "ok" });
});

// from > to なら両方落とす
test("parseSessionsSearchParams は from が to より後なら日付を落とす", () => {
  const parsed = parseSessionsSearchParams("from=2026-07-20&to=2026-07-10&channelId=ch");
  assert.deepEqual(parsed, { channelId: "ch" });
});

// 組み立てとラウンドトリップ
test("buildSessionsSearchParams は空値を載せない", () => {
  const search = buildSessionsSearchParams({
    channelId: "ch",
    sessionDbId: 9,
  });
  assert.equal(search.get("channelId"), "ch");
  assert.equal(search.get("sessionDbId"), "9");
  assert.isNull(search.get("sessionId"));
  assert.isNull(search.get("from"));
});

test("buildSessionsPath はクエリ無しなら /sessions のみ返す", () => {
  assert.equal(buildSessionsPath({}), "/sessions");
  assert.equal(buildSessionsPath({ channelId: "a" }), "/sessions?channelId=a");
});

test("parse と build はラウンドトリップできる", () => {
  const original = {
    sessionId: "s",
    connectionId: "c",
    channelId: "ch",
    from: "2026-01-01",
    to: "2026-01-31",
    sessionDbId: 7,
  };
  const built = buildSessionsSearchParams(original);
  const parsed = parseSessionsSearchParams(built);
  assert.deepEqual(parsed, original);
});
