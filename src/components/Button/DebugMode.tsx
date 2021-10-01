import React from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDebug } from "@/app/slice";

export const DebugMode: React.FC = () => {
  const debug = useAppSelector((state) => state.debug);
  const dispatch = useAppDispatch();
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
