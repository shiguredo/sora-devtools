import { assert, test } from "vite-plus/test";

import { alignRawSeriesPoints, maxRawSeriesCount } from "./statsRawSeries.ts";
import type { RawSeriesPoint } from "./statsRawSeries.ts";

test("alignRawSeriesPoints は空配列で空を返す", () => {
  assert.deepEqual(alignRawSeriesPoints([]), { timestampsSec: [], series: [] });
});

test("alignRawSeriesPoints は単一系列を Unix 秒に整列する", () => {
  const points: RawSeriesPoint[] = [
    { timestamp_ms: 1000, stats_id: "out-a", value: 10 },
    { timestamp_ms: 2000, stats_id: "out-a", value: 20 },
  ];
  const aligned = alignRawSeriesPoints(points);
  assert.deepEqual(aligned.timestampsSec, [1, 2]);
  assert.equal(aligned.series.length, 1);
  assert.equal(aligned.series[0]?.statsId, "out-a");
  assert.deepEqual(aligned.series[0]?.values, [10, 20]);
});

test("alignRawSeriesPoints は複数系列の欠測を null にする", () => {
  const points: RawSeriesPoint[] = [
    { timestamp_ms: 0, stats_id: "a", value: 1 },
    { timestamp_ms: 1000, stats_id: "b", value: 2 },
    { timestamp_ms: 1000, stats_id: "a", value: 3 },
  ];
  const aligned = alignRawSeriesPoints(points);
  assert.deepEqual(aligned.timestampsSec, [0, 1]);
  const seriesA = aligned.series.find((entry) => entry.statsId === "a");
  const seriesB = aligned.series.find((entry) => entry.statsId === "b");
  assert.deepEqual(seriesA?.values, [1, 3]);
  assert.deepEqual(seriesB?.values, [null, 2]);
});

test("alignRawSeriesPoints は系列数を上限で切る", () => {
  const points: RawSeriesPoint[] = [];
  const limit = maxRawSeriesCount();
  for (let index = 0; index < limit + 2; index += 1) {
    // 件数が多い系列を優先するため、index が小さいほど多くする
    const count = limit + 2 - index;
    for (let sample = 0; sample < count; sample += 1) {
      points.push({
        timestamp_ms: sample * 1000,
        stats_id: `id-${String(index)}`,
        value: sample,
      });
    }
  }
  const aligned = alignRawSeriesPoints(points);
  assert.equal(aligned.series.length, limit);
  assert.equal(aligned.series[0]?.statsId, "id-0");
});
