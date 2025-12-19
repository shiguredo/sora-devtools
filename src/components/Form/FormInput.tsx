import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

type Props = {
  type?: "text" | "number";
  value: string;
  onChange: (event: TargetedEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const FormInput: FunctionComponent<Props> = ({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-3 py-1.5 text-base border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
    />
  );
};
