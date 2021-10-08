import React from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDebug } from "@/app/slice";

export const ButtonFooterDebugMode: React.FC = () => {
  const debug = useAppSelector((state) => state.debug);
  const dispatch = useAppDispatch();
  const onClick = (): void => {
    dispatch(setDebug(!debug));
  };
  const className = debug ? "btn btn-footer-debug-mode active" : "btn btn-footer-debug-mode";
  return (
    <div>
      <button className={className} onClick={onClick}>
        debug
      </button>
    </div>
  );
};