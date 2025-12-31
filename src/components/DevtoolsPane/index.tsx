import { useSignal } from "@preact/signals";

import { Collapse } from "@/components/ui";

import {
  audioContentHint,
  autoGainControl,
  blurRadius,
  debug,
  echoCancellation,
  echoCancellationType,
  enabledAudioStreamingLanguageCode,
  enabledBundleId,
  enabledClientId,
  enabledDataChannel,
  enabledDataChannels,
  enabledForwardingFilters,
  enabledMetadata,
  enabledSignalingNotifyMetadata,
  enabledSignalingUrlCandidates,
  enabledVideoAV1Params,
  enabledVideoH264Params,
  enabledVideoH265Params,
  enabledVideoVP9Params,
  forceStereoOutput,
  frameRate,
  mediaProcessorsNoiseSuppression,
  mediaType,
  noiseSuppression,
  reconnect,
  resolution,
  role,
  simulcast,
  spotlight,
  videoContentHint,
} from "@/app/signals";
import { AlertMessages } from "@/components/AlertMessages";
import { LocalVideo } from "@/components/Video/LocalVideo";
import { RemoteVideos } from "@/components/Video/RemoteVideos";

import { AspectRatioForm } from "./AspectRatioForm.tsx";
import { AudioBitRateForm } from "./AudioBitRateForm.tsx";
import { AudioCodecTypeForm } from "./AudioCodecTypeForm.tsx";
import { AudioContentHintForm } from "./AudioContentHintForm.tsx";
import { AudioForm } from "./AudioForm.tsx";
import { AudioInputForm } from "./AudioInputForm.tsx";
import { AudioOutputForm } from "./AudioOutputForm.tsx";
import { AudioStreamingLanguageCodeForm } from "./AudioStreamingLanguageCodeForm.tsx";
import { AudioTrackForm } from "./AudioTrackForm.tsx";
import { AutoGainControlForm } from "./AutoGainControlForm.tsx";
import { BlurRadiusForm } from "./BlurRadiusForm.tsx";
import { BundleIdForm } from "./BundleIdForm.tsx";
import { CameraDeviceForm } from "./CameraDeviceForm.tsx";
import { ChannelIdForm } from "./ChannelIdForm.tsx";
import { ClientIdForm } from "./ClientIdForm.tsx";
import { ConnectButton } from "./ConnectButton.tsx";
import { DataChannelForm } from "./DataChannelForm.tsx";
import { DataChannelsForm } from "./DataChannelsForm.tsx";
import { DisconnectButton } from "./DisconnectButton.tsx";
import { DisplayResolutionForm } from "./DisplayResolutionForm.tsx";
import { DisposeMediaButton } from "./DisposeMediaButton.tsx";
import { EchoCancellationForm } from "./EchoCancellationForm.tsx";
import { EchoCancellationTypeForm } from "./EchoCancellationTypeForm.tsx";
import { FacingModeForm } from "./FacingModeForm.tsx";
import { FakeVolumeForm } from "./FakeVolumeForm.tsx";
import { ForceStereoOutputForm } from "./ForceStereoOutputForm.tsx";
import { ForwardingFiltersForm } from "./ForwardingFiltersForm.tsx";
import { FrameRateForm } from "./FrameRateForm.tsx";
import { MediaProcessorsNoiseSuppressionForm } from "./MediaProcessorsNoiseSuppressionForm.tsx";
import { MediaStatsForm } from "./MediaStatsForm.tsx";
import { MediaTypeForm } from "./MediaTypeForm.tsx";
import { MetadataForm } from "./MetadataForm.tsx";
import { MicDeviceForm } from "./MicDeviceForm.tsx";
import { Mp4FileForm } from "./Mp4FileForm.tsx";
import { NoiseSuppressionForm } from "./NoiseSuppressionForm.tsx";
import { ReconnectForm } from "./ReconnectForm.tsx";
import { ReloadDevicesButton } from "./ReloadDevicesButton.tsx";
import { RequestMediaButton } from "./RequestMediaButton.tsx";
import { ResizeModeForm } from "./ResizeModeForm.tsx";
import { ResolutionForm } from "./ResolutionForm.tsx";
import { RoleForm } from "./RoleForm.tsx";
import { SignalingNotifyMetadataForm } from "./SignalingNotifyMetadataForm.tsx";
import { SignalingUrlCandidatesForm } from "./SignalingUrlCandidatesForm.tsx";
import { SimulcastForm } from "./SimulcastForm.tsx";
import { SimulcastRequestRidForm } from "./SimulcastRequestRidForm.tsx";
import { SimulcastRidForm } from "./SimulcastRidForm.tsx";
import { SpotlightFocusRidForm } from "./SpotlightFocusRidForm.tsx";
import { SpotlightForm } from "./SpotlightForm.tsx";
import { SpotlightNumberForm } from "./SpotlightNumberForm.tsx";
import { SpotlightUnfocusRidForm } from "./SpotlightUnfocusRidForm.tsx";
import { UpdateMediaStreamButton } from "./UpdateMediaStreamButton.tsx";
import { VideoAV1ParamsForm } from "./VideoAV1ParamsForm.tsx";
import { VideoBitRateForm } from "./VideoBitRateForm.tsx";
import { VideoCodecTypeForm } from "./VideoCodecTypeForm.tsx";
import { VideoContentHintForm } from "./VideoContentHintForm.tsx";
import { VideoForm } from "./VideoForm.tsx";
import { VideoH264ParamsForm } from "./VideoH264ParamsForm.tsx";
import { VideoH265ParamsForm } from "./VideoH265ParamsForm.tsx";
import { VideoInputForm } from "./VideoInputForm.tsx";
import { VideoTrackForm } from "./VideoTrackForm.tsx";
import { VideoVP9ParamsForm } from "./VideoVP9ParamsForm.tsx";

