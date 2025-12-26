import { disconnectSora } from "@/app/actions";
import { connectionStatus } from "@/app/signals";

export function DisconnectButton() {
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
          connectionStatus.value === "disconnecting" ||
          connectionStatus.value === "connecting" ||
          connectionStatus.value === "initializing"
        }
      />
    </div>
  );
}
