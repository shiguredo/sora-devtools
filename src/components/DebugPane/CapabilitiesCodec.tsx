import React from 'react';

export const CapabilitiesCodec: React.FC = () => {
  const videoCapabilities = RTCRtpSender.getCapabilities('video');
  console.log(videoCapabilities?.codecs);
  const audioCapabilities = RTCRtpSender.getCapabilities('audio');
  console.log(audioCapabilities?.codecs);
  return <div></div>;
};
