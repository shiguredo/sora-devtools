import { assert, test } from "vite-plus/test";

import fixtureStats from "./__fixtures__/webrtc-stats-sample.json";
import {
  buildRawJson,
  normalizeWebrtcStats,
  selectIdsToDeleteForSampling,
} from "./webrtcStatsNormalizer.ts";

function requireRow(
  rows: ReturnType<typeof normalizeWebrtcStats>,
  statsType: string,
): ReturnType<typeof normalizeWebrtcStats>[number] {
  const row = rows.find((candidate) => candidate.stats_type === statsType);
  assert.ok(row, `stats_type=${statsType} の行が必要`);
  return row;
}

function requireRawObject(raw: unknown): Record<string, unknown> {
  assert.equal(typeof raw, "object");
  assert.notEqual(raw, null);
  assert.equal(Array.isArray(raw), false);
  return raw as Record<string, unknown>;
}

// 正規化対象 type の主要フィールドがカラムに入り、goog* は raw_json に残る
test("normalizeWebrtcStats は inbound-rtp を正規化し goog 拡張を raw_json に残す", () => {
  const normalized = normalizeWebrtcStats(fixtureStats, 1, "sid", "cid", "channel");
  const inbound = requireRow(normalized, "inbound-rtp");
  assert.equal(inbound.session_db_id, 1);
  assert.equal(inbound.session_id, "sid");
  assert.equal(inbound.connection_id, "cid");
  assert.equal(inbound.channel_id, "channel");
  assert.equal(inbound.kind, "video");
  assert.equal(inbound.packets_received, 100);
  assert.equal(inbound.frame_width, 640);
  const raw = requireRawObject(inbound.raw_json);
  assert.equal(raw.googJitterBufferMs, 10);
  assert.equal(raw.packetsReceived, undefined);
  assert.equal(raw.type, undefined);
});

// outbound-rtp の送信系フィールドがカラムに入り raw_json に重複しない
test("normalizeWebrtcStats は outbound-rtp を正規化する", () => {
  const normalized = normalizeWebrtcStats(fixtureStats, 1, "sid", "cid", "channel");
  const outbound = requireRow(normalized, "outbound-rtp");
  assert.equal(outbound.kind, "audio");
  assert.equal(outbound.packets_sent, 80);
  assert.equal(outbound.bytes_sent, 12_000);
  assert.equal(outbound.header_bytes_sent, 400);
  assert.equal(outbound.total_packet_send_delay, 0.01);
  const raw = requireRawObject(outbound.raw_json);
  assert.equal(raw.packetsSent, undefined);
  assert.equal(raw.bytesSent, undefined);
});

// candidate-pair の RTT / bitrate / nominated がカラムに入り raw_json に重複しない
test("normalizeWebrtcStats は candidate-pair を正規化する", () => {
  const normalized = normalizeWebrtcStats(fixtureStats, 1, "sid", "cid", "channel");
  const pair = requireRow(normalized, "candidate-pair");
  assert.equal(pair.candidate_pair_state, "succeeded");
  assert.equal(pair.nominated, true);
  assert.equal(pair.round_trip_time, 0.02);
  assert.equal(pair.available_outgoing_bitrate, 1_000_000);
  assert.equal(pair.local_candidate_id, "L1");
  const raw = requireRawObject(pair.raw_json);
  assert.equal(raw.state, undefined);
  assert.equal(raw.nominated, undefined);
  assert.equal(raw.roundTripTime, undefined);
});

// transport の selectedCandidatePairId がカラムに入り raw_json に重複しない
test("normalizeWebrtcStats は transport を正規化する", () => {
  const normalized = normalizeWebrtcStats(fixtureStats, 1, "sid", "cid", "channel");
  const transport = requireRow(normalized, "transport");
  assert.equal(transport.selected_candidate_pair_id, "CP01");
  assert.equal(transport.bytes_sent, 3000);
  const raw = requireRawObject(transport.raw_json);
  assert.equal(raw.selectedCandidatePairId, undefined);
  assert.equal(raw.bytesSent, undefined);
});

// codec は正規化対象外でも 1 行として残り、mimeType は raw_json に入る
test("normalizeWebrtcStats は codec を raw_json 中心の行として残す", () => {
  const normalized = normalizeWebrtcStats(fixtureStats, 1, null, null, "channel");
  const codec = requireRow(normalized, "codec");
  assert.equal(codec.session_id, null);
  assert.equal(codec.packets_received, null);
  const raw = requireRawObject(codec.raw_json);
  assert.equal(raw.mimeType, "video/VP9");
});

// buildRawJson は正規化キーを除外する
test("buildRawJson は正規化カラムキーを除外する", () => {
  const raw = buildRawJson({
    type: "inbound-rtp",
    id: "x",
    timestamp: 1,
    packetsReceived: 1,
    customField: "keep",
  });
  assert.deepEqual(raw, { customField: "keep" });
});

// サンプリング: 新しい 10000 を残し、古い側は 10 件に 1 件
test("selectIdsToDeleteForSampling は古い側を 10 件に 1 件残す", () => {
  const rows = [];
  for (let index = 0; index < 20_000; index += 1) {
    rows.push({ id: index + 1, timestamp_ms: index });
  }
  const toDelete = selectIdsToDeleteForSampling(rows, 10_000);
  // 古い 10000 件のうち index%10!==0 が削除 → 9000 件削除
  assert.equal(toDelete.length, 9000);
  assert.ok(!toDelete.includes(1));
  assert.ok(toDelete.includes(2));
});
