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
 * react-bootstrap の FormSelect 互換
 *
 * Bootstrap form-select スタイル:
 * - display: block, width: 100%
 * - padding: 0.375rem 2.25rem 0.375rem 0.75rem
 * - font-size: 1rem, line-height: 1.5
 * - border: 1px solid #dee2e6
 * - border-radius: 0.375rem
 * - background-image: カスタム矢印アイコン
 * - focus: border-color: #86b7fe
 * - disabled: background-color: #e9ecef
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
  const baseStyles = [
    "block w-full",
    "px-3 py-1.5 pr-9",
    "text-base leading-normal",
    "text-gray-900 bg-white",
    "border border-gray-300 rounded-md",
    "appearance-none",
    "bg-no-repeat",
    "transition-colors duration-150",
    "cursor-pointer",
    // カスタム矢印アイコン（Bootstrap 互換の SVG）
    "bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e')]",
    "bg-[length:16px_12px]",
    "bg-[position:right_0.75rem_center]",
    // Focus state
    "focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25",
    // Disabled state
    "disabled:bg-[#e9ecef] disabled:opacity-65 disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <select
      ref={ref}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseStyles} ${className}`}
    >
      {children}
    </select>
  );
}
