import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormFrameRate } from "@/components/Form/FrameRate";
import { FormResolution } from "@/components/Form/Resolution";
import { FormSimulcastRid } from "@/components/Form/SimulcastRid";
import { FormVideo } from "@/components/Form/Video";
import { FormVideoBitRate } from "@/components/Form/VideoBitRate";
import { FormVideoCodecType } from "@/components/Form/VideoCodecType";

export const FormRowVideoSettings: React.FC = () => {
  const displaySettings = useAppSelector((state) => state.displaySettings);
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormVideo />
      </Col>
      {displaySettings.videoCodecType ? (
        <Col>
          <FormVideoCodecType />
        </Col>
      ) : null}
      {displaySettings.videoBitRate ? (
        <Col>
          <FormVideoBitRate />
        </Col>
      ) : null}
      {displaySettings.videoConstraints ? (
        <>
          <Col>
            <FormResolution />
          </Col>
          <Col>
            <FormFrameRate />
          </Col>
        </>
      ) : null}
      {displaySettings.simulcastRid ? (
        <Col>
          <FormSimulcastRid />
        </Col>
      ) : null}
    </Row>
  );
};
