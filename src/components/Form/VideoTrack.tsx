import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setVideoTrack, SoraDemoState } from "@/app/slice";

export const VideoTrack: React.FC = () => {
  const videoTrack = useSelector((state: SoraDemoState) => state.videoTrack);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideoTrack(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="custom-control custom-switch">
        <input
          type="checkbox"
          className="custom-control-input"
          id="videoTrack"
          checked={videoTrack}
          onChange={onChange}
        />
        <label className="custom-control-label" htmlFor="videoTrack">
          videoTrack on/off
        </label>
      </div>
    </div>
  );
};
