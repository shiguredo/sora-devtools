import type { FunctionComponent } from "preact";

import { disconnectSora } from "@/app/actions";
import { $connectionStatus } from "@/app/store";

export const DisconnectButton: FunctionComponent = () => {
  const disconnect = (): void => {
    disconnectSora();
  };
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={disconnect}
      disabled={
        $connectionStatus.value === "disconnecting" ||
        $connectionStatus.value === "connecting" ||
        $connectionStatus.value === "initializing"
      }
    >
      disconnect
    </button>
  );
};
