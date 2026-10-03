import { useEffect, useState } from "preact/hooks";

import { SessionDebugMessages } from "@/components/Sessions/SessionDebugMessages";
import { StatsChart } from "@/components/Sessions/StatsChart";
import { StatsRawPanel } from "@/components/Sessions/StatsRawPanel";
import {
  getCurrentSessionDbId,
  getSession,
  queryStatsAggregates,
  queryStatsTimeseries,
  whenReady,
} from "@/sessionDatabase";
import type {
  ConnectionListRow,
  SessionDetail as SessionDetailData,
  StatsAggregates,
  StatsTimeseriesPoint,
} from "@/sessionDatabase";
import { deriveSessionStatus, sessionStatusLabel } from "@/sessionStatus";

import styles from "./SessionDetail.module.css";

export interface SessionDetailProps {
  sessionDbId: number | undefined;
}

function displayOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function formatNullableNumber(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return String(value);
}

// 詳細パネル: メタデータ・connections・stats 集計 / 時系列 / 生データ
export function SessionDetail({ sessionDbId }: SessionDetailProps) {
  const [detail, setDetail] = useState<SessionDetailData | null>(null);
  const [aggregates, setAggregates] = useState<StatsAggregates | null>(null);
  const [timeseries, setTimeseries] = useState<StatsTimeseriesPoint[]>([]);
  const [intervalSec, setIntervalSec] = useState<1 | 10 | 60>(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (sessionDbId === undefined) {
      setDetail(null);
      setAggregates(null);
      setTimeseries([]);
      setErrorMessage(null);
      return;
    }

    const active = { cancelled: false };
    setLoading(true);
    setErrorMessage(null);

    void (async () => {
      try {
        // 未初期化のまま getSession すると null になり「見つかりません」と誤表示される
        await whenReady();
        if (active.cancelled) {
          return;
        }
        const loaded = await getSession(sessionDbId);
        // oxlint-disable-next-line typescript/no-unnecessary-condition
        if (active.cancelled) {
          return;
        }
        if (loaded === null) {
          setDetail(null);
          setAggregates(null);
          setTimeseries([]);
          setLoading(false);
          return;
        }
        const [agg, series] = await Promise.all([
          queryStatsAggregates(sessionDbId),
          queryStatsTimeseries(sessionDbId, { intervalSec }),
        ]);
        // await 中に cleanup で cancelled が立つ可能性がある
        // oxlint-disable-next-line typescript/no-unnecessary-condition
        if (active.cancelled) {
          return;
        }
        setDetail(loaded);
        setAggregates(agg);
        setTimeseries(series);
        setLoading(false);
      } catch (error) {
        if (active.cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to load session detail";
        console.warn(`Session detail load failed: ${message}`);
        setErrorMessage(message);
        setLoading(false);
      }
    })();

    return () => {
      active.cancelled = true;
    };
  }, [sessionDbId, intervalSec]);

  if (sessionDbId === undefined) {
    return (
      <p className={styles.placeholder} data-testid="session-detail-empty">
        一覧からセッションを選択してください
      </p>
    );
  }

  if (loading) {
    return (
      <p className={styles.placeholder} data-testid="session-detail-loading">
        読み込み中…
      </p>
    );
  }

  if (errorMessage !== null) {
    return (
      <div className={styles.error} data-testid="session-detail-error" role="alert">
        詳細の読み取りに失敗しました: {errorMessage}
      </div>
    );
  }

  if (detail === null) {
    return (
      <p className={styles.placeholder} data-testid="session-detail-missing">
        指定されたセッションは見つかりません
      </p>
    );
  }

  const currentSessionDbId = getCurrentSessionDbId();
  const status = deriveSessionStatus(
    detail.session.ended_at,
    detail.session.id,
    currentSessionDbId,
  );

  return (
    <div data-testid="session-detail" data-session-db-id={String(detail.session.id)}>
      <h2 className={styles.title}>セッション詳細</h2>
      <dl className={styles.sessionMeta}>
        <div>
          <dt className={styles.label}>sessionDbId</dt>
          <dd className={styles.monoValue}>{detail.session.id}</dd>
        </div>
        <div>
          <dt className={styles.label}>状態</dt>
          <dd>{sessionStatusLabel(status)}</dd>
        </div>
        <div>
          <dt className={styles.label}>channelId</dt>
          <dd>{displayOrDash(detail.session.channel_id)}</dd>
        </div>
        <div>
          <dt className={styles.label}>session_id</dt>
          <dd className={styles.monoValueSmall}>{displayOrDash(detail.session.session_id)}</dd>
        </div>
        <div>
          <dt className={styles.label}>role</dt>
          <dd>{displayOrDash(detail.session.role)}</dd>
        </div>
        <div>
          <dt className={styles.label}>started_at</dt>
          <dd className={styles.monoValueSmall}>{displayOrDash(detail.session.started_at)}</dd>
        </div>
        <div>
          <dt className={styles.label}>ended_at</dt>
          <dd className={styles.monoValueSmall}>{displayOrDash(detail.session.ended_at)}</dd>
        </div>
      </dl>

      <h3 className={styles.connectionsTitle}>connections</h3>
      <ConnectionsTable connections={detail.connections} />

      <h3 className={styles.aggregatesTitle}>WebRTC stats 集計</h3>
      {aggregates === null ? (
        <p className={styles.empty}>集計データがありません</p>
      ) : (
        <dl className={styles.aggregates} data-testid="stats-aggregates">
          <div>
            <dt className={styles.label}>packets_received</dt>
            <dd>{formatNullableNumber(aggregates.packets_received)}</dd>
          </div>
          <div>
            <dt className={styles.label}>packets_sent</dt>
            <dd>{formatNullableNumber(aggregates.packets_sent)}</dd>
          </div>
          <div>
            <dt className={styles.label}>packet_loss_rate</dt>
            <dd>{formatNullableNumber(aggregates.packet_loss_rate)}</dd>
          </div>
          <div>
            <dt className={styles.label}>rtt_min</dt>
            <dd>{formatNullableNumber(aggregates.rtt_min)}</dd>
          </div>
          <div>
            <dt className={styles.label}>rtt_max</dt>
            <dd>{formatNullableNumber(aggregates.rtt_max)}</dd>
          </div>
          <div>
            <dt className={styles.label}>rtt_avg</dt>
            <dd>{formatNullableNumber(aggregates.rtt_avg)}</dd>
          </div>
          <div>
            <dt className={styles.label}>bitrate_send_bps</dt>
            <dd>{formatNullableNumber(aggregates.bitrate_send_bps)}</dd>
          </div>
          <div>
            <dt className={styles.label}>bitrate_recv_bps</dt>
            <dd>{formatNullableNumber(aggregates.bitrate_recv_bps)}</dd>
          </div>
        </dl>
      )}

      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.timeseriesTitle}>時系列</h3>
          <p className={styles.description}>getStats は 1 秒間隔。横軸は JST の実時刻</p>
        </div>
        <label className={styles.intervalLabel}>
          表示間隔
          <select
            className={styles.intervalSelect}
            value={String(intervalSec)}
            data-testid="timeseries-interval"
            onChange={(event) => {
              const next = Number(event.currentTarget.value);
              if (next === 1 || next === 10 || next === 60) {
                setIntervalSec(next);
              }
            }}
          >
            <option value="1">1 秒</option>
            <option value="10">10 秒</option>
            <option value="60">1 分</option>
          </select>
        </label>
      </div>
      <div className={styles.timeseries} data-testid="stats-timeseries">
        <StatsChart points={timeseries} metric="bitrate_send_bps" title="送信ビットレート" />
        <StatsChart points={timeseries} metric="bitrate_recv_bps" title="受信ビットレート" />
        <StatsChart points={timeseries} metric="round_trip_time" title="RTT" />
      </div>

      <StatsRawPanel sessionDbId={detail.session.id} />

      <SessionDebugMessages sessionDbId={detail.session.id} />
    </div>
  );
}

function ConnectionsTable({ connections }: { connections: ConnectionListRow[] }) {
  if (connections.length === 0) {
    return <p className={styles.empty}>connections はありません</p>;
  }
  return (
    <div className={styles.connectionsWrapper} data-testid="connections-table">
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            <th className={styles.headCell}>connection_id</th>
            <th className={styles.headCell}>session_id</th>
            <th className={styles.headCell}>sora_client_id</th>
            <th className={styles.headCell}>started_at</th>
            <th className={styles.headCell}>ended_at</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((connection) => (
            <tr key={connection.id} className={styles.bodyRow}>
              <td className={styles.bodyCell}>{displayOrDash(connection.connection_id)}</td>
              <td className={styles.bodyCell}>{displayOrDash(connection.session_id)}</td>
              <td className={styles.bodyCell}>{displayOrDash(connection.sora_client_id)}</td>
              <td className={styles.bodyCell}>{displayOrDash(connection.started_at)}</td>
              <td className={styles.bodyCell}>{displayOrDash(connection.ended_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
