import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAudioContentHint } from "@/app/slice";
import { AUDIO_CONTENT_HINTS } from "@/constants";
import { isAudioContentHint } from "@/utils";

export const FormAudioContentHint: React.FC = () => {
  const audioContentHint = useAppSelector((state) => state.audioContentHint);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioContentHint(event.target.value)) {
      dispatch(setAudioContentHint(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioContentHint">
      <FormLabel>audioContentHint:</FormLabel>
      <FormSelect name="audioContentHint" value={audioContentHint} onChange={onChange}>
        {AUDIO_CONTENT_HINTS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
