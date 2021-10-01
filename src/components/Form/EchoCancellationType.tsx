import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEchoCancellationType, SoraDemoState } from "@/app/slice";
import { isEchoCancellationType } from "@/utils";

const EchoCancellationType: React.FC = () => {
  const { echoCancellationType } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isEchoCancellationType(event.target.value)) {
      dispatch(setEchoCancellationType(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="echoCancellationType">
        echoCancellationType:
      </label>
      <select
        id="echoCancellationType"
        name="echoCancellationType"
        className="custom-select"
        value={echoCancellationType}
        onChange={onChange}
      >
        <option value="">未指定</option>
        <option value="browser">browser</option>
        <option value="system">system</option>
      </select>
    </div>
  );
};

export default EchoCancellationType;
