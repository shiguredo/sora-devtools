import React from "react";
import { Col, FormCheck, FormControl, FormGroup, Row } from "react-bootstrap";

import { setDataChannels, setEnabledDataChannels } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { isFormDisabled } from "@/utils";

export const DataChannelsForm: React.FC = () => {
  const enabledDataChannels = useAppSelector((state) => state.enabledDataChannels);
  const dataChannels = useAppSelector((state) => state.dataChannels);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const textareaPlaceholder =
    "dataChannelsを指定\n(例)\n" +
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
    dispatch(setEnabledDataChannels(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDataChannels(event.target.value));
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledDataChannels">
            <FormCheck
              type="switch"
              name="enabledDataChannels"
              label="dataChannels"
              checked={enabledDataChannels}
              onChange={onChangeSwitch}
              disabled={disabled}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannels ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="dataChannels">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder={textareaPlaceholder}
                value={dataChannels}
                onChange={onChangeText}
                rows={12}
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
