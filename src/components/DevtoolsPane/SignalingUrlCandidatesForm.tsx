import React from "react";
import { Col, FormControl, FormGroup, Row } from "react-bootstrap";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck";

export const SignalingUrlCandidatesForm: React.FC = () => {
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
      <Row className="form-row" xs="auto">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledSignalingUrlCandidates">
            <TooltipFormCheck
              kind="signalingUrlCandidates"
              checked={enabledSignalingUrlCandidates}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingUrlCandidates
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledSignalingUrlCandidates ? (
        <Row className="form-row" xs="auto">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="signalingNotifyMetadata">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="signalingUrlCandidatesを指定"
                value={signalingUrlCandidates.join("\n")}
                onChange={onChangeText}
                rows={5}
                cols={100}
                disabled={disabled}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  );
};
