import type { FunctionComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import UPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import {
  AXIS_STROKE,
  CHART_HEIGHT,
  GRID_STROKE,
  axisCompactNumberLabels,
  axisTimeLabelsJst,
  formatChartUnixSecJst,
} from "@/components/Sessions/chartFormat";
import styles from "@/components/Sessions/StatsChart.module.css";

export interface MetricPoint {
  timestamp_ms: number;
  value: number | null;
}

export interface MetricTimeSeriesChartProps {
  points: MetricPoint[];
  title: string;
  unitLabel: string;
  stroke: string;
  fill: string;
  formatValue: (value: number) => string;
  // 保存値 → 表示値（RTT 秒→ms など）
  toDisplay?: (value: number) => number;
  testId?: string;
}

function hasPlottableValue(points: MetricPoint[]): boolean {
  for (const point of points) {
    if (point.value !== null) {
      return true;
    }
  }
  return false;
}

// 単一系列の汎用時系列チャート（試行用）
export const MetricTimeSeriesChart: FunctionComponent<MetricTimeSeriesChartProps> = ({
  points,
  title,
  unitLabel,
  stroke,
  fill,
  formatValue,
  toDisplay,
  testId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    if (!hasPlottableValue(points)) {
      return;
    }

    const timestampsSec: number[] = [];
    const values: Array<number | null> = [];
    for (const point of points) {
      timestampsSec.push(point.timestamp_ms / 1000);
      if (point.value === null) {
        values.push(null);
      } else if (toDisplay !== undefined) {
        values.push(toDisplay(point.value));
      } else {
        values.push(point.value);
      }
    }

    const width = Math.max(container.clientWidth, 320);
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
            size: 56,
            values: axisCompactNumberLabels,
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
            stroke,
            fill,
            width: 2,
            spanGaps: false,
            points: {
              show: false,
            },
            value: (_uPlot, value) => {
              if (!Number.isFinite(value)) {
                return "—";
              }
              return formatValue(value);
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
  }, [points, title, stroke, fill, unitLabel, formatValue, toDisplay]);

  const resolvedTestId = testId ?? "metric-timeseries-chart";

  if (!hasPlottableValue(points)) {
    return (
      <div className="rounded border border-bs-light bg-white p-3" data-testid={resolvedTestId}>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-bs-body">{title}</h4>
          <span className="text-xs text-bs-secondary">{unitLabel}</span>
        </div>
        <p className="text-sm text-bs-secondary">表示できる時系列データがありません</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-bs-light bg-white p-3" data-testid={resolvedTestId}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-bs-body">{title}</h4>
        <span className="text-xs text-bs-secondary">{unitLabel}</span>
      </div>
      <div
        ref={containerRef}
        className={styles.chart}
        role="img"
        aria-label={`${title}（単位: ${unitLabel}）`}
      />
    </div>
  );
};
