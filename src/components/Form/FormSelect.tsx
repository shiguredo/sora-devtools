import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";
import type { ComponentChildren } from "preact";

type Props = {
  value: string;
  onChange: (event: TargetedEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children: ComponentChildren;
  className?: string;
};

export const FormSelect: FunctionComponent<Props> = ({
  value,
  onChange,
  disabled = false,
  children,
  className = "",
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`px-3 py-1.5 text-base border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
    >
      {children}
    </select>
  );
};
