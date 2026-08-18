import { useEffect, useRef } from "preact/hooks";
import UPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import {
  AXIS_STROKE,
  CHART_HEIGHT,
  GRID_STROKE,
  axisCompactNumberLabels,
  axisTimeLabelsJst,
  formatBitrate,
  formatChartUnixSecJst,
  formatRttMs,
} from "@/components/Sessions/chartFormat";
import styles from "@/components/Sessions/StatsChart.module.css";
import type { StatsTimeseriesPoint } from "@/statsQuery";

export interface StatsChartProps {
  points: StatsTimeseriesPoint[];
  metric: "bitrate_send_bps" | "bitrate_recv_bps" | "round_trip_time";
  title: string;
}

interface MetricStyle {
  stroke: string;
  fill: string;
  unitLabel: string;
  // 保存値から表示値へ（bps→表示用、RTT 秒→ms など）
  toDisplay: (value: number) => number;
  formatValue: (value: number) => string;
}

const METRIC_STYLES: Record<StatsChartProps["metric"], MetricStyle> = {
  bitrate_send_bps: {
    stroke: "#0d6efd",
    fill: "rgba(13, 110, 253, 0.12)",
    unitLabel: "kbps / Mbps",
    toDisplay: (value) => value,
    formatValue: formatBitrate,
  },
  bitrate_recv_bps: {
    stroke: "#198754",
    fill: "rgba(25, 135, 84, 0.12)",
    unitLabel: "kbps / Mbps",
    toDisplay: (value) => value,
    formatValue: formatBitrate,
  },
  round_trip_time: {
    stroke: "#fd7e14",
    fill: "rgba(253, 126, 20, 0.12)",
    unitLabel: "ms",
    // WebRTC の roundTripTime は秒
    toDisplay: (value) => value * 1000,
    formatValue: formatRttMs,
  },
};

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

function hasPlottableValue(
  points: StatsTimeseriesPoint[],
  metric: StatsChartProps["metric"],
): boolean {
  for (const point of points) {
    if (metricValue(point, metric) !== null) {
      return true;
    }
  }
  return false;
}

// uPlot で時系列メトリクスを描画する（横軸は JST の実時刻）
export function StatsChart({ points, metric, title }: StatsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const style = METRIC_STYLES[metric];

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    if (!hasPlottableValue(points, metric)) {
      return;
    }

    const timestampsSec: number[] = [];
    const values: Array<number | null> = [];
    for (const point of points) {
      timestampsSec.push(point.timestamp_ms / 1000);
      const raw = metricValue(point, metric);
      if (raw === null) {
        values.push(null);
      } else {
        values.push(style.toDisplay(raw));
      }
    }

    const width = Math.max(container.clientWidth, 320);
    const yValues =
      metric === "round_trip_time"
        ? {
            values: (_uPlot: UPlot, splits: number[]) =>
              splits.map((value) => `${Math.round(value)}`),
          }
        : {
            values: axisCompactNumberLabels,
          };

    const plot = new UPlot(
      {
        width,
        height: CHART_HEIGHT,
        padding: [8, 12, 0, 8],
        cursor: {
          show: true,
          points: {
            size: 7,
            width: 2,
          },
        },
        legend: {
          show: true,
          live: true,
        },
        scales: {
          x: {
            time: true,
          },
          y: {
            // 下限を 0 に寄せて読みやすくする
            range: (_uPlot, _initMin, initMax) => {
              const paddedMax = !Number.isFinite(initMax) || initMax <= 0 ? 1 : initMax * 1.08;
              return [0, paddedMax];
            },
          },
        },
        axes: [
          {
            stroke: AXIS_STROKE,
            grid: {
              show: true,
              stroke: GRID_STROKE,
              width: 1,
            },
            ticks: {
              stroke: GRID_STROKE,
            },
            values: axisTimeLabelsJst,
            space: 72,
          },
          {
            stroke: AXIS_STROKE,
            grid: {
              show: true,
              stroke: GRID_STROKE,
              width: 1,
            },
            ticks: {
              stroke: GRID_STROKE,
            },
            size: 56,
            ...yValues,
          },
        ],
        series: [
          {
            label: "時刻 (JST)",
            value: (_uPlot, unixSec) => {
              if (!Number.isFinite(unixSec)) {
                return "—";
              }
              return formatChartUnixSecJst(unixSec, true);
            },
          },
          {
            label: title,
            stroke: style.stroke,
            fill: style.fill,
            width: 2,
            spanGaps: false,
            points: {
              show: false,
            },
            value: (_uPlot, value) => {
              if (!Number.isFinite(value)) {
                return "—";
              }
              return style.formatValue(value);
            },
          },
        ],
      },
      [timestampsSec, values],
      container,
    );

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(container.clientWidth, 320);
      if (nextWidth !== plot.width) {
        plot.setSize({ width: nextWidth, height: CHART_HEIGHT });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      plot.destroy();
    };
  }, [points, metric, title, style]);

  if (!hasPlottableValue(points, metric)) {
    return (
      <div
        className="rounded border border-bs-light bg-white p-3"
        data-testid={`stats-chart-${metric}`}
      >
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-bs-body">{title}</h4>
          <span className="text-xs text-bs-secondary">{style.unitLabel}</span>
        </div>
        <p className="text-sm text-bs-secondary">表示できる時系列データがありません</p>
      </div>
    );
  }

  return (
    <div
      className="rounded border border-bs-light bg-white p-3"
      data-testid={`stats-chart-${metric}`}
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-bs-body">{title}</h4>
        <span className="text-xs text-bs-secondary">{style.unitLabel}</span>
      </div>
      <div
        ref={containerRef}
        className={styles.chart}
        role="img"
        aria-label={`${title}（単位: ${style.unitLabel}）`}
      />
    </div>
  );
}
