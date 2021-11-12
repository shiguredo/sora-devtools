import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormFakeVolume } from "@/components/Form/FakeVolume";
import { FormMediaType } from "@/components/Form/MediaType";

export const FormRowMediaType: React.FC = () => {
  const displaySettings = useAppSelector((state) => state.displaySettings);
  if (!displaySettings.mediaType) {
    return null;
  }
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
