import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setVideo } from "@/app/slice";

export const FormVideo: React.FC = () => {
  const video = useAppSelector((state) => state.video);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideo(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="video">
      <FormCheck type="switch" name="video" label="video" checked={video} onChange={onChange} />
    </FormGroup>
  );
};
