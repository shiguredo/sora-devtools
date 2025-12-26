import { Col, FormGroup, Row } from "react-bootstrap";

import { setEnabledVideoAV1Params, setVideoAV1Params } from "@/app/actions";
import { enabledVideoAV1Params, isFormDisabled, videoAV1Params } from "@/app/signals";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function VideoAV1ParamsForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledVideoAV1Params(target.checked);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoAV1Params">
            <TooltipFormCheck
              kind="videoAV1Params"
              checked={enabledVideoAV1Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoAV1Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledVideoAV1Params.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="videoAV1Params"
              placeholder="videoAV1Paramsを指定"
              value={videoAV1Params.value}
              setValue={(value) => setVideoAV1Params(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  );
}
