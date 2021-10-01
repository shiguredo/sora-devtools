import React from "react";
import { Col, FormCheck, FormControl, FormGroup, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setClientId, setEnabledClientId } from "@/app/slice";

export const FormClientId: React.FC = () => {
  const enabledClientId = useAppSelector((state) => state.enabledClientId);
  const clientId = useAppSelector((state) => state.clientId);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledClientId(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setClientId(event.target.value));
  };
  return (
    <>
      <Row className="form-row">
        <Col>
          <FormGroup className="form-inline" controlId="enabledClientId">
            <FormCheck
              type="switch"
              name="enabledClientId"
              label="clientId"
              checked={enabledClientId}
              onChange={onChangeSwitch}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledClientId ? (
        <Row>
          <Col>
            <FormGroup className="form-inline w-50" controlId="clientId">
              <FormControl
                className="flex-fill"
                type="text"
                placeholder="ClientIdを指定"
                value={clientId}
                onChange={onChangeText}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  );
};
