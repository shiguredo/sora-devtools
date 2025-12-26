import { Col, FormControl, FormGroup, Row } from "react-bootstrap";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import {
  enabledSignalingUrlCandidates,
  isFormDisabled,
  signalingUrlCandidates,
} from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function SignalingUrlCandidatesForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledSignalingUrlCandidates(target.checked);
  };
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setSignalingUrlCandidates(target.value.split("\n"));
  };
  const textareaPlaceholder = `signalingUrlCandidatesを指定
(例)
wss://sora0.example.com/signaling
wss://sora1.example.com/signaling
`;
  return (
    <>
      <Row className="form-row" xs="auto">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledSignalingUrlCandidates">
            <TooltipFormCheck
              kind="signalingUrlCandidates"
              checked={enabledSignalingUrlCandidates.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingUrlCandidates
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledSignalingUrlCandidates.value ? (
        <Row className="form-row" xs="auto">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="signalingNotifyMetadata">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder={textareaPlaceholder}
                value={signalingUrlCandidates.value.join("\n")}
                onChange={onChangeText}
                rows={5}
                cols={100}
                disabled={disabled}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  );
}