function RowChannelOptions() {
  return (
    <>
      <div className="form-row flex flex-wrap">
        <div className="form-channel-id w-full">
          <ChannelIdForm />
        </div>
      </div>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <RoleForm />
        </div>
        <div>
          <SimulcastForm />
        </div>
        <div>
          <SpotlightForm />
        </div>
      </div>
    </>
  );
}

function RowGetUserMediaConstraints() {
  const showCodecForms = role.value !== "recvonly";
  return (
    <>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <AudioForm />
        </div>
        {showCodecForms && (
          <>
            <div>
              <AudioCodecTypeForm />
            </div>
            <div>
              <AudioBitRateForm />
            </div>
          </>
        )}
      </div>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <VideoForm />
        </div>
        {showCodecForms && (
          <>
            <div>
              <VideoCodecTypeForm />
            </div>
            <div>
              <VideoBitRateForm />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function RowSimulcastOptions() {
  // sendonly の場合は simulcastRequestRid / simulcastRid を表示しない
  if (simulcast.value !== "true" || role.value === "sendonly") {
    return null;
  }
  return (
    <div className="form-row flex flex-wrap gap-2">
      <div>
        <SimulcastRequestRidForm />
      </div>
      <div>
        <SimulcastRidForm />
      </div>
    </div>
  );
}

function RowSpotlightOptions() {
  if (spotlight.value !== "true") {
    return null;
  }
  return (
    <div className="form-row flex flex-wrap gap-2">
      <div>
        <SpotlightNumberForm />
      </div>
      <div>
        <SpotlightFocusRidForm />
      </div>
      <div>
        <SpotlightUnfocusRidForm />
      </div>
    </div>
  );
}

function RowSignalingOptions() {
  const collapsed = useSignal(true);
  const enabledOptions = [
    enabledBundleId.value,
    enabledClientId.value,
    enabledDataChannel.value,
    enabledDataChannels.value,
    enabledForwardingFilters.value,
    enabledMetadata.value,
    enabledSignalingNotifyMetadata.value,
    enabledSignalingUrlCandidates.value,
    reconnect.value,
  ].some((e) => e);
  const linkClassNames = ["btn-collapse-options"];
  if (collapsed.value) {
    linkClassNames.push("collapsed");
  }
  if (enabledOptions) {
    linkClassNames.push("font-bold");
  }
  const onClick = (event: Event): void => {
    event.preventDefault();
    collapsed.value = !collapsed.value;
  };
  return (
    <div className="form-row">
      <div>
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(" ")} onClick={onClick}>
          Signaling options
        </a>
      </div>
      <Collapse in={!collapsed.value}>
        <div>
          <ReconnectForm />
          <ClientIdForm />
          <MetadataForm />
          <BundleIdForm />
          <SignalingNotifyMetadataForm />
          <SignalingUrlCandidatesForm />
          <ForwardingFiltersForm />
          <DataChannelsForm />
          <DataChannelForm />
        </div>
      </Collapse>
    </div>
  );
}

function RowAdvancedSignalingOptions() {
  const showSenderParams = role.value !== "recvonly";
  const showReceiverParams = role.value !== "sendonly";
  const collapsed = useSignal(true);
  const showOptions = [] as boolean[];
  if (showSenderParams) {
    showOptions.push(
      enabledAudioStreamingLanguageCode.value,
      enabledVideoVP9Params.value,
      enabledVideoH264Params.value,
      enabledVideoH265Params.value,
      enabledVideoAV1Params.value,
    );
  }
  if (showReceiverParams) {
    showOptions.push(forceStereoOutput.value);
  }
  const enabledOptions = showOptions.some((e) => e);
  const linkClassNames = ["btn-collapse-options"];
  if (collapsed.value) {
    linkClassNames.push("collapsed");
  }
  if (enabledOptions) {
    linkClassNames.push("font-bold");
  }
  const onClick = (event: Event): void => {
    event.preventDefault();
    collapsed.value = !collapsed.value;
  };
  return (
    <div className="form-row">
      <div>
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(" ")} onClick={onClick}>
          Advanced signaling options
        </a>
      </div>
      <Collapse in={!collapsed.value}>
        <div>
          {showSenderParams && (
            <>
              <AudioStreamingLanguageCodeForm />
              <VideoVP9ParamsForm />
              <VideoAV1ParamsForm />
              <VideoH264ParamsForm />
              <VideoH265ParamsForm />
            </>
          )}
          {showReceiverParams && <ForceStereoOutputForm />}
        </div>
      </Collapse>
    </div>
  );
}

export function RowMediaType() {
  return (
    <>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <MediaTypeForm />
        </div>
      </div>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <FakeVolumeForm />
        </div>
      </div>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <Mp4FileForm />
        </div>
      </div>
    </>
  );
}

function RowMediaOptions() {
  const collapsed = useSignal(true);
  const enabledOptions = [
    audioContentHint.value !== "",
    autoGainControl.value !== "",
    noiseSuppression.value !== "",
    echoCancellation.value !== "",
    echoCancellationType.value !== "",
    videoContentHint.value !== "",
    resolution.value !== "",
    frameRate.value !== "",
    blurRadius.value !== "",
    mediaProcessorsNoiseSuppression.value,
  ].some((e) => e);
  const linkClassNames = ["btn-collapse-options"];
  if (collapsed.value) {
    linkClassNames.push("collapsed");
  }
  if (enabledOptions) {
    linkClassNames.push("font-bold");
  }
  const onClick = (event: Event): void => {
    event.preventDefault();
    collapsed.value = !collapsed.value;
  };
  return (
    <div className="form-row">
      <div>
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(" ")} onClick={onClick}>
          Media options
        </a>
      </div>
      <Collapse in={!collapsed.value}>
        <div>
          <div className="form-row flex flex-wrap gap-2">
            <div className="col-auto">
              <AudioContentHintForm />
            </div>
            <div className="col-auto">
              <AutoGainControlForm />
            </div>
            <div className="col-auto">
              <NoiseSuppressionForm />
            </div>
            <div className="col-auto">
              <EchoCancellationForm />
            </div>
            <div className="col-auto">
              <EchoCancellationTypeForm />
            </div>
            <div className="col-auto">
              <MediaProcessorsNoiseSuppressionForm />
            </div>
          </div>
          <div className="form-row flex flex-wrap gap-2">
            <div className="col-auto">
              <VideoContentHintForm />
            </div>
            <div className="col-auto">
              <ResolutionForm />
            </div>
            <div className="col-auto">
              <FrameRateForm />
            </div>
            <div className="col-auto">
              <AspectRatioForm />
            </div>
            <div className="col-auto">
              <ResizeModeForm />
            </div>
            <div className="col-auto">
              <BlurRadiusForm />
            </div>
            <div className="col-auto">
              <FacingModeForm />
            </div>
          </div>
          <UpdateMediaStreamButton />
        </div>
      </Collapse>
    </div>
  );
}

function RowDevices() {
  return (
    <>
      <div className="form-row flex flex-wrap gap-2">
        {/**
         * role が recvonly 以外で mediaType が getUserMedia の場合のみ、Audio / Video InputForm を表示する
         */}
        {role.value !== "recvonly" && mediaType.value === "getUserMedia" ? (
          <>
            <div>
              <AudioInputForm />
            </div>
            <div>
              <VideoInputForm />
            </div>
          </>
        ) : null}
      </div>
      <div className="form-row flex flex-wrap gap-2">
        {role.value !== "sendonly" ? (
          <div>
            <AudioOutputForm />
          </div>
        ) : null}
        <ReloadDevicesButton />
        {role.value !== "recvonly" ? (
          <>
            <RequestMediaButton />
            <DisposeMediaButton />
          </>
        ) : null}
      </div>
    </>
  );
}

export function RowMediaDevices() {
  return (
    <>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <DisplayResolutionForm />
        </div>
        <div>
          <MediaStatsForm />
        </div>
      </div>
      {role.value !== "recvonly" && (
        <div className="form-row flex flex-wrap gap-2">
          <div>
            <MicDeviceForm />
          </div>
          <div>
            <CameraDeviceForm />
          </div>
          <div>
            <AudioTrackForm />
          </div>
          <div>
            <VideoTrackForm />
          </div>
        </div>
      )}
    </>
  );
}

export function DevtoolsPane() {
  return (
    <div className={debug.value ? "col-devtools col-6" : "col-devtools col-12"}>
      <AlertMessages />
      <RowChannelOptions />
      <RowSimulcastOptions />
      <RowSpotlightOptions />
      <hr className="hr-form" />
      <RowGetUserMediaConstraints />
      <RowSignalingOptions />
      <RowAdvancedSignalingOptions />
      <hr className="hr-form" />
      {role.value !== "recvonly" ? (
        <>
          <RowMediaType />
          <RowMediaOptions />
          <hr className="hr-form" />
        </>
      ) : null}
      <RowDevices />
      <RowMediaDevices />
      <hr className="hr-form" />
      <div className="row">
        <ConnectButton />
        <DisconnectButton />
      </div>
      <hr className="hr-form" />
      <LocalVideo />
      {role.value === "recvonly" || role.value === "sendrecv" ? <RemoteVideos /> : null}
    </div>
  );
}
