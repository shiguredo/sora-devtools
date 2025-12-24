import type React from "react";

import { disconnectSora } from "@/app/actions";
import { useSoraDevtoolsStore } from "@/app/store";

export const DisconnectButton: React.FC = () => {
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus);
  const disconnect = (): void => {
    void disconnectSora();
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="disconnect"
        defaultValue="disconnect"
        onClick={disconnect}
        disabled={
          connectionStatus === "disconnecting" ||
          connectionStatus === "connecting" ||
          connectionStatus === "initializing"
        }
      />
    </div>
  );
};
