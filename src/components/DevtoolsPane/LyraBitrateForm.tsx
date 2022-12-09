import React from "react";
import { FormGroup, FormSelect } from "react-bootstrap";

import { setLyraBitrate } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LYRA_BITRATES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel";

export const LyraBitrateForm: React.FC = () => {
  const lyraBitrate = useAppSelector((state) => state.lyraBitrate);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, LYRA_BITRATES)) {
      dispatch(setLyraBitrate(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="lyraBitrate">
      <TooltipFormLabel kind="lyraBitrate">lyraBitrate:</TooltipFormLabel>
      <FormSelect name="lyraBitrate" value={lyraBitrate} onChange={onChange}>
        {LYRA_BITRATES.map((value) => {
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
