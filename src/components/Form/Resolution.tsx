import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setResolution, SoraDemoState } from "@/slice";
import { isResolution } from "@/utils";

const Resolution: React.FC = () => {
  const { resolution } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isResolution(event.target.value)) {
      dispatch(setResolution(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="resolution">
        resolution:
      </label>
      <select id="resolution" name="resolution" className="custom-select" value={resolution} onChange={onChange}>
        <option value="">未指定</option>
        <option value="UHD 4096x2160">UHD 4096x2160</option>
        <option value="UHD 3840x2160">UHD 3840x2160</option>
        <option value="3840x1920">3840x1920</option>
        <option value="FHD">FHD</option>
        <option value="HD">HD</option>
        <option value="VGA">VGA</option>
        <option value="QVGA">QVGA</option>
        <option value="HQVGA">HQVGA</option>
        <option value="QCIF">QCIF</option>
        <option value="QQVGA">QQVGA</option>
      </select>
    </div>
  );
};

export default Resolution;
