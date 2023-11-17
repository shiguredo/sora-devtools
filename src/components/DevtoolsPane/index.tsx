import React, { useState } from 'react'
import { Col, Collapse, Row } from 'react-bootstrap'

import { useAppSelector } from '@/app/hooks'
import { AlertMessages } from '@/components/AlertMessages'
import { LocalVideo } from '@/components/Video/LocalVideo'
import { RemoteVideos } from '@/components/Video/RemoteVideos'

import { AspectRatioForm } from './AspectRatioForm'
import { AudioBitRateForm } from './AudioBitRateForm'
import { AudioCodecTypeForm } from './AudioCodecTypeForm'
import { AudioContentHintForm } from './AudioContentHintForm'
import { AudioForm } from './AudioForm'
import { AudioInputForm } from './AudioInputForm'
import { AudioLyraParamsBitrateForm } from './AudioLyraParamsBitrateForm'
import { AudioOutputForm } from './AudioOutputForm'
import { AudioStreamingLanguageCodeForm } from './AudioStreamingLanguageCodeForm'
import { AudioTrackForm } from './AudioTrackForm'
import { AutoGainControlForm } from './AutoGainControlForm'
import { BlurRadiusForm } from './BlurRadiusForm'
import { BundleIdForm } from './BundleIdForm'
import { CameraDeviceForm } from './CameraDeviceForm'
import { ChannelIdForm } from './ChannelIdForm'
import { ClientIdForm } from './ClientIdForm'
import { ConnectButton } from './ConnectButton'
import { DataChannelForm } from './DataChannelForm'
import { DataChannelsForm } from './DataChannelsForm'
import { DisconnectButton } from './DisconnectButton'
import { DisplayResolutionForm } from './DisplayResolutionForm'
import { DisposeMediaButton } from './DisposeMediaButton'
import { E2EEForm } from './E2EEForm'
import { EchoCancellationForm } from './EchoCancellationForm'
import { EchoCancellationTypeForm } from './EchoCancellationTypeForm'
import { FacingModeForm } from './FacingModeForm'
import { FakeVolumeForm } from './FakeVolumeForm'
import { ForwardingFilterForm } from './ForwardingFilterForm'
import { FrameRateForm } from './FrameRateForm'
import { LightAdjustmentForm } from './LightAdjustmentForm'
import { MediaProcessorsNoiseSuppressionForm } from './MediaProcessorsNoiseSuppressionForm'
import { MediaTypeForm } from './MediaTypeForm'
import { MetadataForm } from './MetadataForm'
import { MicDeviceForm } from './MicDeviceForm'
import { MultistreamForm } from './MultistreamForm'
import { NoiseSuppressionForm } from './NoiseSuppressionForm'
import { ReconnectForm } from './ReconnectForm'
import { ReloadDevicesButton } from './ReloadDevicesButton'
import { RequestMediaButton } from './RequestMediaButton'
import { ResizeModeForm } from './ResizeModeForm'
import { ResolutionForm } from './ResolutionForm'
import { RoleForm } from './RoleForm'
import { SignalingNotifyMetadataForm } from './SignalingNotifyMetadataForm'
import { SignalingUrlCandidatesForm } from './SignalingUrlCandidatesForm'
import { SimulcastForm } from './SimulcastForm'
import { SimulcastRidForm } from './SimulcastRidForm'
import { SpotlightFocusRidForm } from './SpotlightFocusRidForm'
import { SpotlightForm } from './SpotlightForm'
import { SpotlightNumberForm } from './SpotlightNumberForm'
import { SpotlightUnfocusRidForm } from './SpotlightUnfocusRidForm'
import { StartRecordingButton } from './StartRecordingButton'
import { StopRecordingButton } from './StopRecordingButton'
import { UpdateMediaStreamButton } from './UpdateMediaStreamButton'
import { VideoAV1ParamsForm } from './VideoAV1ParamsForm'
import { VideoBitRateForm } from './VideoBitRateForm'
import { VideoCodecTypeForm } from './VideoCodecTypeForm'
import { VideoContentHintForm } from './VideoContentHintForm'
import { VideoForm } from './VideoForm'
import { VideoH264ParamsForm } from './VideoH264ParamsForm'
import { VideoInputForm } from './VideoInputForm'
import { VideoTrackForm } from './VideoTrackForm'
import { VideoVP9ParamsForm } from './VideoVP9ParamsForm'

