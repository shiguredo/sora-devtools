// webrtc_stats の集計・時系列を純粋関数で計算する
// ストリーム識別は stats_id のみ（第 1 段階）

export interface StatsSourceRow {
  id: number;
  timestamp_ms: number;
  stats_type: string;
  stats_id: string;
  packets_received: number | null;
  packets_lost: number | null;
  packets_sent: number | null;
  bytes_received: number | null;
  bytes_sent: number | null;
  round_trip_time: number | null;
}

export interface StatsAggregates {
  packets_received: number | null;
  packets_sent: number | null;
  packet_loss_rate: number | null;
  rtt_min: number | null;
  rtt_max: number | null;
  rtt_avg: number | null;
  bitrate_send_bps: number | null;
  bitrate_recv_bps: number | null;
}

export interface StatsTimeseriesPoint {
  timestamp_ms: number;
  bitrate_send_bps: number | null;
  bitrate_recv_bps: number | null;
  round_trip_time: number | null;
}

// timestamp_ms 昇順・同値なら id 昇順で比較する
function compareByTimeThenId(
  a: { timestamp_ms: number; id: number },
  b: { timestamp_ms: number; id: number },
): number {
  if (a.timestamp_ms !== b.timestamp_ms) {
    return a.timestamp_ms - b.timestamp_ms;
  }
  return a.id - b.id;
}

// stats_id 単位の最新行を取る（timestamp_ms 最大、同値なら id 最大）
function latestRowPerStatsId(rows: StatsSourceRow[]): Map<string, StatsSourceRow> {
  const latest = new Map<string, StatsSourceRow>();
  for (const row of rows) {
    const existing = latest.get(row.stats_id);
    if (existing === undefined) {
      latest.set(row.stats_id, row);
      continue;
    }
    if (compareByTimeThenId(existing, row) < 0) {
      latest.set(row.stats_id, row);
    }
  }
  return latest;
}

function sumNullable(values: Array<number | null>): number | null {
  let total = 0;
  let hasValue = false;
  for (const value of values) {
    if (value === null) {
      continue;
    }
    total += value;
    hasValue = true;
  }
  if (!hasValue) {
    return null;
  }
  return total;
}

function averageNullable(values: Array<number | null>): number | null {
  let total = 0;
  let count = 0;
  for (const value of values) {
    if (value === null) {
      continue;
    }
    total += value;
    count += 1;
  }
  if (count === 0) {
    return null;
  }
  return total / count;
}

function minNullable(values: Array<number | null>): number | null {
  let min: number | null = null;
  for (const value of values) {
    if (value === null) {
      continue;
    }
    if (min === null || value < min) {
      min = value;
    }
  }
  return min;
}

function maxNullable(values: Array<number | null>): number | null {
  let max: number | null = null;
  for (const value of values) {
    if (value === null) {
      continue;
    }
    if (max === null || value > max) {
      max = value;
    }
  }
  return max;
}

function groupRowsByStatsId(rows: StatsSourceRow[]): Map<string, StatsSourceRow[]> {
  const byStatsId = new Map<string, StatsSourceRow[]>();
  for (const row of rows) {
    const list = byStatsId.get(row.stats_id);
    if (list === undefined) {
      byStatsId.set(row.stats_id, [row]);
    } else {
      list.push(row);
    }
  }
  return byStatsId;
}

// 隣接サンプルから正のビットレート (bps) を計算する。計算不能なら null
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

function positiveRatesForStatsId(
  sorted: StatsSourceRow[],
  bytesKey: "bytes_sent" | "bytes_received",
): number[] {
  const positiveRates: number[] = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const prev = sorted[index - 1];
    const curr = sorted[index];
    const rate = positiveBitrateBps(
      prev[bytesKey],
      curr[bytesKey],
      curr.timestamp_ms - prev.timestamp_ms,
    );
    if (rate !== null) {
      positiveRates.push(rate);
    }
  }
  return positiveRates;
}

// stats_id 単位で bytes 差分 ÷ 時間差（秒）の正の値だけ平均する
function averagePositiveBitrateBps(
  rows: StatsSourceRow[],
  bytesKey: "bytes_sent" | "bytes_received",
): number | null {
  const byStatsId = groupRowsByStatsId(rows);
  const positiveRates: number[] = [];
  for (const list of byStatsId.values()) {
    const sorted = [...list].toSorted(compareByTimeThenId);
    for (const rate of positiveRatesForStatsId(sorted, bytesKey)) {
      positiveRates.push(rate);
    }
  }
  if (positiveRates.length === 0) {
    return null;
  }
  let total = 0;
  for (const rate of positiveRates) {
    total += rate;
  }
  return total / positiveRates.length;
}

function computePacketLossRate(
  packetsReceived: number | null,
  packetsLost: number | null,
): number | null {
  if (packetsReceived === null && packetsLost === null) {
    return null;
  }
  const received = packetsReceived ?? 0;
  const lost = packetsLost ?? 0;
  const denominator = received + lost;
  if (denominator === 0) {
    return null;
  }
  return lost / denominator;
}

