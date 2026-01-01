import { useSignal } from "@preact/signals";

import { Collapse, HrForm } from "@/components/ui";

import {
  setAspectRatio,
  setAudioCodecType,
  setAudioContentHint,
  setEchoCancellationType,
  setFacingMode,
  setResizeMode,
  setSimulcast,
  setSimulcastRequestRid,
  setSimulcastRid,
  setSpotlight,
  setSpotlightFocusRid,
  setSpotlightNumber,
  setSpotlightUnfocusRid,
  setVideoCodecType,
  setVideoContentHint,
} from "@/app/actions";
import {
  aspectRatio,
  audioCodecType,
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
  facingMode,
  forceStereoOutput,
  frameRate,
  mediaProcessorsNoiseSuppression,
  mediaType,
  noiseSuppression,
  reconnect,
  resizeMode,
  resolution,
  role,
  simulcast,
  simulcastRequestRid,
  simulcastRid,
  spotlight,
  spotlightFocusRid,
  spotlightNumber,
  spotlightUnfocusRid,
  videoCodecType,
  videoContentHint,
} from "@/app/signals";
import {
  ASPECT_RATIO_TYPES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  ECHO_CANCELLATION_TYPES,
  FACING_MODES,
  RESIZE_MODE_TYPES,
  SIMULCAST,
  SIMULCAST_REQUEST_RID,
  SIMULCAST_RID,
  SPOTLIGHT,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  VIDEO_CODEC_TYPES,
  VIDEO_CONTENT_HINTS,
} from "@/constants";
import styles from "./DevtoolsPane.module.css";
import { AlertMessages } from "@/components/AlertMessages";
import { LocalVideo } from "@/components/Video/LocalVideo";
import { RemoteVideos } from "@/components/Video/RemoteVideos";

