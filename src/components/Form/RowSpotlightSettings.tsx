import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormSimulcast } from "@/components/Form/Simulcast";
import { FormSpotlightFocusRid } from "@/components/Form/SpotlightFocusRid";
import { FormSpotlightNumber } from "@/components/Form/SpotlightNumber";
import { FormSpotlightUnfocusRid } from "@/components/Form/SpotlightUnfocusRid";

export const FormRowSpotlightSettings: React.FC = () => {
  const displaySettings = useAppSelector((state) => state.displaySettings);
  return (
    <Row xs="auto" className="form-row">
      {displaySettings.spotlightNumber ? (
        <Col>
          <FormSpotlightNumber />
        </Col>
      ) : null}
      {displaySettings.spotlightFocusRid ? (
        <Col>
          <FormSpotlightFocusRid />
        </Col>
      ) : null}
      {displaySettings.spotlightUnfocusRid ? (
        <Col>
          <FormSpotlightUnfocusRid />
        </Col>
      ) : null}
      {displaySettings.simulcast ? (
        <Col>
          <FormSimulcast />
        </Col>
      ) : null}
    </Row>
  );
};
