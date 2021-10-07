import React from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDebug } from "@/app/slice";

export const ButtonHeaderDebugMode: React.FC = () => {
  const debug = useAppSelector((state) => state.debug);
  const dispatch = useAppDispatch();
  const onClick = (): void => {
    dispatch(setDebug(!debug));
  };
  const classNames = ["btn", "btn-header-debug-mode", "btn-sm", "ms-1"];
  if (debug) {
    classNames.push("active");
  }
  return (
    <input className={classNames.join(" ")} type="button" name="debug" defaultValue="debug" onClick={onClick} />
  );
};
