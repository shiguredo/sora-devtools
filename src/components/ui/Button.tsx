import type { ComponentChildren, MouseEventHandler } from "preact";

import styles from "./Button.module.css";

interface ButtonProps {
  variant?: "primary" | "secondary" | "light" | "dark" | "outline-secondary" | "outline-light";
  size?: "sm";
  type?: "button" | "submit" | "reset";
  name?: string;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ComponentChildren;
}

// variant の値と CSS Modules のクラス名を対応付ける
const variantClassNames = {
  primary: styles.primary,
  secondary: styles.secondary,
  light: styles.light,
  dark: styles.dark,
  "outline-secondary": styles.outlineSecondary,
  "outline-light": styles.outlineLight,
} as const;

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
  const sizeClassName = size === "sm" ? styles.small : "";

  return (
    <button
      // type は ButtonProps で "button" | "submit" | "reset" に限定され型安全だが、
      // oxlint は JSX に渡る変数を静的に追えず button-has-type が誤検知するため無効化
      // oxlint-disable-next-line react/button-has-type
      type={type}
      name={name}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${variantClassNames[variant]} ${sizeClassName} ${className}`}
    >
      {children}
    </button>
  );
}
