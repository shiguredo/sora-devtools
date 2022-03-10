import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormVideo } from "@/components/Form/Video";
import { FormVideoBitRate } from "@/components/Form/VideoBitRate";
import { FormVideoCodecType } from "@/components/Form/VideoCodecType";

export const FormRowVideoSettings: React.FC = () => {
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormVideo />
      </Col>
      <Col>
        <FormVideoCodecType />
      </Col>
      <Col>
        <FormVideoBitRate />
      </Col>
    </Row>
  );
};
