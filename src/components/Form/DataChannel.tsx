import React from "react";
import { Col, FormCheck, FormGroup, FormLabel, FormSelect, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDataChannelSignaling, setEnabledDataChannel, setIgnoreDisconnectWebSocket } from "@/app/slice";
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from "@/constants";
import { isDataChannelSignaling, isIgnoreDisconnectWebSocket } from "@/utils";

const FormIgnoreDisconnectWebSocket: React.FC = () => {
  const ignoreDisconnectWebSocket = useAppSelector((state) => state.ignoreDisconnectWebSocket);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isIgnoreDisconnectWebSocket(event.target.value)) {
      dispatch(setIgnoreDisconnectWebSocket(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="ignoreDisconnectWebSocket">
      <FormLabel>ignoreDisconnectWebSocket:</FormLabel>
      <FormSelect name="ignoreDisconnectWebSocket" value={ignoreDisconnectWebSocket} onChange={onChange}>
        {IGNORE_DISCONNECT_WEBSOCKET.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};

const FormDataChannelSignaling: React.FC = () => {
  const dataChannelSignaling = useAppSelector((state) => state.dataChannelSignaling);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isDataChannelSignaling(event.target.value)) {
      dispatch(setDataChannelSignaling(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="dataChannelSignaling">
      <FormLabel>dataChannelSignaling:</FormLabel>
      <FormSelect name="dataChannelSignaling" value={dataChannelSignaling} onChange={onChange}>
        {DATA_CHANNEL_SIGNALING.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};

export const FormDataChannel: React.FC = () => {
  const enabledDataChannel = useAppSelector((state) => state.enabledDataChannel);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledDataChannel(event.target.checked));
  };
  return (
    <>
      <Row className="form-row">
        <Col>
          <FormGroup className="form-inline" controlId="enabledDataChannel">
            <FormCheck
              type="switch"
              name="enabledDataChannel"
              label="dataChannel"
              checked={enabledDataChannel}
              onChange={onChangeSwitch}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannel ? (
        <Row xs="auto">
          <Col>
            <FormDataChannelSignaling />
          </Col>
          <Col>
            <FormIgnoreDisconnectWebSocket />
          </Col>
        </Row>
      ) : null}
    </>
  );
};
