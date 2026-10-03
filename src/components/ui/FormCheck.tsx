import type { CSSProperties, ComponentChildren } from "preact";

import styles from "./FormCheck.module.css";

interface FormCheckProps {
  id?: string;
  name?: string;
  type?: "checkbox" | "radio";
  checked?: boolean;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  label?: ComponentChildren;
  className?: string;
}

/**
 * チェックボックス/ラジオボタンコンポーネント
 * react-bootstrap の FormCheck 互換
 *
 * サイズ・枠線・チェック状態の色とマークはインラインスタイルで指定する。
 * 角丸 (checkbox は 0.25rem、radio は正円)、フォーカスリング、無効時の
 * 半透明表示は FormCheck.module.css で定義する。
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
  const borderRadiusClassName = type === "checkbox" ? styles.inputCheckbox : styles.inputRadio;

  // Bootstrap form-check-input 相当のスタイル
  const inputClassName = `${styles.input} ${borderRadiusClassName}`;

  // チェック状態に応じた背景色とチェックマークをインラインスタイルで指定する
  const checkMarkSvg = type === "checkbox" ? CHECKBOX_CHECK_SVG : RADIO_CHECK_SVG;
  const inputStyle: CSSProperties = {
    width: "16px",
    height: "16px",
    border: checked ? "1px solid #0d6efd" : "1px solid #dee2e6",
    backgroundColor: checked ? "#0d6efd" : "#fff",
    backgroundImage: checked ? checkMarkSvg : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
  };

  const labelClassName = disabled ? styles.labelDisabled : styles.labelEnabled;

  if (label) {
    return (
      <label className={`${styles.label} ${labelClassName} ${className}`}>
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
