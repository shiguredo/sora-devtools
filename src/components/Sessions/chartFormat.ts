// チャート共通の表示整形

const JST_TIME_ZONE = "Asia/Tokyo";

const jstTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JST_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JST_TIME_ZONE,
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const jstDateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: JST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// 経過秒を 0:00 / 1:05 / 1:02:03 形式にする（テーブル等の相対表示用）
export function formatElapsed(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${String(hours)}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(minutes)}:${String(secs).padStart(2, "0")}`;
}

// Unix 秒を JST の時刻文字列にする
export function formatChartUnixSecJst(unixSec: number, includeDate: boolean): string {
  const date = new Date(unixSec * 1000);
  if (includeDate) {
    return jstDateTimeFormatter.format(date);
  }
  return jstTimeFormatter.format(date);
}

function jstDateKey(unixSec: number): string {
  return jstDateKeyFormatter.format(new Date(unixSec * 1000));
}

function shouldIncludeDateInAxis(splits: number[]): boolean {
  if (splits.length <= 1) {
    return false;
  }
  const firstKey = jstDateKey(splits[0]);
  for (let index = 1; index < splits.length; index += 1) {
    if (jstDateKey(splits[index]) !== firstKey) {
      return true;
    }
  }
  return false;
}

// uPlot 横軸: Unix 秒 → JST
export function axisTimeLabelsJst(_uPlot: unknown, splits: number[]): string[] {
  const includeDate = shouldIncludeDateInAxis(splits);
  return splits.map((value) => formatChartUnixSecJst(value, includeDate));
}

export function formatBitrate(bps: number): string {
  if (bps >= 1_000_000) {
    return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  }
  if (bps >= 1000) {
    return `${(bps / 1000).toFixed(1)} kbps`;
  }
  return `${Math.round(bps)} bps`;
}

export function formatRttMs(ms: number): string {
  if (ms >= 100) {
    return `${Math.round(ms)} ms`;
  }
  return `${ms.toFixed(1)} ms`;
}

export function formatByteCount(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  }
  if (bytes >= 1000) {
    return `${(bytes / 1000).toFixed(1)} KB`;
  }
  return `${Math.round(bytes)} B`;
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("ja-JP");
}

export function axisCompactNumberLabels(_uPlot: unknown, splits: number[]): string[] {
  return splits.map((value) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}G`;
    }
    if (abs >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return String(Math.round(value));
  });
}

export const CHART_HEIGHT = 220;
export const AXIS_STROKE = "#868e96";
export const GRID_STROKE = "#e9ecef";

export const SERIES_COLORS = [
  "#0d6efd",
  "#198754",
  "#fd7e14",
  "#6f42c1",
  "#d63384",
  "#20c997",
  "#0dcaf0",
  "#ffc107",
] as const;
