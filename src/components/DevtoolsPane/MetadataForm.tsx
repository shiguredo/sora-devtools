import { Col, FormGroup, Row } from "react-bootstrap";

import { setEnabledMetadata, setMetadata } from "@/app/actions";
import { enabledMetadata, isFormDisabled, metadata } from "@/app/signals";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function MetadataForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledMetadata(target.checked);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledMetadata">
            <TooltipFormCheck
              kind="metadata"
              checked={enabledMetadata.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              metadata
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledMetadata.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="metadata"
              placeholder="Metadataを指定"
              value={metadata.value}
              setValue={(value) => setMetadata(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  );
}
