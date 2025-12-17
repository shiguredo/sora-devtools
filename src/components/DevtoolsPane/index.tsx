import type React from 'react'
import { useState } from 'react'
import { Col, Collapse, Row } from 'react-bootstrap'

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
      <Row className="form-row" xs="auto">
        <Col xs="12" sm="12" className="form-channel-id">
          <ChannelIdForm />
        </Col>
      </Row>
      <Row className="form-row" xs="auto">
        <Col>
          <RoleForm />
        </Col>
        <Col>
          <SimulcastForm />
        </Col>
        <Col>
          <SpotlightForm />
        </Col>
      </Row>
    </>
  )
}

const RowGetUserMediaConstraints: React.FC = () => {
  const showCodecForms = $role.value !== 'recvonly'
  return (
    <>
      <Row className="form-row" xs="auto">
        <Col>
          <AudioForm />
        </Col>
        {showCodecForms && (
          <>
            <Col>
              <AudioCodecTypeForm />
            </Col>
            <Col>
              <AudioBitRateForm />
            </Col>
          </>
        )}
      </Row>
      <Row className="form-row" xs="auto">
        <Col>
          <VideoForm />
        </Col>
        {showCodecForms && (
          <>
            <Col>
              <VideoCodecTypeForm />
            </Col>
            <Col>
              <VideoBitRateForm />
            </Col>
          </>
        )}
      </Row>
    </>
  )
}

const RowSimulcastOptions: React.FC = () => {
  // sendonly の場合は simulcastRequestRid / simulcastRid を表示しない
  if ($simulcast.value !== 'true' || $role.value === 'sendonly') {
    return null
  }
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <SimulcastRequestRidForm />
      </Col>
      <Col>
        <SimulcastRidForm />
      </Col>
    </Row>
  )
}

const RowSpotlightOptions: React.FC = () => {
  if ($spotlight.value !== 'true') {
    return null
  }
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <SpotlightNumberForm />
      </Col>
      <Col>
        <SpotlightFocusRidForm />
      </Col>
      <Col>
        <SpotlightUnfocusRidForm />
      </Col>
    </Row>
  )
}

const RowSignalingOptions: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true)
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
  if (collapsed) {
    linkClassNames.push('collapsed')
  }
  if (enabledOptions) {
    linkClassNames.push('fw-bold')
  }
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault()
    setCollapsed(!collapsed)
  }
  return (
    <Row className="form-row">
      <Col>
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Signaling options
        </a>
      </Col>
      <Collapse in={!collapsed}>
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
      </Collapse>
    </Row>
  )
}

const RowAdvancedSignalingOptions: React.FC = () => {
  const showSenderParams = $role.value !== 'recvonly'
  const showReceiverParams = $role.value !== 'sendonly'
  const [collapsed, setCollapsed] = useState(true)
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
  if (collapsed) {
    linkClassNames.push('collapsed')
  }
  if (enabledOptions) {
    linkClassNames.push('fw-bold')
  }
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault()
    setCollapsed(!collapsed)
  }
  return (
    <Row className="form-row">
      <Col>
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Advanced signaling options
        </a>
      </Col>
      <Collapse in={!collapsed}>
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
    </Row>
  )
}

export const RowMediaType: React.FC = () => {
  return (
    <>
      <Row xs="auto" className="form-row">
        <Col>
          <MediaTypeForm />
        </Col>
      </Row>
      <Row xs="auto" className="form-row">
        <Col>
          <FakeVolumeForm />
        </Col>
      </Row>
      <Row xs="auto" className="form-row">
        <Col>
          <Mp4FileForm />
        </Col>
      </Row>
    </>
  )
}

const RowMediaOptions: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true)
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
  if (collapsed) {
    linkClassNames.push('collapsed')
  }
  if (enabledOptions) {
    linkClassNames.push('fw-bold')
  }
  const onClick = (event: React.MouseEvent): void => {
    event.preventDefault()
    setCollapsed(!collapsed)
  }
  return (
    <Row className="form-row">
      <Col>
        {/* biome-ignore lint/a11y/useValidAnchor: This anchor acts as a button for toggling section visibility */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Media options
        </a>
      </Col>
      <Collapse in={!collapsed}>
        <div>
          <Row className="form-row">
            <Col className="col-auto">
              <AudioContentHintForm />
            </Col>
            <Col className="col-auto">
              <AutoGainControlForm />
            </Col>
            <Col className="col-auto">
              <NoiseSuppressionForm />
            </Col>
            <Col className="col-auto">
              <EchoCancellationForm />
            </Col>
            <Col className="col-auto">
              <EchoCancellationTypeForm />
            </Col>
            <Col className="col-auto">
              <MediaProcessorsNoiseSuppressionForm />
            </Col>
          </Row>
          <Row className="form-row">
            <Col className="col-auto">
              <VideoContentHintForm />
            </Col>
            <Col className="col-auto">
              <ResolutionForm />
            </Col>
            <Col className="col-auto">
              <FrameRateForm />
            </Col>
            <Col className="col-auto">
              <AspectRatioForm />
            </Col>
            <Col className="col-auto">
              <ResizeModeForm />
            </Col>
            <Col className="col-auto">
              <BlurRadiusForm />
            </Col>
            <Col className="col-auto">
              <FacingModeForm />
            </Col>
          </Row>
          <UpdateMediaStreamButton />
        </div>
      </Collapse>
    </Row>
  )
}

const RowDevices: React.FC = () => {
  return (
    <>
      <Row className="form-row" xs="auto">
        {/**
         * role が recvonly 以外で mediaType が getUserMedia の場合のみ、Audio / Video InputForm を表示する
         */}
        {$role.value !== 'recvonly' && $mediaType.value === 'getUserMedia' ? (
          <>
            <Col>
              <AudioInputForm />
            </Col>
            <Col>
              <VideoInputForm />
            </Col>
          </>
        ) : null}
      </Row>
      <Row className="form-row" xs="auto">
        {$role.value !== 'sendonly' ? (
          <Col>
            <AudioOutputForm />
          </Col>
        ) : null}
        <ReloadDevicesButton />
        {$role.value !== 'recvonly' ? (
          <>
            <RequestMediaButton />
            <DisposeMediaButton />
          </>
        ) : null}
      </Row>
    </>
  )
}

export const RowMediaDevices: React.FC = () => {
  return (
    <>
      <Row className="form-row" xs="auto">
        <Col>
          <DisplayResolutionForm />
        </Col>
        <Col>
          <MediaStatsForm />
        </Col>
      </Row>
      {$role.value !== 'recvonly' && (
        <Row className="form-row" xs="auto">
          <Col>
            <MicDeviceForm />
          </Col>
          <Col>
            <CameraDeviceForm />
          </Col>
          <Col>
            <AudioTrackForm />
          </Col>
          <Col>
            <VideoTrackForm />
          </Col>
        </Row>
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
