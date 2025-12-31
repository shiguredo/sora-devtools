import type { ComponentChildren, VNode } from "preact";
import { toChildArray } from "preact";

type TabsProps = {
  activeKey: string;
  onSelect?: (key: string | null) => void;
  className?: string;
  children: ComponentChildren;
};

type TabProps = {
  eventKey: string;
  title: ComponentChildren;
  className?: string;
  children: ComponentChildren;
};

type TabInfo = {
  eventKey: string;
  title: ComponentChildren;
  children: ComponentChildren;
};

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
 * Bootstrap nav-tabs スタイル:
 * - display: flex
 * - border-bottom: 1px solid
 * - .nav-link: padding, border-radius (top corners)
 * - .nav-link.active: background-color, border-color
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
    <div className={className}>
      {/* タブヘッダー */}
      <div className="flex border-b border-gray-600" role="tablist">
        {tabs.map((tab) => {
          const { eventKey, title } = tab;
          const isActive = eventKey === activeKey;

          return (
            <button
              type="button"
              key={eventKey}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(eventKey)}
              className={[
                "px-4 py-2",
                "text-sm font-medium",
                "border-b-2 -mb-px",
                "transition-colors duration-150",
                isActive
                  ? "text-white border-white bg-gray-700"
                  : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-500",
              ].join(" ")}
            >
              {title}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className="pt-2">
        {tabs.map((tab) => {
          const { eventKey, children: tabChildren } = tab;
          const isActive = eventKey === activeKey;

          if (!isActive) return null;

          return (
            <div key={eventKey} role="tabpanel">
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
