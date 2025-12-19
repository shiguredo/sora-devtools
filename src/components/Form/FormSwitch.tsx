import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

type Props = {
  id: string;
  checked: boolean;
  onChange: (event: TargetedEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export const FormSwitch: FunctionComponent<Props> = ({
  id,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <input
      id={id}
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-checked={checked}
      className="w-9 h-5 appearance-none bg-slate-300 rounded-full cursor-pointer transition-colors duration-200 checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform before:duration-200 checked:before:translate-x-4"
    />
  );
};
