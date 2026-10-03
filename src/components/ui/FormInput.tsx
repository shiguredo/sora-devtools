import styles from "./FormInput.module.css";

interface FormInputProps {
  type?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: Event) => void;
  onBlur?: (event: Event) => void;
  disabled?: boolean;
  readOnly?: boolean;
  accept?: string;
  className?: string;
}

/**
 * テキスト入力コンポーネント
 * react-bootstrap の FormControl (type="text") 互換
 *
 * スタイルは FormInput.module.css で定義する:
 * - display: block, width: 100%, padding: 0.375rem 0.75rem
 * - font-size: 1rem, line-height: 1.5
 * - border: 1px solid var(--color-gray-300), border-radius: 0.375rem
 * - focus: border-color: var(--color-blue-400), 2px のフォーカスリング
 * - disabled: background-color: var(--color-bs-disabled), opacity: 0.65
 */
export function FormInput({
  type = "text",
  name,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  readOnly = false,
  accept,
  className = "",
}: FormInputProps) {
  return (
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      readOnly={readOnly}
      accept={accept}
      className={`${styles.input} ${className}`}
    />
  );
}
