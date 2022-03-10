import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormAudio } from "@/components/Form/Audio";
import { FormAudioBitRate } from "@/components/Form/AudioBitRate";
import { FormAudioCodecType } from "@/components/Form/AudioCodecType";

export const FormRowAudioSettings: React.FC = () => {
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormAudio />
      </Col>
      <Col>
        <FormAudioCodecType />
      </Col>
      <Col>
        <FormAudioBitRate />
      </Col>
    </Row>
  );
};
