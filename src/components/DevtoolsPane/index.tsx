import { useSignal } from '@preact/signals'
import type React from 'react'

import {
  $audioContentHint,
  $autoGainControl,
  $blurRadius,
  $debug,
  $echoCancellation,
  $echoCancellationType,
  $enabledAudioStreamingLanguageCode,
  $enabledBundleId,
  $enabledClientId,
  $enabledDataChannel,
  $enabledDataChannels,
  $enabledForwardingFilter,
  $enabledForwardingFilters,
  $enabledMetadata,
  $enabledSignalingNotifyMetadata,
  $enabledSignalingUrlCandidates,
  $enabledVideoAV1Params,
  $enabledVideoH264Params,
  $enabledVideoH265Params,
  $enabledVideoVP9Params,
  $forceStereoOutput,
  $frameRate,
  $mediaProcessorsNoiseSuppression,
  $mediaType,
  $noiseSuppression,
  $reconnect,
  $resolution,
  $role,
  $simulcast,
  $spotlight,
  $videoContentHint,
} from '@/app/store'
import { AlertMessages } from '@/components/AlertMessages'
import { LocalVideo } from '@/components/Video/LocalVideo'
import { RemoteVideos } from '@/components/Video/RemoteVideos'

import { AspectRatioForm } from './AspectRatioForm.tsx'
import { AudioBitRateForm } from './AudioBitRateForm.tsx'
import { AudioCodecTypeForm } from './AudioCodecTypeForm.tsx'
import { AudioContentHintForm } from './AudioContentHintForm.tsx'
import { AudioForm } from './AudioForm.tsx'
import { AudioInputForm } from './AudioInputForm.tsx'
import { AudioOutputForm } from './AudioOutputForm.tsx'
import { AudioStreamingLanguageCodeForm } from './AudioStreamingLanguageCodeForm.tsx'
import { AudioTrackForm } from './AudioTrackForm.tsx'
import { AutoGainControlForm } from './AutoGainControlForm.tsx'
import { BlurRadiusForm } from './BlurRadiusForm.tsx'
import { BundleIdForm } from './BundleIdForm.tsx'
import { CameraDeviceForm } from './CameraDeviceForm.tsx'
import { ChannelIdForm } from './ChannelIdForm.tsx'
import { ClientIdForm } from './ClientIdForm.tsx'
import { ConnectButton } from './ConnectButton.tsx'
import { DataChannelForm } from './DataChannelForm.tsx'
import { DataChannelsForm } from './DataChannelsForm.tsx'
import { DisconnectButton } from './DisconnectButton.tsx'
import { DisplayResolutionForm } from './DisplayResolutionForm.tsx'
import { DisposeMediaButton } from './DisposeMediaButton.tsx'
import { EchoCancellationForm } from './EchoCancellationForm.tsx'
import { EchoCancellationTypeForm } from './EchoCancellationTypeForm.tsx'
import { FacingModeForm } from './FacingModeForm.tsx'
import { FakeVolumeForm } from './FakeVolumeForm.tsx'
import { ForceStereoOutputForm } from './ForceStereoOutputForm.tsx'
import { ForwardingFilterForm } from './ForwardingFilterForm.tsx'
import { ForwardingFiltersForm } from './ForwardingFiltersForm.tsx'
import { FrameRateForm } from './FrameRateForm.tsx'
import { MediaProcessorsNoiseSuppressionForm } from './MediaProcessorsNoiseSuppressionForm.tsx'
import { MediaStatsForm } from './MediaStatsForm.tsx'
import { MediaTypeForm } from './MediaTypeForm.tsx'
import { MetadataForm } from './MetadataForm.tsx'
import { MicDeviceForm } from './MicDeviceForm.tsx'
import { Mp4FileForm } from './Mp4FileForm.tsx'
import { NoiseSuppressionForm } from './NoiseSuppressionForm.tsx'
import { ReconnectForm } from './ReconnectForm.tsx'
import { ReloadDevicesButton } from './ReloadDevicesButton.tsx'
import { RequestMediaButton } from './RequestMediaButton.tsx'
import { ResizeModeForm } from './ResizeModeForm.tsx'
import { ResolutionForm } from './ResolutionForm.tsx'
import { RoleForm } from './RoleForm.tsx'
import { SignalingNotifyMetadataForm } from './SignalingNotifyMetadataForm.tsx'
import { SignalingUrlCandidatesForm } from './SignalingUrlCandidatesForm.tsx'
import { SimulcastForm } from './SimulcastForm.tsx'
import { SimulcastRequestRidForm } from './SimulcastRequestRidForm.tsx'
import { SimulcastRidForm } from './SimulcastRidForm.tsx'
import { SpotlightFocusRidForm } from './SpotlightFocusRidForm.tsx'
import { SpotlightForm } from './SpotlightForm.tsx'
import { SpotlightNumberForm } from './SpotlightNumberForm.tsx'
import { SpotlightUnfocusRidForm } from './SpotlightUnfocusRidForm.tsx'
import { UpdateMediaStreamButton } from './UpdateMediaStreamButton.tsx'
import { VideoAV1ParamsForm } from './VideoAV1ParamsForm.tsx'
import { VideoBitRateForm } from './VideoBitRateForm.tsx'
import { VideoCodecTypeForm } from './VideoCodecTypeForm.tsx'
import { VideoContentHintForm } from './VideoContentHintForm.tsx'
import { VideoForm } from './VideoForm.tsx'
import { VideoH264ParamsForm } from './VideoH264ParamsForm.tsx'
import { VideoH265ParamsForm } from './VideoH265ParamsForm.tsx'
import { VideoInputForm } from './VideoInputForm.tsx'
import { VideoTrackForm } from './VideoTrackForm.tsx'
import { VideoVP9ParamsForm } from './VideoVP9ParamsForm.tsx'

