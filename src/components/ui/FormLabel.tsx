import type { ComponentChildren } from "preact";

import styles from "./FormLabel.module.css";

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
    <label htmlFor={htmlFor} className={`${styles.label} ${className}`}>
      {children}
    </label>
  );
}
