import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormAudio } from "@/components/Form/Audio";
import { FormAudioBitRate } from "@/components/Form/AudioBitRate";
import { FormAudioCodecType } from "@/components/Form/AudioCodecType";
import { FormAutoGainControl } from "@/components/Form/AutoGainControl";
import { FormEchoCancellation } from "@/components/Form/EchoCancellation";
import { FormEchoCancellationType } from "@/components/Form/EchoCancellationType";
import { FormNoiseSuppression } from "@/components/Form/NoiseSuppression";
import type { EnabledParameters } from "@/types";

type FormRowAudioSettingsProps = {
  enabledParameters: EnabledParameters;
};
export const FormRowAudioSettings: React.FC<FormRowAudioSettingsProps> = (props) => {
  return (
    <Row className="form-row" xs="auto">
      {props.enabledParameters.audio ? (
        <Col>
          <FormAudio />
        </Col>
      ) : null}
      {props.enabledParameters.audioCodecType ? (
        <Col>
          <FormAudioCodecType />
        </Col>
      ) : null}
      {props.enabledParameters.audioBitRate ? (
        <Col>
          <FormAudioBitRate />
        </Col>
      ) : null}
      {props.enabledParameters.autoGainControl ? (
        <Col>
          <FormAutoGainControl />
        </Col>
      ) : null}
      {props.enabledParameters.noiseSuppression ? (
        <Col>
          <FormNoiseSuppression />
        </Col>
      ) : null}
      {props.enabledParameters.echoCancellation ? (
        <Col>
          <FormEchoCancellation />
        </Col>
      ) : null}
      {props.enabledParameters.echoCancellationType ? (
        <Col>
          <FormEchoCancellationType />
        </Col>
      ) : null}
    </Row>
  );
};
