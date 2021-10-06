import React from "react";

import { useAppDispatch } from "@/app/hooks";
import { copyURL } from "@/app/slice";

export const CopyURL: React.FC = () => {
  const dispatch = useAppDispatch();
  const onClick = (): void => {
    dispatch(copyURL());
  };
  return (
    <input
      className="btn btn-light btn-sm ms-1"
      type="button"
      name="copyUrl"
      defaultValue="copy URL"
      onClick={onClick}
    />
  );
};
