import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";

const SignalingURL: React.FC = () => {
  const { sora } = useSelector((state: SoraDemoState) => state.soraContents);
  return (
    <div className="debug-signaling-url d-flex align-items-center">
      <span className="mr-1">signaling server</span>
      <p className="border rounded p-2 m-0 flex-fill">{sora ? sora.signalingUrl : ""}</p>
    </div>
  );
};

export default SignalingURL;
