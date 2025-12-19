import type { FunctionComponent } from "preact";

import { $connectionStatus, $sora } from "@/app/store";
import { rpc } from "@/rpc";

export const ResetSpotlightRidButton: FunctionComponent = () => {
  const onClick = async (): Promise<void> => {
    if (!$sora.value || $connectionStatus.value !== "connected") {
      return;
    }

    await rpc(
      $sora.value,
      "2025.2.0/ResetSpotlightRid",
      {},
      { notification: false, showMethodAlert: true },
    );
  };

  return (
    <div className="mx-1">
      <input
        className="px-2 py-1 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 rounded cursor-pointer"
        type="button"
        name="resetAllSpotlightRid"
        defaultValue="resetSpotlightRid"
        onClick={onClick}
      />
    </div>
  );
};
