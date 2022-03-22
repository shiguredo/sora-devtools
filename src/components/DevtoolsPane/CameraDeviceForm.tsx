import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { setCameraDevice } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

export const CameraDeviceForm: React.FC = () => {
  const cameraDevice = useAppSelector((state) => state.cameraDevice);
  const sora = useAppSelector((state) => state.soraContents.sora);
  const video = useAppSelector((state) => state.video);
  const disabled = !(sora ? sora.video : video);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setCameraDevice(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="cameraDevice">
      <FormCheck
        type="switch"
        name="cameraDevice"
        label="Enable camera device"
        checked={cameraDevice}
        onChange={onChange}
        disabled={disabled}
      />
    </FormGroup>
  );
};
