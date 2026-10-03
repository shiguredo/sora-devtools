import { setMediaDevices } from "@/app/actions";
import { Button } from "@/components/ui";

import styles from "./ReloadDevicesButton.module.css";

export function ReloadDevicesButton() {
  const onClick = (): void => {
    void setMediaDevices();
  };
  return (
    <div className={`col-auto ${styles.root}`}>
      <Button variant="outline-secondary" onClick={onClick}>
        update-devices
      </Button>
    </div>
  );
}
