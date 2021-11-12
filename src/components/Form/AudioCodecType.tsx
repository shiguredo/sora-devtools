import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAudioCodecType } from "@/app/slice";
import { AUDIO_CODEC_TYPES } from "@/constants";
import { isAudioCodecType, isFormDisabled } from "@/utils";

export const FormAudioCodecType: React.FC = () => {
  const audioCodecType = useAppSelector((state) => state.audioCodecType);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioCodecType(event.target.value)) {
      dispatch(setAudioCodecType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioBitRate">
      <FormLabel>audioCodecType:</FormLabel>
      <FormSelect name="audioCodecType" value={audioCodecType} onChange={onChange} disabled={disabled}>
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
