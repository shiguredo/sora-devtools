import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setFrameRate } from "@/app/actions";
import { $frameRate } from "@/app/store";
import { FormRow } from "@/components/Form";

import { DropdownInput } from "./DropdownInput.tsx";
import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

const FRAME_RATE_DATA = [
  { label: "未指定", value: "" },
  { label: "60", value: "60" },
  { label: "30", value: "30" },
  { label: "24", value: "24" },
  { label: "20", value: "20" },
  { label: "15", value: "15" },
  { label: "10", value: "10" },
  { label: "5", value: "5" },
];

export const FrameRateForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setFrameRate(event.currentTarget.value);
  };
  const items = FRAME_RATE_DATA.map(({ label, value }) => ({
    label,
    value,
  }));
  return (
    <FormRow>
      <TooltipFormLabel kind="frameRate">frameRate:</TooltipFormLabel>
      <DropdownInput
        inputClassName="w-20"
        inputValue={$frameRate.value}
        inputPlaceholder="未指定"
        onInputChange={onChange}
        items={items}
        onItemClick={setFrameRate}
      />
    </FormRow>
  );
};
