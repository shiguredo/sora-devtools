import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormSimulcastRid } from "@/components/Form/SimulcastRid";

export const FormRowSimulcastSettings: React.FC = () => {
  return (
    <Row xs="auto" className="form-row">
      <Col>
        <FormSimulcastRid />
      </Col>
    </Row>
  );
};
