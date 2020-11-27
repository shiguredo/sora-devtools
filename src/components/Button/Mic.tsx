import React from "react";
import { useDispatch, useSelector } from "react-redux";

import IconMic from "@/components/IconMic";
import { SoraDemoState, toggleEnabledMic } from "@/slice";

const Mic: React.FC = () => {
  const { enabledMic } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    dispatch(toggleEnabledMic());
    event.currentTarget.blur();
  };
  return (
    <button className="btn btn-secondary btn-sm mx-1" onClick={onClick}>
      <IconMic mute={!enabledMic} /> mic on/off
    </button>
  );
};

export default Mic;
