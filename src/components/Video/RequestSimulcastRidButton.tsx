import type { SimulcastRid } from "sora-js-sdk";

import { Button } from "@/components/ui";
import { connectionStatus, sora } from "@/app/signals";
import { rpc } from "@/rpc";

type SimulcastRequestRid = "none" | SimulcastRid;

type Props = {
  rid: SimulcastRequestRid;
  sendConnectionId?: string;
};

export function RequestSimulcastRidButton(props: Props) {
  const conn = sora.value;

  const onClick = async (): Promise<void> => {
    if (!conn || connectionStatus.value !== "connected") {
      return;
    }

    const params: {
      rid: SimulcastRequestRid;
      sender_connection_id?: string;
    } = {
      rid: props.rid,
    };
    if (props.sendConnectionId) {
      params.sender_connection_id = props.sendConnectionId;
    }

    await rpc(conn, "2025.2.0/RequestSimulcastRid", params, {
      notification: false,
      showMethodAlert: true,
    });
  };

  return (
    <Button variant="secondary" size="sm" className="mx-1" onClick={onClick}>
      {props.rid}
    </Button>
  );
}
