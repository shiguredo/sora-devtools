import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";

interface ToastProps {
  show?: boolean;
  autohide?: boolean;
  delay?: number;
  onClose?: () => void;
  className?: string;
  children: ComponentChildren;
}

interface ToastHeaderProps {
  closeButton?: boolean;
  onClose?: () => void;
  className?: string;
  children: ComponentChildren;
}

interface ToastBodyProps {
  className?: string;
  children: ComponentChildren;
}

/**
 * トースト通知コンポーネント
 * react-bootstrap の Toast 互換
 *
 * Bootstrap toast:
 * - width: 450px (App.css の .toast で指定)
 * - background-color: rgba(255, 255, 255, 0.85)
 * - border-radius: 0.375rem
 * - box-shadow
 */
export function Toast({
  show = true,
  autohide = false,
  delay = 5000,
  onClose,
  className = "",
  children,
}: ToastProps) {
  // 自動非表示
  // no-else-return に従い早期 return でネストを浅くする
  useEffect(() => {
    if (!(show && autohide && onClose)) {
      return;
    }
    const timer = setTimeout(() => {
      onClose();
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [show, autohide, delay, onClose]);

  if (!show) {
    return null;
  }

  // クリックで閉じる
  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`w-[90vw] md:w-[450px] mt-2.5 cursor-pointer bg-white/85 border border-black/10 rounded-md shadow-lg ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

/**
 * トーストヘッダー
 * Bootstrap toast-header 互換
 */
export function ToastHeader({
  closeButton = true,
  onClose,
  className = "",
  children,
}: ToastHeaderProps) {
  // クリックイベントの伝播を止める（親のToastのonClickと競合しないように）
  const handleCloseClick = (e: Event) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between px-3 py-2
        rounded-t-md
        ${className}
      `}
      style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex items-center gap-2">{children}</div>
      {closeButton && (
        <button
          type="button"
          onClick={handleCloseClick}
          className="ml-2 p-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close"
          style={{ background: "transparent", border: "none" }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * トーストボディ
 */
export function ToastBody({ className = "", children }: ToastBodyProps) {
  return <div className={`px-3 py-2 ${className}`}>{children}</div>;
}
