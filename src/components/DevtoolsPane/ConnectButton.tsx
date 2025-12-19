import type { FunctionComponent } from "preact";

import { connectSora } from "@/app/actions";
import { $connectionStatus } from "@/app/store";

export const ConnectButton: FunctionComponent = () => {
  const connect = (): void => {
    connectSora();
  };
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={connect}
      disabled={
        $connectionStatus.value === "disconnecting" ||
        $connectionStatus.value === "connecting" ||
        $connectionStatus.value === "initializing"
      }
    >
      connect
    </button>
  );
};
