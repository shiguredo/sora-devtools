import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormAudioTrack } from "@/components/Form/AudioTrack";
import { FormCameraDevice } from "@/components/Form/CameraDevice";
import { FormDisplayResolution } from "@/components/Form/DisplayResolution";
import { FormMicDevice } from "@/components/Form/MicDevice";
import { FormVideoTrack } from "@/components/Form/VideoTrack";
import type { EnabledParameters } from "@/types";

type FormMediaDevicesProps = {
  enabledParameters: EnabledParameters;
};
export const FormRowMediaDevices: React.FC<FormMediaDevicesProps> = (props) => {
  return (
    <Row className="form-row" xs="auto">
      {props.enabledParameters.displayResolution ? (
        <Col>
          <FormDisplayResolution />
        </Col>
      ) : null}
      {props.enabledParameters.micDevice ? (
        <Col>
          <FormMicDevice />
        </Col>
      ) : null}
      {props.enabledParameters.cameraDevice ? (
        <Col>
          <FormCameraDevice />
        </Col>
      ) : null}
      {props.enabledParameters.audioTrack ? (
        <Col>
          <FormAudioTrack />
        </Col>
      ) : null}
      {props.enabledParameters.videoTrack ? (
        <Col>
          <FormVideoTrack />
        </Col>
      ) : null}
    </Row>
  );
};
