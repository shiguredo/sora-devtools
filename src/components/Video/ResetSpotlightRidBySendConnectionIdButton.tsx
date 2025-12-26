import { connectionStatus, sora } from "@/app/signals";
import { rpc } from "@/rpc";

type Props = {
  sendConnectionId: string;
};
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
    <input
      className="btn btn-secondary mx-1"
      type="button"
      name="resetSpotlightRid"
      defaultValue="resetSpotlightRid"
      onClick={onClick}
    />
  );
}