const RowChannelOptions: React.FC = () => {
  return (
    <>
      <Row className="form-row" xs="auto">
        <Col>
          <ChannelIdForm />
        </Col>
      </Row>
      <Row className="form-row" xs="auto">
        <Col>
          <RoleForm />
        </Col>
        <Col>
          <MultistreamForm />
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
  const multistream = useAppSelector((state) => state.multistream)
  const showCodecForms = !(role === 'recvonly' && (multistream === 'true' || multistream === ''))
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
  const e2ee = useAppSelector((state) => state.e2ee)
  const enabledBundleId = useAppSelector((state) => state.enabledBundleId)
  const enabledClientId = useAppSelector((state) => state.enabledClientId)
  const enabledDataChannel = useAppSelector((state) => state.enabledDataChannel)
  const enabledDataChannels = useAppSelector((state) => state.enabledDataChannels)
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
    e2ee,
    enabledBundleId,
    enabledClientId,
    enabledDataChannel,
    enabledDataChannels,
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
        <button type="button" className={linkClassNames.join(' ')} onClick={onClick}>
          Signaling options
        </button>
      </Col>
      <Collapse in={!collapsed}>
        <div>
          <E2EEForm />
          <ReconnectForm />
          <ClientIdForm />
          <MetadataForm />
          <BundleIdForm />
          <SignalingNotifyMetadataForm />
          <SignalingUrlCandidatesForm />
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
  const audioStreamingLanguageCode = useAppSelector((state) => state.audioStreamingLanguageCode)
  const audioLyraParamsBitrate = useAppSelector((state) => state.audioLyraParamsBitrate)
  const enabledVideoVP9Params = useAppSelector((state) => state.enabledVideoVP9Params)
  const enabledVideoH264Params = useAppSelector((state) => state.enabledVideoH264Params)
  const enabledVideoAV1Params = useAppSelector((state) => state.enabledVideoAV1Params)
  const enabledOptions = [
    audioStreamingLanguageCode !== '',
    audioLyraParamsBitrate !== '',
    enabledVideoVP9Params,
    enabledVideoH264Params,
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
        <button type="button" className={linkClassNames.join(' ')} onClick={onClick}>
          Advanced signaling options
        </button>
      </Col>
      <Collapse in={!collapsed}>
        <div>
          <AudioStreamingLanguageCodeForm />
          <Row className="form-row">
            <Col className="col-auto">
              <AudioLyraParamsBitrateForm />
            </Col>
          </Row>
          <VideoVP9ParamsForm />
          <VideoAV1ParamsForm />
          <VideoH264ParamsForm />
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
        <button type="button" className={linkClassNames.join(' ')} onClick={onClick}>
          Media options
        </button>
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
              <LightAdjustmentForm />
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
        <Col>
          <AudioOutputForm />
        </Col>
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
    <Row className="form-row" xs="auto">
      <Col>
        <DisplayResolutionForm />
      </Col>
      {role !== 'recvonly' ? (
        <>
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
        </>
      ) : null}
    </Row>
  )
}

export const DevtoolsPane: React.FC = () => {
  const debug = useAppSelector((state) => state.debug)
  const role = useAppSelector((state) => state.role)
  const multistream = useAppSelector((state) => state.multistream)
  const showAdvancedSignalingForms = !(
    role === 'recvonly' &&
    (multistream === 'true' || multistream === '')
  )
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
