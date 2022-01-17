import React, { useState } from "react";
import { Col, Collapse, Row } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";
import { ButtonUpdateMediaStream } from "@/components/Button/UpdateMediaStream";
import { FormAspectRatio } from "@/components/Form/AspectRatio";
import { FormAudioContentHint } from "@/components/Form/AudioContentHint";
import { FormAutoGainControl } from "@/components/Form/AutoGainControl";
import { FormBlurRadius } from "@/components/Form/BlurRadius";
import { FormEchoCancellation } from "@/components/Form/EchoCancellation";
import { FormEchoCancellationType } from "@/components/Form/EchoCancellationType";
import { FormFrameRate } from "@/components/Form/FrameRate";
import { FormMediaProcessorsNoiseSuppression } from "@/components/Form/MediaProcessorsNoiseSuppression";
import { FormNoiseSuppression } from "@/components/Form/NoiseSuppression";
import { FormResizeMode } from "@/components/Form/ResizeMode";
import { FormResolution } from "@/components/Form/Resolution";
import { FormVideoContentHint } from "@/components/Form/VideoContentHint";

export const FormRowMediaOptions: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const displaySettings = useAppSelector((state) => state.displaySettings);
  const audioContentHint = useAppSelector((state) => state.audioContentHint);
  const autoGainControl = useAppSelector((state) => state.autoGainControl);
  const noiseSuppression = useAppSelector((state) => state.noiseSuppression);
  const echoCancellation = useAppSelector((state) => state.echoCancellation);
  const echoCancellationType = useAppSelector((state) => state.echoCancellationType);
  const videoContentHint = useAppSelector((state) => state.videoContentHint);
  const resolution = useAppSelector((state) => state.resolution);
  const frameRate = useAppSelector((state) => state.frameRate);
  const blurRadius = useAppSelector((state) => state.blurRadius);
  const mediaProcessorsNoiseSuppression = useAppSelector((state) => state.mediaProcessorsNoiseSuppression);
  const enabledOptions = [
    audioContentHint !== "",
    autoGainControl !== "",
    noiseSuppression !== "",
    echoCancellation !== "",
    echoCancellationType !== "",
    videoContentHint !== "",
    resolution !== "",
    frameRate !== "",
    blurRadius !== "",
    mediaProcessorsNoiseSuppression,
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
          Media options
        </a>
      </Col>
      <Collapse in={!collapsed}>
        <div>
          {displaySettings.audioConstraints ? (
            <Row className="form-row">
              <Col className="col-auto">
                <FormAudioContentHint />
              </Col>
              <Col className="col-auto">
                <FormAutoGainControl />
              </Col>
              <Col className="col-auto">
                <FormNoiseSuppression />
              </Col>
              <Col className="col-auto">
                <FormEchoCancellation />
              </Col>
              <Col className="col-auto">
                <FormEchoCancellationType />
              </Col>
              <Col className="col-auto">
                <FormMediaProcessorsNoiseSuppression />
              </Col>
            </Row>
          ) : null}
          {displaySettings.videoConstraints ? (
            <Row className="form-row">
              <Col className="col-auto">
                <FormVideoContentHint />
              </Col>
              <Col className="col-auto">
                <FormResolution />
              </Col>
              <Col className="col-auto">
                <FormFrameRate />
              </Col>
              <Col className="col-auto">
                <FormAspectRatio />
              </Col>
              <Col className="col-auto">
                <FormResizeMode />
              </Col>
              <Col className="col-auto">
                <FormBlurRadius />
              </Col>
            </Row>
          ) : null}
          <ButtonUpdateMediaStream />
        </div>
      </Collapse>
    </Row>
  );
};
