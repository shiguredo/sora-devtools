import { FormGroup, FormSelect } from "@/components/ui";

import { setAudioOutput } from "@/app/actions";
import { audioOutput, audioOutputDevices } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AudioOutputForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    setAudioOutput(target.value);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="audioOutput">
      <TooltipFormLabel kind="audioOutput">audioOutput:</TooltipFormLabel>
      <FormSelect
        name="audioOutput"
        value={audioOutput.value}
        onChange={onChange}
        disabled={audioOutputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {audioOutputDevices.value.map((deviceInfo) => {
          return (
            <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
              {deviceInfo.label}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
}
