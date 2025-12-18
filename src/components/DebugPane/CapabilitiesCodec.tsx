import type { FunctionComponent } from "preact";

import { Message } from "./Message.tsx";

interface RTCRtpCapabilitiesCodecWithIndexSignature extends RTCRtpCodec {
  [x: string]: string | number | undefined;
}

type LogProps = {
  title: string;
  codecs: RTCRtpCapabilitiesCodecWithIndexSignature[];
};

const Collapse: FunctionComponent<LogProps> = ({ title, codecs }) => {
  return <Message title={title} timestamp={null} description={JSON.stringify(codecs, null, 2)} />;
};

const Log: FunctionComponent<LogProps> = (props) => {
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

export const CapabilitiesCodec: FunctionComponent = () => {
  const senderAudioCapabilitiesCodec = getCapabilitiesCodec(RTCRtpSender.getCapabilities, "audio");
  const senderVideoCapabilitiesCodec = getCapabilitiesCodec(RTCRtpSender.getCapabilities, "video");
  const receiverAudioCapabilitiesCodec = getCapabilitiesCodec(
    RTCRtpReceiver.getCapabilities,
    "audio",
  );
  const receiverVideoCapabilitiesCodec = getCapabilitiesCodec(
    RTCRtpReceiver.getCapabilities,
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
