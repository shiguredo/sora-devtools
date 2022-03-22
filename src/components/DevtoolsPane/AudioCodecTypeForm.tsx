import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setAudioCodecType } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { AUDIO_CODEC_TYPES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

export const AudioCodecTypeForm: React.FC = () => {
  const audioCodecType = useAppSelector((state) => state.audioCodecType);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUDIO_CODEC_TYPES)) {
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
