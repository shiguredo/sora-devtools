import { useEffect, useState } from "preact/hooks";

import { formatChartUnixSecJst } from "@/components/Sessions/chartFormat";
import {
  queryLogMessagesPage,
  queryNotifyMessagesPage,
  queryPushMessagesPage,
  querySignalingMessagesPage,
  queryTimelineMessagesPage,
} from "@/sessionDatabase";
import type { Json } from "@/types";

import styles from "./SessionDebugMessages.module.css";

export interface SessionDebugMessagesProps {
  sessionDbId: number;
}

// 種別タブ。timeline / notify / signaling / log / push の 5 種
type MessageTab = "timeline" | "notify" | "signaling" | "log" | "push";

const MESSAGE_TABS: MessageTab[] = ["timeline", "notify", "signaling", "log", "push"];
const PAGE_LIMIT = 50;

interface DisplayColumn {
  label: string;
  value: string;
}

// 種別ごとの正規化カラムをまとめた表示用の行
interface DisplayRow {
  id: number;
  timestampMs: number;
  connectionId: string | null;
  columns: DisplayColumn[];
  payloadJson: Json;
}

function displayOrDash(value: string | null): string {
  if (value === null || value === "") {
    return "—";
  }
  return value;
}

function columnLabelsForTab(tab: MessageTab): string[] {
  if (tab === "timeline") {
    return ["type", "log_type"];
  }
  if (tab === "notify") {
    return ["event_type", "transport_type"];
  }
  if (tab === "signaling") {
    return ["type", "transport_type"];
  }
  if (tab === "log") {
    return ["title"];
  }
  return ["transport_type"];
}

// 種別ごとに query*Page を呼び分け、表示用の行へ正規化する
async function fetchDisplayPage(
  sessionDbId: number,
  tab: MessageTab,
  offset: number,
): Promise<{ rows: DisplayRow[]; totalCount: number }> {
  const options = { limit: PAGE_LIMIT, offset };

  if (tab === "timeline") {
    const result = await queryTimelineMessagesPage(sessionDbId, options);
    const rows = result.rows.map((row): DisplayRow => ({
      id: row.id,
      timestampMs: row.timestamp_ms,
      connectionId: row.connection_id,
      columns: [
        { label: "type", value: displayOrDash(row.type) },
        { label: "log_type", value: displayOrDash(row.log_type) },
      ],
      payloadJson: row.payload_json,
    }));
    return { rows, totalCount: result.totalCount };
  }

  if (tab === "notify") {
    const result = await queryNotifyMessagesPage(sessionDbId, options);
    const rows = result.rows.map((row): DisplayRow => ({
      id: row.id,
      timestampMs: row.timestamp_ms,
      connectionId: row.connection_id,
      columns: [
        { label: "event_type", value: displayOrDash(row.event_type) },
        { label: "transport_type", value: displayOrDash(row.transport_type) },
      ],
      payloadJson: row.payload_json,
    }));
    return { rows, totalCount: result.totalCount };
  }

  if (tab === "signaling") {
    const result = await querySignalingMessagesPage(sessionDbId, options);
    const rows = result.rows.map((row): DisplayRow => ({
      id: row.id,
      timestampMs: row.timestamp_ms,
      connectionId: row.connection_id,
      columns: [
        { label: "type", value: displayOrDash(row.type) },
        { label: "transport_type", value: displayOrDash(row.transport_type) },
      ],
      payloadJson: row.payload_json,
    }));
    return { rows, totalCount: result.totalCount };
  }

  if (tab === "log") {
    const result = await queryLogMessagesPage(sessionDbId, options);
    const rows = result.rows.map((row): DisplayRow => ({
      id: row.id,
      timestampMs: row.timestamp_ms,
      connectionId: row.connection_id,
      columns: [{ label: "title", value: displayOrDash(row.title) }],
      payloadJson: row.payload_json,
    }));
    return { rows, totalCount: result.totalCount };
  }

  const result = await queryPushMessagesPage(sessionDbId, options);
  const rows = result.rows.map((row): DisplayRow => ({
    id: row.id,
    timestampMs: row.timestamp_ms,
    connectionId: row.connection_id,
    columns: [{ label: "transport_type", value: displayOrDash(row.transport_type) }],
    payloadJson: row.payload_json,
  }));
  return { rows, totalCount: result.totalCount };
}

