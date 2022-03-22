import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { setVideo } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { isFormDisabled } from "@/utils";

export const VideoForm: React.FC = () => {
  const video = useAppSelector((state) => state.video);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideo(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="video">
      <FormCheck type="switch" name="video" label="video" checked={video} onChange={onChange} disabled={disabled} />
    </FormGroup>
  );
};
