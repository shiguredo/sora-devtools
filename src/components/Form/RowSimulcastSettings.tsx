import React from "react";
import { Col, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormSimulcastRid } from "@/components/Form/SimulcastRid";

export const FormRowSimulcastSettings: React.FC = () => {
  const displaySettings = useAppSelector((state) => state.displaySettings);
  return (
    <Row xs="auto" className="form-row">
      {displaySettings.simulcastRid ? (
        <Col>
          <FormSimulcastRid />
        </Col>
      ) : null}
    </Row>
  );
};