const RowChannelOptions: React.FC = () => {
  return (
    <>
      <div className="row form-row g-0">
        <div className="col-12 form-channel-id">
          <ChannelIdForm />
        </div>
      </div>
      <div className="row form-row g-0">
        <div className="col-auto">
          <RoleForm />
        </div>
        <div className="col-auto">
          <SimulcastForm />
        </div>
        <div className="col-auto">
          <SpotlightForm />
        </div>
      </div>
    </>
  )
}

const RowGetUserMediaConstraints: React.FC = () => {
  const showCodecForms = $role.value !== 'recvonly'
  return (
    <>
      <div className="row form-row g-0">
        <div className="col-auto">
          <AudioForm />
        </div>
        {showCodecForms && (
          <>
            <div className="col-auto">
              <AudioCodecTypeForm />
            </div>
            <div className="col-auto">
              <AudioBitRateForm />
            </div>
          </>
        )}
      </div>
      <div className="row form-row g-0">
        <div className="col-auto">
          <VideoForm />
        </div>
        {showCodecForms && (
          <>
            <div className="col-auto">
              <VideoCodecTypeForm />
            </div>
            <div className="col-auto">
              <VideoBitRateForm />
            </div>
          </>
        )}
      </div>
    </>
  )
}

const RowSimulcastOptions: React.FC = () => {
  // sendonly の場合は simulcastRequestRid / simulcastRid を表示しない
  if ($simulcast.value !== 'true' || $role.value === 'sendonly') {
    return null
  }
  return (
    <div className="row form-row g-0">
      <div className="col-auto">
        <SimulcastRequestRidForm />
      </div>
      <div className="col-auto">
        <SimulcastRidForm />
      </div>
    </div>
  )
}

const RowSpotlightOptions: React.FC = () => {
  if ($spotlight.value !== 'true') {
    return null
  }
  return (
    <div className="row form-row g-0">
      <div className="col-auto">
        <SpotlightNumberForm />
      </div>
      <div className="col-auto">
        <SpotlightFocusRidForm />
      </div>
      <div className="col-auto">
        <SpotlightUnfocusRidForm />
      </div>
    </div>
  )
}

const RowSignalingOptions: React.FC = () => {
  const collapsed = useSignal(true)
  const enabledOptions = [
    $enabledBundleId.value,
    $enabledClientId.value,
    $enabledDataChannel.value,
    $enabledDataChannels.value,
    $enabledForwardingFilters.value,
    $enabledForwardingFilter.value,
    $enabledMetadata.value,
    $enabledSignalingNotifyMetadata.value,
    $enabledSignalingUrlCandidates.value,
    $reconnect.value,
  ].some((e) => e)
  const linkClassNames = ['btn-collapse-options']
  if (collapsed.value) {
    linkClassNames.push('collapsed')
  }
  if (enabledOptions) {
    linkClassNames.push('fw-bold')
  }
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault()
    collapsed.value = !collapsed.value
  }
  return (
    <div className="row form-row">
      <div className="col">
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Signaling options
        </a>
      </div>
      <div className={`collapse${collapsed.value ? '' : ' show'}`}>
        <div>
          <ReconnectForm />
          <ClientIdForm />
          <MetadataForm />
          <BundleIdForm />
          <SignalingNotifyMetadataForm />
          <SignalingUrlCandidatesForm />
          <ForwardingFiltersForm />
          <ForwardingFilterForm />
          <DataChannelsForm />
          <DataChannelForm />
        </div>
      </div>
    </div>
  )
}

