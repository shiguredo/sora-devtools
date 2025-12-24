import type React from "react";
import { FormGroup, FormSelect } from "react-bootstrap";

import { setAudioOutput } from "@/app/actions";
import { useSoraDevtoolsStore } from "@/app/store";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AudioOutputForm: React.FC = () => {
  const audioOutput = useSoraDevtoolsStore((state) => state.audioOutput);
  const audioOutputDevices = useSoraDevtoolsStore((state) => state.audioOutputDevices);
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setAudioOutput(event.target.value);
  };
  return (
    <FormGroup className="form-inline" controlId="audioOutput">
      <TooltipFormLabel kind="audioOutput">audioOutput:</TooltipFormLabel>
      <FormSelect
        name="audioOutput"
        value={audioOutput}
        onChange={onChange}
        disabled={audioOutputDevices.length === 0}
      >
        <option value="">未指定</option>
        {audioOutputDevices.map((deviceInfo) => {
          return (
            <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
              {deviceInfo.label}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
