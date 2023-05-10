import React from 'react';
import { FormGroup, FormSelect } from 'react-bootstrap';

import { setAudioInput, updateMediaStream } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

import { TooltipFormLabel } from './TooltipFormLabel';

export const AudioInputForm: React.FC = () => {
  const audioInput = useAppSelector((state) => state.audioInput);
  const audioInputDevices = useAppSelector((state) => state.audioInputDevices);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setAudioInput(event.target.value));
    dispatch(updateMediaStream());
  };
  return (
    <FormGroup className="form-inline" controlId="audioInput">
      <TooltipFormLabel kind="audioInput">audioInput:</TooltipFormLabel>
      <FormSelect
        name="audioInput"
        value={audioInput}
        onChange={onChange}
        disabled={audioInputDevices.length === 0}
      >
        <option value="">未指定</option>
        {audioInputDevices.map((deviceInfo) => {
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
