import type { ComponentChildren } from "preact";

type InputGroupProps = {
  className?: string;
  children: ComponentChildren;
};

/**
 * 入力フィールドグループコンポーネント
 * react-bootstrap の InputGroup 互換
 *
 * Bootstrap input-group スタイル:
 * - display: flex
 * - 子要素の border-radius を調整して連結表示
 */
export function InputGroup({ className = "", children }: InputGroupProps) {
  const baseStyles = [
    "relative",
    "flex",
    "items-stretch",
    // 子要素の border-radius を調整
    "[&>*:not(:first-child)]:rounded-l-none",
    "[&>*:not(:last-child)]:rounded-r-none",
    "[&>*:not(:first-child)]:-ml-px",
  ].join(" ");

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
}
