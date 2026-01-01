import type { ComponentChildren, JSX } from "preact";

type FormCheckProps = {
  id?: string;
  name?: string;
  type?: "checkbox" | "radio";
  checked?: boolean;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  label?: ComponentChildren;
  className?: string;
};

/**
 * チェックボックス/ラジオボタンコンポーネント
 * react-bootstrap の FormCheck 互換
 *
 * Bootstrap form-check スタイル:
 * - width/height: 16px
 * - border: 1px solid #dee2e6
 * - border-radius: 0.25em (checkbox) / 50% (radio)
 * - checked: background-color: primary, チェックマーク表示
 */
// Bootstrap の SVG 背景画像
const CHECKBOX_CHECK_SVG =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e\")";
const RADIO_CHECK_SVG =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='2' fill='%23fff'/%3e%3c/svg%3e\")";

export function FormCheck({
  id,
  name,
  type = "checkbox",
  checked = false,
  onChange,
  disabled = false,
  label,
  className = "",
}: FormCheckProps) {
  const borderRadius = type === "checkbox" ? "rounded" : "rounded-full";

  // Bootstrap form-check-input スタイル (Tailwind クラス)
  const inputClassName = `
    appearance-none cursor-pointer
    transition-colors duration-150
    ${borderRadius}
    focus:outline-none focus:ring-2 focus:ring-bs-primary/25
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // インラインスタイルで正確な値を指定 (Tailwind v4 のスケーリングを回避)
  const checkMarkSvg = type === "checkbox" ? CHECKBOX_CHECK_SVG : RADIO_CHECK_SVG;
  const inputStyle: JSX.CSSProperties = {
    width: "16px",
    height: "16px",
    border: checked ? "1px solid #0d6efd" : "1px solid #dee2e6",
    backgroundColor: checked ? "#0d6efd" : "#fff",
    backgroundImage: checked ? checkMarkSvg : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
  };

  const labelStyles = disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer";

  if (label) {
    return (
      <label className={`inline-flex items-center gap-2 ${labelStyles} ${className}`}>
        <input
          type={type}
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={inputClassName}
          style={inputStyle}
        />
        <span>{label}</span>
      </label>
    );
  }

  return (
    <input
      type={type}
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`${inputClassName} ${className}`}
      style={inputStyle}
    />
  );
}
