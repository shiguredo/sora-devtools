import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setBlurRadius } from "@/app/slice";
import { BLUR_RADIUS } from "@/constants";
import { isBlurRadius } from "@/utils";

export const FormBlurRadius: React.FC = () => {
  const blurRadius = useAppSelector((state) => state.blurRadius);
  const mediaType = useAppSelector((state) => state.mediaType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isBlurRadius(event.target.value)) {
      dispatch(setBlurRadius(event.target.value));
    }
  };
  const disabled = mediaType !== "getUserMedia" || !VirtualBackgroundProcessor.isSupported();
  return (
    <FormGroup className="form-inline" controlId="spotlightNumber">
      <FormLabel>blurRadius:</FormLabel>
      <FormSelect value={blurRadius} onChange={onChange} disabled={disabled}>
        {BLUR_RADIUS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" || disabled ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
