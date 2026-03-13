import type { ComponentChildren, Ref } from "preact";

interface FormSelectProps {
  name?: string;
  id?: string;
  value?: string;
  onChange?: (event: Event) => void;
  disabled?: boolean;
  children: ComponentChildren;
  className?: string;
  ref?: Ref<HTMLSelectElement>;
}

// ドロップダウン矢印 SVG（URL エンコード済み）
const dropdownArrow =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")";

/**
 * セレクトボックスコンポーネント
 */
export function FormSelect({
  name,
  id,
  value,
  onChange,
  disabled = false,
  children,
  className = "",
  ref,
}: FormSelectProps) {
  return (
    <select
      ref={ref}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        block w-full py-1.5 pr-9 pl-3
        text-base font-normal leading-normal text-bs-dark
        bg-white bg-no-repeat bg-position-[right_0.75rem_center] bg-size-[16px_12px]
        border border-[#ced4da] rounded-md appearance-none
        transition-[border-color,box-shadow] duration-150
        focus:border-[#86b7fe] focus:outline-none focus:ring-4 focus:ring-bs-primary/25
        disabled:bg-[#e9ecef] disabled:opacity-65
        ${className}
      `}
      style={{ backgroundImage: dropdownArrow }}
    >
      {children}
    </select>
  );
}
