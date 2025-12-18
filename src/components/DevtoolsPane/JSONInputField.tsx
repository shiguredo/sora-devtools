import { useSignal } from "@preact/signals";
import type { ComponentChildren, FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";
import { useEffect } from "preact/hooks";

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

export const JSONInputField: FunctionComponent<JSONInputFieldProps> = ({
  value,
  controlId,
  placeholder,
  disabled,
  setValue,
  extraControls,
  rows,
  cols,
}) => {
  const invalidJsonString = useSignal(false);
  const onChangeText = (event: TargetedEvent<HTMLTextAreaElement>): void => {
    setValue(event.currentTarget.value);
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
    <div className="relative flex items-center gap-2">
      <textarea
        id={controlId}
        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 disabled:bg-slate-100 disabled:text-slate-500 ${
          invalidJsonString.value ? "border-red-500 focus:ring-red-500" : "border-slate-300"
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
        rows={rows || 10}
        cols={cols || 100}
        disabled={disabled}
      />
      <div className="absolute top-2 right-2 flex gap-1">
        {extraControls}
        <button
          type="button"
          className="px-2 py-1 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => prettyFormat(value, setValue)}
          disabled={invalidJsonString.value}
        >
          pretty format
        </button>
      </div>
    </div>
  );
};
