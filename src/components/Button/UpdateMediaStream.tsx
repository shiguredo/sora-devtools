import React from "react";

import { useAppDispatch } from "@/app/hooks";
import { updateMediaStream } from "@/app/slice";

export const ButtonUpdateMediaStream: React.FC = () => {
  const dispatch = useAppDispatch();
  const onClick = (): void => {
    dispatch(updateMediaStream());
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-outline-secondary"
        type="button"
        name="update-mediastream"
        defaultValue="update-mediastream"
        onClick={onClick}
      />
    </div>
  );
};
