import { connectSora } from "@/app/actions";
import { connectionStatus } from "@/app/signals";
import { Button } from "@/components/ui";

import styles from "./ConnectButton.module.css";

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
    <div className={`col-auto ${styles.root}`}>
      <Button variant="secondary" name="connect" onClick={connect} disabled={disabled}>
        connect
      </Button>
    </div>
  );
}
