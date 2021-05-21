import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAudioBitRate, SoraDemoState } from "@/slice";
import { isAudioBitRate } from "@/utils";

const AudioBitRate: React.FC = () => {
  const { audioBitRate } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioBitRate(event.target.value)) {
      dispatch(setAudioBitRate(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="audioBitRate">
        audioBitRate:
      </label>
      <select id="audioBitRate" name="audioBitRate" className="custom-select" value={audioBitRate} onChange={onChange}>
        <option value="">未指定</option>
        <option value="8">8</option>
        <option value="16">16</option>
        <option value="24">24</option>
        <option value="32">32</option>
        <option value="64">64</option>
        <option value="96">96</option>
        <option value="128">128</option>
        <option value="256">256</option>
      </select>
    </div>
  );
};

export default AudioBitRate;
