import type { FunctionComponent } from "preact";

import { setMediaDevices } from "@/app/actions";

export const ReloadDevicesButton: FunctionComponent = () => {
  const onClick = (): void => {
    setMediaDevices();
  };
  return (
    <button type="button" className="btn btn-outline" onClick={onClick}>
      update-devices
    </button>
  );
};
