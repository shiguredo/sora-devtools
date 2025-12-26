import { Col, FormCheck, FormGroup, FormSelect, Row } from "react-bootstrap";

import {
  setDataChannelSignaling,
  setEnabledDataChannel,
  setIgnoreDisconnectWebSocket,
} from "@/app/actions";
import {
  dataChannelSignaling,
  enabledDataChannel,
  ignoreDisconnectWebSocket,
  isFormDisabled,
} from "@/app/signals";
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

function IgnoreDisconnectWebSocketForm(props: { disabled: boolean }) {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      setIgnoreDisconnectWebSocket(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="ignoreDisconnectWebSocket">
      <TooltipFormLabel kind="ignoreDisconnectWebSocket">
        ignoreDisconnectWebSocket:
      </TooltipFormLabel>
      <FormSelect
        name="ignoreDisconnectWebSocket"
        value={ignoreDisconnectWebSocket.value}
        onChange={onChange}
        disabled={props.disabled}
      >
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
}

function DataChannelSignalingForm(props: { disabled: boolean }) {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, DATA_CHANNEL_SIGNALING)) {
      setDataChannelSignaling(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="dataChannelSignaling">
      <TooltipFormLabel kind="dataChannelSignaling">dataChannelSignaling:</TooltipFormLabel>
      <FormSelect
        name="dataChannelSignaling"
        value={dataChannelSignaling.value}
        onChange={onChange}
        disabled={props.disabled}
      >
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
}

export function DataChannelForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledDataChannel(target.checked);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledDataChannel">
            <FormCheck
              type="switch"
              name="enabledDataChannel"
              label="dataChannel"
              checked={enabledDataChannel.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannel.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <Row xs="auto">
              <Col>
                <DataChannelSignalingForm disabled={disabled} />
              </Col>
              <Col>
                <IgnoreDisconnectWebSocketForm disabled={disabled} />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : null}
    </>
  );
}
