type FormSwitchProps = {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * トグルスイッチコンポーネント
 * react-bootstrap の FormCheck (type="switch") 互換
 *
 * Bootstrap form-switch スタイル:
 * - width: 2em, height: 1em
 * - border-radius: 2em (ピル型)
 * - background-position: left center (OFF) / right center (ON)
 * - checked: background-color: primary
 */
export function FormSwitch({
  id,
  name,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}: FormSwitchProps) {
  const baseStyles = [
    "w-8 h-4",
    "appearance-none",
    "bg-black/25",
    "border-0",
    "rounded-full",
    "cursor-pointer",
    "transition-all duration-150",
    // スイッチのつまみ（SVG 背景画像）
    "bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%273%27 fill=%27%23fff%27/%3e%3c/svg%3e')]",
    "bg-no-repeat",
    "bg-[length:contain]",
    "bg-[position:left_center]",
    // チェック状態
    "checked:bg-[#0d6efd]",
    "checked:bg-[position:right_center]",
    // Focus state
    "focus:outline-none focus:ring-2 focus:ring-blue-400/25",
    // Disabled state
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <input
      type="checkbox"
      role="switch"
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`${baseStyles} ${className}`}
    />
  );
}
