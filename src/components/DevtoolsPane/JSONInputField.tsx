import type React from "react";
import { useEffect, useState } from "react";
import { Button, FormControl, FormGroup } from "react-bootstrap";

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
  extraControls?: React.ReactNode;
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
  const [invalidJsonString, setInvalidJsonString] = useState(false);
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setValue(target.value);
  };
  useEffect(() => {
    if (value === "") {
      setInvalidJsonString(false);
      return;
    }
    try {
      JSON.parse(value);
      setInvalidJsonString(false);
    } catch {
      setInvalidJsonString(true);
    }
  }, [value]);
  return (
    <FormGroup className="form-inline position-relative" controlId={controlId}>
      <FormControl
        className={invalidJsonString ? "flex-fill invalid-json" : "flex-fill"}
        as="textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
        rows={rows || 10}
        cols={cols || 100}
        disabled={disabled}
      />
      <div className="json-input-textarea-overlay">
        {extraControls}
        <Button
          type="button"
          variant="light"
          size="sm"
          onClick={() => prettyFormat(value, setValue)}
          disabled={invalidJsonString}
        >
          pretty format
        </Button>
      </div>
    </FormGroup>
  );
};
