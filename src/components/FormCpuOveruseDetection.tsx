import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCpuOveruseDetection, SoraDemoState } from "@/slice";

const FormCpuOveruseDetection: React.FC = () => {
  const { cpuOveruseDetection } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setCpuOveruseDetection(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input
          id="cpuOveruseDetection"
          className="form-check-input"
          type="checkbox"
          checked={cpuOveruseDetection}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="cpuOveruseDetection">
          cpuOveruseDetection
        </label>
      </div>
    </div>
  );
};

export default FormCpuOveruseDetection;
