import { Message } from "./Message.tsx";

type RTCRtpCapabilitiesCodecWithIndexSignature = Record<string, string | number | undefined>;

interface LogProps {
  title: string;
  codecs: RTCRtpCapabilitiesCodecWithIndexSignature[];
}

function Collapse({ title, codecs }: LogProps) {
  return <Message title={title} timestamp={null} description={JSON.stringify(codecs, null, 2)} />;
}

function Log(props: LogProps) {
  return <Collapse {...props} />;
}

const getCapabilitiesCodec = (
  getCapabilities: ((kind: string) => RTCRtpCapabilities | null) | undefined,
  kind: string,
): RTCRtpCodec[] => {
  if (!getCapabilities) {
    return [];
  }
  const capabilities = getCapabilities(kind);
  return capabilities?.codecs ?? [];
};

export function CapabilitiesCodec() {
  // getCapabilities API が存在しない場合 (古いブラウザでは undefined になる)
  // oxlint-disable-next-line typescript-eslint(no-unnecessary-condition)
  if (!globalThis.RTCRtpSender || !RTCRtpSender.getCapabilities) {
    return null;
  }
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
        codecs={
          senderAudioCapabilitiesCodec as unknown as RTCRtpCapabilitiesCodecWithIndexSignature[]
        }
      />
      <Log
        title="Video RTCRtpSender CapabilitiesCodec"
        codecs={
          senderVideoCapabilitiesCodec as unknown as RTCRtpCapabilitiesCodecWithIndexSignature[]
        }
      />
      <Log
        title="Audio RTCRtpReceiver CapabilitiesCodec"
        codecs={
          receiverAudioCapabilitiesCodec as unknown as RTCRtpCapabilitiesCodecWithIndexSignature[]
        }
      />
      <Log
        title="Video RTCRtpReceiver CapabilitiesCodec"
        codecs={
          receiverVideoCapabilitiesCodec as unknown as RTCRtpCapabilitiesCodecWithIndexSignature[]
        }
      />
    </div>
  );
}
