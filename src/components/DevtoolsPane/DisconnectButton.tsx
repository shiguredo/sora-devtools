import { disconnectSora } from "@/app/actions";
import { connectionStatus } from "@/app/signals";
import { Button } from "@/components/ui";

import styles from "./DisconnectButton.module.css";

export function DisconnectButton() {
  const disconnect = (): void => {
    void disconnectSora();
  };
  const disabled =
    connectionStatus.value === "disconnecting" ||
    connectionStatus.value === "connecting" ||
    connectionStatus.value === "initializing";

  return (
    <div className={`col-auto ${styles.root}`}>
      <Button variant="secondary" name="disconnect" onClick={disconnect} disabled={disabled}>
        disconnect
      </Button>
    </div>
  );
}
