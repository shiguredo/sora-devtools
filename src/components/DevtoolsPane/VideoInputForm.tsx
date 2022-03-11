import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setVideoInput, updateMediaStream } from "@/app/slice";

export const VideoInputForm: React.FC = () => {
  const videoInput = useAppSelector((state) => state.videoInput);
  const videoInputDevices = useAppSelector((state) => state.videoInputDevices);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setVideoInput(event.target.value));
    dispatch(updateMediaStream());
  };
  return (
    <FormGroup className="form-inline" controlId="videoInput">
      <FormLabel>videoInput:</FormLabel>
      <FormSelect name="videoInput" value={videoInput} onChange={onChange} disabled={videoInputDevices.length === 0}>
        <option value="">未指定</option>
        {videoInputDevices.map((deviceInfo) => {
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
