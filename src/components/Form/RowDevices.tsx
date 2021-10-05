import React from "react";
import { Col, Row } from "react-bootstrap";

import { ReloadDevices } from "@/components/Button/ReloadDevices";
import { FormAudioInput } from "@/components/Form/AudioInput";
import { FormAudioOutput } from "@/components/Form/AudioOutput";
import { FormVideoInput } from "@/components/Form/VideoInput";
import type { EnabledParameters } from "@/types";

type FormDevicesProps = {
  enabledParameters: EnabledParameters;
};
export const FormRowDevices: React.FC<FormDevicesProps> = (props) => {
  return (
    <Row className="form-row" xs="auto">
      {props.enabledParameters.audioInput ? (
        <Col>
          <FormAudioInput />
        </Col>
      ) : null}
      {props.enabledParameters.videoInput ? (
        <Col>
          <FormVideoInput />
        </Col>
      ) : null}
      {props.enabledParameters.audioOutput ? (
        <Col>
          <FormAudioOutput />
        </Col>
      ) : null}
      <ReloadDevices />
    </Row>
  );
};
