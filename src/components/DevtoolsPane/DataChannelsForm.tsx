import type React from "react";
import { Button, Col, FormGroup, Row } from "react-bootstrap";

import { setDataChannels, setEnabledDataChannels } from "@/app/actions";
import { useSoraDevtoolsStore } from "@/app/store";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const DataChannelsForm: React.FC = () => {
  const enabledDataChannels = useSoraDevtoolsStore((state) => state.enabledDataChannels);
  const dataChannels = useSoraDevtoolsStore((state) => state.dataChannels);
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const exampleJsonString = JSON.stringify(
    [
      {
        label: "#devtools",
        maxPacketLifeTime: 10,
        ordered: true,
        compress: false,
        direction: "sendrecv",
      },
    ],
    null,
    2,
  );
  const textareaPlaceholder = `dataChannelsを指定\n(例)\n${exampleJsonString}`;
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledDataChannels(event.target.checked);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledDataChannels">
            <TooltipFormCheck
              kind="dataChannels"
              checked={enabledDataChannels}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              dataChannels
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannels ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="dataChannels"
              placeholder={textareaPlaceholder}
              value={dataChannels}
              setValue={(value) => setDataChannels(value)}
              disabled={disabled}
              rows={12}
              extraControls={
                <Button
                  type="button"
                  variant="light"
                  size="sm"
                  onClick={() => setDataChannels(exampleJsonString)}
                >
                  load template
                </Button>
              }
            />
          </Col>
        </Row>
      ) : null}
    </>
  );
};
