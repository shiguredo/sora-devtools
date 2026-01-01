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
      className={`form-switch ${className}`}
    />
  );
}
