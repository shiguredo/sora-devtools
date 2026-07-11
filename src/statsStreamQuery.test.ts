import { assert, test } from "vite-plus/test";

import {
  computeStreamTimeseries,
  computeStreamTimeseriesForId,
  listStatsStreams,
} from "./statsStreamQuery.ts";
import type { StreamSourceRow } from "./statsStreamQuery.ts";

function row(
  partial: Partial<StreamSourceRow> &
    Pick<StreamSourceRow, "id" | "timestamp_ms" | "stats_type" | "stats_id">,
): StreamSourceRow {
  return {
    kind: null,
    packets_received: null,
    packets_sent: null,
    bytes_received: null,
    bytes_sent: null,
    round_trip_time: null,
    ...partial,
  };
}

test("listStatsStreams は outbound/inbound/candidate-pair だけを返す", () => {
  const rows: StreamSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      kind: "video",
      bytes_sent: 0,
      packets_sent: 0,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "outbound-rtp",
      stats_id: "out-a",
      kind: "video",
      bytes_sent: 1000,
      packets_sent: 10,
    }),
    row({
      id: 3,
      timestamp_ms: 1000,
      stats_type: "codec",
      stats_id: "codec-1",
    }),
  ];
  const streams = listStatsStreams(rows);
  assert.equal(streams.length, 1);
  assert.equal(streams[0]?.stats_id, "out-a");
  assert.equal(streams[0]?.kind, "video");
  assert.equal(streams[0]?.sample_count, 2);
  assert.equal(streams[0]?.last_bitrate_bps, 8000);
  assert.equal(streams[0]?.last_packet_rate_pps, 10);
});

test("computeStreamTimeseries は差分ビットレートとパケットレートを出す", () => {
  const rows: StreamSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "inbound-rtp",
      stats_id: "in-a",
      bytes_received: 0,
      packets_received: 0,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "inbound-rtp",
      stats_id: "in-a",
      bytes_received: 500,
      packets_received: 5,
    }),
  ];
  const points = computeStreamTimeseries(rows);
  assert.equal(points.length, 2);
  assert.equal(points[0]?.bitrate_bps, null);
  assert.equal(points[1]?.bitrate_bps, 4000);
  assert.equal(points[1]?.packet_rate_pps, 5);
});

test("computeStreamTimeseriesForId は指定 id だけを対象にする", () => {
  const rows: StreamSourceRow[] = [
    row({
      id: 1,
      timestamp_ms: 0,
      stats_type: "candidate-pair",
      stats_id: "pair-a",
      round_trip_time: 0.02,
    }),
    row({
      id: 2,
      timestamp_ms: 1000,
      stats_type: "candidate-pair",
      stats_id: "pair-b",
      round_trip_time: 0.05,
    }),
    row({
      id: 3,
      timestamp_ms: 2000,
      stats_type: "candidate-pair",
      stats_id: "pair-a",
      round_trip_time: 0.03,
    }),
  ];
  const points = computeStreamTimeseriesForId(rows, "pair-a");
  assert.equal(points.length, 2);
  assert.equal(points[0]?.round_trip_time, 0.02);
  assert.equal(points[1]?.round_trip_time, 0.03);
});
