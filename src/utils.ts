import {
  type LightAdjustmentProcessorOptions,
  SelfieSegmentationFocusMask,
} from '@shiguredo/light-adjustment'
import queryString from 'query-string'
import type { ConnectionOptions } from 'sora-js-sdk'

import {
  ASPECT_RATIO_TYPES,
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  BLUR_RADIUS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  ECHO_CANCELLATIONS,
  ECHO_CANCELLATION_TYPES,
  FACING_MODES,
  IGNORE_DISCONNECT_WEBSOCKET,
  LIGHT_ADJUSTMENT,
  MEDIA_TYPES,
  MULTISTREAM,
  NOISE_SUPPRESSIONS,
  RESIZE_MODE_TYPES,
  ROLES,
  SIMULCAST,
  SIMULCAST_RID,
  SPOTLIGHT,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
  VIDEO_CONTENT_HINTS,
} from './constants'
import type {
  ConnectionOptionsState,
  CustomHTMLCanvasElement,
  Json,
  QueryStringParameters,
  SoraDevtoolsMediaTrackConstraints,
  SoraDevtoolsState,
} from './types'

// UNIX time を 年-月-日 時:分:秒.ミリ秒 形式に変換
export function formatUnixtime(time: number): string {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')
  const millisecond = date.getMilliseconds().toString().padStart(3, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`
}

// OS の Clipboard にテキストを書き込む
export function copy2clipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  return Promise.resolve()
}

// Form の Type Guard
export function checkFormValue<T extends readonly string[]>(
  value: unknown,
  candidates: T,
): value is (typeof candidates)[number] {
  if (typeof value === 'string') {
    return candidates.indexOf(value) >= 0
  }
  return false
}

// クエリ文字列パーサー
export function parseQueryString(): Partial<QueryStringParameters> {
  // パラメーターが文字列かどうかを判定して string | undefined を返す
  const parseStringParameter = (
    parameter: string | (string | null)[] | null,
  ): string | undefined => {
    if (typeof parameter === 'string') {
      return parameter
    }
    return
  }
  // パラメーターが boolean かどうかを判定して boolean | undefined を返す
  const parseBooleanParameter = (
    parameter: string | (string | null)[] | null,
  ): boolean | undefined => {
    if (typeof parameter === 'string') {
      return parseBooleanString(parameter)
    }
    return
  }
  // パラメーターが特定の文字列かどうかを判定して string | undefined を返す
  const parseSpecifiedStringParameter = <T extends readonly string[]>(
    parameter: string | (string | null)[] | null,
    candidates: T,
  ): (typeof candidates)[number] | undefined => {
    if (checkFormValue(parameter, candidates)) {
      return parameter
    }
    return
  }
  const qs = queryString.parse(location.search)
  // signalingUrlCandidates のパース
  let signalingUrlCandidates: any
  if (typeof qs.signalingUrlCandidates === 'string') {
    try {
      signalingUrlCandidates = JSON.parse(qs.signalingUrlCandidates)
    } catch (_) {
      // 例外の場合は何もしない
    }
  }
  const result: Partial<QueryStringParameters> = {
    apiUrl: parseStringParameter(qs.apiUrl),
    audio: parseBooleanParameter(qs.audio),
    audioBitRate: parseSpecifiedStringParameter(qs.audioBitRate, AUDIO_BIT_RATES),
    audioCodecType: parseSpecifiedStringParameter(qs.audioCodecType, AUDIO_CODEC_TYPES),
    audioStreamingLanguageCode: parseStringParameter(qs.audioStreamingLanguageCode),
    autoGainControl: parseSpecifiedStringParameter(qs.autoGainControl, AUTO_GAIN_CONTROLS),
    bundleId: parseStringParameter(qs.bundleId),
    channelId: parseStringParameter(qs.channelId),
    clientId: parseStringParameter(qs.clientId),
    googCpuOveruseDetection: parseBooleanParameter(qs.googCpuOveruseDetection),
    debug: parseBooleanParameter(qs.debug),
    debugType: parseSpecifiedStringParameter(qs.debugType, DEBUG_TYPES),
    displayResolution: parseStringParameter(qs.displayResolution),
    echoCancellation: parseSpecifiedStringParameter(qs.echoCancellation, ECHO_CANCELLATIONS),
    echoCancellationType: parseSpecifiedStringParameter(
      qs.echoCancellationType,
      ECHO_CANCELLATION_TYPES,
    ),
    noiseSuppression: parseSpecifiedStringParameter(qs.noiseSuppression, NOISE_SUPPRESSIONS),
    facingMode: parseSpecifiedStringParameter(qs.facingMode, FACING_MODES),
    fakeVolume: parseStringParameter(qs.fakeVolume),
    frameRate: parseStringParameter(qs.frameRate),
    mediaStats: parseBooleanParameter(qs.mediaStats),
    mediaType: parseSpecifiedStringParameter(qs.mediaType, MEDIA_TYPES),
    metadata: parseStringParameter(qs.metadata),
    showStats: parseBooleanParameter(qs.showStats),
    signalingNotifyMetadata: parseStringParameter(qs.signalingNotifyMetadata),
    signalingUrlCandidates: Array.isArray(signalingUrlCandidates)
      ? signalingUrlCandidates
      : undefined,
    forwardingFilter: parseStringParameter(qs.forwardingFilter),
    simulcast: parseSpecifiedStringParameter(qs.simulcast, SIMULCAST),
    simulcastRid: parseSpecifiedStringParameter(qs.simulcastRid, SIMULCAST_RID),
    spotlight: parseSpecifiedStringParameter(qs.spotlight, SPOTLIGHT),
    spotlightNumber: parseSpecifiedStringParameter(qs.spotlightNumber, SPOTLIGHT_NUMBERS),
    spotlightFocusRid: parseSpecifiedStringParameter(qs.spotlightFocusRid, SPOTLIGHT_FOCUS_RIDS),
    spotlightUnfocusRid: parseSpecifiedStringParameter(
      qs.spotlightUnfocusRid,
      SPOTLIGHT_FOCUS_RIDS,
    ),
    resolution: parseStringParameter(qs.resolution),
    video: parseBooleanParameter(qs.video),
    videoBitRate: parseSpecifiedStringParameter(qs.videoBitRate, VIDEO_BIT_RATES),
    videoCodecType: parseSpecifiedStringParameter(qs.videoCodecType, VIDEO_CODEC_TYPES),
    videoVP9Params: parseStringParameter(qs.videoVP9Params),
    videoH264Params: parseStringParameter(qs.videoH264Params),
    videoH265Params: parseStringParameter(qs.videoH265Params),
    videoAV1Params: parseStringParameter(qs.videoAV1Params),
    audioInput: parseStringParameter(qs.audioInput),
    videoInput: parseStringParameter(qs.videoInput),
    audioOutput: parseStringParameter(qs.audioOutput),
    mute: parseBooleanParameter(qs.mute),
    dataChannelSignaling: parseSpecifiedStringParameter(
      qs.dataChannelSignaling,
      DATA_CHANNEL_SIGNALING,
    ),
    ignoreDisconnectWebSocket: parseSpecifiedStringParameter(
      qs.ignoreDisconnectWebSocket,
      IGNORE_DISCONNECT_WEBSOCKET,
    ),
    micDevice: parseBooleanParameter(qs.micDevice),
    cameraDevice: parseBooleanParameter(qs.cameraDevice),
    audioTrack: parseBooleanParameter(qs.audioTrack),
    videoTrack: parseBooleanParameter(qs.videoTrack),
    dataChannels: parseStringParameter(qs.dataChannels),
    reconnect: parseBooleanParameter(qs.reconnect),
    audioContentHint: parseSpecifiedStringParameter(qs.audioContentHint, AUDIO_CONTENT_HINTS),
    videoContentHint: parseSpecifiedStringParameter(qs.videoContentHint, VIDEO_CONTENT_HINTS),
    aspectRatio: parseSpecifiedStringParameter(qs.aspectRatio, ASPECT_RATIO_TYPES),
    resizeMode: parseSpecifiedStringParameter(qs.resizeMode, RESIZE_MODE_TYPES),
    blurRadius: parseSpecifiedStringParameter(qs.blurRadius, BLUR_RADIUS),
    lightAdjustment: parseSpecifiedStringParameter(qs.lightAdjustment, LIGHT_ADJUSTMENT),
    mediaProcessorsNoiseSuppression: parseBooleanParameter(qs.mediaProcessorsNoiseSuppression),
    multistream: parseSpecifiedStringParameter(qs.multistream, MULTISTREAM),
    role: parseSpecifiedStringParameter(qs.role, ROLES),
  }
  // undefined の項目を削除する
  ;(Object.keys(result) as (keyof Partial<QueryStringParameters>)[]).map((key) => {
    if (result[key] === undefined) {
      delete result[key]
    }
  })
  return result
}

// Sora のシグナリングURLを生成
export function createSignalingURL(
  enabledSignalingUrlCandidates: boolean,
  signalingUrlCandidates: string[],
): string | string[] {
  if (enabledSignalingUrlCandidates) {
    // 空文字列は取り除く
    return signalingUrlCandidates.filter((signalingUrlCandidate) => signalingUrlCandidate !== '')
  }
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SORA_SIGNALING_URL) {
    return process.env.NEXT_PUBLIC_SORA_SIGNALING_URL
  }
  const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  const port = window.location.port ? `:${window.location.port}` : ''
  return `${wsProtocol + window.location.hostname + port}/signaling`
}

// 解像度に対応する width と height を返す
const videoResolutionPattern = /^(\d+)x(\d+)$/

export function testVideoResolutionPattern(resolution: string): boolean {
  return videoResolutionPattern.test(resolution)
}

export function getVideoSizeByResolution(resolution: string): { width: number; height: number } {
  if (videoResolutionPattern.test(resolution)) {
    const match = resolution.match(videoResolutionPattern)
    if (match) {
      return { width: Number.parseInt(match[1], 10), height: Number.parseInt(match[2], 10) }
    }
  }
  return { width: 0, height: 0 }
}

// アスペクト比に対応する数値を返す
export function getValueByAspectRatio(aspectRatio: string): number {
  switch (aspectRatio) {
    case '4:3':
      return 4 / 3
    case '16:9':
      return 16 / 9
    case '21:9':
      return 20 / 9
    default:
      return Number.NaN
  }
}

// devtools の blurRadius 文字列に対する数値を返す
export function getBlurRadiusNumber(blurRadius: (typeof BLUR_RADIUS)[number]): number {
  switch (blurRadius) {
    case 'weak':
      return 5
    case 'medium':
      return 10
    case 'strong':
      return 15
    default:
      return 0
  }
}

// devtools の lightAdjustment 文字列に対するオプションを返す
export function getLightAdjustmentOptions(
  lightAdjustment: (typeof LIGHT_ADJUSTMENT)[number],
): LightAdjustmentProcessorOptions {
  switch (lightAdjustment) {
    case 'weak':
      return { adjustmentLevel: 30, sharpnessLevel: 0 }
    case 'medium': {
      const assetsPath = process.env.NEXT_PUBLIC_LIGHT_ADJUSTMENT_ASSETS_PATH || ''
      const focusMask = new SelfieSegmentationFocusMask(assetsPath)
      return { adjustmentLevel: 50, sharpnessLevel: 10, focusMask }
    }
    case 'strong': {
      const assetsPath = process.env.NEXT_PUBLIC_LIGHT_ADJUSTMENT_ASSETS_PATH || ''
      const focusMask = new SelfieSegmentationFocusMask(assetsPath)
      return { adjustmentLevel: 70, sharpnessLevel: 20, minIntensity: 10, focusMask }
    }
    default:
      return {}
  }
}

// getUserMedia の audio constraints を生成
type CreateAudioConstraintsParameters = {
  audio: boolean
  autoGainControl: (typeof AUTO_GAIN_CONTROLS)[number]
  noiseSuppression: (typeof NOISE_SUPPRESSIONS)[number]
  echoCancellation: (typeof ECHO_CANCELLATIONS)[number]
  echoCancellationType: (typeof ECHO_CANCELLATION_TYPES)[number]
  audioInput: string
}
export function createAudioConstraints(
  parameters: CreateAudioConstraintsParameters,
): boolean | MediaTrackConstraints {
  const {
    audio,
    autoGainControl,
    noiseSuppression,
    echoCancellation,
    echoCancellationType,
    audioInput,
  } = parameters
  if (!audio) {
    return false
  }
  if (
    !autoGainControl &&
    !noiseSuppression &&
    !echoCancellation &&
    !echoCancellationType &&
    !audioInput
  ) {
    return audio
  }
  const audioConstraints: SoraDevtoolsMediaTrackConstraints = {}
  if (audioInput) {
    audioConstraints.deviceId = { exact: audioInput }
  }
  const parsedAutoGainControl = parseBooleanString(autoGainControl)
  if (parsedAutoGainControl !== undefined) {
    audioConstraints.autoGainControl = parsedAutoGainControl
  }
  const parsedNoiseSuppression = parseBooleanString(noiseSuppression)
  if (parsedNoiseSuppression !== undefined) {
    audioConstraints.noiseSuppression = parsedNoiseSuppression
  }
  const parsedEchoCancellation = parseBooleanString(echoCancellation)
  if (parsedEchoCancellation !== undefined) {
    audioConstraints.echoCancellation = parsedEchoCancellation
  }
  if (echoCancellationType) {
    audioConstraints.echoCancellationType = echoCancellationType
  }
  return audioConstraints
}

// getUserMedia の video constraints を生成
type CreateVideoConstraintsParameters = {
  aspectRatio: SoraDevtoolsState['aspectRatio']
  frameRate: SoraDevtoolsState['frameRate']
  resizeMode: SoraDevtoolsState['resizeMode']
  resolution: SoraDevtoolsState['resolution']
  video: SoraDevtoolsState['video']
  videoInput: SoraDevtoolsState['videoInput']
  facingMode: SoraDevtoolsState['facingMode']
}
export function createVideoConstraints(
  parameters: CreateVideoConstraintsParameters,
): boolean | MediaTrackConstraints {
  const { video, frameRate, resolution, videoInput, aspectRatio, resizeMode, facingMode } =
    parameters
  if (!video) {
    return false
  }
  if (!frameRate && !resolution && !videoInput && !aspectRatio && !resizeMode && !facingMode) {
    return video
  }
  const videoConstraints: SoraDevtoolsMediaTrackConstraints = {}
  if (frameRate) {
    const fps = Number.parseInt(frameRate, 10)
    if (!Number.isNaN(fps)) {
      videoConstraints.frameRate = {
        min: fps,
        max: fps,
      }
    }
  }
  if (resolution) {
    const { width, height } = getVideoSizeByResolution(resolution)
    if (0 < width && 0 < height) {
      videoConstraints.width = { exact: width }
      videoConstraints.height = { exact: height }
    }
  }
  if (videoInput) {
    videoConstraints.deviceId = { exact: videoInput }
  }
  if (aspectRatio) {
    videoConstraints.aspectRatio = getValueByAspectRatio(aspectRatio)
  }
  if (resizeMode) {
    videoConstraints.resizeMode = resizeMode
  }
  if (facingMode === 'front') {
    videoConstraints.facingMode = 'user'
  } else if (facingMode === 'back') {
    videoConstraints.facingMode = { exact: 'environment' }
  }
  return videoConstraints
}

// Fake 用の constraints を生成
type CreateFakeMediaConstraintsParameters = {
  audio: SoraDevtoolsState['audio']
  video: SoraDevtoolsState['video']
  frameRate: SoraDevtoolsState['frameRate']
  resolution: SoraDevtoolsState['resolution']
  volume: SoraDevtoolsState['fakeVolume']
  aspectRatio: SoraDevtoolsState['aspectRatio']
  resizeMode: SoraDevtoolsState['resizeMode']
}
type FakeMediaStreamConstraints = {
  audio: boolean
  video: boolean
  frameRate: number
  width: number
  height: number
  fontSize: number
  volume: number
  videoTrackConstraints?: SoraDevtoolsMediaTrackConstraints
}
export function createFakeMediaConstraints(
  parameters: CreateFakeMediaConstraintsParameters,
): FakeMediaStreamConstraints {
  const { audio, video, frameRate, resolution, volume, aspectRatio, resizeMode } = parameters
  // fake の default frameRate は 30 fps
  const fps = Number.parseInt(frameRate, 10)
  const parsedFrameRate = Number.isNaN(fps) ? 30 : fps
  // width, height の default はそれぞれ 240 / 160
  const resolutionSize = getVideoSizeByResolution(resolution)
  const width = resolutionSize.width || 240
  const height = resolutionSize.height || 160
  const fontSize = Math.floor(width / 5)
  const constraints: FakeMediaStreamConstraints = {
    audio: audio,
    video: video,
    frameRate: parsedFrameRate,
    width: width,
    height: height,
    fontSize: fontSize,
    volume: Number.parseFloat(volume),
  }
  if (video && (aspectRatio || resizeMode)) {
    constraints.videoTrackConstraints = {}
    if (aspectRatio) {
      constraints.videoTrackConstraints.aspectRatio = getValueByAspectRatio(aspectRatio)
    }
    if (resizeMode) {
      constraints.videoTrackConstraints.resizeMode = resizeMode
    }
  }
  return constraints
}

// getDisplayMedia の audio constraints を生成
type CreateGetDisplayMediaAudioConstraintsParameters = {
  audio: SoraDevtoolsState['audio']
  autoGainControl: (typeof AUTO_GAIN_CONTROLS)[number]
  noiseSuppression: (typeof NOISE_SUPPRESSIONS)[number]
  echoCancellation: (typeof ECHO_CANCELLATIONS)[number]
  echoCancellationType: (typeof ECHO_CANCELLATION_TYPES)[number]
}
export function createGetDisplayMediaAudioConstraints(
  parameters: CreateGetDisplayMediaAudioConstraintsParameters,
): boolean | MediaTrackConstraints {
  const { audio, autoGainControl, noiseSuppression, echoCancellation, echoCancellationType } =
    parameters
  if (!audio) {
    return false
  }
  if (!autoGainControl && !noiseSuppression && !echoCancellation && !echoCancellationType) {
    return true
  }
  const audioConstraints: SoraDevtoolsMediaTrackConstraints = {}
  const parsedAutoGainControl = parseBooleanString(autoGainControl)
  if (parsedAutoGainControl !== undefined) {
    audioConstraints.autoGainControl = parsedAutoGainControl
  }
  const parsedNoiseSuppression = parseBooleanString(noiseSuppression)
  if (parsedNoiseSuppression !== undefined) {
    audioConstraints.noiseSuppression = parsedNoiseSuppression
  }
  const parsedEchoCancellation = parseBooleanString(echoCancellation)
  if (parsedEchoCancellation !== undefined) {
    audioConstraints.echoCancellation = parsedEchoCancellation
  }
  if (echoCancellationType) {
    audioConstraints.echoCancellationType = echoCancellationType
  }
  return audioConstraints
}

// getDisplayMedia の video constraints を生成
type CreateGetDisplayMediaVideoConstraintsParameters = {
  frameRate: SoraDevtoolsState['frameRate']
  resolution: SoraDevtoolsState['resolution']
  aspectRatio: SoraDevtoolsState['aspectRatio']
  resizeMode: SoraDevtoolsState['resizeMode']
}
export function createGetDisplayMediaVideoConstraints(
  parameters: CreateGetDisplayMediaVideoConstraintsParameters,
): boolean | SoraDevtoolsMediaTrackConstraints {
  const { aspectRatio, frameRate, resizeMode, resolution } = parameters
  if (!frameRate && !resolution && !aspectRatio && !resizeMode) {
    return true
  }
  const videoConstraints: SoraDevtoolsMediaTrackConstraints = {}
  if (frameRate) {
    const fps = Number.parseInt(frameRate, 10)
    if (!Number.isNaN(fps)) {
      videoConstraints.frameRate = fps
    }
  }
  if (resolution) {
    const { width, height } = getVideoSizeByResolution(resolution)
    if (0 < width && 0 < height) {
      videoConstraints.width = width
      videoConstraints.height = height
    }
  }
  if (aspectRatio) {
    videoConstraints.aspectRatio = getValueByAspectRatio(aspectRatio)
  }
  if (resizeMode) {
    videoConstraints.resizeMode = resizeMode
  }
  return videoConstraints
}

// Fake 用の MediaStream を生成
export function createFakeMediaStream(parameters: FakeMediaStreamConstraints): {
  canvas: CustomHTMLCanvasElement | null
  mediaStream: MediaStream
  gainNode: GainNode | null
} {
  const mediaStream = new MediaStream()
  let canvas = null
  if (parameters.video) {
    canvas = document.createElement('canvas') as CustomHTMLCanvasElement
    // Firefox では getContext を呼ばないと captureStream が失敗する
    canvas.getContext('2d')
    canvas.width = parameters.width
    canvas.height = parameters.height
    const cancasStream = canvas.captureStream(parameters.frameRate)
    const videoTrack = cancasStream.getTracks()[0]
    if (parameters.videoTrackConstraints) {
      videoTrack.applyConstraints(parameters.videoTrackConstraints)
    }
    mediaStream.addTrack(videoTrack)
  }
  let gainNode = null
  if (parameters.audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const selectedOscillatorType = 'sine'
    oscillator.type = selectedOscillatorType
    gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    oscillator.start(0)
    const mediaStreamDestination = audioContext.createMediaStreamDestination()
    gainNode.connect(mediaStreamDestination)
    const audioTracks = mediaStreamDestination.stream.getTracks()
    mediaStream.addTrack(audioTracks[0])
    gainNode.gain.setValueAtTime(parameters.volume, 0)
  }
  return { canvas, mediaStream, gainNode }
}

// Fake mediastream を生成するための canvas に書き込みをする
export function drawFakeCanvas(
  canvas: CustomHTMLCanvasElement | null,
  colorCode: number,
  fontSize: number,
  text: string,
): void {
  if (canvas === null) {
    return
  }
  const context = canvas.getContext('2d')
  if (!context) {
    return
  }
  context.globalCompositeOperation = 'source-over'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = `#${('0'.repeat(6) + colorCode.toString(16)).slice(-6)}`
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = `#${('0'.repeat(6) + (0xffffff - colorCode).toString(16)).slice(-6)}`
  context.font = `${fontSize}px Arial`
  const x = canvas.width / 2 - fontSize / 2
  const margin = (fontSize / 4) * (text.length - 1)
  const y = canvas.height / 2 + fontSize / 2.5
  context.fillText(text, x - margin, y)
}

export function parseBooleanString(value: string): boolean | undefined {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return
}

export function parseMetadata(enabledMetadata: boolean, metadata: string): Json | undefined {
  if (!enabledMetadata) {
    return undefined
  }
  try {
    return JSON.parse(metadata)
  } catch (_e) {
    // JSON parse に失敗しても何もしない
  }
  return metadata
}

export function getDefaultVideoCodecType(): (typeof VIDEO_CODEC_TYPES)[number] {
  // getCapabilities API が存在しない場合
  if (!window.RTCRtpSender || !RTCRtpSender.getCapabilities) {
    return 'VP9'
  }
  // getCapabilities APIから codec 一覧が取れない場合
  const capabilities = RTCRtpSender.getCapabilities('video')
  if (!capabilities || !capabilities.codecs) {
    return 'VP9'
  }
  const codecs = capabilities.codecs.map((c) => c.mimeType.replace('video/', ''))
  if (codecs.includes('VP9')) {
    return 'VP9'
  }
  if (codecs.includes('VP8')) {
    return 'VP8'
  }
  if (codecs.includes('H264')) {
    return 'H264'
  }
  if (codecs.includes('AV1')) {
    return 'AV1'
  }
  if (codecs.includes('H265')) {
    return 'H265'
  }
  return 'VP9'
}

export async function getDevices(): Promise<MediaDeviceInfo[]> {
  // https じゃない場合などで mediaDevices が undefined になる可能性がある
  if (navigator.mediaDevices === undefined) {
    return []
  }
  try {
    return await navigator.mediaDevices.enumerateDevices()
  } catch (_) {
    // 例外が起きた場合は何もしない
  }
  return []
}

// Sora との接続状態に応じて特定の Form を表示するかしないかを返す
export function isFormDisabled(
  connectionStatus: SoraDevtoolsState['soraContents']['connectionStatus'],
): boolean {
  return (
    connectionStatus === 'preparing' ||
    connectionStatus === 'connected' ||
    connectionStatus === 'connecting'
  )
}

// track の設定情報を返す
type GetMediaStreamTrackProperties = {
  id: MediaStreamTrack['id']
  label: MediaStreamTrack['label']
  kind: MediaStreamTrack['kind']
  enabled: MediaStreamTrack['enabled']
  muted: MediaStreamTrack['muted']
  readyState: MediaStreamTrack['readyState']
  contentHint: MediaStreamTrack['contentHint']
  getConstraints: MediaTrackConstraints
  getCapabilities: MediaTrackCapabilities | null
  getSettings: MediaTrackSettings
}
export function getMediaStreamTrackProperties(
  track: MediaStreamTrack,
): GetMediaStreamTrackProperties {
  return {
    id: track.id,
    label: track.label,
    kind: track.kind,
    enabled: track.enabled,
    muted: track.muted,
    readyState: track.readyState,
    contentHint: track.contentHint,
    getConstraints: track.getConstraints(),
    getCapabilities: track.getCapabilities ? track.getCapabilities() : null,
    getSettings: track.getSettings(),
  }
}

// Sora の connectOptions を生成する
export function createConnectOptions(
  connectionOptionsState: ConnectionOptionsState,
): ConnectionOptions {
  const connectionOptions: ConnectionOptions = {
    audio: connectionOptionsState.audio,
    video: connectionOptionsState.video,
  }
  // recvonly かつ multistream の時は audio/video のパラメータを送らない
  const sendAudioVideoParams = !(
    connectionOptionsState.role === 'recvonly' &&
    (connectionOptionsState.multistream === 'true' || connectionOptionsState.multistream === '')
  )
  if (sendAudioVideoParams) {
    // audioCodecType
    if (connectionOptionsState.audioCodecType) {
      connectionOptions.audioCodecType = connectionOptionsState.audioCodecType
    }
    // audioBitRate
    const parsedAudioBitRate = Number.parseInt(connectionOptionsState.audioBitRate, 10)
    if (parsedAudioBitRate) {
      connectionOptions.audioBitRate = parsedAudioBitRate
    }
    // videoCodecType
    if (connectionOptionsState.videoCodecType) {
      connectionOptions.videoCodecType = connectionOptionsState.videoCodecType
    }
    // videoBitRate
    const parsedVideoBitRate = Number.parseInt(connectionOptionsState.videoBitRate, 10)
    if (parsedVideoBitRate) {
      connectionOptions.videoBitRate = parsedVideoBitRate
    }
    // videoVP9Params
    if (connectionOptionsState.enabledVideoVP9Params) {
      connectionOptions.videoVP9Params = parseMetadata(true, connectionOptionsState.videoVP9Params)
    }
    // videoH264Params
    if (connectionOptionsState.enabledVideoH264Params) {
      connectionOptions.videoH264Params = parseMetadata(
        true,
        connectionOptionsState.videoH264Params,
      )
    }
    // videoH265Params
    if (connectionOptionsState.enabledVideoH265Params) {
      connectionOptions.videoH265Params = parseMetadata(
        true,
        connectionOptionsState.videoH265Params,
      )
    }
    // videoVP9Params
    if (connectionOptionsState.enabledVideoAV1Params) {
      connectionOptions.videoAV1Params = parseMetadata(true, connectionOptionsState.videoAV1Params)
    }
    // audioStreamingLanguageCode
    if (connectionOptionsState.enabledAudioStreamingLanguageCode) {
      connectionOptions.audioStreamingLanguageCode =
        connectionOptionsState.audioStreamingLanguageCode
    }
  }
  // multistream
  const parsedMultistream = parseBooleanString(connectionOptionsState.multistream)
  if (parsedMultistream !== undefined) {
    connectionOptions.multistream = parsedMultistream
  }
  // spotlight
  const parsedSpotlight = parseBooleanString(connectionOptionsState.spotlight)
  if (parsedSpotlight !== undefined) {
    connectionOptions.spotlight = parsedSpotlight
    if (parsedSpotlight === true) {
      if (connectionOptionsState.spotlightNumber) {
        connectionOptions.spotlightNumber = Number.parseInt(connectionOptionsState.spotlightNumber)
      }
      if (connectionOptionsState.spotlightFocusRid) {
        connectionOptions.spotlightFocusRid = connectionOptionsState.spotlightFocusRid
      }
      if (connectionOptionsState.spotlightUnfocusRid) {
        connectionOptions.spotlightUnfocusRid = connectionOptionsState.spotlightUnfocusRid
      }
    }
  }
  // simulcast
  const parsedSimulcast = parseBooleanString(connectionOptionsState.simulcast)
  if (parsedSimulcast !== undefined) {
    connectionOptions.simulcast = parsedSimulcast
    if (parsedSimulcast === true && connectionOptionsState.simulcastRid) {
      connectionOptions.simulcastRid = connectionOptionsState.simulcastRid
    }
  }
  // signalingNotifyMetadata
  if (connectionOptionsState.enabledSignalingNotifyMetadata) {
    connectionOptions.signalingNotifyMetadata = parseMetadata(
      true,
      connectionOptionsState.signalingNotifyMetadata,
    )
  }
  // forwardingFilter
  if (connectionOptionsState.enabledForwardingFilter) {
    connectionOptions.forwardingFilter = parseMetadata(
      true,
      connectionOptionsState.forwardingFilter,
    )
  }
  // bundleId
  if (connectionOptionsState.enabledBundleId) {
    connectionOptions.bundleId = connectionOptionsState.bundleId
  }
  // clientId
  if (connectionOptionsState.enabledClientId) {
    connectionOptions.clientId = connectionOptionsState.clientId
  }
  // dataChannelSignaling, ignoreDisconnectWebSocket
  if (connectionOptionsState.enabledDataChannel) {
    const parsedDataChannelSignaling = parseBooleanString(
      connectionOptionsState.dataChannelSignaling,
    )
    if (parsedDataChannelSignaling !== undefined) {
      connectionOptions.dataChannelSignaling = parsedDataChannelSignaling
    }
    const parsedIgnoreDisconnectWebSocket = parseBooleanString(
      connectionOptionsState.ignoreDisconnectWebSocket,
    )
    if (parsedIgnoreDisconnectWebSocket !== undefined) {
      connectionOptions.ignoreDisconnectWebSocket = parsedIgnoreDisconnectWebSocket
    }
  }
  // dataChannels
  if (connectionOptionsState.dataChannels !== '') {
    let dataChannels = []
    try {
      dataChannels = JSON.parse(connectionOptionsState.dataChannels)
    } catch (_) {
      // サンプル実装なので warning で回避
      console.warn('Illegal format DataChannels')
    }
    if (Array.isArray(dataChannels)) {
      connectionOptions.dataChannels = dataChannels
    }
  }
  return connectionOptions
}
