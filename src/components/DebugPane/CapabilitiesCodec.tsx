import React from 'react';

import { useAppSelector } from '@/app/hooks';

import { Message } from './Message';

interface RTCRtpCapabilitiesCodecWithIndexSignature extends RTCRtpCodecCapability {
  [x: string]: string | number | undefined;
}

const Collapse: React.FC<RTCRtpCapabilitiesCodecWithIndexSignature> = (props) => {
  let title = `${props.mimeType} ${props.clockRate}`;
  if (props.channels) {
    title += ` ch:${props.channels}`;
  }
  if (props.sdpFmtpLine) {
    title += ` ${props.sdpFmtpLine}`;
  }
  return <Message title={title} timestamp={null} description={props} />;
};

const Log = React.memo((props: RTCRtpCodecCapability) => {
  return <Collapse {...props} />;
});

const getCapabilitiesCodec = (kind: string): RTCRtpCodecCapability[] => {
  if (!RTCRtpSender.getCapabilities) {
    return [];
  }
  const capabilities = RTCRtpSender.getCapabilities(kind);
  if (!capabilities || !capabilities.codecs) {
    return [];
  }

  return capabilities.codecs;
};

export const CapabilitiesCodec: React.FC = () => {
  const audioCapabilitiesCodec = getCapabilitiesCodec('audio');
  const videoCapabilitiesCodec = getCapabilitiesCodec('video');
  const debugFilterText = useAppSelector((state) => state.debugFilterText);
  const filteredAudioCapabilitiesCodec = audioCapabilitiesCodec.filter((codec) => {
    return debugFilterText.split(' ').every((filterText) => {
      if (filterText === '') {
        return true;
      }
      return 0 <= JSON.stringify(codec).indexOf(filterText);
    });
  });
  const filteredVideoCapabilitiesCodec = videoCapabilitiesCodec.filter((codec) => {
    return debugFilterText.split(' ').every((filterText) => {
      if (filterText === '') {
        return true;
      }
      return 0 <= JSON.stringify(codec).indexOf(filterText);
    });
  });
  return (
    <div className="capabilities-codec">
      {filteredAudioCapabilitiesCodec.map((codec, index) => {
        return (
          <Log key={`audio-${index}`} {...(codec as RTCRtpCapabilitiesCodecWithIndexSignature)} />
        );
      })}
      {filteredVideoCapabilitiesCodec.map((codec, index) => {
        return (
          <Log key={`video-${index}`} {...(codec as RTCRtpCapabilitiesCodecWithIndexSignature)} />
        );
      })}
    </div>
  );
};
