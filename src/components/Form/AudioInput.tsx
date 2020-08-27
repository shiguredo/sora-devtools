import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAudioInput, SoraDemoState, updateMediaStream } from "@/slice";

const AudioInput: React.FC = () => {
  const { audioInput, audioInputDevices } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setAudioInput(event.target.value));
    dispatch(updateMediaStream());
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="audioInput">
        audioInput:
      </label>
      <select
        id="audioInput"
        className="custom-select"
        name="audioInput"
        value={audioInput}
        onChange={onChange}
        disabled={audioInputDevices.length === 0}
      >
        {audioInputDevices.map((deviceInfo) => {
          return (
            <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
              {deviceInfo.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default AudioInput;
