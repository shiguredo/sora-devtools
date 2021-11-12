import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
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
    </Row>
  );
};
