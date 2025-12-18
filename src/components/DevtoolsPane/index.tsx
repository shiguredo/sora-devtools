import { useSignal } from '@preact/signals'
import type { FunctionComponent } from 'preact'

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

const RowChannelOptions: FunctionComponent = () => {
  return (
    <>
      <div className="flex flex-wrap gap-0">
        <div className="w-full form-channel-id">
          <ChannelIdForm />
        </div>
      </div>
      <div className="flex flex-wrap gap-0">
        <div className="flex-none pr-4 pb-2">
          <RoleForm />
        </div>
        <div className="flex-none pr-4 pb-2">
          <SimulcastForm />
        </div>
        <div className="flex-none pr-4 pb-2">
          <SpotlightForm />
        </div>
      </div>
    </>
  )
}

const RowGetUserMediaConstraints: FunctionComponent = () => {
  const showCodecForms = $role.value !== 'recvonly'
  return (
    <>
      <div className="flex flex-wrap gap-0">
        <div className="flex-none pr-4 pb-2">
          <AudioForm />
        </div>
        {showCodecForms && (
          <>
            <div className="flex-none pr-4 pb-2">
              <AudioCodecTypeForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <AudioBitRateForm />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-0">
        <div className="flex-none pr-4 pb-2">
          <VideoForm />
        </div>
        {showCodecForms && (
          <>
            <div className="flex-none pr-4 pb-2">
              <VideoCodecTypeForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <VideoBitRateForm />
            </div>
          </>
        )}
      </div>
    </>
  )
}

const RowSimulcastOptions: FunctionComponent = () => {
  // sendonly の場合は simulcastRequestRid / simulcastRid を表示しない
  if ($simulcast.value !== 'true' || $role.value === 'sendonly') {
    return null
  }
  return (
    <div className="flex flex-wrap gap-0">
      <div className="flex-none pr-4 pb-2">
        <SimulcastRequestRidForm />
      </div>
      <div className="flex-none pr-4 pb-2">
        <SimulcastRidForm />
      </div>
    </div>
  )
}

const RowSpotlightOptions: FunctionComponent = () => {
  if ($spotlight.value !== 'true') {
    return null
  }
  return (
    <div className="flex flex-wrap gap-0">
      <div className="flex-none pr-4 pb-2">
        <SpotlightNumberForm />
      </div>
      <div className="flex-none pr-4 pb-2">
        <SpotlightFocusRidForm />
      </div>
      <div className="flex-none pr-4 pb-2">
        <SpotlightUnfocusRidForm />
      </div>
    </div>
  )
}

const RowSignalingOptions: FunctionComponent = () => {
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
    linkClassNames.push('font-bold')
  }
  const onClick = (event: MouseEvent): void => {
    event.preventDefault()
    collapsed.value = !collapsed.value
  }
  return (
    <div className="flex flex-wrap pb-2">
      <div className="flex-1">
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Signaling options
        </a>
      </div>
      <div className={collapsed.value ? 'hidden' : 'block'}>
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

const RowAdvancedSignalingOptions: FunctionComponent = () => {
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
    linkClassNames.push('font-bold')
  }
  const onClick = (event: MouseEvent): void => {
    event.preventDefault()
    collapsed.value = !collapsed.value
  }
  return (
    <div className="flex flex-wrap pb-2">
      <div className="flex-1">
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Advanced signaling options
        </a>
      </div>
      <div className={collapsed.value ? 'hidden' : 'block'}>
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

export const RowMediaType: FunctionComponent = () => {
  return (
    <>
      <div className="flex flex-wrap gap-0">
        <div className="flex-none pr-4 pb-2">
          <MediaTypeForm />
        </div>
      </div>
      <div className="flex flex-wrap gap-0">
        <div className="flex-none pr-4 pb-2">
          <FakeVolumeForm />
        </div>
      </div>
      <div className="flex flex-wrap gap-0">
        <div className="flex-none pr-4 pb-2">
          <Mp4FileForm />
        </div>
      </div>
    </>
  )
}

const RowMediaOptions: FunctionComponent = () => {
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
    linkClassNames.push('font-bold')
  }
  const onClick = (event: MouseEvent): void => {
    event.preventDefault()
    collapsed.value = !collapsed.value
  }
  return (
    <div className="flex flex-wrap pb-2">
      <div className="flex-1">
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Media options
        </a>
      </div>
      <div className={collapsed.value ? 'hidden' : 'block'}>
        <div>
          <div className="flex flex-wrap pb-2">
            <div className="flex-none pr-4 pb-2">
              <AudioContentHintForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <AutoGainControlForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <NoiseSuppressionForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <EchoCancellationForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <EchoCancellationTypeForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <MediaProcessorsNoiseSuppressionForm />
            </div>
          </div>
          <div className="flex flex-wrap pb-2">
            <div className="flex-none pr-4 pb-2">
              <VideoContentHintForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <ResolutionForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <FrameRateForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <AspectRatioForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <ResizeModeForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <BlurRadiusForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <FacingModeForm />
            </div>
          </div>
          <UpdateMediaStreamButton />
        </div>
      </div>
    </div>
  )
}

const RowDevices: FunctionComponent = () => {
  return (
    <>
      <div className="flex flex-wrap gap-0">
        {/**
         * role が recvonly 以外で mediaType が getUserMedia の場合のみ、Audio / Video InputForm を表示する
         */}
        {$role.value !== 'recvonly' && $mediaType.value === 'getUserMedia' ? (
          <>
            <div className="flex-none pr-4 pb-2">
              <AudioInputForm />
            </div>
            <div className="flex-none pr-4 pb-2">
              <VideoInputForm />
            </div>
          </>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-0">
        {$role.value !== 'sendonly' ? (
          <div className="flex-none pr-4 pb-2">
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

export const RowMediaDevices: FunctionComponent = () => {
  return (
    <>
      <div className="flex flex-wrap gap-0">
        <div className="flex-none pr-4 pb-2">
          <DisplayResolutionForm />
        </div>
        <div className="flex-none pr-4 pb-2">
          <MediaStatsForm />
        </div>
      </div>
      {$role.value !== 'recvonly' && (
        <div className="flex flex-wrap gap-0">
          <div className="flex-none pr-4 pb-2">
            <MicDeviceForm />
          </div>
          <div className="flex-none pr-4 pb-2">
            <CameraDeviceForm />
          </div>
          <div className="flex-none pr-4 pb-2">
            <AudioTrackForm />
          </div>
          <div className="flex-none pr-4 pb-2">
            <VideoTrackForm />
          </div>
        </div>
      )}
    </>
  )
}

export const DevtoolsPane: FunctionComponent = () => {
  return (
    <div className={$debug.value ? 'col-devtools w-1/2' : 'col-devtools w-full'}>
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
      <div className="flex flex-wrap">
        <ConnectButton />
        <DisconnectButton />
      </div>
      <hr className="hr-form" />
      <LocalVideo />
      {$role.value === 'recvonly' || $role.value === 'sendrecv' ? <RemoteVideos /> : null}
    </div>
  )
}
