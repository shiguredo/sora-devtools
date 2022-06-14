import React from "react";
import { FormGroup, FormSelect } from "react-bootstrap";

import { setAudioOutput } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

import { TooltipFormLabel } from "./TooltipFormLabel";

export const AudioOutputForm: React.FC = () => {
  const audioOutput = useAppSelector((state) => state.audioOutput);
  const audioOutputDevices = useAppSelector((state) => state.audioOutputDevices);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setAudioOutput(event.target.value));
  };
  return (
    <FormGroup className="form-inline" controlId="audioOutput">
      <TooltipFormLabel kind="audio_output">audioOutput:</TooltipFormLabel>
      <FormSelect name="audioOutput" value={audioOutput} onChange={onChange} disabled={audioOutputDevices.length === 0}>
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
