import { Col, FormGroup, Row } from "react-bootstrap";

import { setReconnect } from "@/app/actions";
import { isFormDisabled, reconnect } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ReconnectForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setReconnect(target.checked);
  };
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="reconnect">
          <TooltipFormCheck
            kind="reconnect"
            checked={reconnect.value}
            onChange={onChange}
            disabled={disabled}
          >
            reconnect
          </TooltipFormCheck>
        </FormGroup>
      </Col>
    </Row>
  );
}
