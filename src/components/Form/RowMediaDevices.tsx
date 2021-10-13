import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormAudioContentHint } from "@/components/Form/AudioContentHint";
import { FormAudioTrack } from "@/components/Form/AudioTrack";
import { FormCameraDevice } from "@/components/Form/CameraDevice";
import { FormDisplayResolution } from "@/components/Form/DisplayResolution";
import { FormMicDevice } from "@/components/Form/MicDevice";
import { FormVideoContentHint } from "@/components/Form/VideoContentHint";
import { FormVideoTrack } from "@/components/Form/VideoTrack";

export const FormRowMediaDevices: React.FC = () => {
  const displaySettings = useAppSelector((state) => state.displaySettings);
  return (
    <Row className="form-row" xs="auto">
      {displaySettings.displayResolution ? (
        <Col>
          <FormDisplayResolution />
        </Col>
      ) : null}
      {displaySettings.micDevice ? (
        <Col>
          <FormMicDevice />
        </Col>
      ) : null}
      {displaySettings.cameraDevice ? (
        <Col>
          <FormCameraDevice />
        </Col>
      ) : null}
      {displaySettings.audioTrack ? (
        <Col>
          <FormAudioTrack />
        </Col>
      ) : null}
      {displaySettings.videoTrack ? (
        <Col>
          <FormVideoTrack />
        </Col>
      ) : null}
      {displaySettings.audioContentHint ? (
        <Col>
          <FormAudioContentHint />
        </Col>
      ) : null}
      {displaySettings.videoContentHint ? (
        <Col>
          <FormVideoContentHint />
        </Col>
      ) : null}
    </Row>
  );
};
