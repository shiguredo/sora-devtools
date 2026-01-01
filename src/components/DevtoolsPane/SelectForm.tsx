import { FormGroup, FormSelect } from "@/components/ui";

import { isFormDisabled } from "@/app/signals";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

type SelectFormProps<T extends readonly string[]> = {
  kind: string;
  label: string;
  value: string;
  options: T;
  onChange: (value: T[number]) => void;
  disabled?: boolean;
  emptyLabel?: string;
};

export function SelectForm<T extends readonly string[]>({
  kind,
  label,
  value,
  options,
  onChange,
  disabled = isFormDisabled.value,
  emptyLabel = "未指定",
}: SelectFormProps<T>) {
  const handleChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, options)) {
      onChange(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId={kind}>
      <TooltipFormLabel kind={kind}>{label}</TooltipFormLabel>
      <FormSelect name={kind} value={value} onChange={handleChange} disabled={disabled}>
        {options.map((v) => (
          <option key={v} value={v}>
            {v === "" ? emptyLabel : v}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}
