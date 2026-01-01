type FormTextareaProps = {
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
};

/**
 * テキストエリアコンポーネント
 * react-bootstrap の FormControl (as="textarea") 互換
 *
 * Bootstrap form-control スタイルを適用
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
      className={`
        block w-full px-3 py-1.5
        text-base leading-normal text-gray-900 bg-white
        border border-gray-300 rounded-md appearance-none resize-y
        transition-colors duration-150
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25
        disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );
}
