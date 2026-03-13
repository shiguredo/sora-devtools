import type { CSSProperties } from "preact";

interface FormSwitchProps {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  className?: string;
}

// SVG 背景画像（URL エンコード済み）- Bootstrap form-switch 互換
const UNCHECKED_THUMB =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280,0,0,0.25%29'/%3e%3c/svg%3e\")";
const CHECKED_THUMB =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e\")";

/**
 * トグルスイッチコンポーネント
 * react-bootstrap の FormCheck (type="switch") 互換
 *
 * Bootstrap form-switch:
 * - width: 2em (32px at 16px font)
 * - height: 1em (16px)
 * - border-radius: 2em
 * - background-size: contain
 * - background-position: left (unchecked) / right (checked)
 */
export function FormSwitch({
  id,
  name,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}: FormSwitchProps) {
  const inputStyle: CSSProperties = {
    width: "2em",
    height: "1em",
    border: checked ? "1px solid #0d6efd" : "1px solid rgba(0, 0, 0, 0.25)",
    borderRadius: "2em",
    backgroundColor: checked ? "#0d6efd" : "#fff",
    backgroundImage: checked ? CHECKED_THUMB : UNCHECKED_THUMB,
    backgroundRepeat: "no-repeat",
    backgroundPosition: checked ? "right center" : "left center",
    backgroundSize: "contain",
  };

  return (
    <input
      type="checkbox"
      role="switch"
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`
        appearance-none cursor-pointer
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-bs-primary/25
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={inputStyle}
    />
  );
}
