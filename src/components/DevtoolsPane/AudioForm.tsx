import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAudio } from "@/app/slice";
import { isFormDisabled } from "@/utils";

export const AudioForm: React.FC = () => {
  const audio = useAppSelector((state) => state.audio);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudio(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="audio">
      <FormCheck type="switch" name="audio" label="audio" checked={audio} onChange={onChange} disabled={disabled} />
    </FormGroup>
  );
};
