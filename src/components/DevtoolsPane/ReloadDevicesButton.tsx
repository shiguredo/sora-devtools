import { setMediaDevices } from "@/app/actions";
import { Button } from "@/components/ui";

export function ReloadDevicesButton() {
  const onClick = (): void => {
    void setMediaDevices();
  };
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick}>
        update-devices
      </Button>
    </div>
  );
}
