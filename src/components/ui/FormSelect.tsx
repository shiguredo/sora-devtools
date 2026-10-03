import type { ComponentChildren, Ref } from "preact";

import styles from "./FormSelect.module.css";

interface FormSelectProps {
  name?: string;
  id?: string;
  value?: string;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  children: ComponentChildren;
  className?: string;
  ref?: Ref<HTMLSelectElement>;
}

// ドロップダウン矢印 SVG（URL エンコード済み）
const dropdownArrow =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")";

/**
 * セレクトボックスコンポーネント
 */
export function FormSelect({
  name,
  id,
  value,
  onChange,
  disabled = false,
  children,
  className = "",
  ref,
}: FormSelectProps) {
  return (
    <select
      ref={ref}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${styles.select} ${className}`}
      style={{ backgroundImage: dropdownArrow }}
    >
      {children}
    </select>
  );
}
