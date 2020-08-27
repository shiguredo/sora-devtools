import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setVideo, SoraDemoState } from "@/slice";

const FormVideo: React.FC = () => {
  const { video } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideo(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input
          id="video"
          className="form-check-input"
          type="checkbox"
          name="video"
          checked={video}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="video">
          video
        </label>
      </div>
    </div>
  );
};

export default FormVideo;
