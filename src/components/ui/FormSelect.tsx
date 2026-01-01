import type { ComponentChildren, Ref } from "preact";

type FormSelectProps = {
  name?: string;
  id?: string;
  value?: string;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  children: ComponentChildren;
  className?: string;
  ref?: Ref<HTMLSelectElement>;
};

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
      className={`form-select ${className}`}
    >
      {children}
    </select>
  );
}