const RowAdvancedSignalingOptions: React.FC = () => {
  const showSenderParams = $role.value !== 'recvonly'
  const showReceiverParams = $role.value !== 'sendonly'
  const collapsed = useSignal(true)
  const showOptions = [] as boolean[]
  if (showSenderParams) {
    showOptions.push(
      $enabledAudioStreamingLanguageCode.value,
      $enabledVideoVP9Params.value,
      $enabledVideoH264Params.value,
      $enabledVideoH265Params.value,
      $enabledVideoAV1Params.value,
    )
  }
  if (showReceiverParams) {
    showOptions.push($forceStereoOutput.value)
  }
  const enabledOptions = showOptions.some((e) => e)
  const linkClassNames = ['btn-collapse-options']
  if (collapsed.value) {
    linkClassNames.push('collapsed')
  }
  if (enabledOptions) {
    linkClassNames.push('fw-bold')
  }
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault()
    collapsed.value = !collapsed.value
  }
  return (
    <div className="row form-row">
      <div className="col">
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Advanced signaling options
        </a>
      </div>
      <div className={`collapse${collapsed.value ? '' : ' show'}`}>
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
      </div>
    </div>
  )
}

export const RowMediaType: React.FC = () => {
  return (
    <>
      <div className="row form-row g-0">
        <div className="col-auto">
          <MediaTypeForm />
        </div>
      </div>
      <div className="row form-row g-0">
        <div className="col-auto">
          <FakeVolumeForm />
        </div>
      </div>
      <div className="row form-row g-0">
        <div className="col-auto">
          <Mp4FileForm />
        </div>
      </div>
    </>
  )
}

const RowMediaOptions: React.FC = () => {
  const collapsed = useSignal(true)
  const enabledOptions = [
    $audioContentHint.value !== '',
    $autoGainControl.value !== '',
    $noiseSuppression.value !== '',
    $echoCancellation.value !== '',
    $echoCancellationType.value !== '',
    $videoContentHint.value !== '',
    $resolution.value !== '',
    $frameRate.value !== '',
    $blurRadius.value !== '',
    $mediaProcessorsNoiseSuppression.value,
  ].some((e) => e)
  const linkClassNames = ['btn-collapse-options']
  if (collapsed.value) {
    linkClassNames.push('collapsed')
  }
  if (enabledOptions) {
    linkClassNames.push('fw-bold')
  }
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault()
    collapsed.value = !collapsed.value
  }
  return (
    <div className="row form-row">
      <div className="col">
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Media options
        </a>
      </div>
      <div className={`collapse${collapsed.value ? '' : ' show'}`}>
        <div>
          <div className="row form-row">
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
          <div className="row form-row">
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
      </div>
    </div>
  )
}

const RowDevices: React.FC = () => {
  return (
    <>
      <div className="row form-row g-0">
        {/**
         * role が recvonly 以外で mediaType が getUserMedia の場合のみ、Audio / Video InputForm を表示する
         */}
        {$role.value !== 'recvonly' && $mediaType.value === 'getUserMedia' ? (
          <>
            <div className="col-auto">
              <AudioInputForm />
            </div>
            <div className="col-auto">
              <VideoInputForm />
            </div>
          </>
        ) : null}
      </div>
      <div className="row form-row g-0">
        {$role.value !== 'sendonly' ? (
          <div className="col-auto">
            <AudioOutputForm />
          </div>
        ) : null}
        <ReloadDevicesButton />
        {$role.value !== 'recvonly' ? (
          <>
            <RequestMediaButton />
            <DisposeMediaButton />
          </>
        ) : null}
      </div>
    </>
  )
}

export const RowMediaDevices: React.FC = () => {
  return (
    <>
      <div className="row form-row g-0">
        <div className="col-auto">
          <DisplayResolutionForm />
        </div>
        <div className="col-auto">
          <MediaStatsForm />
        </div>
      </div>
      {$role.value !== 'recvonly' && (
        <div className="row form-row g-0">
          <div className="col-auto">
            <MicDeviceForm />
          </div>
          <div className="col-auto">
            <CameraDeviceForm />
          </div>
          <div className="col-auto">
            <AudioTrackForm />
          </div>
          <div className="col-auto">
            <VideoTrackForm />
          </div>
        </div>
      )}
    </>
  )
}

export const DevtoolsPane: React.FC = () => {
  return (
    <div className={$debug.value ? 'col-devtools col-6' : 'col-devtools col-12'}>
      <AlertMessages />
      <RowChannelOptions />
      <RowSimulcastOptions />
      <RowSpotlightOptions />
      <hr className="hr-form" />
      <RowGetUserMediaConstraints />
      <RowSignalingOptions />
      <RowAdvancedSignalingOptions />
      <hr className="hr-form" />
      {$role.value !== 'recvonly' ? (
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
      {$role.value === 'recvonly' || $role.value === 'sendrecv' ? <RemoteVideos /> : null}
    </div>
  )
}
