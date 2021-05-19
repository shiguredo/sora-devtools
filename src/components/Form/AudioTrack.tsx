import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAudioTrack, SoraDemoState } from "@/slice";

const AudioTrack: React.FC = () => {
  const audioTrack = useSelector((state: SoraDemoState) => state.audioTrack);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudioTrack(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="custom-control custom-switch">
        <input type="checkbox" className="custom-control-input" id="audioTrack" checked={audioTrack} onChange={onChange} />
        <label className="custom-control-label" htmlFor="audioTrack">audioTrack on/off</label>
      </div>
    </div>
  );
};

export default AudioTrack;
