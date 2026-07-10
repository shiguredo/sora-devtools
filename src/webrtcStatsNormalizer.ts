// RTCStats を webrtc_stats テーブル向けに正規化する純粋関数群
// 参照: WebRTC Statistics API (W3C) https://www.w3.org/TR/webrtc-stats/

import type { Json } from "@/types";

// 第 1 段階で正規化カラムに展開する type
const NORMALIZED_STATS_TYPES = new Set([
  "inbound-rtp",
  "outbound-rtp",
  "remote-inbound-rtp",
  "remote-outbound-rtp",
  "candidate-pair",
  "transport",
]);

// 正規化カラム名（テーブル定義と 1:1。raw_json から除外するキーの正規化名）
const NORMALIZED_COLUMN_KEYS = [
  "timestamp",
  "type",
  "id",
  "kind",
  "ssrc",
  "trackIdentifier",
  "transportId",
  "codecId",
  "mid",
  "remoteId",
  "packetsReceived",
  "packetsLost",
  "packetsSent",
  "bytesReceived",
  "bytesSent",
  "headerBytesSent",
  "retransmittedPacketsSent",
  "retransmittedBytesSent",
  "totalPacketSendDelay",
  "nackCount",
  "frameWidth",
  "frameHeight",
  "framesPerSecond",
  "framesReceived",
  "roundTripTime",
  "totalRoundTripTime",
  "availableOutgoingBitrate",
  "availableIncomingBitrate",
  "localCandidateId",
  "remoteCandidateId",
  "state",
  "nominated",
  "selectedCandidatePairId",
] as const;

const NORMALIZED_COLUMN_KEY_SET = new Set<string>(NORMALIZED_COLUMN_KEYS);

// webrtc_stats 行（id / created_at を除く）に対応する正規化結果
export interface NormalizedWebrtcStat {
  session_db_id: number;
  session_id: string | null;
  connection_id: string | null;
  channel_id: string;
  timestamp_ms: number;
  stats_type: string;
  stats_id: string;
  kind: string | null;
  ssrc: number | null;
  track_identifier: string | null;
  transport_id: string | null;
  codec_id: string | null;
  mid: string | null;
  remote_id: string | null;
  packets_received: number | null;
  packets_lost: number | null;
  packets_sent: number | null;
  bytes_received: number | null;
  bytes_sent: number | null;
  header_bytes_sent: number | null;
  retransmitted_packets_sent: number | null;
  retransmitted_bytes_sent: number | null;
  total_packet_send_delay: number | null;
  nack_count: number | null;
  frame_width: number | null;
  frame_height: number | null;
  frames_per_second: number | null;
  frames_received: number | null;
  round_trip_time: number | null;
  total_round_trip_time: number | null;
  available_outgoing_bitrate: number | null;
  available_incoming_bitrate: number | null;
  local_candidate_id: string | null;
  remote_candidate_id: string | null;
  candidate_pair_state: string | null;
  nominated: boolean | null;
  selected_candidate_pair_id: string | null;
  raw_json: Json;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key];
  if (typeof value === "boolean") {
    return value;
  }
  return null;
}

function optionalString(
  enabled: boolean,
  record: Record<string, unknown>,
  key: string,
): string | null {
  if (!enabled) {
    return null;
  }
  return readString(record, key);
}

function optionalNumber(
  enabled: boolean,
  record: Record<string, unknown>,
  key: string,
): number | null {
  if (!enabled) {
    return null;
  }
  return readNumber(record, key);
}

function optionalBoolean(
  enabled: boolean,
  record: Record<string, unknown>,
  key: string,
): boolean | null {
  if (!enabled) {
    return null;
  }
  return readBoolean(record, key);
}

// 正規化カラムに含まれるキーを除いた残りを raw_json にする
export function buildRawJson(stat: Record<string, unknown>): Json {
  const raw: Record<string, Json | undefined> = {};
  for (const [key, value] of Object.entries(stat)) {
    if (NORMALIZED_COLUMN_KEY_SET.has(key)) {
      continue;
    }
    if (value === undefined) {
      continue;
    }
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      raw[key] = value;
      continue;
    }
    if (typeof value === "object") {
      raw[key] = value as Json;
    }
  }
  return raw;
}

