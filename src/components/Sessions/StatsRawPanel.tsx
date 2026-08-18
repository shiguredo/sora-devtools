import { useEffect, useState } from "preact/hooks";

import {
  formatBitrate,
  formatByteCount,
  formatChartUnixSecJst,
  formatCount,
  formatRttMs,
} from "@/components/Sessions/chartFormat";
import { MetricTimeSeriesChart } from "@/components/Sessions/MetricTimeSeriesChart";
import { queryStatsPage, queryStatsStreamTimeseries, queryStatsStreams } from "@/sessionDatabase";
import type {
  StatsPageResult,
  StatsStreamSummary,
  StatsStreamTimeseriesPoint,
} from "@/sessionDatabase";

export interface StatsRawPanelProps {
  sessionDbId: number;
}

function displayOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function formatTableNumber(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return formatCount(value);
}

function formatTableBytes(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return formatByteCount(value);
}

function formatTableRtt(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return formatRttMs(value * 1000);
}

function formatPacketRate(pps: number): string {
  if (pps >= 100) {
    return `${Math.round(pps)} pps`;
  }
  return `${pps.toFixed(1)} pps`;
}

function rttSecondsToMs(value: number): number {
  return value * 1000;
}

function streamTypeLabel(statsType: string): string {
  if (statsType === "outbound-rtp") {
    return "送信";
  }
  if (statsType === "inbound-rtp") {
    return "受信";
  }
  if (statsType === "candidate-pair") {
    return "RTT";
  }
  return statsType;
}

function shortStatsId(statsId: string): string {
  if (statsId.length <= 28) {
    return statsId;
  }
  return `${statsId.slice(0, 12)}…${statsId.slice(-10)}`;
}

function pickDefaultStream(streams: StatsStreamSummary[]): StatsStreamSummary | null {
  if (streams.length === 0) {
    return null;
  }
  const preferredOrder = ["outbound-rtp", "inbound-rtp", "candidate-pair"];
  for (const preferred of preferredOrder) {
    for (const stream of streams) {
      if (stream.stats_type === preferred) {
        return stream;
      }
    }
  }
  return streams[0] ?? null;
}

