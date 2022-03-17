import React, { useRef } from "react";
import { FormGroup, FormSelect } from "react-bootstrap";
import type { SpotlightFocusRid } from "sora-js-sdk";

import { requestSpotlightRid } from "@/api";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";

export const RequestSpotlightRid: React.FC = () => {
  const focusRidRef = useRef<HTMLSelectElement>(null);
  const unfocusRidRef = useRef<HTMLSelectElement>(null);
  const sora = useAppSelector((state) => state.soraContents.sora);
  const channelId = useAppSelector((state) => state.channelId);
  const apiUrl = useAppSelector((state) => state.apiUrl);
  const dispatch = useAppDispatch();
  if (!sora?.connectionId) {
    return null;
  }
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return;
    }
    if (focusRidRef.current === null || unfocusRidRef.current === null) {
      return;
    }
    const focusRid = focusRidRef.current.value as SpotlightFocusRid;
    const unfocusRid = unfocusRidRef.current.value as SpotlightFocusRid;
    try {
      const response = await requestSpotlightRid(apiUrl, channelId, sora.connectionId, focusRid, unfocusRid);
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message));
      }
    }
  };
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
};
