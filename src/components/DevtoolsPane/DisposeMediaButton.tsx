import type { FunctionComponent } from "preact";

import { disposeMedia } from "@/app/actions";
import { $connectionStatus, $role, $sora } from "@/app/store";
import { isFormDisabled } from "@/utils";

export const DisposeMediaButton: FunctionComponent = () => {
  const onClick = (): void => {
    disposeMedia();
  };
  const disabled =
    $role.value === "recvonly" || $sora.value !== null || isFormDisabled($connectionStatus.value);
  return (
    <button type="button" className="btn btn-outline" onClick={onClick} disabled={disabled}>
      dispose media
    </button>
  );
};
