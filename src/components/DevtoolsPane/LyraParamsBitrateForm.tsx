import React from "react";
import { FormGroup, FormSelect } from "react-bootstrap";

import { setLyraParamsBitrate } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LYRA_PARAMS_BITRATES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel";

export const LyraParamsBitrateForm: React.FC = () => {
  const lyraParamsBitrate = useAppSelector((state) => state.lyraParamsBitrate);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, LYRA_PARAMS_BITRATES)) {
      dispatch(setLyraParamsBitrate(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="lyraParamsBitrate">
      <TooltipFormLabel kind="lyraParamsBitrate">lyraParamsBitrate:</TooltipFormLabel>
      <FormSelect name="lyraParamsBitrate" value={lyraParamsBitrate} onChange={onChange}>
        {LYRA_PARAMS_BITRATES.map((value) => {
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
