import type { ComponentChildren } from "preact";

import styles from "./InputGroup.module.css";

interface InputGroupProps {
  className?: string;
  children: ComponentChildren;
}

/**
 * 入力フィールドグループコンポーネント
 * react-bootstrap の InputGroup 互換
 *
 * Bootstrap input-group スタイル:
 * - display: flex
 * - 子要素の border-radius を調整して連結表示
 */
export function InputGroup({ className = "", children }: InputGroupProps) {
  return <div className={`${styles.group} ${className}`}>{children}</div>;
}
