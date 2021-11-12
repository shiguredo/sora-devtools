import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormAudio } from "@/components/Form/Audio";
import { FormAudioBitRate } from "@/components/Form/AudioBitRate";
import { FormAudioCodecType } from "@/components/Form/AudioCodecType";

export const FormRowAudioSettings: React.FC = () => {
  const displaySettings = useAppSelector((state) => state.displaySettings);
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormAudio />
      </Col>
      {displaySettings.audioCodecType ? (
        <Col>
          <FormAudioCodecType />
        </Col>
      ) : null}
      {displaySettings.audioBitRate ? (
        <Col>
          <FormAudioBitRate />
        </Col>
      ) : null}
    </Row>
  );
};
