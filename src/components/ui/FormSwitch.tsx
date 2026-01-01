type FormSwitchProps = {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  className?: string;
};

// SVG 背景画像（URL エンコード済み）
const uncheckedThumb =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280,0,0,0.25%29'/%3e%3c/svg%3e\")";
const checkedThumb =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e\")";

/**
 * トグルスイッチコンポーネント
 * react-bootstrap の FormCheck (type="switch") 互換
 */
export function FormSwitch({
  id,
  name,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}: FormSwitchProps) {
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
        w-8 h-4 appearance-none border rounded-full cursor-pointer
        transition-all duration-150 bg-no-repeat bg-contain
        focus:outline-none focus:ring-2 focus:ring-bs-primary/25
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-bs-primary border-bs-primary bg-right" : "bg-white border-[#dee2e6] bg-left"}
        ${className}
      `}
      style={{ backgroundImage: checked ? checkedThumb : uncheckedThumb }}
    />
  );
}
