import { useRef } from "preact/hooks";
import type { SpotlightFocusRid } from "sora-js-sdk";

import { Button, FormGroup, FormSelect } from "@/components/ui";

import { connectionStatus, sora } from "@/app/signals";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { rpc } from "@/rpc";

interface Props {
  sendConnectionId: string;
}
export function RequestSpotlightRidBySendConnectionIdButton(props: Props) {
  const focusRidRef = useRef<HTMLSelectElement>(null);
  const unfocusRidRef = useRef<HTMLSelectElement>(null);
  const conn = sora.value;

  const onClick = async (): Promise<void> => {
    if (!conn || connectionStatus.value !== "connected") {
      return;
    }
    if (focusRidRef.current === null || unfocusRidRef.current === null) {
      return;
    }
    const focusRid = focusRidRef.current.value as SpotlightFocusRid;
    const unfocusRid = unfocusRidRef.current.value as SpotlightFocusRid;

    await rpc(
      conn,
      "2025.2.0/RequestSpotlightRid",
      {
        spotlight_focus_rid: focusRid,
        spotlight_unfocus_rid: unfocusRid,
        send_connection_id: props.sendConnectionId,
      },
      { notification: false, showMethodAlert: true },
    );
  };

  if (!conn?.connectionId) {
    return null;
  }

  return (
    <div className="mx-1">
      <FormGroup className="flex items-center gap-2">
        <FormSelect ref={focusRidRef}>
          {SPOTLIGHT_FOCUS_RIDS.map((value) => {
            if (value === "") {
              return null;
            }
            return (
              <option key={value} value={value}>
                SpotlightFocusRid: {value}
              </option>
            );
          })}
        </FormSelect>
        <FormSelect ref={unfocusRidRef}>
          {SPOTLIGHT_FOCUS_RIDS.map((value) => {
            if (value === "") {
              return null;
            }
            return (
              <option key={value} value={value}>
                SpotlightUnfocusRid: {value}&nbsp;&nbsp;&nbsp;
              </option>
            );
          })}
        </FormSelect>
        <Button variant="secondary" onClick={onClick}>
          requestSpotlightRid
        </Button>
      </FormGroup>
    </div>
  );
}