// ストリーム選択 → 差分メトリクスグラフ → 折りたたみ生テーブル（試行 UI）
export function StatsRawPanel({ sessionDbId }: StatsRawPanelProps) {
  const [streams, setStreams] = useState<StatsStreamSummary[]>([]);
  const [selectedStatsId, setSelectedStatsId] = useState("");
  const [timeseries, setTimeseries] = useState<StatsStreamTimeseriesPoint[]>([]);
  const [page, setPage] = useState<StatsPageResult>({ rows: [], totalCount: 0 });
  const [pageOffset, setPageOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pageLimit = 50;

  const selected = streams.find((stream) => stream.stats_id === selectedStatsId) ?? null;

  // ストリーム一覧
  useEffect(() => {
    const active = { cancelled: false };
    setLoading(true);
    setErrorMessage(null);
    void (async () => {
      try {
        const listed = await queryStatsStreams(sessionDbId);
        if (active.cancelled) {
          return;
        }
        setStreams(listed);
        const initial = pickDefaultStream(listed);
        setSelectedStatsId(initial?.stats_id ?? "");
        setPageOffset(0);
        setLoading(false);
      } catch (error) {
        if (active.cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to list stats streams";
        console.warn(`Stats streams load failed: ${message}`);
        setErrorMessage(message);
        setLoading(false);
      }
    })();
    return () => {
      active.cancelled = true;
    };
  }, [sessionDbId]);

  // 選択ストリームの時系列 + 生テーブル
  useEffect(() => {
    if (selectedStatsId === "") {
      setTimeseries([]);
      setPage({ rows: [], totalCount: 0 });
      return;
    }
    const active = { cancelled: false };
    setLoading(true);
    setErrorMessage(null);
    void (async () => {
      try {
        const [series, pageResult] = await Promise.all([
          queryStatsStreamTimeseries(sessionDbId, selectedStatsId),
          queryStatsPage(sessionDbId, {
            limit: pageLimit,
            offset: pageOffset,
            statsId: selectedStatsId,
          }),
        ]);
        if (active.cancelled) {
          return;
        }
        setTimeseries(series);
        setPage(pageResult);
        setLoading(false);
      } catch (error) {
        if (active.cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to load stream stats";
        console.warn(`Stats stream detail load failed: ${message}`);
        setErrorMessage(message);
        setLoading(false);
      }
    })();
    return () => {
      active.cancelled = true;
    };
  }, [sessionDbId, selectedStatsId, pageOffset]);

  const maxOffset = Math.max(0, page.totalCount - pageLimit);
  const showBitrate =
    selected?.stats_type === "outbound-rtp" || selected?.stats_type === "inbound-rtp";
  const showPacketRate = showBitrate;
  const showRtt = selected?.stats_type === "candidate-pair";

  return (
    <section className="mt-4" data-testid="stats-raw-panel">
      <div className="mb-3">
        <h3 className="text-base font-semibold">ストリーム詳細</h3>
        <p className="mt-0.5 text-xs text-bs-secondary">
          stats_id を選ぶと、累積値ではなく差分から求めたビットレート / パケットレート / RTT
          を表示します（試行中）
        </p>
      </div>

      {errorMessage !== null ? (
        <p className="mb-2 text-sm text-red-700" data-testid="raw-stats-error">
          {errorMessage}
        </p>
      ) : null}
      {loading ? (
        <p className="mb-2 text-sm text-bs-secondary" data-testid="raw-stats-loading">
          読み込み中…
        </p>
      ) : null}

      {streams.length === 0 && !loading ? (
        <p className="text-sm text-bs-secondary" data-testid="stats-streams-empty">
          表示できるストリームがありません
        </p>
      ) : (
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,320px)_1fr]">
          <div
            className="max-h-96 overflow-auto rounded border border-bs-light"
            data-testid="stats-stream-list"
          >
            <ul className="divide-y divide-bs-light">
              {streams.map((stream) => {
                const active = stream.stats_id === selectedStatsId;
                const summaryParts: string[] = [];
                if (stream.kind !== null) {
                  summaryParts.push(stream.kind);
                }
                if (stream.last_bitrate_bps !== null) {
                  summaryParts.push(formatBitrate(stream.last_bitrate_bps));
                }
                if (stream.last_packet_rate_pps !== null) {
                  summaryParts.push(formatPacketRate(stream.last_packet_rate_pps));
                }
                if (stream.last_round_trip_time !== null) {
                  summaryParts.push(formatRttMs(stream.last_round_trip_time * 1000));
                }
                summaryParts.push(`${String(stream.sample_count)} samples`);
                return (
                  <li key={`${stream.stats_type}:${stream.stats_id}`}>
                    <button
                      type="button"
                      className={
                        active
                          ? "w-full bg-[#e7f1ff] px-3 py-2 text-left"
                          : "w-full bg-white px-3 py-2 text-left hover:bg-[#f8f9fa]"
                      }
                      data-testid="stats-stream-item"
                      data-stats-id={stream.stats_id}
                      aria-pressed={active}
                      onClick={() => {
                        setSelectedStatsId(stream.stats_id);
                        setPageOffset(0);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-bs-light px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-bs-secondary uppercase">
                          {streamTypeLabel(stream.stats_type)}
                        </span>
                        <span
                          className="truncate font-mono text-xs text-bs-body"
                          title={stream.stats_id}
                        >
                          {shortStatsId(stream.stats_id)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-bs-secondary">{summaryParts.join(" · ")}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col gap-3" data-testid="stats-stream-detail">
            {selected === null ? (
              <p className="text-sm text-bs-secondary">ストリームを選択してください</p>
            ) : (
              <>
                <div className="rounded border border-bs-light bg-white p-3">
                  <p className="text-xs text-bs-secondary">選択中</p>
                  <p className="font-mono text-sm break-all">{selected.stats_id}</p>
                  <p className="mt-1 text-xs text-bs-secondary">
                    {streamTypeLabel(selected.stats_type)}
                    {selected.kind !== null ? ` / ${selected.kind}` : ""}
                    {` / ${String(selected.sample_count)} samples`}
                  </p>
                </div>
                {showBitrate ? (
                  <MetricTimeSeriesChart
                    points={timeseries.map((point) => ({
                      timestamp_ms: point.timestamp_ms,
                      value: point.bitrate_bps,
                    }))}
                    title="ビットレート（差分）"
                    unitLabel="kbps / Mbps"
                    stroke="#0d6efd"
                    fill="rgba(13, 110, 253, 0.12)"
                    formatValue={formatBitrate}
                    testId="stream-chart-bitrate"
                  />
                ) : null}
                {showPacketRate ? (
                  <MetricTimeSeriesChart
                    points={timeseries.map((point) => ({
                      timestamp_ms: point.timestamp_ms,
                      value: point.packet_rate_pps,
                    }))}
                    title="パケットレート（差分）"
                    unitLabel="pps"
                    stroke="#198754"
                    fill="rgba(25, 135, 84, 0.12)"
                    formatValue={formatPacketRate}
                    testId="stream-chart-packet-rate"
                  />
                ) : null}
                {showRtt ? (
                  <MetricTimeSeriesChart
                    points={timeseries.map((point) => ({
                      timestamp_ms: point.timestamp_ms,
                      value: point.round_trip_time,
                    }))}
                    title="RTT"
                    unitLabel="ms"
                    stroke="#fd7e14"
                    fill="rgba(253, 126, 20, 0.12)"
                    formatValue={formatRttMs}
                    toDisplay={rttSecondsToMs}
                    testId="stream-chart-rtt"
                  />
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      <details
        className="rounded border border-bs-light bg-white p-3"
        data-testid="stats-raw-details"
      >
        <summary className="cursor-pointer text-sm font-semibold text-bs-body">
          生データテーブル（デバッグ用）
        </summary>
        <div className="mt-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-bs-secondary" data-testid="stats-page-count">
              {selectedStatsId === ""
                ? "0 件"
                : `全 ${String(page.totalCount)} 件（${String(pageOffset + 1)}–${String(Math.min(pageOffset + page.rows.length, page.totalCount))} 件目）`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded border border-bs-secondary px-2 py-1 text-sm disabled:opacity-50"
                disabled={pageOffset <= 0}
                data-testid="stats-page-prev"
                onClick={() => {
                  setPageOffset(Math.max(0, pageOffset - pageLimit));
                }}
              >
                前へ
              </button>
              <button
                type="button"
                className="rounded border border-bs-secondary px-2 py-1 text-sm disabled:opacity-50"
                disabled={pageOffset >= maxOffset}
                data-testid="stats-page-next"
                onClick={() => {
                  setPageOffset(Math.min(maxOffset, pageOffset + pageLimit));
                }}
              >
                次へ
              </button>
            </div>
          </div>
          <StatsRawTable page={page} />
        </div>
      </details>
    </section>
  );
}

function StatsRawTable({ page }: { page: StatsPageResult }) {
  if (page.rows.length === 0) {
    return (
      <p className="text-sm text-bs-secondary" data-testid="stats-raw-empty">
        生データはありません
      </p>
    );
  }

  let showPacketsReceived = false;
  let showPacketsSent = false;
  let showBytesReceived = false;
  let showBytesSent = false;
  let showRtt = false;
  let showKind = false;
  for (const row of page.rows) {
    if (row.packets_received !== null) {
      showPacketsReceived = true;
    }
    if (row.packets_sent !== null) {
      showPacketsSent = true;
    }
    if (row.bytes_received !== null) {
      showBytesReceived = true;
    }
    if (row.bytes_sent !== null) {
      showBytesSent = true;
    }
    if (row.round_trip_time !== null) {
      showRtt = true;
    }
    if (row.kind !== null && row.kind !== "") {
      showKind = true;
    }
  }

  return (
    <div
      className="max-h-80 overflow-auto rounded border border-bs-light"
      data-testid="stats-raw-table"
    >
      <table className="w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-bs-light">
          <tr className="border-b border-bs-secondary">
            <th className="px-2 py-1.5 font-semibold">時刻 (JST)</th>
            <th className="px-2 py-1.5 font-semibold">stats_type</th>
            {showKind ? <th className="px-2 py-1.5 font-semibold">kind</th> : null}
            {showPacketsReceived ? (
              <th className="px-2 py-1.5 text-right font-semibold">pkt recv</th>
            ) : null}
            {showPacketsSent ? (
              <th className="px-2 py-1.5 text-right font-semibold">pkt sent</th>
            ) : null}
            {showBytesReceived ? (
              <th className="px-2 py-1.5 text-right font-semibold">bytes recv</th>
            ) : null}
            {showBytesSent ? (
              <th className="px-2 py-1.5 text-right font-semibold">bytes sent</th>
            ) : null}
            {showRtt ? <th className="px-2 py-1.5 text-right font-semibold">RTT</th> : null}
          </tr>
        </thead>
        <tbody>
          {page.rows.map((row, index) => {
            const rowClass =
              index % 2 === 0
                ? "border-b border-bs-light bg-white"
                : "border-b border-bs-light bg-[#f8f9fa]";
            return (
              <tr key={row.id} className={rowClass}>
                <td className="px-2 py-1 font-mono tabular-nums">
                  {formatChartUnixSecJst(row.timestamp_ms / 1000, true)}
                </td>
                <td className="px-2 py-1">{displayOrDash(row.stats_type)}</td>
                {showKind ? <td className="px-2 py-1">{displayOrDash(row.kind)}</td> : null}
                {showPacketsReceived ? (
                  <td className="px-2 py-1 text-right font-mono tabular-nums">
                    {formatTableNumber(row.packets_received)}
                  </td>
                ) : null}
                {showPacketsSent ? (
                  <td className="px-2 py-1 text-right font-mono tabular-nums">
                    {formatTableNumber(row.packets_sent)}
                  </td>
                ) : null}
                {showBytesReceived ? (
                  <td className="px-2 py-1 text-right font-mono tabular-nums">
                    {formatTableBytes(row.bytes_received)}
                  </td>
                ) : null}
                {showBytesSent ? (
                  <td className="px-2 py-1 text-right font-mono tabular-nums">
                    {formatTableBytes(row.bytes_sent)}
                  </td>
                ) : null}
                {showRtt ? (
                  <td className="px-2 py-1 text-right font-mono tabular-nums">
                    {formatTableRtt(row.round_trip_time)}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
