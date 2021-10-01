import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormFrameRate } from "@/components/Form/FrameRate";
import { FormResolution } from "@/components/Form/Resolution";
import { FormSimulcastRid } from "@/components/Form/SimulcastRid";
import { FormVideo } from "@/components/Form/Video";
import { FormVideoBitRate } from "@/components/Form/VideoBitRate";
import { FormVideoCodecType } from "@/components/Form/VideoCodecType";
import { EnabledParameters } from "@/utils";

type FormRowVideoSettingsProps = {
  enabledParameters: EnabledParameters;
};
export const FormRowVideoSettings: React.FC<FormRowVideoSettingsProps> = (props) => {
  return (
    <Row className="form-row" xs="auto">
      {props.enabledParameters.video ? (
        <Col>
          <FormVideo />
        </Col>
      ) : null}
      {props.enabledParameters.videoCodecType ? (
        <Col>
          <FormVideoCodecType />
        </Col>
      ) : null}
      {props.enabledParameters.videoBitRate ? (
        <Col>
          <FormVideoBitRate />
        </Col>
      ) : null}
      {props.enabledParameters.resolution ? (
        <Col>
          <FormResolution />
        </Col>
      ) : null}
      {props.enabledParameters.frameRate ? (
        <Col>
          <FormFrameRate />
        </Col>
      ) : null}
      {props.enabledParameters.simulcastRid ? (
        <Col>
          <FormSimulcastRid />
        </Col>
      ) : null}
    </Row>
  );
};
