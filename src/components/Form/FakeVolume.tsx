import React from "react";
import { Form, FormGroup, FormLabel } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setFakeVolume } from "@/app/slice";

export const FormFakeVolume: React.FC = () => {
  const mediaType = useAppSelector((state) => state.mediaType);
  const fakeVolume = useAppSelector((state) => state.fakeVolume);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setFakeVolume(event.target.value));
  };
  if (mediaType !== "fakeMedia") {
    return null;
  }
  return (
    <FormGroup className="form-inline" controlId="fakeVolume">
      <FormLabel>fakeVolume:</FormLabel>
      <Form.Range min="0" max="1" step="0.25" value={fakeVolume} onChange={onChange} />
    </FormGroup>
  );
};
