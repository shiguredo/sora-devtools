import type React from 'react'
import { useState } from 'react'
import { Col, Collapse, Row } from 'react-bootstrap'

import { useAppSelector } from '@/app/hooks'
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
import { SimulcastRidForm } from './SimulcastRidForm.tsx'
import { SpotlightFocusRidForm } from './SpotlightFocusRidForm.tsx'
import { SpotlightForm } from './SpotlightForm.tsx'
import { SpotlightNumberForm } from './SpotlightNumberForm.tsx'
import { SpotlightUnfocusRidForm } from './SpotlightUnfocusRidForm.tsx'
import { StartRecordingButton } from './StartRecordingButton.tsx'
import { StopRecordingButton } from './StopRecordingButton.tsx'
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
  const role = useAppSelector((state) => state.role)
  const showCodecForms = role !== 'recvonly'
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
  const simulcast = useAppSelector((state) => state.simulcast)
  if (simulcast !== 'true') {
    return null
  }
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <SimulcastRidForm />
      </Col>
    </Row>
  )
}

const RowSpotlightOptions: React.FC = () => {
  const spotlight = useAppSelector((state) => state.spotlight)
  if (spotlight !== 'true') {
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
  const enabledBundleId = useAppSelector((state) => state.enabledBundleId)
  const enabledClientId = useAppSelector((state) => state.enabledClientId)
  const enabledDataChannel = useAppSelector((state) => state.enabledDataChannel)
  const enabledDataChannels = useAppSelector((state) => state.enabledDataChannels)
  const enabledForwardingFilters = useAppSelector((state) => state.enabledForwardingFilters)
  const enabledForwardingFilter = useAppSelector((state) => state.enabledForwardingFilter)
  const enabledMetadata = useAppSelector((state) => state.enabledMetadata)
  const enabledSignalingNotifyMetadata = useAppSelector(
    (state) => state.enabledSignalingNotifyMetadata,
  )
  const enabledSignalingUrlCandidates = useAppSelector(
    (state) => state.enabledSignalingUrlCandidates,
  )
  const reconnect = useAppSelector((state) => state.reconnect)
  const enabledOptions = [
    enabledBundleId,
    enabledClientId,
    enabledDataChannel,
    enabledDataChannels,
    enabledForwardingFilters,
    enabledForwardingFilter,
    enabledMetadata,
    enabledSignalingNotifyMetadata,
    enabledSignalingUrlCandidates,
    reconnect,
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
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
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
  const [collapsed, setCollapsed] = useState(true)
  const enableAudioStreamingLanguageCode = useAppSelector(
    (state) => state.enabledAudioStreamingLanguageCode,
  )
  const enabledVideoVP9Params = useAppSelector((state) => state.enabledVideoVP9Params)
  const enabledVideoH264Params = useAppSelector((state) => state.enabledVideoH264Params)
  const enabledVideoH265Params = useAppSelector((state) => state.enabledVideoH265Params)
  const enabledVideoAV1Params = useAppSelector((state) => state.enabledVideoAV1Params)
  const enabledOptions = [
    enableAudioStreamingLanguageCode,
    enabledVideoVP9Params,
    enabledVideoH264Params,
    enabledVideoH265Params,
    enabledVideoAV1Params,
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
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
        <a href="#" className={linkClassNames.join(' ')} onClick={onClick}>
          Advanced signaling options
        </a>
      </Col>
      <Collapse in={!collapsed}>
        <div>
          <AudioStreamingLanguageCodeForm />
          <VideoVP9ParamsForm />
          <VideoAV1ParamsForm />
          <VideoH264ParamsForm />
          <VideoH265ParamsForm />
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
  const audioContentHint = useAppSelector((state) => state.audioContentHint)
  const autoGainControl = useAppSelector((state) => state.autoGainControl)
  const noiseSuppression = useAppSelector((state) => state.noiseSuppression)
  const echoCancellation = useAppSelector((state) => state.echoCancellation)
  const echoCancellationType = useAppSelector((state) => state.echoCancellationType)
  const videoContentHint = useAppSelector((state) => state.videoContentHint)
  const resolution = useAppSelector((state) => state.resolution)
  const frameRate = useAppSelector((state) => state.frameRate)
  const blurRadius = useAppSelector((state) => state.blurRadius)
  const lightAdjustment = useAppSelector((state) => state.lightAdjustment)
  const mediaProcessorsNoiseSuppression = useAppSelector(
    (state) => state.mediaProcessorsNoiseSuppression,
  )
  const enabledOptions = [
    audioContentHint !== '',
    autoGainControl !== '',
    noiseSuppression !== '',
    echoCancellation !== '',
    echoCancellationType !== '',
    videoContentHint !== '',
    resolution !== '',
    frameRate !== '',
    blurRadius !== '',
    lightAdjustment !== '',
    mediaProcessorsNoiseSuppression,
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
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
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
  const role = useAppSelector((state) => state.role)
  const mediaType = useAppSelector((state) => state.mediaType)
  return (
    <>
      <Row className="form-row" xs="auto">
        {/**
         * role が recvonly 以外で mediaType が getUserMedia の場合のみ、Audio / Video InputForm を表示する
         */}
        {role !== 'recvonly' && mediaType === 'getUserMedia' ? (
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
        {role !== 'sendonly' ? (
          <Col>
            <AudioOutputForm />
          </Col>
        ) : null}
        <ReloadDevicesButton />
        {role !== 'recvonly' ? (
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
  const role = useAppSelector((state) => state.role)
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
      {role !== 'recvonly' && (
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
  const debug = useAppSelector((state) => state.debug)
  const role = useAppSelector((state) => state.role)
  const showAdvancedSignalingForms = role !== 'recvonly'
  return (
    <div className={debug ? 'col-devtools col-6' : 'col-devtools col-12'}>
      <AlertMessages />
      <RowChannelOptions />
      <RowSimulcastOptions />
      <RowSpotlightOptions />
      <hr className="hr-form" />
      <RowGetUserMediaConstraints />
      <RowSignalingOptions />
      {showAdvancedSignalingForms && <RowAdvancedSignalingOptions />}
      <hr className="hr-form" />
      {role !== 'recvonly' ? (
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
        <StartRecordingButton />
        <StopRecordingButton />
      </div>
      <hr className="hr-form" />
      <LocalVideo />
      {role === 'recvonly' || role === 'sendrecv' ? <RemoteVideos /> : null}
    </div>
  )
}
