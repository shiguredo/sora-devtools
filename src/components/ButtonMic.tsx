import React from "react";
import { useDispatch } from "react-redux";

import { toggleEnabledMic } from "@/slice";

const ButtonMic: React.FC = () => {
  const dispatch = useDispatch();
  const onClick = (event: React.MouseEvent<HTMLInputElement>): void => {
    dispatch(toggleEnabledMic());
    event.currentTarget.blur();
  };
  return (
    <input
      className="btn btn-secondary btn-sm mb-1 mx-1"
      type="button"
      name="mic"
      defaultValue="mic on/off"
      onClick={onClick}
    />
  );
};

export default ButtonMic;
