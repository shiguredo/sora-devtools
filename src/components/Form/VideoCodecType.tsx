import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setVideoCodecType } from "@/app/slice";
import { VIDEO_CODEC_TYPES } from "@/constants";
import { isVideoCodecType } from "@/utils";

export const FormVideoCodecType: React.FC = () => {
  const videoCodecType = useAppSelector((state) => state.videoCodecType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isVideoCodecType(event.target.value)) {
      dispatch(setVideoCodecType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="videoCodecType">
      <FormLabel>videoCodecType:</FormLabel>
      <FormSelect name="videoCodecType" value={videoCodecType} onChange={onChange}>
        {VIDEO_CODEC_TYPES.map((value) => {
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