import { AudioBitRateForm } from "./AudioBitRateForm.tsx";
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
import { CollapseLink } from "./CollapseLink.tsx";
import { ConnectButton } from "./ConnectButton.tsx";
import { DataChannelForm } from "./DataChannelForm.tsx";
import { DataChannelsForm } from "./DataChannelsForm.tsx";
import { DisconnectButton } from "./DisconnectButton.tsx";
import { DisplayResolutionForm } from "./DisplayResolutionForm.tsx";
import { DisposeMediaButton } from "./DisposeMediaButton.tsx";
import { EchoCancellationForm } from "./EchoCancellationForm.tsx";
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
import { ResolutionForm } from "./ResolutionForm.tsx";
import { RoleForm } from "./RoleForm.tsx";
import { SelectForm } from "./SelectForm.tsx";
import { SignalingNotifyMetadataForm } from "./SignalingNotifyMetadataForm.tsx";
import { SignalingUrlCandidatesForm } from "./SignalingUrlCandidatesForm.tsx";
import { UpdateMediaStreamButton } from "./UpdateMediaStreamButton.tsx";
import { VideoAV1ParamsForm } from "./VideoAV1ParamsForm.tsx";
import { VideoBitRateForm } from "./VideoBitRateForm.tsx";
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
        <div className="max-w-[802px] pb-2 w-full">
          <ChannelIdForm />
        </div>
      </div>
      <div className="form-row flex flex-wrap gap-2">
        <div>
          <RoleForm />
        </div>
        <div>
          <SelectForm
            kind="simulcast"
            label="simulcast:"
            value={simulcast.value}
            options={SIMULCAST}
            onChange={setSimulcast}
          />
        </div>
        <div>
          <SelectForm
            kind="spotlight"
            label="spotlight:"
            value={spotlight.value}
            options={SPOTLIGHT}
            onChange={setSpotlight}
          />
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
              <SelectForm
                kind="audioCodecType"
                label="audioCodecType:"
                value={audioCodecType.value}
                options={AUDIO_CODEC_TYPES}
                onChange={setAudioCodecType}
              />
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
              <SelectForm
                kind="videoCodecType"
                label="videoCodecType:"
                value={videoCodecType.value}
                options={VIDEO_CODEC_TYPES}
                onChange={setVideoCodecType}
              />
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
        <SelectForm
          kind="simulcastRequestRid"
          label="simulcastRequestRid:"
          value={simulcastRequestRid.value}
          options={SIMULCAST_REQUEST_RID}
          onChange={setSimulcastRequestRid}
        />
      </div>
      <div>
        <SelectForm
          kind="simulcastRid"
          label="simulcastRid:"
          value={simulcastRid.value}
          options={SIMULCAST_RID}
          onChange={setSimulcastRid}
        />
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
        <SelectForm
          kind="spotlightNumber"
          label="spotlightNumber:"
          value={spotlightNumber.value}
          options={SPOTLIGHT_NUMBERS}
          onChange={setSpotlightNumber}
        />
      </div>
      <div>
        <SelectForm
          kind="spotlightFocusRid"
          label="spotlightFocusRid:"
          value={spotlightFocusRid.value}
          options={SPOTLIGHT_FOCUS_RIDS}
          onChange={setSpotlightFocusRid}
        />
      </div>
      <div>
        <SelectForm
          kind="spotlightUnfocusRid"
          label="spotlightUnfocusRid:"
          value={spotlightUnfocusRid.value}
          options={SPOTLIGHT_FOCUS_RIDS}
          onChange={setSpotlightUnfocusRid}
        />
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
  const onClick = (event: Event): void => {
    event.preventDefault();
    collapsed.value = !collapsed.value;
  };
  return (
    <>
      <div className="form-row">
        <div>
          <CollapseLink collapsed={collapsed.value} enabled={enabledOptions} onClick={onClick}>
            Signaling options
          </CollapseLink>
        </div>
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
    </>
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
  const onClick = (event: Event): void => {
    event.preventDefault();
    collapsed.value = !collapsed.value;
  };
  return (
    <>
      <div className="form-row">
        <div>
          <CollapseLink collapsed={collapsed.value} enabled={enabledOptions} onClick={onClick}>
            Advanced signaling options
          </CollapseLink>
        </div>
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
    </>
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
  const onClick = (event: Event): void => {
    event.preventDefault();
    collapsed.value = !collapsed.value;
  };
  return (
    <>
      <div className="form-row">
        <div>
          <CollapseLink collapsed={collapsed.value} enabled={enabledOptions} onClick={onClick}>
            Media options
          </CollapseLink>
        </div>
      </div>
      <Collapse in={!collapsed.value}>
        <div>
          <div className="form-row flex flex-wrap gap-2">
            <div className="col-auto">
              <SelectForm
                kind="audioContentHint"
                label="audioContentHint:"
                value={audioContentHint.value}
                options={AUDIO_CONTENT_HINTS}
                onChange={setAudioContentHint}
                disabled={false}
              />
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
              <SelectForm
                kind="echoCancellationType"
                label="echoCancellationType:"
                value={echoCancellationType.value}
                options={ECHO_CANCELLATION_TYPES}
                onChange={setEchoCancellationType}
                disabled={false}
              />
            </div>
            <div className="col-auto">
              <MediaProcessorsNoiseSuppressionForm />
            </div>
          </div>
          <div className="form-row flex flex-wrap gap-2">
            <div className="col-auto">
              <SelectForm
                kind="videoContentHint"
                label="videoContentHint:"
                value={videoContentHint.value}
                options={VIDEO_CONTENT_HINTS}
                onChange={setVideoContentHint}
                disabled={false}
              />
            </div>
            <div className="col-auto">
              <ResolutionForm />
            </div>
            <div className="col-auto">
              <FrameRateForm />
            </div>
            <div className="col-auto">
              <SelectForm
                kind="aspectRatio"
                label="aspectRatio:"
                value={aspectRatio.value}
                options={ASPECT_RATIO_TYPES}
                onChange={setAspectRatio}
                disabled={false}
              />
            </div>
            <div className="col-auto">
              <SelectForm
                kind="resizeMode"
                label="resizeMode:"
                value={resizeMode.value}
                options={RESIZE_MODE_TYPES}
                onChange={setResizeMode}
                disabled={false}
              />
            </div>
            <div className="col-auto">
              <BlurRadiusForm />
            </div>
            <div className="col-auto">
              <SelectForm
                kind="facingMode"
                label="facingMode:"
                value={facingMode.value}
                options={FACING_MODES}
                onChange={setFacingMode}
                disabled={mediaType.value !== "getUserMedia"}
              />
            </div>
          </div>
          <UpdateMediaStreamButton />
        </div>
      </Collapse>
    </>
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
    <div className={debug.value ? `${styles.container} col-6` : `${styles.container} col-12`}>
      <AlertMessages />
      <RowChannelOptions />
      <RowSimulcastOptions />
      <RowSpotlightOptions />
      <HrForm />
      <RowGetUserMediaConstraints />
      <RowSignalingOptions />
      <RowAdvancedSignalingOptions />
      <HrForm />
      {role.value !== "recvonly" ? (
        <>
          <RowMediaType />
          <RowMediaOptions />
          <HrForm />
        </>
      ) : null}
      <RowDevices />
      <RowMediaDevices />
      <HrForm />
      <div className="row">
        <ConnectButton />
        <DisconnectButton />
      </div>
      <HrForm />
      <LocalVideo />
      {role.value === "recvonly" || role.value === "sendrecv" ? <RemoteVideos /> : null}
    </div>
  );
}
