import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setVideoContentHint } from "@/app/slice";
import { VIDEO_CONTENT_HINTS } from "@/constants";
import { isVideoContentHint } from "@/utils";

export const FormVideoContentHint: React.FC = () => {
  const videoContentHint = useAppSelector((state) => state.videoContentHint);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isVideoContentHint(event.target.value)) {
      dispatch(setVideoContentHint(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="videoContentHint">
      <FormLabel>videoContentHint:</FormLabel>
      <FormSelect name="videoContentHint" value={videoContentHint} onChange={onChange}>
        {VIDEO_CONTENT_HINTS.map((value) => {
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
