import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setGetDisplayMedia, SoraDemoState } from "@/slice";

const GetDisplayMedia: React.FC = () => {
  const { getDisplayMedia } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setGetDisplayMedia(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input
          id="getDisplayMedia"
          className="form-check-input"
          type="checkbox"
          name="getDisplayMedia"
          checked={getDisplayMedia}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="getDisplayMedia">
          getDisplayMedia
        </label>
      </div>
    </div>
  );
};

export default GetDisplayMedia;
