import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { setMicDevice } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

export const MicDeviceForm: React.FC = () => {
  const micDevice = useAppSelector((state) => state.micDevice);
  const sora = useAppSelector((state) => state.soraContents.sora);
  const audio = useAppSelector((state) => state.audio);
  const disabled = !(sora ? sora.audio : audio);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMicDevice(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="micDevice">
      <FormCheck
        type="switch"
        name="micDevice"
        label="Enable mic device"
        checked={micDevice}
        onChange={onChange}
        disabled={disabled}
      />
    </FormGroup>
  );
};