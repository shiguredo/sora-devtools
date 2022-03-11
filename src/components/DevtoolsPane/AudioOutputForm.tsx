import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAudioOutput } from "@/app/slice";

export const AudioOutputForm: React.FC = () => {
  const audioOutput = useAppSelector((state) => state.audioOutput);
  const audioOutputDevices = useAppSelector((state) => state.audioOutputDevices);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setAudioOutput(event.target.value));
  };
  return (
    <FormGroup className="form-inline" controlId="audioOutput">
      <FormLabel>audioOutput:</FormLabel>
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
