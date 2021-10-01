import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/app/slice";

export const SignalingURL: React.FC = () => {
  const { sora } = useSelector((state: SoraDemoState) => state.soraContents);
  return (
    <div className="debug-signaling-url d-flex align-items-center">
      <span className="me-1">signaling server</span>
      {sora ? (
        <p className="border rounded px-2 py-1 m-0 flex-fill">{sora.connectedSignalingUrl}</p>
      ) : (
        <p className="border rounded py-3 m-0 flex-fill" />
      )}
    </div>
  );
};
