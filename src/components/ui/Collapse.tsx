import type { ComponentChildren } from "preact";

interface CollapseProps {
  in: boolean;
  className?: string;
  children: ComponentChildren;
}

/**
 * 折りたたみコンポーネント
 * react-bootstrap の Collapse 互換
 *
 * Bootstrap collapse:
 * - overflow: hidden
 * - height transition
 */
export function Collapse({ in: isOpen, className = "", children }: CollapseProps) {
  const visibilityStyles = isOpen
    ? "overflow-visible max-h-[5000px] opacity-100"
    : "overflow-hidden max-h-0 opacity-0";

  return (
    <div className={`transition-all duration-300 ease-in-out ${visibilityStyles} ${className}`}>
      {children}
    </div>
  );
}
