import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setVideoBitRate, SoraDemoState } from "@/app/slice";
import { isVideoBitRate } from "@/utils";

export const VideoBitRate: React.FC = () => {
  const { videoBitRate } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isVideoBitRate(event.target.value)) {
      dispatch(setVideoBitRate(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="videoBitRate">
        videoBitRate:
      </label>
      <select id="videoBitRate" name="videoBitRate" className="custom-select" value={videoBitRate} onChange={onChange}>
        <option value="">未指定</option>
        <option value="10">10</option>
        <option value="30">30</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="300">300</option>
        <option value="500">500</option>
        <option value="800">800</option>
        <option value="1000">1000</option>
        <option value="1500">1500</option>
        <option value="2000">2000</option>
        <option value="2500">2500</option>
        <option value="3000">3000</option>
        <option value="5000">5000</option>
        <option value="10000">10000</option>
        <option value="15000">15000</option>
        <option disabled>以下はサポート外です</option>
        <option value="20000">20000</option>
        <option value="30000">30000</option>
        <option value="50000">50000</option>
      </select>
    </div>
  );
};
