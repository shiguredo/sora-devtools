import { setMediaDevices } from "@/app/actions";

export function ReloadDevicesButton() {
  const onClick = (): void => {
    void setMediaDevices();
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-outline-secondary"
        type="button"
        name="update-devices"
        defaultValue="update-devices"
        onClick={onClick}
      />
    </div>
  );
}
