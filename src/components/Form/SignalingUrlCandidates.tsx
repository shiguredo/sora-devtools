import React from "react";
import { Col, FormCheck, FormControl, FormGroup, Row } from "react-bootstrap";

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
      <Row className="form-row">
        <Col>
          <FormGroup className="form-inline" controlId="enabledSignalingUrlCandidates">
            <FormCheck
              type="switch"
              name="enabledSignalingUrlCandidates"
              label="signalingUrlCandidates"
              checked={enabledSignalingUrlCandidates}
              onChange={onChangeSwitch}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledSignalingUrlCandidates ? (
        <Row>
          <Col>
            <FormGroup className="form-inline w-50" controlId="signalingNotifyMetadata">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="signalingUrlCandidatesを指定"
                value={signalingUrlCandidates.join("\n")}
                onChange={onChangeText}
                rows={10}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  );
};
