import styles from "./FormTextarea.module.css";

interface FormTextareaProps {
  name?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: Event) => void;
  onBlur?: (event: Event) => void;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  cols?: number;
  className?: string;
}

/**
 * テキストエリアコンポーネント
 * react-bootstrap の FormControl (as="textarea") 互換
 *
 * スタイルは FormTextarea.module.css で定義する (FormInput と同等 + 複数行対応)
 */
export function FormTextarea({
  name,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  readOnly = false,
  rows = 3,
  cols,
  className = "",
}: FormTextareaProps) {
  return (
    <textarea
      name={name}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
      cols={cols}
      className={`${styles.textarea} ${className}`}
    />
  );
}
