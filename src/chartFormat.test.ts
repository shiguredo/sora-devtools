import { assert, test } from "vite-plus/test";

import { axisTimeLabelsJst, formatChartUnixSecJst } from "./components/Sessions/chartFormat.ts";

test("formatChartUnixSecJst は JST の時刻を返す", () => {
  // 2024-01-01T00:00:00Z = 2024-01-01 09:00:00 JST
  assert.equal(formatChartUnixSecJst(1_704_067_200, false), "09:00:00");
});

test("formatChartUnixSecJst は日付付きも JST で返す", () => {
  assert.equal(formatChartUnixSecJst(1_704_067_200, true), "01/01 09:00:00");
});

test("axisTimeLabelsJst は同一日内なら時刻のみ", () => {
  const labels = axisTimeLabelsJst(null, [1_704_067_200, 1_704_067_260]);
  assert.deepEqual(labels, ["09:00:00", "09:01:00"]);
});
