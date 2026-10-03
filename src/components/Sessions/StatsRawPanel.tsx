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

import styles from "./StatsRawPanel.module.css";

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
    <section className={styles.root} data-testid="stats-raw-panel">
      <div className={styles.header}>
        <h3 className={styles.title}>ストリーム詳細</h3>
        <p className={styles.description}>
          stats_id を選ぶと、累積値ではなく差分から求めたビットレート / パケットレート / RTT
          を表示します（試行中）
        </p>
      </div>

      {errorMessage !== null ? (
        <p className={styles.error} data-testid="raw-stats-error">
          {errorMessage}
        </p>
      ) : null}
      {loading ? (
        <p className={styles.loading} data-testid="raw-stats-loading">
          読み込み中…
        </p>
      ) : null}

      {streams.length === 0 && !loading ? (
        <p className={styles.empty} data-testid="stats-streams-empty">
          表示できるストリームがありません
        </p>
      ) : (
        <div className={styles.layout}>
          <div className={styles.streamList} data-testid="stats-stream-list">
            <ul className={styles.streamItems}>
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
                          ? `${styles.streamButton} ${styles.streamButtonActive}`
                          : `${styles.streamButton} ${styles.streamButtonInactive}`
                      }
                      data-testid="stats-stream-item"
                      data-stats-id={stream.stats_id}
                      aria-pressed={active}
                      onClick={() => {
                        setSelectedStatsId(stream.stats_id);
                        setPageOffset(0);
                      }}
                    >
                      <div className={styles.streamItemHeader}>
                        <span className={styles.streamType}>
                          {streamTypeLabel(stream.stats_type)}
                        </span>
                        <span className={styles.streamId} title={stream.stats_id}>
                          {shortStatsId(stream.stats_id)}
                        </span>
                      </div>
                      <p className={styles.meta}>{summaryParts.join(" · ")}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.detail} data-testid="stats-stream-detail">
            {selected === null ? (
              <p className={styles.empty}>ストリームを選択してください</p>
            ) : (
              <>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>選択中</p>
                  <p className={styles.selectedStreamId}>{selected.stats_id}</p>
                  <p className={styles.meta}>
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

      <details className={styles.card} data-testid="stats-raw-details">
        <summary className={styles.tableSummary}>生データテーブル（デバッグ用）</summary>
        <div className={styles.tableContent}>
          <div className={styles.tableToolbar}>
            <p className={styles.count} data-testid="stats-page-count">
              {selectedStatsId === ""
                ? "0 件"
                : `全 ${String(page.totalCount)} 件（${String(pageOffset + 1)}–${String(Math.min(pageOffset + page.rows.length, page.totalCount))} 件目）`}
            </p>
            <div className={styles.pageActions}>
              <button
                type="button"
                className={styles.pageButton}
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
                className={styles.pageButton}
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
      <p className={styles.empty} data-testid="stats-raw-empty">
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
    <div className={styles.tableWrapper} data-testid="stats-raw-table">
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr className={styles.headRow}>
            <th className={styles.headCell}>時刻 (JST)</th>
            <th className={styles.headCell}>stats_type</th>
            {showKind ? <th className={styles.headCell}>kind</th> : null}
            {showPacketsReceived ? <th className={styles.headCellRight}>pkt recv</th> : null}
            {showPacketsSent ? <th className={styles.headCellRight}>pkt sent</th> : null}
            {showBytesReceived ? <th className={styles.headCellRight}>bytes recv</th> : null}
            {showBytesSent ? <th className={styles.headCellRight}>bytes sent</th> : null}
            {showRtt ? <th className={styles.headCellRight}>RTT</th> : null}
          </tr>
        </thead>
        <tbody>
          {page.rows.map((row, index) => {
            const rowClass = index % 2 === 0 ? styles.rowEven : styles.rowOdd;
            return (
              <tr key={row.id} className={rowClass}>
                <td className={styles.timeCell}>
                  {formatChartUnixSecJst(row.timestamp_ms / 1000, true)}
                </td>
                <td className={styles.bodyCell}>{displayOrDash(row.stats_type)}</td>
                {showKind ? <td className={styles.bodyCell}>{displayOrDash(row.kind)}</td> : null}
                {showPacketsReceived ? (
                  <td className={styles.numberCell}>{formatTableNumber(row.packets_received)}</td>
                ) : null}
                {showPacketsSent ? (
                  <td className={styles.numberCell}>{formatTableNumber(row.packets_sent)}</td>
                ) : null}
                {showBytesReceived ? (
                  <td className={styles.numberCell}>{formatTableBytes(row.bytes_received)}</td>
                ) : null}
                {showBytesSent ? (
                  <td className={styles.numberCell}>{formatTableBytes(row.bytes_sent)}</td>
                ) : null}
                {showRtt ? (
                  <td className={styles.numberCell}>{formatTableRtt(row.round_trip_time)}</td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
