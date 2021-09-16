import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setFakeVolume, setMediaType, SoraDemoState } from "@/app/slice";
import { isMediaType } from "@/utils";

const VolumeRange: React.FC = () => {
  const fakeVolume = useSelector((state: SoraDemoState) => state.fakeVolume);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setFakeVolume(event.target.value));
  };
  return (
    <div className="form-check ml-2">
      <input
        id="fakeVolume"
        className="fake-volume-range"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={fakeVolume}
        onChange={onChange}
      />
    </div>
  );
};

export const MediaType: React.FC = () => {
  const soraContents = useSelector((state: SoraDemoState) => state.soraContents);
  const mediaType = useSelector((state: SoraDemoState) => state.mediaType);
  const disabled = soraContents.sora !== null;
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (isMediaType(event.target.value)) {
      dispatch(setMediaType(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
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
      {mediaType === "fakeMedia" ? <VolumeRange /> : null}
    </div>
  );
};
