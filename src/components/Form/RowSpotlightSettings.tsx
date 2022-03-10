import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormSimulcast } from "@/components/Form/Simulcast";
import { FormSpotlightFocusRid } from "@/components/Form/SpotlightFocusRid";
import { FormSpotlightNumber } from "@/components/Form/SpotlightNumber";
import { FormSpotlightUnfocusRid } from "@/components/Form/SpotlightUnfocusRid";

export const FormRowSpotlightSettings: React.FC = () => {
  return (
    <Row xs="auto" className="form-row">
      <Col>
        <FormSpotlightNumber />
      </Col>
      <Col>
        <FormSpotlightFocusRid />
      </Col>
      <Col>
        <FormSpotlightUnfocusRid />
      </Col>
      <Col>
        <FormSimulcast />
      </Col>
    </Row>
  );
};
