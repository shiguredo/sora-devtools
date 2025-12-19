import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAudioOutput } from "@/app/actions";
import { $audioOutput, $audioOutputDevices } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AudioOutputForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    setAudioOutput(event.currentTarget.value);
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="audioOutput">audioOutput:</TooltipFormLabel>
      <FormSelect
        value={$audioOutput.value}
        onChange={onChange}
        disabled={$audioOutputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {$audioOutputDevices.value.map((deviceInfo) => (
          <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
            {deviceInfo.label}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
