import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAudioTrack } from "@/app/slice";

export const AudioTrackForm: React.FC = () => {
  const audioTrack = useAppSelector((state) => state.audioTrack);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudioTrack(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="audioTrack">
      <FormCheck type="switch" name="audioTrack" label="Enable audio track" checked={audioTrack} onChange={onChange} />
    </FormGroup>
  );
};
