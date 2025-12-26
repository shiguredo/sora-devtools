import { FormGroup, FormSelect } from "react-bootstrap";

import { setAudioOutput } from "@/app/actions";
import { audioOutput, audioOutputDevices } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AudioOutputForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    setAudioOutput(target.value);
  };
  return (
    <FormGroup className="form-inline" controlId="audioOutput">
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
