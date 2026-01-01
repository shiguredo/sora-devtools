import type { ComponentChildren, JSX } from "preact";

type ButtonProps = {
  variant?: "primary" | "secondary" | "light" | "dark" | "outline-secondary" | "outline-light";
  size?: "sm";
  type?: "button" | "submit" | "reset";
  name?: string;
  disabled?: boolean;
  className?: string;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  children: ComponentChildren;
};

const variantStyles = {
  primary: "text-white bg-bs-primary border-bs-primary hover:bg-[#0b5ed7] hover:border-[#0a58ca]",
  secondary:
    "text-white bg-bs-secondary border-bs-secondary hover:bg-[#5c636a] hover:border-[#565e64]",
  light: "text-black bg-bs-light border-bs-light hover:bg-[#e2e6ea] hover:border-[#dae0e5]",
  dark: "text-white bg-bs-dark border-bs-dark hover:bg-[#1c1f23] hover:border-[#1a1e21]",
  "outline-secondary":
    "text-bs-secondary border-bs-secondary bg-transparent hover:text-white hover:bg-bs-secondary",
  "outline-light":
    "text-bs-light border-bs-light bg-transparent hover:text-black hover:bg-bs-light",
};

/**
 * ボタンコンポーネント
 * Bootstrap の btn クラス互換
 */
export function Button({
  variant = "secondary",
  size,
  type = "button",
  name,
  disabled = false,
  className = "",
  onClick,
  children,
}: ButtonProps) {
  const sizeStyles =
    size === "sm" ? "px-2 py-1 text-sm rounded" : "px-3 py-1.5 text-base rounded-md";

  return (
    <button
      type={type}
      name={name}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-block font-normal leading-normal text-center no-underline align-middle
        cursor-pointer select-none border
        transition-colors duration-150
        disabled:opacity-65 disabled:pointer-events-none
        ${sizeStyles} ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
}
