import { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setMediaProcessorsNoiseSuppression } from "@/app/slice";

export const FormMediaProcessorsNoiseSuppression: React.FC = () => {
  const mediaProcessorsNoiseSuppression = useAppSelector((state) => state.mediaProcessorsNoiseSuppression);
  const mediaType = useAppSelector((state) => state.mediaType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMediaProcessorsNoiseSuppression(event.target.checked));
  };
  const disabled = mediaType !== "getUserMedia" || !NoiseSuppressionProcessor.isSupported();
  return (
    <FormGroup className="form-inline" controlId="mediaProcessorsNoiseSuppression">
      <FormCheck
        type="switch"
        name="mediaProcessorsNoiseSuppression"
        label="mediaProcessorsNoiseSuppression"
        checked={mediaProcessorsNoiseSuppression}
        onChange={onChange}
        disabled={disabled}
      />
    </FormGroup>
  );
};
