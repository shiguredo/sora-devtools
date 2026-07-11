import { assert, test } from "vite-plus/test";

import { computeStatsAggregates, computeStatsTimeseries } from "./statsQuery.ts";
import type { StatsSourceRow } from "./statsQuery.ts";

function row(
  partial: Partial<StatsSourceRow> &
    Pick<StatsSourceRow, "id" | "timestamp_ms" | "stats_type" | "stats_id">,
): StatsSourceRow {
  return {
    packets_received: null,
    packets_lost: null,
    packets_sent: null,
    bytes_received: null,
    bytes_sent: null,
    round_trip_time: null,
    ...partial,
  };
}

// 空入力はすべて null
test("computeStatsAggregates は空配列で全フィールド null を返す", () => {
  assert.deepEqual(computeStatsAggregates([]), {
    packets_received: null,
    packets_sent: null,
    packet_loss_rate: null,
    rtt_min: null,
    rtt_max: null,
    rtt_avg: null,
    bitrate_send_bps: null,
    bitrate_recv_bps: null,
  });
});

// stats_id 単位の最新行を合算する
test("computeStatsAggregates は inbound/outbound の最新行を合算する", () => {
  const rows: StatsSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 1000,
      stats_type: "inbound-rtp",
      stats_id: "in-a",
      packets_received: 10,
      packets_lost: 1,
    }),
    row({
      id: 2,
      timestamp_ms: 2000,
      stats_type: "inbound-rtp",
      stats_id: "in-a",
      packets_received: 20,
      packets_lost: 2,
    }),
    row({
      id: 3,
      timestamp_ms: 2000,
      stats_type: "inbound-rtp",
      stats_id: "in-b",
      packets_received: 5,
      packets_lost: 0,
    }),
    row({
      id: 4,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      packets_sent: 3,
    }),
    row({
      id: 5,
      timestamp_ms: 3000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      packets_sent: 8,
    }),
  ];
  const aggregates = computeStatsAggregates(rows);
  assert.equal(aggregates.packets_received, 25);
  assert.equal(aggregates.packets_sent, 8);
  assert.equal(aggregates.packet_loss_rate, 2 / 27);
});

// RTT は candidate-pair 最新行の min/max/avg
test("computeStatsAggregates は RTT の min/max/avg を返す", () => {
  const rows: StatsSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 1000,
      stats_type: "candidate-pair",
      stats_id: "cp-a",
      round_trip_time: 0.04,
    }),
    row({
      id: 2,
      timestamp_ms: 2000,
      stats_type: "candidate-pair",
      stats_id: "cp-a",
      round_trip_time: 0.02,
    }),
    row({
      id: 3,
      timestamp_ms: 2000,
      stats_type: "candidate-pair",
      stats_id: "cp-b",
      round_trip_time: 0.06,
    }),
  ];
  const aggregates = computeStatsAggregates(rows);
  assert.equal(aggregates.rtt_min, 0.02);
  assert.equal(aggregates.rtt_max, 0.06);
  assert.equal(aggregates.rtt_avg, 0.04);
});

// 正の bytes 差分だけ平均ビットレートにする
test("computeStatsAggregates は正の bytes 差分だけ平均ビットレートにする", () => {
  const rows: StatsSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 1000,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 2000,
    }),
  ];
  const aggregates = computeStatsAggregates(rows);
  // 1000 bytes / 1s * 8 = 8000 bps
  assert.equal(aggregates.bitrate_send_bps, 8000);
});

// 時系列: バケット代表時刻と合算
test("computeStatsTimeseries は intervalSec でバケット化する", () => {
  const rows: StatsSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 0,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 1000,
    }),
    row({
      id: 3,
      timestamp_ms: 11_000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 2000,
    }),
  ];
  const points = computeStatsTimeseries(rows, 10);
  assert.isAtLeast(points.length, 1);
  assert.equal(points[0]?.timestamp_ms, 0);
  // 2 つ目のバケット（10000ms 台）
  const second = points.find((point) => point.timestamp_ms === 10_000);
  assert.isDefined(second);
});

// 1 秒バケット: getStats 収集間隔に合わせた既定
test("computeStatsTimeseries は 1 秒間隔でバケット化する", () => {
  const rows: StatsSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 0,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 1000,
    }),
    row({
      id: 3,
      timestamp_ms: 2000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 2500,
    }),
  ];
  const points = computeStatsTimeseries(rows, 1);
  assert.equal(points.length, 3);
  assert.equal(points[0]?.timestamp_ms, 0);
  assert.equal(points[0]?.bitrate_send_bps, null);
  assert.equal(points[1]?.timestamp_ms, 1000);
  assert.equal(points[1]?.bitrate_send_bps, 8000);
  assert.equal(points[2]?.timestamp_ms, 2000);
  // (2500-1000)*8*1000/1000 = 12000
  assert.equal(points[2]?.bitrate_send_bps, 12_000);
});

// 同一バケット内の複数サンプルは stats_id 単位 last のみ使い、全サンプル合算しない
test("computeStatsTimeseries はバケット内で stats_id 単位の last を使う", () => {
  const rows: StatsSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 0,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 1000,
    }),
    row({
      id: 3,
      timestamp_ms: 2000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 3000,
    }),
  ];
  const points = computeStatsTimeseries(rows, 10);
  assert.equal(points.length, 1);
  // last は id=3（2000ms）の差分: (3000-1000)*8*1000/1000 = 16000
  // 全サンプル合算だと 8000+16000=24000 になる
  assert.equal(points[0]?.bitrate_send_bps, 16_000);
});

// 同一バケットの複数 stats_id は last 同士を合算する
test("computeStatsTimeseries は複数 stats_id の last を合算する", () => {
  const rows: StatsSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 0,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      bytes_sent: 1000,
    }),
    row({
      id: 3,
      timestamp_ms: 0,
      stats_type: "outbound-rtp",
      stats_id: "out-b",
      bytes_sent: 0,
    }),
    row({
      id: 4,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-b",
      bytes_sent: 500,
    }),
  ];
  const points = computeStatsTimeseries(rows, 10);
  assert.equal(points.length, 1);
  // out-a: 8000 bps, out-b: 4000 bps → 合算 12000
  assert.equal(points[0]?.bitrate_send_bps, 12_000);
});

test("computeStatsTimeseries は空配列で空を返す", () => {
  assert.deepEqual(computeStatsTimeseries([], 10), []);
});
