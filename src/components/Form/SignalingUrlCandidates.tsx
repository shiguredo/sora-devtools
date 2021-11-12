import React from "react";
import { FormCheck, FormControl, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/slice";
import { isFormDisabled } from "@/utils";

export const FormSignalingUrlCandidates: React.FC = () => {
  const enabledSignalingUrlCandidates = useAppSelector((state) => state.enabledSignalingUrlCandidates);
  const signalingUrlCandidates = useAppSelector((state) => state.signalingUrlCandidates);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledSignalingUrlCandidates(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSignalingUrlCandidates(event.target.value.split("\n")));
  };
  return (
    <>
      <FormGroup className="form-inline" controlId="enabledSignalingUrlCandidates">
        <FormCheck
          type="switch"
          name="enabledSignalingUrlCandidates"
          label="signalingUrlCandidates"
          checked={enabledSignalingUrlCandidates}
          onChange={onChangeSwitch}
          disabled={disabled}
        />
      </FormGroup>
      {enabledSignalingUrlCandidates ? (
        <FormGroup className="form-inline" controlId="signalingNotifyMetadata">
          <FormControl
            className="flex-fill w-500"
            as="textarea"
            placeholder="signalingUrlCandidatesを指定"
            value={signalingUrlCandidates.join("\n")}
            onChange={onChangeText}
            rows={5}
            disabled={disabled}
          />
        </FormGroup>
      ) : null}
    </>
  );
};
