// stats_id 単位のストリーム要約・差分時系列（試行用の純粋関数）

export interface StreamSourceRow {
  id: number;
  timestamp_ms: number;
  stats_type: string;
  stats_id: string;
  kind: string | null;
  packets_received: number | null;
  packets_sent: number | null;
  bytes_received: number | null;
  bytes_sent: number | null;
  round_trip_time: number | null;
}

export type StatsStreamType = "outbound-rtp" | "inbound-rtp" | "candidate-pair";

export interface StatsStreamSummary {
  stats_type: StatsStreamType;
  stats_id: string;
  kind: string | null;
  sample_count: number;
  // 直近付近の要約（差分から算出。無ければ null）
  last_bitrate_bps: number | null;
  last_packet_rate_pps: number | null;
  last_round_trip_time: number | null;
}

export interface StatsStreamTimeseriesPoint {
  timestamp_ms: number;
  bitrate_bps: number | null;
  packet_rate_pps: number | null;
  round_trip_time: number | null;
}

const STREAM_TYPES = new Set<string>(["outbound-rtp", "inbound-rtp", "candidate-pair"]);

function compareByTimeThenId(
  a: { timestamp_ms: number; id: number },
  b: { timestamp_ms: number; id: number },
): number {
  if (a.timestamp_ms !== b.timestamp_ms) {
    return a.timestamp_ms - b.timestamp_ms;
  }
  return a.id - b.id;
}

function isStreamType(value: string): value is StatsStreamType {
  return STREAM_TYPES.has(value);
}

function positiveBitrateBps(
  prevBytes: number | null,
  currBytes: number | null,
  deltaMs: number,
): number | null {
  if (prevBytes === null || currBytes === null || deltaMs <= 0) {
    return null;
  }
  const deltaBytes = currBytes - prevBytes;
  if (deltaBytes <= 0) {
    return null;
  }
  return (deltaBytes * 8 * 1000) / deltaMs;
}

function positivePacketRatePps(
  prevPackets: number | null,
  currPackets: number | null,
  deltaMs: number,
): number | null {
  if (prevPackets === null || currPackets === null || deltaMs <= 0) {
    return null;
  }
  const deltaPackets = currPackets - prevPackets;
  if (deltaPackets <= 0) {
    return null;
  }
  return (deltaPackets * 1000) / deltaMs;
}

function groupByStatsId(rows: StreamSourceRow[]): Map<string, StreamSourceRow[]> {
  const byStatsId = new Map<string, StreamSourceRow[]>();
  for (const row of rows) {
    if (!isStreamType(row.stats_type) || row.stats_id === "") {
      continue;
    }
    const list = byStatsId.get(row.stats_id);
    if (list === undefined) {
      byStatsId.set(row.stats_id, [row]);
    } else {
      list.push(row);
    }
  }
  return byStatsId;
}

function lastNonNull(values: Array<number | null>): number | null {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (value !== null) {
      return value;
    }
  }
  return null;
}

// 対象ストリーム種別の一覧要約を作る
export function listStatsStreams(rows: StreamSourceRow[]): StatsStreamSummary[] {
  const byStatsId = groupByStatsId(rows);
  const summaries: StatsStreamSummary[] = [];

  for (const [statsId, list] of byStatsId.entries()) {
    if (list.length === 0) {
      continue;
    }
    const sorted = [...list].toSorted(compareByTimeThenId);
    const [first] = sorted;
    if (!isStreamType(first.stats_type)) {
      continue;
    }
    const points = computeStreamTimeseries(sorted);
    let kind: string | null = null;
    for (const row of sorted) {
      const { kind: rowKind } = row;
      if (rowKind !== null && rowKind !== "") {
        kind = rowKind;
      }
    }
    summaries.push({
      stats_type: first.stats_type,
      stats_id: statsId,
      kind,
      sample_count: sorted.length,
      last_bitrate_bps: lastNonNull(points.map((point) => point.bitrate_bps)),
      last_packet_rate_pps: lastNonNull(points.map((point) => point.packet_rate_pps)),
      last_round_trip_time: lastNonNull(points.map((point) => point.round_trip_time)),
    });
  }

  return summaries.toSorted((left, right) => {
    if (left.stats_type !== right.stats_type) {
      return left.stats_type.localeCompare(right.stats_type);
    }
    return left.stats_id.localeCompare(right.stats_id);
  });
}

// 1 ストリーム分の差分時系列（先頭サンプルは差分不能なので bitrate/packet は null）
export function computeStreamTimeseries(rows: StreamSourceRow[]): StatsStreamTimeseriesPoint[] {
  if (rows.length === 0) {
    return [];
  }
  const sorted = [...rows].toSorted(compareByTimeThenId);
  const points: StatsStreamTimeseriesPoint[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const curr = sorted[index];
    let bitrate: number | null = null;
    let packetRate: number | null = null;
    if (index > 0) {
      const prev = sorted[index - 1];
      const deltaMs = curr.timestamp_ms - prev.timestamp_ms;
      if (curr.stats_type === "outbound-rtp") {
        bitrate = positiveBitrateBps(prev.bytes_sent, curr.bytes_sent, deltaMs);
        packetRate = positivePacketRatePps(prev.packets_sent, curr.packets_sent, deltaMs);
      } else if (curr.stats_type === "inbound-rtp") {
        bitrate = positiveBitrateBps(prev.bytes_received, curr.bytes_received, deltaMs);
        packetRate = positivePacketRatePps(prev.packets_received, curr.packets_received, deltaMs);
      }
    }
    let rtt: number | null = null;
    if (curr.stats_type === "candidate-pair") {
      rtt = curr.round_trip_time;
    }
    points.push({
      timestamp_ms: curr.timestamp_ms,
      bitrate_bps: bitrate,
      packet_rate_pps: packetRate,
      round_trip_time: rtt,
    });
  }
  return points;
}

// 指定 stats_id の行だけに絞って時系列化する
export function computeStreamTimeseriesForId(
  rows: StreamSourceRow[],
  statsId: string,
): StatsStreamTimeseriesPoint[] {
  const filtered = rows.filter((row) => row.stats_id === statsId);
  return computeStreamTimeseries(filtered);
}
