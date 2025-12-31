import type { ComponentChildren } from "preact";

type CollapseProps = {
  in: boolean;
  className?: string;
  children: ComponentChildren;
};

/**
 * 折りたたみコンポーネント
 * react-bootstrap の Collapse 互換
 *
 * Bootstrap collapse:
 * - overflow: hidden
 * - height transition
 */
export function Collapse({ in: isOpen, className = "", children }: CollapseProps) {
  const baseStyles = [
    "overflow-hidden",
    "transition-all duration-300 ease-in-out",
    isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0",
  ].join(" ");

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
}
