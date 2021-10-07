import React, { useEffect, useState } from "react";
import { Col, Collapse, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { FormClientId } from "@/components/Form/ClientId";
import { FormDataChannel } from "@/components/Form/DataChannel";
import { FormDataChannelMessaging } from "@/components/Form/DataChannelMessaging";
import { FormE2EE } from "@/components/Form/E2EE";
import { FormMetadata } from "@/components/Form/Metadata";
import { FormSignalingNotifyMetadata } from "@/components/Form/SignalingNotifyMetadata";
import { FormSignalingUrlCandidates } from "@/components/Form/SignalingUrlCandidates";

export const FormRowOptions: React.FC = () => {
  const e2ee = useAppSelector((state) => state.e2ee);
  const enabledClientId = useAppSelector((state) => state.enabledClientId);
  const enabledDataChannel = useAppSelector((state) => state.enabledDataChannel);
  const enabledDataChannelMessaging = useAppSelector((state) => state.enabledDataChannelMessaging);
  const enabledMetadata = useAppSelector((state) => state.enabledMetadata);
  const enabledSignalingNotifyMetadata = useAppSelector((state) => state.enabledSignalingNotifyMetadata);
  const enabledSignalingUrlCandidates = useAppSelector((state) => state.enabledSignalingUrlCandidates);
  const enabledOptions = [
    e2ee,
    enabledClientId,
    enabledDataChannel,
    enabledDataChannelMessaging,
    enabledMetadata,
    enabledSignalingNotifyMetadata,
    enabledSignalingUrlCandidates,
  ].some((e) => e);
  const [collapsed, setCollapsed] = useState(true);
  useEffect(() => {
    if (enabledOptions) {
      setCollapsed(false);
    }
  }, [enabledOptions]);
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    setCollapsed(!collapsed);
  };
  return (
    <Row className="form-row">
      <Col>
        <a href="#" className={collapsed ? "btn-collapse-options collapsed" : "btn-collapse-options"} onClick={onClick}>
          Options
        </a>
      </Col>
      <Collapse in={!collapsed}>
        <div>
          <Row className="form-row">
            <Col>
              <FormE2EE />
            </Col>
          </Row>
          <FormClientId />
          <FormMetadata />
          <FormSignalingNotifyMetadata />
          <FormDataChannel />
          <FormSignalingUrlCandidates />
          <FormDataChannelMessaging />
        </div>
      </Collapse>
    </Row>
  );
};
