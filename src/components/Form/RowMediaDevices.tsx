import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormAudioTrack } from "@/components/Form/AudioTrack";
import { FormCameraDevice } from "@/components/Form/CameraDevice";
import { FormDisplayResolution } from "@/components/Form/DisplayResolution";
import { FormMicDevice } from "@/components/Form/MicDevice";
import { FormVideoTrack } from "@/components/Form/VideoTrack";

export const FormRowMediaDevices: React.FC = () => {
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormDisplayResolution />
      </Col>
      <Col>
        <FormMicDevice />
      </Col>
      <Col>
        <FormCameraDevice />
      </Col>
      <Col>
        <FormAudioTrack />
      </Col>
      <Col>
        <FormVideoTrack />
      </Col>
    </Row>
  );
};
