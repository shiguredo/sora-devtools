import { Button } from "@/components/ui";
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
      <Button variant="secondary" onClick={onClick}>
        resetSpotlightRid
      </Button>
    </div>
  );
}
