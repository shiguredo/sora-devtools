import React, { useState } from "react";
import { Col, Collapse, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormClientId } from "@/components/Form/ClientId";
import { FormDataChannel } from "@/components/Form/DataChannel";
import { FormDataChannels } from "@/components/Form/DataChannels";
import { FormE2EE } from "@/components/Form/E2EE";
import { FormMetadata } from "@/components/Form/Metadata";
import { FormReconnect } from "@/components/Form/Reconnect";
import { FormSignalingNotifyMetadata } from "@/components/Form/SignalingNotifyMetadata";
import { FormSignalingUrlCandidates } from "@/components/Form/SignalingUrlCandidates";

export const FormRowSignalingOptions: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const e2ee = useAppSelector((state) => state.e2ee);
  const enabledClientId = useAppSelector((state) => state.enabledClientId);
  const enabledDataChannel = useAppSelector((state) => state.enabledDataChannel);
  const enabledDataChannels = useAppSelector((state) => state.enabledDataChannels);
  const enabledMetadata = useAppSelector((state) => state.enabledMetadata);
  const enabledSignalingNotifyMetadata = useAppSelector((state) => state.enabledSignalingNotifyMetadata);
  const enabledSignalingUrlCandidates = useAppSelector((state) => state.enabledSignalingUrlCandidates);
  const reconnect = useAppSelector((state) => state.reconnect);
  const enabledOptions = [
    e2ee,
    enabledClientId,
    enabledDataChannel,
    enabledDataChannels,
    enabledMetadata,
    enabledSignalingNotifyMetadata,
    enabledSignalingUrlCandidates,
    reconnect,
  ].some((e) => e);
  const linkClassNames = ["btn-collapse-options"];
  if (collapsed) {
    linkClassNames.push("collapsed");
  }
  if (enabledOptions) {
    linkClassNames.push("fw-bold");
  }
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    setCollapsed(!collapsed);
  };
  return (
    <Row className="form-row">
      <Col>
        <a href="#" className={linkClassNames.join(" ")} onClick={onClick}>
          Signaling options
        </a>
      </Col>
      <Collapse in={!collapsed}>
        <div>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormE2EE />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormReconnect />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormClientId />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormMetadata />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormSignalingNotifyMetadata />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormSignalingUrlCandidates />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormDataChannels />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto d-flex flex-column align-items-start">
              <FormDataChannel />
            </Col>
          </Row>
        </div>
      </Collapse>
    </Row>
  );
};
