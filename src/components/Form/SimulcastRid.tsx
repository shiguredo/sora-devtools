import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setSimulcastRid, SoraDemoState } from "@/slice";
import { isSimulcastRid } from "@/utils";

const SimulcastRid: React.FC = () => {
  const { simulcastRid } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSimulcastRid(event.target.value)) {
      dispatch(setSimulcastRid(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="simulcastRid">
        simulcastRid:
      </label>
      <select
        id="simulcastRid"
        name="simulcastRid"
        className="custom-select"
        value={simulcastRid}
        onChange={onChange}
      >
        <option value="">未指定</option>
        <option value="r0">r0</option>
        <option value="r1">r1</option>
        <option value="r2">r2</option>
      </select>
    </div>
  );
};

export default SimulcastRid;
