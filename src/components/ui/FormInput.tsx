type FormInputProps = {
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
};

/**
 * テキスト入力コンポーネント
 * react-bootstrap の FormControl (type="text") 互換
 *
 * Bootstrap form-control スタイル:
 * - display: block, width: 100%
 * - padding: 0.375rem 0.75rem
 * - font-size: 1rem, line-height: 1.5
 * - border: 1px solid #dee2e6
 * - border-radius: 0.375rem
 * - focus: border-color: #86b7fe, box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25)
 * - disabled: background-color: #e9ecef
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
  const baseStyles = [
    "block w-full",
    "px-3 py-1.5",
    "text-base leading-normal",
    "text-gray-900 bg-white",
    "border border-gray-300 rounded-md",
    "appearance-none",
    "transition-colors duration-150",
    // Focus state
    "focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25",
    // Disabled state
    "disabled:bg-[#e9ecef] disabled:opacity-65 disabled:cursor-not-allowed",
  ].join(" ");

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
      className={`${baseStyles} ${className}`}
    />
  );
}
