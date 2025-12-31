import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";

type ToastProps = {
  show?: boolean;
  autohide?: boolean;
  delay?: number;
  onClose?: () => void;
  className?: string;
  children: ComponentChildren;
};

type ToastHeaderProps = {
  closeButton?: boolean;
  onClose?: () => void;
  className?: string;
  children: ComponentChildren;
};

type ToastBodyProps = {
  className?: string;
  children: ComponentChildren;
};

/**
 * トースト通知コンポーネント
 * react-bootstrap の Toast 互換
 *
 * Bootstrap toast:
 * - max-width: 350px
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
  useEffect(() => {
    if (show && autohide && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [show, autohide, delay, onClose]);

  if (!show) return null;

  const baseStyles = [
    "max-w-sm",
    "bg-white/95",
    "border border-gray-200 rounded-md",
    "shadow-lg",
    "backdrop-blur-sm",
    // アニメーション
    "animate-fade-in",
  ].join(" ");

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
}

/**
 * トーストヘッダー
 */
export function ToastHeader({
  closeButton = true,
  onClose,
  className = "",
  children,
}: ToastHeaderProps) {
  const baseStyles = [
    "flex items-center justify-between",
    "px-3 py-2",
    "border-b border-gray-200",
    "rounded-t-md",
  ].join(" ");

  return (
    <div className={`${baseStyles} ${className}`}>
      <div className="flex items-center">{children}</div>
      {closeButton && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
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
  const baseStyles = "px-3 py-2";

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
}
