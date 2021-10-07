import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormAudio } from "@/components/Form/Audio";
import { FormAudioBitRate } from "@/components/Form/AudioBitRate";
import { FormAudioCodecType } from "@/components/Form/AudioCodecType";
import { FormAutoGainControl } from "@/components/Form/AutoGainControl";
import { FormEchoCancellation } from "@/components/Form/EchoCancellation";
import { FormEchoCancellationType } from "@/components/Form/EchoCancellationType";
import { FormNoiseSuppression } from "@/components/Form/NoiseSuppression";

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
      {displaySettings.audioConstraints ? (
        <>
          <Col>
            <FormAutoGainControl />
          </Col>
          <Col>
            <FormNoiseSuppression />
          </Col>
          <Col>
            <FormEchoCancellation />
          </Col>
          <Col>
            <FormEchoCancellationType />
          </Col>
        </>
      ) : null}
    </Row>
  );
};
