import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setSignalingUrlCandidates, SoraDemoState } from "@/app/slice";

export const SignalingUrlCandidates: React.FC = () => {
  const signalingUrlCandidates = useSelector((state: SoraDemoState) => state.signalingUrlCandidates);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    dispatch(setSignalingUrlCandidates(event.target.value.split("\n")));
  };
  return (
    <div className="col-10 form-inline flex-nowrap align-items-start form-sora">
      <label className="mr-1 my-2" htmlFor="signalingUrlCandidates">
        signalingUrlCandidates:
      </label>
      <textarea
        id="signalingUrlCandidates"
        className="form-control flex-fill"
        rows={10}
        onChange={onChange}
        defaultValue={signalingUrlCandidates.join("\n")}
      />
    </div>
  );
};
