import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEnabledSignalingUrlCandidates, SoraDemoState } from "@/app/slice";

const EnabledSignalingUrlCandidates: React.FC = () => {
  const enabledSignalingUrlCandidates = useSelector((state: SoraDemoState) => state.enabledSignalingUrlCandidates);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledSignalingUrlCandidates(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="enabledSignalingUrlCandidates"
          name="enabledSignalingUrlCandidates"
          className="form-check-input"
          type="checkbox"
          checked={enabledSignalingUrlCandidates}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="enabledSignalingUrlCandidates">
          signalingUrlCandidates
        </label>
      </div>
    </div>
  );
};

export default EnabledSignalingUrlCandidates;
