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
  return (
    <div
      className={`
        relative flex items-stretch
        [&>*:not(:first-child)]:rounded-l-none
        [&>*:not(:last-child)]:rounded-r-none
        [&>*:not(:first-child)]:-ml-px
        ${className}
      `}
    >
      {children}
    </div>
  );
}
