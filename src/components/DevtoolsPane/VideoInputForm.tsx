import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setVideoInput, updateMediaStream } from "@/app/actions";
import { $videoInput, $videoInputDevices } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const VideoInputForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    setVideoInput(event.currentTarget.value);
    updateMediaStream();
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="videoInput">videoInput:</TooltipFormLabel>
      <FormSelect
        value={$videoInput.value}
        onChange={onChange}
        disabled={$videoInputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {$videoInputDevices.value.map((deviceInfo) => (
          <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
            {deviceInfo.label}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
