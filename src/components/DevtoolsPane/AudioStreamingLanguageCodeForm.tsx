import { Col, FormControl, FormGroup, Row } from "react-bootstrap";

import {
  audioStreamingLanguageCode,
  enabledAudioStreamingLanguageCode,
  isFormDisabled,
  setAudioStreamingLanguageCode,
  setEnabledAudioStreamingLanguageCode,
} from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function AudioStreamingLanguageCodeForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledAudioStreamingLanguageCode(target.checked);
  };
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setAudioStreamingLanguageCode(target.value);
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledAudioStreamingLanguageCode">
            <TooltipFormCheck
              kind="audioStreamingLanguageCode"
              checked={enabledAudioStreamingLanguageCode.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              audioStreamingLanguageCode
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledAudioStreamingLanguageCode.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="audioStreamingLanguageCode">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="audioStreamingLanguageCodeを指定"
                value={audioStreamingLanguageCode.value}
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
