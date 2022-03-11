import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setVideoTrack } from "@/app/slice";

export const VideoTrackForm: React.FC = () => {
  const videoTrack = useAppSelector((state) => state.videoTrack);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideoTrack(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="videoTrack">
      <FormCheck type="switch" name="videoTrack" label="Enable video track" checked={videoTrack} onChange={onChange} />
    </FormGroup>
  );
};
