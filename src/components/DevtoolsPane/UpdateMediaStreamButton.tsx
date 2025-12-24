import type React from "react";

import { updateMediaStream } from "@/app/actions";

export const UpdateMediaStreamButton: React.FC = () => {
  const onClick = (): void => {
    void updateMediaStream();
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
