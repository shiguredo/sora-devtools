import type { ComponentChildren, VNode } from "preact";
import { toChildArray } from "preact";

import styles from "./Tabs.module.css";

interface TabsProps {
  activeKey: string;
  onSelect?: (key: string | null) => void;
  className?: string;
  children: ComponentChildren;
}

interface TabProps {
  eventKey: string;
  title: ComponentChildren;
  className?: string;
  children: ComponentChildren;
}

interface TabInfo {
  eventKey: string;
  title: ComponentChildren;
  children: ComponentChildren;
}

function isTabElement(child: unknown): child is VNode {
  return child !== null && typeof child === "object" && "props" in (child as VNode);
}

function getTabInfo(child: VNode): TabInfo | null {
  const props = child.props as Record<string, unknown>;
  if (typeof props.eventKey === "string") {
    return {
      eventKey: props.eventKey,
      title: props.title as ComponentChildren,
      children: props.children as ComponentChildren,
    };
  }
  return null;
}

/**
 * タブコンテナコンポーネント
 * react-bootstrap の Tabs 互換
 *
 * 見た目は Tabs.module.css で定義する:
 * - タブ見出しは下線付きで、選択中は白文字 + 濃い背景 + 白下線
 * - タブ本文は DebugPane の :global セレクタが参照するグローバル名 .tab-content / .tab-pane と併用する
 */
export function Tabs({ activeKey, onSelect, className = "", children }: TabsProps) {
  const tabs: TabInfo[] = [];
  for (const child of toChildArray(children)) {
    if (isTabElement(child)) {
      const info = getTabInfo(child);
      if (info) {
        tabs.push(info);
      }
    }
  }

  const handleSelect = (key: string) => {
    onSelect?.(key);
  };

  return (
    <div className={`${styles.tabs} ${className}`}>
      {/* タブヘッダー
          タブ数が多い場合に横幅が親を超えるため、ペイン内で横スクロールさせる
          （ページ全体の横スクロールバーを出さない） */}
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => {
          const { eventKey, title } = tab;
          const isActive = eventKey === activeKey;

          const activeClassName = isActive ? styles.tabActive : styles.tabInactive;

          return (
            <button
              type="button"
              key={eventKey}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                handleSelect(eventKey);
              }}
              className={`${styles.tab} ${activeClassName}`}
            >
              {title}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className={`tab-content ${styles.tabContent}`}>
        {tabs.map((tab) => {
          const { eventKey, children: tabChildren } = tab;
          const isActive = eventKey === activeKey;

          return (
            <div
              key={eventKey}
              role="tabpanel"
              className={`tab-pane ${isActive ? "active" : styles.paneHidden}`}
            >
              {tabChildren}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 個別タブコンポーネント
 * react-bootstrap の Tab 互換
 */
export function Tab({ eventKey: _eventKey, title: _title, className = "", children }: TabProps) {
  // Tab は Tabs の children として使用され、直接レンダリングはしない
  // Tabs 内で props を読み取って処理する
  return <div className={className}>{children}</div>;
}
