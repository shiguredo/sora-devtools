import { connectSora } from "@/app/actions";
import { connectionStatus } from "@/app/signals";

export function ConnectButton() {
  const connect = (): void => {
    void connectSora();
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="connect"
        defaultValue="connect"
        onClick={connect}
        disabled={
          connectionStatus.value === "disconnecting" ||
          connectionStatus.value === "connecting" ||
          connectionStatus.value === "initializing"
        }
      />
    </div>
  );
}
