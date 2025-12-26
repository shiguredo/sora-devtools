import { Button, Col, FormGroup, Row } from "react-bootstrap";

import { setDataChannels, setEnabledDataChannels } from "@/app/actions";
import { dataChannels, enabledDataChannels, isFormDisabled } from "@/app/signals";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function DataChannelsForm() {
  const disabled = isFormDisabled.value;
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
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledDataChannels(target.checked);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledDataChannels">
            <TooltipFormCheck
              kind="dataChannels"
              checked={enabledDataChannels.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              dataChannels
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannels.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="dataChannels"
              placeholder={textareaPlaceholder}
              value={dataChannels.value}
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
}
