import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormChannelId } from "@/components/Form/ChannelId";

export const FormRowChannelId: React.FC = () => {
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormChannelId />
      </Col>
    </Row>
  );
};
