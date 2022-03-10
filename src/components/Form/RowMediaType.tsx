import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormFakeVolume } from "@/components/Form/FakeVolume";
import { FormMediaType } from "@/components/Form/MediaType";

export const FormRowMediaType: React.FC = () => {
  return (
    <Row xs="auto" className="form-row">
      <Col>
        <FormMediaType />
      </Col>
      <Col>
        <FormFakeVolume />
      </Col>
    </Row>
  );
};
