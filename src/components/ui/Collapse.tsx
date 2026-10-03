import type { ComponentChildren } from "preact";

import styles from "./Collapse.module.css";

interface CollapseProps {
  in: boolean;
  className?: string;
  children: ComponentChildren;
}

/**
 * 折りたたみコンポーネント
 * react-bootstrap の Collapse 互換
 *
 * Bootstrap collapse:
 * - overflow: hidden
 * - height transition
 */
export function Collapse({ in: isOpen, className = "", children }: CollapseProps) {
  const visibilityClassName = isOpen ? styles.collapseOpen : styles.collapseClosed;

  return <div className={`${styles.collapse} ${visibilityClassName} ${className}`}>{children}</div>;
}
