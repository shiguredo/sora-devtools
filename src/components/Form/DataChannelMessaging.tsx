import React from "react";
import { Col, FormCheck, FormControl, FormGroup, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDataChannelMessaging, setEnabledDataChannelMessaging } from "@/app/slice";

export const FormDataChannelMessaging: React.FC = () => {
  const enabledDataChannelMessaging = useAppSelector((state) => state.enabledDataChannelMessaging);
  const dataChannelMessaging = useAppSelector((state) => state.dataChannelMessaging);
  const dispatch = useAppDispatch();
  const textareaPlaceholder =
    "dataChannelMessagingを指定\n(例)\n" +
    JSON.stringify(
      [
        {
          label: "#spam",
          maxPacketLifeTime: 10,
          ordered: true,
          protocol: "efg",
          compress: false,
          direction: "sendrecv",
        },
      ],
      null,
      2
    );
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
                  placeholder={textareaPlaceholder}
                  value={dataChannelMessaging}
                  onChange={onChangeText}
                  rows={12}
                />
              </FormGroup>
            </Col>
          </Row>
        </>
      ) : null}
    </>
  );
};
