import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setDisplayResolution } from "@/app/actions";
import { $displayResolution } from "@/app/store";
import { FormRow } from "@/components/Form";

import { DropdownInput } from "./DropdownInput.tsx";
import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

const DISPLAY_RESOLUTION_DATA_LIST = [
  { label: "未指定", value: "" },
  { label: "144p", value: "256x144" },
  { label: "240p", value: "320x240" },
  { label: "360p", value: "640x360" },
  { label: "480p", value: "720x480" },
  { label: "540p", value: "960x540" },
  { label: "720p", value: "1280x720" },
  { label: "1080p", value: "1920x1080" },
  { label: "1440p", value: "2560x1440" },
  { label: "2160p", value: "3840x2160" },
];

export const DisplayResolutionForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setDisplayResolution(event.currentTarget.value);
  };
  const items = DISPLAY_RESOLUTION_DATA_LIST.map(({ label, value }) => ({
    label: value !== "" ? `${label} (${value})` : label,
    value,
  }));
  return (
    <FormRow>
      <TooltipFormLabel kind="displayResolution">displayResolution:</TooltipFormLabel>
      <DropdownInput
        inputClassName="w-28"
        inputValue={$displayResolution.value}
        inputPlaceholder="未指定"
        onInputChange={onChange}
        items={items}
        onItemClick={setDisplayResolution}
      />
    </FormRow>
  );
};
