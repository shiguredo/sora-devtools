import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { setSpotlightUnfocusRid, SoraDemoState } from "@/slice";
import { isSpotlightFocusRid } from "@/utils";

const SpotlightUnfocusRid: React.FC = () => {
  const { spotlightUnfocusRid } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSpotlightFocusRid(event.target.value)) {
      dispatch(setSpotlightUnfocusRid(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="spotlightUnfocusRid">
        spotlightUnfocusRid:
      </label>
      <select
        id="spotlightUnfocusRid"
        name="spotlightUnfocusRid"
        className="custom-select"
        value={spotlightUnfocusRid}
        onChange={onChange}
      >
        {SPOTLIGHT_FOCUS_RIDS.map((rid) => {
          const label = rid === "" ? "未指定" : rid;
          return (
            <option key={rid} value={rid}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SpotlightUnfocusRid;
