import type { FunctionComponent } from "preact";
import type { ComponentChildren } from "preact";

type Props = {
  children: ComponentChildren;
  className?: string;
};

export const FormRow: FunctionComponent<Props> = ({ children, className = "" }) => {
  return <div className={`flex items-center gap-3 ${className}`}>{children}</div>;
};
