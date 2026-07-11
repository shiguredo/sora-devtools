import type { FunctionComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import UPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import {
  AXIS_STROKE,
  CHART_HEIGHT,
  GRID_STROKE,
  SERIES_COLORS,
  axisCompactNumberLabels,
  axisTimeLabelsJst,
  formatByteCount,
  formatChartUnixSecJst,
  formatCount,
  formatRttMs,
} from "@/components/Sessions/chartFormat";
import styles from "@/components/Sessions/StatsChart.module.css";
import type { StatsRawMetric, StatsRawSeriesPoint } from "@/sessionDatabase";
import { alignRawSeriesPoints, maxRawSeriesCount } from "@/statsRawSeries";

export interface RawStatsChartProps {
  points: StatsRawSeriesPoint[];
  metric: StatsRawMetric;
  title: string;
}

function toDisplayValue(metric: StatsRawMetric, value: number): number {
  if (metric === "round_trip_time") {
    return value * 1000;
  }
  return value;
}

function formatMetricValue(metric: StatsRawMetric, value: number): string {
  if (metric === "round_trip_time") {
    return formatRttMs(value);
  }
  if (metric === "bytes_sent" || metric === "bytes_received") {
    return formatByteCount(value);
  }
  return formatCount(value);
}

function unitLabel(metric: StatsRawMetric): string {
  if (metric === "round_trip_time") {
    return "ms";
  }
  if (metric === "bytes_sent" || metric === "bytes_received") {
    return "B / KB / MB";
  }
  return "packets";
}

function hasPlottablePoints(points: StatsRawSeriesPoint[]): boolean {
  return points.length > 0;
}

// 生データの stats_id 別時系列を uPlot で描画する
export const RawStatsChart: FunctionComponent<RawStatsChartProps> = ({ points, metric, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const distinctIds = new Set(points.map((point) => point.stats_id)).size;
  const truncated = distinctIds > maxRawSeriesCount();

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    if (!hasPlottablePoints(points)) {
      return;
    }

    const aligned = alignRawSeriesPoints(points);
    if (aligned.series.length === 0 || aligned.timestampsSec.length === 0) {
      return;
    }

    const displaySeries = aligned.series.map((entry) => ({
      statsId: entry.statsId,
      values: entry.values.map((value) => {
        if (value === null) {
          return null;
        }
        return toDisplayValue(metric, value);
      }),
    }));

    const width = Math.max(container.clientWidth, 320);
    const seriesOpts: UPlot.Series[] = [
      {
        label: "時刻 (JST)",
        value: (_uPlot, unixSec) => {
          if (!Number.isFinite(unixSec)) {
            return "—";
          }
          return formatChartUnixSecJst(unixSec, true);
        },
      },
    ];
    for (const [index, entry] of displaySeries.entries()) {
      const color = SERIES_COLORS[index % SERIES_COLORS.length];
      seriesOpts.push({
        label: entry.statsId,
        stroke: color,
        width: 2,
        spanGaps: false,
        points: {
          show: false,
        },
        value: (_uPlot, value) => {
          if (!Number.isFinite(value)) {
            return "—";
          }
          return formatMetricValue(metric, value);
        },
      });
    }

    const data: UPlot.AlignedData = [
      aligned.timestampsSec,
      ...displaySeries.map((entry) => entry.values),
    ];

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
            size: 64,
            values: axisCompactNumberLabels,
          },
        ],
        series: seriesOpts,
      },
      data,
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
  }, [points, metric]);

  if (!hasPlottablePoints(points)) {
    return (
      <div className="rounded border border-bs-light bg-white p-3" data-testid="raw-stats-chart">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-bs-body">{title}</h4>
          <span className="text-xs text-bs-secondary">{unitLabel(metric)}</span>
        </div>
        <p className="text-sm text-bs-secondary">表示できる生データ時系列がありません</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-bs-light bg-white p-3" data-testid="raw-stats-chart">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-bs-body">{title}</h4>
        <span className="text-xs text-bs-secondary">{unitLabel(metric)}</span>
      </div>
      {truncated ? (
        <p className="mb-2 text-xs text-bs-secondary">
          stats_id が多いため上位 {String(maxRawSeriesCount())} 系列のみ表示しています
        </p>
      ) : null}
      <div
        ref={containerRef}
        className={styles.chart}
        role="img"
        aria-label={`${title}（単位: ${unitLabel(metric)}）`}
      />
    </div>
  );
};
