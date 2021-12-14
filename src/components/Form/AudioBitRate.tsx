import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAudioBitRate } from "@/app/slice";
import { AUDIO_BIT_RATES } from "@/constants";
import { isAudioBitRate, isFormDisabled } from "@/utils";

export const FormAudioBitRate: React.FC = () => {
  const audioBitRate = useAppSelector((state) => state.audioBitRate);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioBitRate(event.target.value)) {
      dispatch(setAudioBitRate(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioBitRate">
      <FormLabel>audioBitRate:</FormLabel>
      <FormSelect name="audioBitRate" value={audioBitRate} onChange={onChange} disabled={disabled}>
        {AUDIO_BIT_RATES.map((value) => {
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
