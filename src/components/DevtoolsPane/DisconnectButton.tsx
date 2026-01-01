import { disconnectSora } from "@/app/actions";
import { connectionStatus } from "@/app/signals";
import { Button } from "@/components/ui";

export function DisconnectButton() {
  const disconnect = (): void => {
    void disconnectSora();
  };
  const disabled =
    connectionStatus.value === "disconnecting" ||
    connectionStatus.value === "connecting" ||
    connectionStatus.value === "initializing";

  return (
    <div className="col-auto mb-1">
      <Button variant="secondary" onClick={disconnect} disabled={disabled}>
        disconnect
      </Button>
    </div>
  );
}
