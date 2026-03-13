import { Button } from "@/components/ui";
import { connectionStatus, sora } from "@/app/signals";
import { rpc } from "@/rpc";

interface Props {
  sendConnectionId: string;
}
export function ResetSpotlightRidBySendConnectionIdButton(props: Props) {
  const conn = sora.value;

  const onClick = async (): Promise<void> => {
    if (!conn || connectionStatus.value !== "connected") {
      return;
    }

    await rpc(
      conn,
      "2025.2.0/ResetSpotlightRid",
      {
        send_connection_id: props.sendConnectionId,
      },
      { notification: false, showMethodAlert: true },
    );
  };

  return (
    <Button variant="secondary" className="mx-1" onClick={onClick}>
      resetSpotlightRid
    </Button>
  );
}
