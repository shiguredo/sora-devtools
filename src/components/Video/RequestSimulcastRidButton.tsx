import type { FunctionComponent } from "preact";
import type { SimulcastRid } from "sora-js-sdk";

import { $connectionStatus, $sora } from "@/app/store";
import { rpc } from "@/rpc";

type SimulcastRequestRid = "none" | SimulcastRid;

type Props = {
  rid: SimulcastRequestRid;
  sendConnectionId?: string;
};

export const RequestSimulcastRidButton: FunctionComponent<Props> = (props) => {
  const onClick = async (): Promise<void> => {
    if (!$sora.value || $connectionStatus.value !== "connected") {
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

    await rpc($sora.value, "2025.2.0/RequestSimulcastRid", params, {
      notification: false,
      showMethodAlert: true,
    });
  };

  return (
    <input
      className="px-2 py-1 text-sm bg-gray-500 text-white hover:bg-gray-600 mx-1 rounded"
      type="button"
      name={`requestSimulcastRidTo${props.rid.charAt(0).toUpperCase() + props.rid.slice(1)}`}
      defaultValue={props.rid}
      onClick={onClick}
    />
  );
};
