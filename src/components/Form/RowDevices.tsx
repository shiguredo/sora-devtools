import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { ReloadDevices } from "@/components/Button/ReloadDevices";
import { FormAudioInput } from "@/components/Form/AudioInput";
import { FormAudioOutput } from "@/components/Form/AudioOutput";
import { FormVideoInput } from "@/components/Form/VideoInput";

export const FormRowDevices: React.FC = () => {
  const displaySettings = useAppSelector((state) => state.displaySettings);
  return (
    <Row className="form-row" xs="auto">
      {displaySettings.audioInput ? (
        <Col>
          <FormAudioInput />
        </Col>
      ) : null}
      {displaySettings.videoInput ? (
        <Col>
          <FormVideoInput />
        </Col>
      ) : null}
      {displaySettings.audioOutput ? (
        <Col>
          <FormAudioOutput />
        </Col>
      ) : null}
      <ReloadDevices />
    </Row>
  );
};
