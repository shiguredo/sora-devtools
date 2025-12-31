import { useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";

import { FormGroup, FormTextarea } from "@/components/ui";

const prettyFormat = (jsonString: string, setValue: (value: string) => void): void => {
  if (jsonString === "") {
    return;
  }
  try {
    const formated = JSON.stringify(JSON.parse(jsonString), null, 2);
    setValue(formated);
  } catch {
    // JSON.parse に失敗した場合は何もしない
  }
};

type JSONInputFieldProps = {
  controlId: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  setValue: (value: string) => void;
  extraControls?: ComponentChildren;
  rows?: number;
  cols?: number;
};

export const JSONInputField = ({
  value,
  controlId,
  placeholder,
  disabled,
  setValue,
  extraControls,
  rows,
  cols,
}: JSONInputFieldProps) => {
  const invalidJsonString = useSignal(false);
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setValue(target.value);
  };
  useEffect(() => {
    if (value === "") {
      invalidJsonString.value = false;
      return;
    }
    try {
      JSON.parse(value);
      invalidJsonString.value = false;
    } catch {
      invalidJsonString.value = true;
    }
  }, [value, invalidJsonString]);
  return (
    <FormGroup className="flex items-center gap-2 relative" controlId={controlId}>
      <FormTextarea
        className={invalidJsonString.value ? "flex-fill invalid-json" : "flex-fill"}
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
        rows={rows || 10}
        cols={cols || 100}
        disabled={disabled}
      />
      <div className="json-input-textarea-overlay">
        {extraControls}
        <button
          type="button"
          className="btn btn-light btn-sm"
          onClick={() => prettyFormat(value, setValue)}
          disabled={invalidJsonString.value}
        >
          pretty format
        </button>
      </div>
    </FormGroup>
  );
};
