import React from "react";
import { Col, Row } from "react-bootstrap";

import { ReloadDevices } from "@/components/Button/ReloadDevices";
import { FormAudioInput } from "@/components/Form/AudioInput";
import { FormAudioOutput } from "@/components/Form/AudioOutput";
import { FormVideoInput } from "@/components/Form/VideoInput";

export const FormRowDevices: React.FC = () => {
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormAudioInput />
      </Col>
      <Col>
        <FormVideoInput />
      </Col>
      <Col>
        <FormAudioOutput />
      </Col>
      <ReloadDevices />
    </Row>
  );
};
