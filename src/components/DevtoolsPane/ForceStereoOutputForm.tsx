import { Col, FormGroup, Row } from "react-bootstrap";

import { forceStereoOutput, isFormDisabled, setForceStereoOutput } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ForceStereoOutputForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setForceStereoOutput(target.checked);
  };
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="forceStereoOutput">
          <TooltipFormCheck
            kind="forceStereoOutput"
            checked={forceStereoOutput.value}
            onChange={onChangeSwitch}
            disabled={disabled}
          >
            forceStereoOutput
          </TooltipFormCheck>
        </FormGroup>
      </Col>
    </Row>
  );
}
