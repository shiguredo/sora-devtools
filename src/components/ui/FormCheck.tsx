import type { ComponentChildren } from "preact";

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
 * - width/height: 1em
 * - border: 1px solid
 * - border-radius: 0.25em (checkbox) / 50% (radio)
 * - checked: background-color: primary, チェックマーク表示
 */
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
  const checkMark =
    type === "checkbox"
      ? "checked:bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3e%3cpath fill=%27none%27 stroke=%27%23fff%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%273%27 d=%27m6 10 3 3 6-6%27/%3e%3c/svg%3e')]"
      : "checked:bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%272%27 fill=%27%23fff%27/%3e%3c/svg%3e')]";

  const inputClassName = `
    w-4 h-4 appearance-none bg-white
    border border-gray-300 ${borderRadius} cursor-pointer
    transition-colors duration-150
    checked:bg-blue-600 checked:border-blue-600
    ${checkMark}
    bg-no-repeat bg-center bg-contain
    focus:outline-none focus:ring-2 focus:ring-blue-400/25
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

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
    />
  );
}