// 集計値を算出する（行が無ければ各フィールド null）
export function computeStatsAggregates(rows: StatsSourceRow[]): StatsAggregates {
  const inbound = rows.filter((row) => row.stats_type === "inbound-rtp");
  const outbound = rows.filter((row) => row.stats_type === "outbound-rtp");
  const candidatePairs = rows.filter((row) => row.stats_type === "candidate-pair");

  const latestInbound = [...latestRowPerStatsId(inbound).values()];
  const latestOutbound = [...latestRowPerStatsId(outbound).values()];
  const latestPairs = [...latestRowPerStatsId(candidatePairs).values()];

  const packetsReceived = sumNullable(latestInbound.map((row) => row.packets_received));
  const packetsLost = sumNullable(latestInbound.map((row) => row.packets_lost));
  const packetsSent = sumNullable(latestOutbound.map((row) => row.packets_sent));
  const rttValues = latestPairs.map((row) => row.round_trip_time);

  return {
    packets_received: packetsReceived,
    packets_sent: packetsSent,
    packet_loss_rate: computePacketLossRate(packetsReceived, packetsLost),
    rtt_min: minNullable(rttValues),
    rtt_max: maxNullable(rttValues),
    rtt_avg: averageNullable(rttValues),
    bitrate_send_bps: averagePositiveBitrateBps(outbound, "bytes_sent"),
    bitrate_recv_bps: averagePositiveBitrateBps(inbound, "bytes_received"),
  };
}

interface StreamSample {
  stats_id: string;
  timestamp_ms: number;
  id: number;
  bitrate_send_bps: number | null;
  bitrate_recv_bps: number | null;
  round_trip_time: number | null;
}

function sampleBitratesFromAdjacent(
  prev: StatsSourceRow,
  curr: StatsSourceRow,
): { bitrate_send_bps: number | null; bitrate_recv_bps: number | null } {
  const deltaMs = curr.timestamp_ms - prev.timestamp_ms;
  let bitrateSend: number | null = null;
  let bitrateRecv: number | null = null;
  if (curr.stats_type === "outbound-rtp") {
    bitrateSend = positiveBitrateBps(prev.bytes_sent, curr.bytes_sent, deltaMs);
  }
  if (curr.stats_type === "inbound-rtp") {
    bitrateRecv = positiveBitrateBps(prev.bytes_received, curr.bytes_received, deltaMs);
  }
  return { bitrate_send_bps: bitrateSend, bitrate_recv_bps: bitrateRecv };
}

// stats_id 単位の差分ビットレートと RTT サンプルを作る
function buildStreamSamples(rows: StatsSourceRow[]): StreamSample[] {
  const byStatsId = groupRowsByStatsId(rows);
  const samples: StreamSample[] = [];
  for (const list of byStatsId.values()) {
    const sorted = [...list].toSorted(compareByTimeThenId);
    for (const [index, curr] of sorted.entries()) {
      let bitrateSend: number | null = null;
      let bitrateRecv: number | null = null;
      if (index > 0) {
        const prev = sorted[index - 1];
        const bitrates = sampleBitratesFromAdjacent(prev, curr);
        bitrateSend = bitrates.bitrate_send_bps;
        bitrateRecv = bitrates.bitrate_recv_bps;
      }
      let rtt: number | null = null;
      if (curr.stats_type === "candidate-pair") {
        rtt = curr.round_trip_time;
      }
      samples.push({
        stats_id: curr.stats_id,
        timestamp_ms: curr.timestamp_ms,
        id: curr.id,
        bitrate_send_bps: bitrateSend,
        bitrate_recv_bps: bitrateRecv,
        round_trip_time: rtt,
      });
    }
  }
  return samples;
}

// バケット内で stats_id 単位の last を取り、bitrate は合算・RTT は平均する
function foldBucketSamples(samples: StreamSample[]): {
  bitrate_send_bps: number | null;
  bitrate_recv_bps: number | null;
  round_trip_time: number | null;
} {
  // stats_id ごとに last（timestamp_ms 最大、同値なら id 最大）を選ぶ
  const lastPerStatsId = new Map<string, StreamSample>();
  for (const sample of samples) {
    const existing = lastPerStatsId.get(sample.stats_id);
    if (existing === undefined) {
      lastPerStatsId.set(sample.stats_id, sample);
      continue;
    }
    if (compareByTimeThenId(existing, sample) < 0) {
      lastPerStatsId.set(sample.stats_id, sample);
    }
  }
  const lastSamples = [...lastPerStatsId.values()];
  return {
    bitrate_send_bps: sumNullable(lastSamples.map((sample) => sample.bitrate_send_bps)),
    bitrate_recv_bps: sumNullable(lastSamples.map((sample) => sample.bitrate_recv_bps)),
    round_trip_time: averageNullable(lastSamples.map((sample) => sample.round_trip_time)),
  };
}

// 時系列サンプリング。intervalSec は呼び出し側で 1 / 10 / 60 に限定する
export function computeStatsTimeseries(
  rows: StatsSourceRow[],
  intervalSec: number,
): StatsTimeseriesPoint[] {
  if (rows.length === 0) {
    return [];
  }
  const intervalMs = intervalSec * 1000;
  const samples = buildStreamSamples(rows);
  const buckets = new Map<number, StreamSample[]>();
  for (const sample of samples) {
    const bucket = Math.floor(sample.timestamp_ms / intervalMs);
    const list = buckets.get(bucket);
    if (list === undefined) {
      buckets.set(bucket, [sample]);
    } else {
      list.push(sample);
    }
  }

  const bucketKeys = [...buckets.keys()].toSorted((a, b) => a - b);
  const points: StatsTimeseriesPoint[] = [];
  for (const bucket of bucketKeys) {
    const list = buckets.get(bucket);
    if (list === undefined || list.length === 0) {
      continue;
    }
    const folded = foldBucketSamples(list);
    points.push({
      timestamp_ms: bucket * intervalMs,
      bitrate_send_bps: folded.bitrate_send_bps,
      bitrate_recv_bps: folded.bitrate_recv_bps,
      round_trip_time: folded.round_trip_time,
    });
  }
  return points;
}
