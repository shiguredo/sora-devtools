import { useRef } from "react";
import { FormGroup, FormSelect } from "react-bootstrap";
import type { SpotlightFocusRid } from "sora-js-sdk";

import { connectionStatus, sora } from "@/app/signals";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { rpc } from "@/rpc";

export function RequestSpotlightRidButton() {
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
      },
      { notification: false, showMethodAlert: true },
    );
  };

  if (!conn?.connectionId) {
    return null;
  }

  return (
    <div className="mx-1">
      <FormGroup className="form-inline">
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
        <input
          className="btn btn-secondary"
          type="button"
          name="requestSpotlightRid"
          defaultValue="requestSpotlightRid"
          onClick={onClick}
        />
      </FormGroup>
    </div>
  );
}
