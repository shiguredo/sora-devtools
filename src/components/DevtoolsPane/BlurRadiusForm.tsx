import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setBlurRadius } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { BLUR_RADIUS } from "@/constants";
import { checkFormValue } from "@/utils";

export const BlurRadiusForm: React.FC = () => {
  const blurRadius = useAppSelector((state) => state.blurRadius);
  const mediaType = useAppSelector((state) => state.mediaType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, BLUR_RADIUS)) {
      dispatch(setBlurRadius(event.target.value));
    }
  };
  const disabled = mediaType !== "getUserMedia" || !VirtualBackgroundProcessor.isSupported();
  return (
    <FormGroup className="form-inline" controlId="spotlightNumber">
      <FormLabel>blurRadius:</FormLabel>
      <FormSelect suppressHydrationWarning value={blurRadius} onChange={onChange} disabled={disabled}>
        {BLUR_RADIUS.map((value) => {
          return (
            <option suppressHydrationWarning key={value} value={value}>
              {value === "" || disabled ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
