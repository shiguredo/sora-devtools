import type React from "react";

import { Message } from "./Message.tsx";

interface RTCRtpCapabilitiesCodecWithIndexSignature extends RTCRtpCodec {
  [x: string]: string | number | undefined;
}

type LogProps = {
  title: string;
  codecs: RTCRtpCapabilitiesCodecWithIndexSignature[];
};

const Collapse: React.FC<LogProps> = ({ title, codecs }) => {
  return <Message title={title} timestamp={null} description={JSON.stringify(codecs, null, 2)} />;
};

const Log: React.FC<LogProps> = (props) => {
  return <Collapse {...props} />;
};

const getCapabilitiesCodec = (
  getCapabilities: (kind: string) => RTCRtpCapabilities | null,
  kind: string,
): RTCRtpCodec[] => {
  if (!getCapabilities) {
    return [];
  }
  const capabilities = getCapabilities(kind);
  if (!capabilities || !capabilities.codecs) {
    return [];
  }

  return capabilities.codecs;
};

export const CapabilitiesCodec: React.FC = () => {
  const senderAudioCapabilitiesCodec = getCapabilitiesCodec(
    (kind) => RTCRtpSender.getCapabilities(kind),
    "audio",
  );
  const senderVideoCapabilitiesCodec = getCapabilitiesCodec(
    (kind) => RTCRtpSender.getCapabilities(kind),
    "video",
  );
  const receiverAudioCapabilitiesCodec = getCapabilitiesCodec(
    (kind) => RTCRtpReceiver.getCapabilities(kind),
    "audio",
  );
  const receiverVideoCapabilitiesCodec = getCapabilitiesCodec(
    (kind) => RTCRtpReceiver.getCapabilities(kind),
    "video",
  );
  return (
    <div className="capabilities-codec">
      <Log
        title="Audio RTCRtpSender CapabilitiesCodec"
        codecs={senderAudioCapabilitiesCodec as RTCRtpCapabilitiesCodecWithIndexSignature[]}
      />
      <Log
        title="Video RTCRtpSender CapabilitiesCodec"
        codecs={senderVideoCapabilitiesCodec as RTCRtpCapabilitiesCodecWithIndexSignature[]}
      />
      <Log
        title="Audio RTCRtpReceiver CapabilitiesCodec"
        codecs={receiverAudioCapabilitiesCodec as RTCRtpCapabilitiesCodecWithIndexSignature[]}
      />
      <Log
        title="Video RTCRtpReceiver CapabilitiesCodec"
        codecs={receiverVideoCapabilitiesCodec as RTCRtpCapabilitiesCodecWithIndexSignature[]}
      />
    </div>
  );
};
