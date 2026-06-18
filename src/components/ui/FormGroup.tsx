import type { ComponentChildren } from "preact";

interface FormGroupProps {
  controlId?: string;
  className?: string;
  children: ComponentChildren;
}

/**
 * フォーム要素のグループ化コンポーネント
 * react-bootstrap の FormGroup 互換
 */
export function FormGroup({ controlId, className = "", children }: FormGroupProps) {
  return (
    <div className={`flex items-center min-h-10 ${className}`} data-control-id={controlId}>
      {children}
    </div>
  );
}
