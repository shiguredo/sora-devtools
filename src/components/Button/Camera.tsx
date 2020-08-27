import React from "react";
import { useDispatch } from "react-redux";

import { toggleEnabledCamera } from "@/slice";

const Camera: React.FC = () => {
  const dispatch = useDispatch();
  const onClick = (event: React.MouseEvent<HTMLInputElement>): void => {
    dispatch(toggleEnabledCamera());
    event.currentTarget.blur();
  };
  return (
    <input
      className="btn btn-secondary btn-sm mb-1 mx-1"
      type="button"
      name="camera"
      defaultValue="camera on/off"
      onClick={onClick}
    />
  );
};

export default Camera;
