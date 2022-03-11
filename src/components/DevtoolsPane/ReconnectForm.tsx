import React from "react";
import { Col, FormCheck, FormGroup, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setReconnect } from "@/app/slice";
import { isFormDisabled } from "@/utils";

export const ReconnectForm: React.FC = () => {
  const reconnect = useAppSelector((state) => state.reconnect);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setReconnect(event.target.checked));
  };
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="reconnect">
          <FormCheck
            type="switch"
            name="reconnect"
            label="reconnect"
            checked={reconnect}
            onChange={onChange}
            disabled={disabled}
          />
        </FormGroup>
      </Col>
    </Row>
  );
};
