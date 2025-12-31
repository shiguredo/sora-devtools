import type { ComponentChildren } from "preact";

type FormLabelProps = {
  htmlFor?: string;
  className?: string;
  children: ComponentChildren;
};

/**
 * フォームラベルコンポーネント
 * react-bootstrap の FormLabel 互換
 *
 * Bootstrap スタイル:
 * - display: inline-block
 * - margin-bottom: 0.5rem
 */
export function FormLabel({ htmlFor, className = "", children }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className={`form-label ${className}`}>
      {children}
    </label>
  );
}