// 1 件の RTCStats 相当オブジェクトを正規化する
export function normalizeOneWebrtcStat(
  stat: unknown,
  sessionDbId: number,
  sessionId: string | null,
  connectionId: string | null,
  channelId: string,
): NormalizedWebrtcStat | null {
  const record = asRecord(stat);
  if (record === null) {
    return null;
  }
  const statsType = readString(record, "type");
  const statsId = readString(record, "id");
  const timestampMs = readNumber(record, "timestamp");
  if (statsType === null || statsId === null || timestampMs === null) {
    return null;
  }

  // 正規化対象外 type も raw_json 中心で 1 行として残す（一覧・件数検証のため）
  const enabled = NORMALIZED_STATS_TYPES.has(statsType);

  return {
    session_db_id: sessionDbId,
    session_id: sessionId,
    connection_id: connectionId,
    channel_id: channelId,
    timestamp_ms: timestampMs,
    stats_type: statsType,
    stats_id: statsId,
    kind: optionalString(enabled, record, "kind"),
    ssrc: optionalNumber(enabled, record, "ssrc"),
    track_identifier: optionalString(enabled, record, "trackIdentifier"),
    transport_id: optionalString(enabled, record, "transportId"),
    codec_id: optionalString(enabled, record, "codecId"),
    mid: optionalString(enabled, record, "mid"),
    remote_id: optionalString(enabled, record, "remoteId"),
    packets_received: optionalNumber(enabled, record, "packetsReceived"),
    packets_lost: optionalNumber(enabled, record, "packetsLost"),
    packets_sent: optionalNumber(enabled, record, "packetsSent"),
    bytes_received: optionalNumber(enabled, record, "bytesReceived"),
    bytes_sent: optionalNumber(enabled, record, "bytesSent"),
    header_bytes_sent: optionalNumber(enabled, record, "headerBytesSent"),
    retransmitted_packets_sent: optionalNumber(enabled, record, "retransmittedPacketsSent"),
    retransmitted_bytes_sent: optionalNumber(enabled, record, "retransmittedBytesSent"),
    total_packet_send_delay: optionalNumber(enabled, record, "totalPacketSendDelay"),
    nack_count: optionalNumber(enabled, record, "nackCount"),
    frame_width: optionalNumber(enabled, record, "frameWidth"),
    frame_height: optionalNumber(enabled, record, "frameHeight"),
    frames_per_second: optionalNumber(enabled, record, "framesPerSecond"),
    frames_received: optionalNumber(enabled, record, "framesReceived"),
    round_trip_time: optionalNumber(enabled, record, "roundTripTime"),
    total_round_trip_time: optionalNumber(enabled, record, "totalRoundTripTime"),
    available_outgoing_bitrate: optionalNumber(enabled, record, "availableOutgoingBitrate"),
    available_incoming_bitrate: optionalNumber(enabled, record, "availableIncomingBitrate"),
    local_candidate_id: optionalString(enabled, record, "localCandidateId"),
    remote_candidate_id: optionalString(enabled, record, "remoteCandidateId"),
    candidate_pair_state: optionalString(enabled, record, "state"),
    nominated: optionalBoolean(enabled, record, "nominated"),
    selected_candidate_pair_id: optionalString(enabled, record, "selectedCandidatePairId"),
    raw_json: buildRawJson(record),
  };
}

// RTCStats 配列を正規化する
export function normalizeWebrtcStats(
  stats: unknown[],
  sessionDbId: number,
  sessionId: string | null,
  connectionId: string | null,
  channelId: string,
): NormalizedWebrtcStat[] {
  const result: NormalizedWebrtcStat[] = [];
  for (const stat of stats) {
    const normalized = normalizeOneWebrtcStat(
      stat,
      sessionDbId,
      sessionId,
      connectionId,
      channelId,
    );
    if (normalized !== null) {
      result.push(normalized);
    }
  }
  return result;
}

// 容量サンプリング: timestamp_ms 昇順の古い側から 10 件に 1 件残す対象 id を返す
export function selectIdsToDeleteForSampling(
  rows: Array<{ id: number; timestamp_ms: number }>,
  keepNewestCount: number,
): number[] {
  if (rows.length <= keepNewestCount) {
    return [];
  }
  const sorted = [...rows].toSorted((left, right) => {
    if (left.timestamp_ms !== right.timestamp_ms) {
      return left.timestamp_ms - right.timestamp_ms;
    }
    return left.id - right.id;
  });
  const oldCount = sorted.length - keepNewestCount;
  const oldRows = sorted.slice(0, oldCount);
  const toDelete: number[] = [];
  for (let index = 0; index < oldRows.length; index += 1) {
    // 10 件ごとに 1 件残す（index % 10 === 0 を残す）
    if (index % 10 === 0) {
      continue;
    }
    toDelete.push(oldRows[index].id);
  }
  return toDelete;
}
