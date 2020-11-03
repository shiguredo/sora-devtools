import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setSimulcastQuality, SoraDemoState } from "@/slice";
import { isSimulcastQuality } from "@/utils";

const SimulcastQuality: React.FC = () => {
  const { simulcastRid } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSimulcastQuality(event.target.value)) {
      dispatch(setSimulcastQuality(event.target.value));
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
        <option value="r0">low</option>
        <option value="r1">middle</option>
        <option value="r2">high</option>
      </select>
    </div>
  );
};

export default SimulcastQuality;
