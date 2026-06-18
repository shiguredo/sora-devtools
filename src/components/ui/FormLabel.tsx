import type { ComponentChildren } from "preact";

interface FormLabelProps {
  htmlFor?: string;
  className?: string;
  children: ComponentChildren;
}

/**
 * フォームラベルコンポーネント
 * react-bootstrap の FormLabel 互換
 */
export function FormLabel({ htmlFor, className = "", children }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className={`me-2 ${className}`}>
      {children}
    </label>
  );
}
