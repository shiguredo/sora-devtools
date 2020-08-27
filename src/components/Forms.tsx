import React from "react";
import { useSelector } from "react-redux";

import ButtonConnect from "@/components/ButtonConnect";
import ButtonDisconnect from "@/components/ButtonDisconnect";
import ButtonStartRecording from "@/components/ButtonStartRecording";
import ButtonStopRecording from "@/components/ButtonStopRecording";
import FormAudio from "@/components/FormAudio";
import FormAudioBitRate from "@/components/FormAudioBitRate";
import FormAudioCodecType from "@/components/FormAudioCodecType";
import FormAudioInput from "@/components/FormAudioInput";
import FormAudioOutput from "@/components/FormAudioOutput";
import FormAutoGainControl from "@/components/FormAutoGainControl";
import FormChannelId from "@/components/FormChannelId";
import FormCpuOveruseDetection from "@/components/FormCpuOveruseDetection";
import FormEchoCancellation from "@/components/FormEchoCancellation";
import FormEchoCancellationType from "@/components/FormEchoCancellationType";
import FormFake from "@/components/FormFake";
import FormFrameRate from "@/components/FormFrameRate";
import FormGetDisplayMedia from "@/components/FormGetDisplayMedia";
import FormNoiseSuppression from "@/components/FormNoiseSuppression";
import FormResolution from "@/components/FormResolution";
import FormSimulcastQuality from "@/components/FormSimulcastQuality";
import FormSpotlight from "@/components/FormSpotlight";
import FormSpotlightNumber from "@/components/FormSpotlightNumber";
import FormVideo from "@/components/FormVideo";
import FormVideoBitRate from "@/components/FormVideoBitRate";
import FormVideoCodecType from "@/components/FormVideoCodecType";
import FormVideoInput from "@/components/FormVideoInput";
import { SoraDemoState } from "@/slice";

type FormsProps = {
  connectType: "sendonly" | "sendrecv" | "recvonly";
  connectOptionMultistream?: boolean;
  connectOptionSpotlight?: boolean;
  connectOptionSimulcast?: boolean;
};
const Forms: React.FC<FormsProps> = (props) => {
  const { enabledParameters } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      <div className="form-row align-items-center">
        {enabledParameters.enabledChannelId ? <FormChannelId /> : null}
        {enabledParameters.enabledCpuOveruseDetection ? <FormCpuOveruseDetection /> : null}
        {enabledParameters.enabledSpotlight ? <FormSpotlight /> : null}
        {enabledParameters.enabledSpotlightNumber ? <FormSpotlightNumber /> : null}
        {enabledParameters.enabledFake ? <FormFake /> : null}
      </div>
      <div className="form-row align-items-center">
        {enabledParameters.enabledVideo ? <FormVideo /> : null}
        {enabledParameters.enabledVideoCodecType ? <FormVideoCodecType /> : null}
        {enabledParameters.enabledVideoBitRate ? <FormVideoBitRate /> : null}
        {enabledParameters.enabledResolution ? <FormResolution /> : null}
        {enabledParameters.enabledFrameRate ? <FormFrameRate /> : null}
        {enabledParameters.enabledGetDisplayMedia ? <FormGetDisplayMedia /> : null}
        {enabledParameters.enabledSimulcastQuality ? <FormSimulcastQuality /> : null}
      </div>
      <div className="form-row align-items-center">
        {enabledParameters.enabledAudio ? <FormAudio /> : null}
        {enabledParameters.enabledAudioCodecType ? <FormAudioCodecType /> : null}
        {enabledParameters.enabledAudioBitRate ? <FormAudioBitRate /> : null}
        {enabledParameters.enabledAutoGainControl ? <FormAutoGainControl /> : null}
        {enabledParameters.enabledNoiseSuppression ? <FormNoiseSuppression /> : null}
        {enabledParameters.enabledEchoCancellation ? <FormEchoCancellation /> : null}
        {enabledParameters.enabledEchoCancellationType ? <FormEchoCancellationType /> : null}
      </div>
      <div className="form-row align-items-center">
        {enabledParameters.enabledAudioInput ? <FormAudioInput /> : null}
        {enabledParameters.enabledVideoInput ? <FormVideoInput /> : null}
        {enabledParameters.enabledAudioOutput ? <FormAudioOutput /> : null}
      </div>
      <div className="form-row align-items-center">
        <ButtonConnect
          connectType={props.connectType}
          multistream={props.connectOptionMultistream ? true : false}
          spotlight={props.connectOptionSpotlight ? true : false}
          simulcast={props.connectOptionSimulcast ? true : false}
        />
        <ButtonDisconnect />
        <ButtonStartRecording />
        <ButtonStopRecording />
      </div>
    </>
  );
};

Forms.defaultProps = {
  connectOptionMultistream: false,
  connectOptionSpotlight: false,
  connectOptionSimulcast: false,
};

export default Forms;
