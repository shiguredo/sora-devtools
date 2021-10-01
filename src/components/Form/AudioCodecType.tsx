import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAudioCodecType } from "@/app/slice";
import { AUDIO_CODEC_TYPES } from "@/constants";
import { isAudioCodecType } from "@/utils";

export const FormAudioCodecType: React.FC = () => {
  const audioCodecType = useAppSelector((state) => state.audioCodecType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioCodecType(event.target.value)) {
      dispatch(setAudioCodecType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioBitRate">
      <FormLabel>audioCodecType:</FormLabel>
      <FormSelect name="audioCodecType" value={audioCodecType} onChange={onChange}>
        {AUDIO_CODEC_TYPES.map((value) => {
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
