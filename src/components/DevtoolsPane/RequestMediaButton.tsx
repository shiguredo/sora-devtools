import type { FunctionComponent } from "preact";

import { requestMedia } from "@/app/actions";
import { $connectionStatus, $role, $sora } from "@/app/store";
import { isFormDisabled } from "@/utils";

export const RequestMediaButton: FunctionComponent = () => {
  const onClick = (): void => {
    requestMedia();
  };
  const disabled =
    $role.value === "recvonly" || $sora.value !== null || isFormDisabled($connectionStatus.value);
  return (
    <button type="button" className="btn btn-outline" onClick={onClick} disabled={disabled}>
      request media
    </button>
  );
};
