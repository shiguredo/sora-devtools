import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setMediaType, SoraDemoState } from "@/slice";
import { isMediaType } from "@/utils";

const GetDisplayMedia: React.FC = () => {
  const { soraContents, mediaType } = useSelector((state: SoraDemoState) => state);
  const disabled = soraContents.sora !== null;
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (isMediaType(event.target.value)) {
      dispatch(setMediaType(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input
          id="getUserMedia"
          name="getMedia"
          className="form-check-input"
          type="radio"
          value="getUserMedia"
          checked={mediaType === "getUserMedia"}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="form-check-label" htmlFor="getUserMedia">
          getUserMedia
        </label>
      </div>
      <div className="form-check ml-2">
        <input
          id="getDisplayMedia"
          name="getMedia"
          className="form-check-input"
          type="radio"
          value="getDisplayMedia"
          checked={mediaType === "getDisplayMedia"}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="form-check-label" htmlFor="getDisplayMedia">
          getDisplayMedia
        </label>
      </div>
      <div className="form-check ml-2">
        <input
          id="fakeMedia"
          name="getMedia"
          className="form-check-input"
          value="fakeMedia"
          type="radio"
          checked={mediaType === "fakeMedia"}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="form-check-label" htmlFor="fakeMedia">
          fakeMedia
        </label>
      </div>
    </div>
  );
};

export default GetDisplayMedia;
