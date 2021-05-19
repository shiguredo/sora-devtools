import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAudio, SoraDemoState } from "@/slice";

const Audio: React.FC = () => {
  const { audio } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudio(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="audio"
          name="audio"
          className="form-check-input"
          type="checkbox"
          checked={audio}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="audio">
          audio
        </label>
      </div>
    </div>
  );
};

export default Audio;
