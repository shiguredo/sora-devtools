import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setDebug, SoraDemoState } from "@/app/slice";

const DebugMode: React.FC = () => {
  const { debug } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const disconnect = (): void => {
    dispatch(setDebug(!debug));
  };
  return (
    <div>
      <button className={debug ? "btn btn-debug-mode active" : "btn btn-debug-mode"} onClick={disconnect}>
        debug
      </button>
    </div>
  );
};

export default DebugMode;
