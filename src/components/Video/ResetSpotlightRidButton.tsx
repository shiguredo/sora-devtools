import { connectionStatus, sora } from "@/app/signals";
import { rpc } from "@/rpc";

export function ResetSpotlightRidButton() {
  const conn = sora.value;

  const onClick = async (): Promise<void> => {
    if (!conn || connectionStatus.value !== "connected") {
      return;
    }

    await rpc(
      conn,
      "2025.2.0/ResetSpotlightRid",
      {},
      { notification: false, showMethodAlert: true },
    );
  };

  return (
    <div className="mx-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="resetAllSpotlightRid"
        defaultValue="resetSpotlightRid"
        onClick={onClick}
      />
    </div>
  );
}
