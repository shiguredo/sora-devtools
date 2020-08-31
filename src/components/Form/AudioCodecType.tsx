import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAudioCodecType, SoraDemoState } from "@/slice";
import { isAudioCodecType } from "@/utils";

const AudioCodecType: React.FC = () => {
  const { audioCodecType } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioCodecType(event.target.value)) {
      dispatch(setAudioCodecType(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="audioCodecType">
        audioCodecType:
      </label>
      <select
        id="audioCodecType"
        name="audioCodecType"
        className="custom-select"
        value={audioCodecType}
        onChange={onChange}
      >
        <option value="">未指定</option>
        <option value="OPUS">OPUS</option>
      </select>
    </div>
  );
};

export default AudioCodecType;
