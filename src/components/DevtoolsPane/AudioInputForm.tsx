import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAudioInput, updateMediaStream } from "@/app/actions";
import { $audioInput, $audioInputDevices } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AudioInputForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    setAudioInput(event.currentTarget.value);
    updateMediaStream();
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="audioInput">audioInput:</TooltipFormLabel>
      <FormSelect
        value={$audioInput.value}
        onChange={onChange}
        disabled={$audioInputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {$audioInputDevices.value.map((deviceInfo) => (
          <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
            {deviceInfo.label}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
