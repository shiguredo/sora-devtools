import { connectSora } from "@/app/actions";
import { connectionStatus } from "@/app/signals";
import { Button } from "@/components/ui";

export function ConnectButton() {
  const connect = (): void => {
    void connectSora();
  };
  const disabled =
    connectionStatus.value === "disconnecting" ||
    connectionStatus.value === "connecting" ||
    connectionStatus.value === "initializing" ||
    connectionStatus.value === "preparing";

  return (
    <div className="col-auto mb-1 mr-2">
      <Button variant="secondary" name="connect" onClick={connect} disabled={disabled}>
        connect
      </Button>
    </div>
  );
}
