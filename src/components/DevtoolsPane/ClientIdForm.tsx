import { Col, FormControl, FormGroup, Row } from "react-bootstrap";

import { setClientId, setEnabledClientId } from "@/app/actions";
import { clientId, enabledClientId, isFormDisabled } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ClientIdForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledClientId(target.checked);
  };
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setClientId(target.value);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledClientId">
            <TooltipFormCheck
              kind="clientId"
              checked={enabledClientId.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              clientId
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledClientId.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="clientId">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="ClientIdを指定"
                value={clientId.value}
                onChange={onChangeText}
                disabled={disabled}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  );
}
