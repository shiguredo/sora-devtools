import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setDataChannelSignaling, SoraDemoState } from "@/app/slice";
import { DATA_CHANNEL_SIGNALING } from "@/constants";
import { isDataChannelSignaling } from "@/utils";

const DataChannelSignaling: React.FC = () => {
  const dataChannelSignaling = useSelector((state: SoraDemoState) => state.dataChannelSignaling);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isDataChannelSignaling(event.target.value)) {
      dispatch(setDataChannelSignaling(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="dataChannelSignaling">
        dataChannelSignaling:
      </label>
      <select
        id="dataChannelSignaling"
        name="dataChannelSignaling"
        className="custom-select"
        value={dataChannelSignaling}
        onChange={onChange}
      >
        {DATA_CHANNEL_SIGNALING.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default DataChannelSignaling;
