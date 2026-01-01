import { FormGroup, FormSelect } from "@/components/ui";

import { setAudioInput, updateMediaStream } from "@/app/actions";
import { audioInput, audioInputDevices } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AudioInputForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    setAudioInput(target.value);
    void updateMediaStream();
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="audioInput">
      <TooltipFormLabel kind="audioInput">audioInput:</TooltipFormLabel>
      <FormSelect
        name="audioInput"
        value={audioInput.value}
        onChange={onChange}
        disabled={audioInputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {audioInputDevices.value.map((deviceInfo) => {
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