// DB 読み取り専用のデバッグメッセージ閲覧パネル（DebugPane とは独立の子コンポーネント）
export function SessionDebugMessages({ sessionDbId }: SessionDebugMessagesProps) {
  const [activeTab, setActiveTab] = useState<MessageTab>("timeline");
  const [pageOffset, setPageOffset] = useState(0);
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const active = { cancelled: false };
    setLoading(true);
    setErrorMessage(null);
    void (async () => {
      try {
        const result = await fetchDisplayPage(sessionDbId, activeTab, pageOffset);
        if (active.cancelled) {
          return;
        }
        setRows(result.rows);
        setTotalCount(result.totalCount);
        setLoading(false);
      } catch (error) {
        if (active.cancelled) {
          return;
        }
        let message = "Failed to load session debug messages";
        if (error instanceof Error) {
          const { message: errorMessage } = error;
          message = errorMessage;
        }
        console.warn(`Session debug messages load failed: ${message}`);
        setErrorMessage(message);
        setLoading(false);
      }
    })();
    return () => {
      active.cancelled = true;
    };
  }, [sessionDbId, activeTab, pageOffset]);

  const columnLabels = columnLabelsForTab(activeTab);
  const maxOffset = Math.max(0, totalCount - PAGE_LIMIT);

  let countLabel = "0 件";
  if (totalCount > 0) {
    const lastIndex = Math.min(pageOffset + rows.length, totalCount);
    countLabel = `全 ${String(totalCount)} 件（${String(pageOffset + 1)}–${String(lastIndex)} 件目）`;
  }

  return (
    <section className={styles.root} data-testid="session-messages-panel">
      <h3 className={styles.title}>デバッグメッセージ</h3>
      <div className={styles.tabs} role="tablist">
        {MESSAGE_TABS.map((tab) => {
          let buttonClass = `${styles.tab} ${styles.tabInactive}`;
          if (tab === activeTab) {
            buttonClass = `${styles.tab} ${styles.tabActive}`;
          }
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              className={buttonClass}
              data-testid={`session-messages-tab-${tab}`}
              aria-pressed={tab === activeTab}
              onClick={() => {
                setActiveTab(tab);
                setPageOffset(0);
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {errorMessage !== null && (
        <div className={styles.error} data-testid="session-messages-error" role="alert">
          読み取りに失敗しました: {errorMessage}
        </div>
      )}
      {loading && (
        <p className={styles.loading} data-testid="session-messages-loading">
          読み込み中…
        </p>
      )}

      <SessionMessagesTable rows={rows} columnLabels={columnLabels} />

      <div className={styles.tableToolbar}>
        <p className={styles.count} data-testid="session-messages-count">
          {countLabel}
        </p>
        <div className={styles.pageActions}>
          <button
            type="button"
            className={styles.pageButton}
            disabled={pageOffset <= 0}
            data-testid="session-messages-page-prev"
            onClick={() => {
              setPageOffset(Math.max(0, pageOffset - PAGE_LIMIT));
            }}
          >
            前へ
          </button>
          <button
            type="button"
            className={styles.pageButton}
            disabled={pageOffset >= maxOffset}
            data-testid="session-messages-page-next"
            onClick={() => {
              setPageOffset(Math.min(maxOffset, pageOffset + PAGE_LIMIT));
            }}
          >
            次へ
          </button>
        </div>
      </div>
    </section>
  );
}

function SessionMessagesTable({
  rows,
  columnLabels,
}: {
  rows: DisplayRow[];
  columnLabels: string[];
}) {
  return (
    <div className={styles.tableWrapper} data-testid="session-messages-list">
      {rows.length === 0 && (
        <p className={styles.empty} data-testid="session-messages-empty">
          メッセージはありません
        </p>
      )}
      {rows.length > 0 && (
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr className={styles.headRow}>
              <th className={styles.headCell}>時刻 (JST)</th>
              {columnLabels.map((label) => (
                <th key={label} className={styles.headCell}>
                  {label}
                </th>
              ))}
              <th className={styles.headCell}>connection_id</th>
              <th className={styles.headCell}>payload</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={styles.bodyRow}>
                <td className={styles.timeCell}>
                  {formatChartUnixSecJst(row.timestampMs / 1000, true)}
                </td>
                {row.columns.map((column) => (
                  <td key={column.label} className={styles.bodyCell}>
                    {column.value}
                  </td>
                ))}
                <td className={styles.connectionCell}>{displayOrDash(row.connectionId)}</td>
                <td className={styles.bodyCell}>
                  <details>
                    <summary className={styles.payloadSummary}>表示</summary>
                    <pre className={styles.payloadPre}>
                      {JSON.stringify(row.payloadJson, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
