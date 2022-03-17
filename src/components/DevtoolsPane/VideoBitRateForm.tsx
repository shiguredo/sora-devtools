import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setVideoBitRate } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { VIDEO_BIT_RATES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

// 15000 を超える場合にサポート外であることを表示するためのカスタム
const DISPLAY_VIDEO_BIT_RATE: string[] = VIDEO_BIT_RATES.slice();
DISPLAY_VIDEO_BIT_RATE.splice(VIDEO_BIT_RATES.indexOf("15000") + 1, 0, "support-message");

export const VideoBitRateForm: React.FC = () => {
  const videoBitRate = useAppSelector((state) => state.videoBitRate);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, VIDEO_BIT_RATES)) {
      dispatch(setVideoBitRate(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="videoBitRate">
      <FormLabel>videoBitRate:</FormLabel>
      <FormSelect name="videoBitRate" value={videoBitRate} onChange={onChange} disabled={disabled}>
        {DISPLAY_VIDEO_BIT_RATE.map((value) => {
          let text = value;
          if (value === "") {
            text = "未指定";
          } else if (value === "support-message") {
            text = "以下はサポート外です";
          }
          return (
            <option key={value} value={value} disabled={value === "support-message"}>
              {text}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
