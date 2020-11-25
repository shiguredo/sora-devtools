import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setSignalingNotifyMetadata, SoraDemoState } from "@/slice";

const SignalingNotifyMetadata: React.FC = () => {
  const { signalingNotifyMetadata } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSignalingNotifyMetadata(event.target.value));
  };
  return (
    <div className="col-10 form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="channelId">
        signalingNotifyMetadata:
      </label>
      <input
        id="signalingNotifyMetadata"
        name="signalingNotifyMetadata"
        className="form-control flex-fill"
        type="text"
        placeholder="signalingNotifyMetadata を指定"
        value={signalingNotifyMetadata}
        onChange={onChange}
      />
    </div>
  );
};

export default SignalingNotifyMetadata;
