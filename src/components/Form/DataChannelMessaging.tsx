import React, { useRef } from "react";
import { Button, Col, FormCheck, FormControl, FormGroup, FormLabel, FormSelect, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDataChannelMessaging, setEnabledDataChannelMessaging } from "@/app/slice";

const FormSendDataChannelMessaging: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const sora = useAppSelector((state) => state.soraContents.sora);
  if (!sora) {
    return null;
  }
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return;
    }
    const label = selectRef.current.value;
    let text = textareaRef.current.value;
    try {
      text = JSON.parse(textareaRef.current.value);
    } catch (_) {
      // JSON parse に失敗しても何もしない
    }
    sora.sendMessage(label, text);
  };
  return (
    <Row xs="auto" className="form-row">
      <Col>
        <FormGroup className="form-inline" controlId="sendDataChannelMessaging">
          <FormLabel>sendDataChannelMessaging:</FormLabel>
          <FormSelect name="sendDataChannelMessaging" ref={selectRef}>
            {sora.messagingDataChannels.map((messagingDataChannel) => {
              return (
                <option key={messagingDataChannel.label} value={messagingDataChannel.label}>
                  {messagingDataChannel.label}
                </option>
              );
            })}
          </FormSelect>
        </FormGroup>
      </Col>
      <Col xs="6">
        <FormControl className="flex-fill" placeholder="sendDataChannelMessagingを指定" type="text" ref={textareaRef} />
      </Col>
      <Col>
        <Button variant="secondary" onClick={handleSendMessage}>
          sendDataChannelMessaging
        </Button>
      </Col>
    </Row>
  );
};

export const FormDataChannelMessaging: React.FC = () => {
  const enabledDataChannelMessaging = useAppSelector((state) => state.enabledDataChannelMessaging);
  const dataChannelMessaging = useAppSelector((state) => state.dataChannelMessaging);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledDataChannelMessaging(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDataChannelMessaging(event.target.value));
  };
  return (
    <>
      <Row className="form-row">
        <Col>
          <FormGroup className="form-inline" controlId="enabledDataChannelMessaging">
            <FormCheck
              type="switch"
              name="enabledDataChannelMessaging"
              label="dataChannelMessaging"
              checked={enabledDataChannelMessaging}
              onChange={onChangeSwitch}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannelMessaging ? (
        <>
          <Row className="form-row">
            <Col>
              <FormGroup className="form-inline w-50" controlId="dataChannelMessaging">
                <FormControl
                  className="flex-fill"
                  as="textarea"
                  placeholder="dataChannelMessagingを指定"
                  value={dataChannelMessaging}
                  onChange={onChangeText}
                  rows={10}
                />
              </FormGroup>
            </Col>
          </Row>
          <FormSendDataChannelMessaging />
        </>
      ) : null}
    </>
  );
};
