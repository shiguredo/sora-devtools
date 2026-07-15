import type { FunctionComponent } from "preact";
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
export const SessionDetail: FunctionComponent<SessionDetailProps> = ({ sessionDbId }) => {
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
      <p className="text-bs-secondary" data-testid="session-detail-empty">
        一覧からセッションを選択してください
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-bs-secondary" data-testid="session-detail-loading">
        読み込み中…
      </p>
    );
  }

  if (errorMessage !== null) {
    return (
      <div
        className="rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800"
        data-testid="session-detail-error"
        role="alert"
      >
        詳細の読み取りに失敗しました: {errorMessage}
      </div>
    );
  }

  if (detail === null) {
    return (
      <p className="text-bs-secondary" data-testid="session-detail-missing">
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
      <h2 className="mb-2 text-lg font-semibold">セッション詳細</h2>
      <dl className="mb-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div>
          <dt className="text-bs-secondary">sessionDbId</dt>
          <dd className="font-mono">{detail.session.id}</dd>
        </div>
        <div>
          <dt className="text-bs-secondary">状態</dt>
          <dd>{sessionStatusLabel(status)}</dd>
        </div>
        <div>
          <dt className="text-bs-secondary">channelId</dt>
          <dd>{displayOrDash(detail.session.channel_id)}</dd>
        </div>
        <div>
          <dt className="text-bs-secondary">session_id</dt>
          <dd className="font-mono text-xs">{displayOrDash(detail.session.session_id)}</dd>
        </div>
        <div>
          <dt className="text-bs-secondary">role</dt>
          <dd>{displayOrDash(detail.session.role)}</dd>
        </div>
        <div>
          <dt className="text-bs-secondary">started_at</dt>
          <dd className="font-mono text-xs">{displayOrDash(detail.session.started_at)}</dd>
        </div>
        <div>
          <dt className="text-bs-secondary">ended_at</dt>
          <dd className="font-mono text-xs">{displayOrDash(detail.session.ended_at)}</dd>
        </div>
      </dl>

      <h3 className="mb-2 text-base font-semibold">connections</h3>
      <ConnectionsTable connections={detail.connections} />

      <h3 className="mb-2 mt-4 text-base font-semibold">WebRTC stats 集計</h3>
      {aggregates === null ? (
        <p className="text-sm text-bs-secondary">集計データがありません</p>
      ) : (
        <dl
          className="mb-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4"
          data-testid="stats-aggregates"
        >
          <div>
            <dt className="text-bs-secondary">packets_received</dt>
            <dd>{formatNullableNumber(aggregates.packets_received)}</dd>
          </div>
          <div>
            <dt className="text-bs-secondary">packets_sent</dt>
            <dd>{formatNullableNumber(aggregates.packets_sent)}</dd>
          </div>
          <div>
            <dt className="text-bs-secondary">packet_loss_rate</dt>
            <dd>{formatNullableNumber(aggregates.packet_loss_rate)}</dd>
          </div>
          <div>
            <dt className="text-bs-secondary">rtt_min</dt>
            <dd>{formatNullableNumber(aggregates.rtt_min)}</dd>
          </div>
          <div>
            <dt className="text-bs-secondary">rtt_max</dt>
            <dd>{formatNullableNumber(aggregates.rtt_max)}</dd>
          </div>
          <div>
            <dt className="text-bs-secondary">rtt_avg</dt>
            <dd>{formatNullableNumber(aggregates.rtt_avg)}</dd>
          </div>
          <div>
            <dt className="text-bs-secondary">bitrate_send_bps</dt>
            <dd>{formatNullableNumber(aggregates.bitrate_send_bps)}</dd>
          </div>
          <div>
            <dt className="text-bs-secondary">bitrate_recv_bps</dt>
            <dd>{formatNullableNumber(aggregates.bitrate_recv_bps)}</dd>
          </div>
        </dl>
      )}

      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">時系列</h3>
          <p className="mt-0.5 text-xs text-bs-secondary">
            getStats は 1 秒間隔。横軸は JST の実時刻
          </p>
        </div>
        <label className="text-sm text-bs-secondary">
          表示間隔
          <select
            className="ml-2 rounded border border-bs-secondary bg-white px-2 py-1 text-bs-body"
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
      <div className="flex flex-col gap-4" data-testid="stats-timeseries">
        <StatsChart points={timeseries} metric="bitrate_send_bps" title="送信ビットレート" />
        <StatsChart points={timeseries} metric="bitrate_recv_bps" title="受信ビットレート" />
        <StatsChart points={timeseries} metric="round_trip_time" title="RTT" />
      </div>

      <StatsRawPanel sessionDbId={detail.session.id} />

      <SessionDebugMessages sessionDbId={detail.session.id} />
    </div>
  );
};

const ConnectionsTable: FunctionComponent<{ connections: ConnectionListRow[] }> = ({
  connections,
}) => {
  if (connections.length === 0) {
    return <p className="text-sm text-bs-secondary">connections はありません</p>;
  }
  return (
    <div className="overflow-x-auto" data-testid="connections-table">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-bs-secondary">
            <th className="px-2 py-1">connection_id</th>
            <th className="px-2 py-1">session_id</th>
            <th className="px-2 py-1">sora_client_id</th>
            <th className="px-2 py-1">started_at</th>
            <th className="px-2 py-1">ended_at</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((connection) => (
            <tr key={connection.id} className="border-b border-bs-light">
              <td className="px-2 py-1 font-mono text-xs">
                {displayOrDash(connection.connection_id)}
              </td>
              <td className="px-2 py-1 font-mono text-xs">
                {displayOrDash(connection.session_id)}
              </td>
              <td className="px-2 py-1 font-mono text-xs">
                {displayOrDash(connection.sora_client_id)}
              </td>
              <td className="px-2 py-1 font-mono text-xs">
                {displayOrDash(connection.started_at)}
              </td>
              <td className="px-2 py-1 font-mono text-xs">{displayOrDash(connection.ended_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
