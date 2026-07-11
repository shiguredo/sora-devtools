// 生データグラフ用の時系列整形（純粋関数）

export interface RawSeriesPoint {
  timestamp_ms: number;
  stats_id: string;
  value: number;
}

export interface AlignedRawSeries {
  // Unix 秒（uPlot time スケール用）
  timestampsSec: number[];
  // stats_id ごとの系列（欠測は null）
  series: Array<{ statsId: string; values: Array<number | null> }>;
}

const MAX_SERIES = 8;

// 複数 stats_id を uPlot 向けに時刻整列する（系列数は上限あり）
export function alignRawSeriesPoints(points: RawSeriesPoint[]): AlignedRawSeries {
  if (points.length === 0) {
    return { timestampsSec: [], series: [] };
  }

  const counts = new Map<string, number>();
  for (const point of points) {
    counts.set(point.stats_id, (counts.get(point.stats_id) ?? 0) + 1);
  }
  const rankedIds = [...counts.entries()]
    .toSorted((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return left[0].localeCompare(right[0]);
    })
    .slice(0, MAX_SERIES)
    .map(([statsId]) => statsId);
  const allowed = new Set(rankedIds);

  const timestamps: number[] = [];
  const seenTs = new Set<number>();
  const byId = new Map<string, Map<number, number>>();
  for (const statsId of rankedIds) {
    byId.set(statsId, new Map());
  }

  for (const point of points) {
    if (!allowed.has(point.stats_id)) {
      continue;
    }
    if (!seenTs.has(point.timestamp_ms)) {
      seenTs.add(point.timestamp_ms);
      timestamps.push(point.timestamp_ms);
    }
    byId.get(point.stats_id)?.set(point.timestamp_ms, point.value);
  }
  timestamps.sort((a, b) => a - b);

  const timestampsSec = timestamps.map((timestampMs) => timestampMs / 1000);
  const series = rankedIds.map((statsId) => {
    const valuesByTs = byId.get(statsId) ?? new Map<number, number>();
    const values = timestamps.map((timestampMs) => {
      const value = valuesByTs.get(timestampMs);
      if (value === undefined) {
        return null;
      }
      return value;
    });
    return { statsId, values };
  });

  return { timestampsSec, series };
}

export function maxRawSeriesCount(): number {
  return MAX_SERIES;
}
