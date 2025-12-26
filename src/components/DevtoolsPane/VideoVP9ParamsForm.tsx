import { Col, FormGroup, Row } from "react-bootstrap";

import { setEnabledVideoVP9Params, setVideoVP9Params } from "@/app/actions";
import { enabledVideoVP9Params, isFormDisabled, videoVP9Params } from "@/app/signals";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function VideoVP9ParamsForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledVideoVP9Params(target.checked);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoVP9Params">
            <TooltipFormCheck
              kind="videoVP9Params"
              checked={enabledVideoVP9Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoVP9Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledVideoVP9Params.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="videoVP9Params"
              placeholder="videoVP9Paramsを指定"
              value={videoVP9Params.value}
              setValue={(value) => setVideoVP9Params(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  );
}
