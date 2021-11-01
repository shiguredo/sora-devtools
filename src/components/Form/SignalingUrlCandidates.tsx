import React from "react";
import { FormCheck, FormControl, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/slice";

export const FormSignalingUrlCandidates: React.FC = () => {
  const enabledSignalingUrlCandidates = useAppSelector((state) => state.enabledSignalingUrlCandidates);
  const signalingUrlCandidates = useAppSelector((state) => state.signalingUrlCandidates);
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
        />
      </FormGroup>
      <FormGroup className="form-inline" controlId="signalingNotifyMetadata">
        <FormControl
          className="flex-fill w-500"
          as="textarea"
          placeholder="signalingUrlCandidatesを指定"
          value={signalingUrlCandidates.join("\n")}
          onChange={onChangeText}
          rows={5}
          disabled={!enabledSignalingUrlCandidates}
        />
      </FormGroup>
    </>
  );
};
