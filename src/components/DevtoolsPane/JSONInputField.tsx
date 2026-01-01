import { useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";

import { Button, FormGroup, FormTextarea } from "@/components/ui";

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
  const invalidStyles = invalidJsonString.value
    ? "flex-1 border-bs-red border-2 focus:border-bs-red"
    : "flex-1";

  return (
    <FormGroup className="flex items-center gap-2 relative" controlId={controlId}>
      <FormTextarea
        className={invalidStyles}
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
        rows={rows || 10}
        cols={cols || 100}
        disabled={disabled}
      />
      <div className="absolute top-2.5 right-0 flex gap-2">
        {extraControls}
        <Button
          variant="light"
          size="sm"
          onClick={() => prettyFormat(value, setValue)}
          disabled={invalidJsonString.value}
        >
          pretty format
        </Button>
      </div>
    </FormGroup>
  );
};
