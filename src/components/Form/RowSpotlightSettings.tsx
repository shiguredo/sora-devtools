import React from "react";
import { Col, Row } from "react-bootstrap";

import { FormSpotlightFocusRid } from "@/components/Form/SpotlightFocusRid";
import { FormSpotlightNumber } from "@/components/Form/SpotlightNumber";
import { FormSpotlightUnfocusRid } from "@/components/Form/SpotlightUnfocusRid";
import { EnabledParameters } from "@/utils";

type FormSpotlightProps = {
  enabledParameters: EnabledParameters;
};
export const FormRowSpotlightSettings: React.FC<FormSpotlightProps> = (props) => {
  return (
    <Row xs="auto" className="form-row">
      <Col>
        <FormSpotlightNumber />
      </Col>
      {props.enabledParameters.spotlightFocusRid ? (
        <Col>
          <FormSpotlightFocusRid />
        </Col>
      ) : null}
      {props.enabledParameters.spotlightUnfocusRid ? (
        <Col>
          <FormSpotlightUnfocusRid />
        </Col>
      ) : null}
    </Row>
  );
};
