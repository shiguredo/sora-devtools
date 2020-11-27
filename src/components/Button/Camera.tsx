import React from "react";
import { useDispatch, useSelector } from "react-redux";

import IconCamera from "@/components/IconCamera";
import { SoraDemoState, toggleEnabledCamera } from "@/slice";

const Camera: React.FC = () => {
  const { enabledCamera } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    dispatch(toggleEnabledCamera());
    event.currentTarget.blur();
  };
  return (
    <button className="btn btn-secondary btn-sm mb-1 mx-1" onClick={onClick}>
      <IconCamera mute={!enabledCamera} /> camera on/off
    </button>
  );
};

export default Camera;
