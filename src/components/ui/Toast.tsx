import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";

import styles from "./Toast.module.css";

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
 * - width: 450px (Toast.module.css の .toast で指定)
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
    <div className={`${styles.toast} ${className}`} onClick={handleClick}>
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
  // クリックイベントの伝播を止める（親の Toast の onClick と競合しないように）
  const handleCloseClick = (e: Event) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.headerContent}>{children}</div>
      {closeButton && (
        <button
          type="button"
          onClick={handleCloseClick}
          className={styles.closeButton}
          aria-label="Close"
        >
          <svg className={styles.closeIcon} fill="currentColor" viewBox="0 0 16 16">
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
  return <div className={`${styles.body} ${className}`}>{children}</div>;
}
