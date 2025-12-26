import { Col, FormGroup, Row } from "react-bootstrap";

import { setEnabledSignalingNotifyMetadata, setSignalingNotifyMetadata } from "@/app/actions";
import {
  enabledSignalingNotifyMetadata,
  isFormDisabled,
  signalingNotifyMetadata,
} from "@/app/signals";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function SignalingNotifyMetadataForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledSignalingNotifyMetadata(target.checked);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledSignalingNotifyMetadata">
            <TooltipFormCheck
              kind="signalingNotifyMetadata"
              checked={enabledSignalingNotifyMetadata.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingNotifyMetadata
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledSignalingNotifyMetadata.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="signalingNotifyMetadata"
              placeholder="signalingNotifyMetadataを指定"
              value={signalingNotifyMetadata.value}
              setValue={(value) => setSignalingNotifyMetadata(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  );
}
