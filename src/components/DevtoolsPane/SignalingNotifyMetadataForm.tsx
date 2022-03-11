import React from "react";
import { Col, FormCheck, FormControl, FormGroup, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setEnabledSignalingNotifyMetadata, setSignalingNotifyMetadata } from "@/app/slice";
import { isFormDisabled } from "@/utils";

export const SignalingNotifyMetadataForm: React.FC = () => {
  const enabledSignalingNotifyMetadata = useAppSelector((state) => state.enabledSignalingNotifyMetadata);
  const signalingNotifyMetadata = useAppSelector((state) => state.signalingNotifyMetadata);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledSignalingNotifyMetadata(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSignalingNotifyMetadata(event.target.value));
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledSignalingNotifyMetadata">
            <FormCheck
              type="switch"
              name="enabledSignalingNotifyMetadata"
              label="signalingNotifyMetadata"
              checked={enabledSignalingNotifyMetadata}
              onChange={onChangeSwitch}
              disabled={disabled}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledSignalingNotifyMetadata ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="signalingNotifyMetadata">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="signalingNotifyMetadataを指定"
                value={signalingNotifyMetadata}
                onChange={onChangeText}
                rows={10}
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
