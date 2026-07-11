import type { FunctionComponent } from "preact";

import type { StatsTimeseriesPoint } from "@/statsQuery";

export interface StatsChartProps {
  points: StatsTimeseriesPoint[];
  metric: "bitrate_send_bps" | "bitrate_recv_bps" | "round_trip_time";
  title: string;
}

function metricValue(
  point: StatsTimeseriesPoint,
  metric: StatsChartProps["metric"],
): number | null {
  if (metric === "bitrate_send_bps") {
    return point.bitrate_send_bps;
  }
  if (metric === "bitrate_recv_bps") {
    return point.bitrate_recv_bps;
  }
  return point.round_trip_time;
}

// チャートライブラリ無しの簡易 SVG スパークライン
export const StatsChart: FunctionComponent<StatsChartProps> = ({ points, metric, title }) => {
  const width = 480;
  const height = 120;
  const padding = 8;

  const values: number[] = [];
  for (const point of points) {
    const value = metricValue(point, metric);
    if (value !== null) {
      values.push(value);
    }
  }

  if (values.length === 0) {
    return (
      <div className="mb-3" data-testid={`stats-chart-${metric}`}>
        <h4 className="mb-1 text-sm font-semibold">{title}</h4>
        <p className="text-sm text-bs-secondary">表示できる時系列データがありません</p>
      </div>
    );
  }

  let min = values[0] ?? 0;
  let max = values[0] ?? 0;
  for (const value of values) {
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  const range = max - min;
  const effectiveRange = range === 0 ? 1 : range;

  const pathParts: string[] = [];
  for (const [index, point] of points.entries()) {
    const value = metricValue(point, metric);
    if (value === null) {
      continue;
    }
    const x =
      padding + (points.length === 1 ? 0 : (index / (points.length - 1)) * (width - padding * 2));
    const y = height - padding - ((value - min) / effectiveRange) * (height - padding * 2);
    if (pathParts.length === 0) {
      pathParts.push(`M ${x} ${y}`);
    } else {
      pathParts.push(`L ${x} ${y}`);
    }
  }

  return (
    <div className="mb-3" data-testid={`stats-chart-${metric}`}>
      <h4 className="mb-1 text-sm font-semibold">{title}</h4>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[480px] rounded border border-bs-light bg-white"
        role="img"
        aria-label={title}
      >
        <path d={pathParts.join(" ")} fill="none" stroke="#0d6efd" strokeWidth="2" />
      </svg>
    </div>
  );
};
