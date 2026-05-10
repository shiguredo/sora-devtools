import type { Mp4MediaStream } from "@shiguredo/mp4-media-stream";
import { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import { batch, computed, signal } from "@preact/signals";
import type {
  ConnectionPublisher,
  ConnectionSubscriber,
  DataChannelConfiguration,
  Role,
} from "sora-js-sdk";

import packageJSON from "../../package.json";
// eslint-disable-next-line import/default -- vite の `?worker` は default export を提供する仮想モジュールで eslint-plugin-import が解釈できない
import FakeVideoWorker from "../workers/fakeVideo.worker.ts?worker";
import type {
  AlertMessage,
  ApiObject,
  DataChannelMessage,
  DebugType,
  LogMessage,
  NotifyMessage,
  PushMessage,
  RemoteClient,
  RpcObject,
  SignalingMessage,
  SoraDevtoolsState,
  TimelineMessage,
} from "../types";
import { setTrackContentHint } from "../utils.ts";

// --- Audio 関連 ---
export const audio = signal<boolean>(true);
export const audioBitRate = signal<string>("");
export const audioCodecType = signal<SoraDevtoolsState["audioCodecType"]>("");
export const audioContentHint = signal<SoraDevtoolsState["audioContentHint"]>("");
export const audioInput = signal<string>("");
export const audioInputDevices = signal<MediaDeviceInfo[]>([]);
export const audioOutput = signal<string>("");
export const audioOutputDevices = signal<MediaDeviceInfo[]>([]);
export const autoGainControl = signal<SoraDevtoolsState["autoGainControl"]>("");
export const audioStreamingLanguageCode = signal<string>("");
export const enabledAudioStreamingLanguageCode = signal<boolean>(false);
export const audioTrack = signal<boolean>(true);

// --- Video 関連 ---
export const video = signal<boolean>(true);
export const videoBitRate = signal<string>("");
export const videoCodecType = signal<SoraDevtoolsState["videoCodecType"]>("");
export const videoContentHint = signal<SoraDevtoolsState["videoContentHint"]>("");
export const videoInput = signal<string>("");
export const videoInputDevices = signal<MediaDeviceInfo[]>([]);
export const videoVP9Params = signal<string>("");
export const videoH264Params = signal<string>("");
export const videoH265Params = signal<string>("");
export const videoAV1Params = signal<string>("");
export const videoTrack = signal<boolean>(true);

// --- 接続設定 ---
export const channelId = signal<string>("sora");
export const clientId = signal<string>("");
export const bundleId = signal<string>("");
export const enabledBundleId = signal<boolean>(false);
export const enabledClientId = signal<boolean>(false);
export const role = signal<Role>("sendrecv");
export const reconnect = signal<boolean>(false);
export const apiUrl = signal<string | null>(null);

// --- Simulcast/Spotlight ---
export const simulcast = signal<SoraDevtoolsState["simulcast"]>("");
export const simulcastRid = signal<SoraDevtoolsState["simulcastRid"]>("");
export const simulcastRequestRid = signal<SoraDevtoolsState["simulcastRequestRid"]>("");
export const spotlight = signal<SoraDevtoolsState["spotlight"]>("");
export const spotlightNumber = signal<SoraDevtoolsState["spotlightNumber"]>("");
export const spotlightFocusRid = signal<SoraDevtoolsState["spotlightFocusRid"]>("");
export const spotlightUnfocusRid = signal<SoraDevtoolsState["spotlightUnfocusRid"]>("");
export const focusedSpotlightConnectionIds = signal<Record<string, boolean>>({});

// --- DataChannel ---
export const dataChannelSignaling = signal<SoraDevtoolsState["dataChannelSignaling"]>("");
export const dataChannels = signal<string>("");
export const enabledDataChannels = signal<boolean>(false);
export const enabledDataChannel = signal<boolean>(false);
export const dataChannelMessages = signal<DataChannelMessage[]>([]);

// --- メタデータ ---
export const metadata = signal<string>("");
export const enabledMetadata = signal<boolean>(false);
export const signalingNotifyMetadata = signal<string>("");
export const enabledSignalingNotifyMetadata = signal<boolean>(false);
export const signalingUrlCandidates = signal<string[]>([]);
export const enabledSignalingUrlCandidates = signal<boolean>(false);
export const forwardingFilters = signal<string>("");
export const enabledForwardingFilters = signal<boolean>(false);

// --- Video パラメータ enabled ---
export const enabledVideoVP9Params = signal<boolean>(false);
export const enabledVideoH264Params = signal<boolean>(false);
export const enabledVideoH265Params = signal<boolean>(false);
export const enabledVideoAV1Params = signal<boolean>(false);

// --- メディア設定 ---
export const frameRate = signal<string>("");
export const resolution = signal<string>("");
export const displayResolution = signal<string>("");
export const aspectRatio = signal<SoraDevtoolsState["aspectRatio"]>("");
export const resizeMode = signal<SoraDevtoolsState["resizeMode"]>("");
export const facingMode = signal<SoraDevtoolsState["facingMode"]>("");
export const mediaType = signal<SoraDevtoolsState["mediaType"]>("getUserMedia");
export const blurRadius = signal<SoraDevtoolsState["blurRadius"]>("");
export const mediaProcessorsNoiseSuppression = signal<boolean>(false);
export const noiseSuppression = signal<SoraDevtoolsState["noiseSuppression"]>("");
export const echoCancellation = signal<SoraDevtoolsState["echoCancellation"]>("");
export const echoCancellationType = signal<SoraDevtoolsState["echoCancellationType"]>("");
export const ignoreDisconnectWebSocket = signal<SoraDevtoolsState["ignoreDisconnectWebSocket"]>("");
export const forceStereoOutput = signal<boolean>(false);

// --- Fake メディア ---
export const fakeVolume = signal<string>("0");
export const fakeVideoShowChannelId = signal<boolean>(true);
export const fakeContents = signal<{
  worker: Worker | null;
  gainNode: GainNode | null;
  audioContext: AudioContext | null;
}>({
  worker: null,
  gainNode: null,
  audioContext: null,
});

// --- デバイス ---
export const cameraDevice = signal<boolean>(true);
export const micDevice = signal<boolean>(true);
export const googCpuOveruseDetection = signal<boolean | null>(null);

// --- 外部メディア ---
export const mp4MediaStream = signal<Mp4MediaStream | null>(null);
export const noiseSuppressionProcessor = signal<NoiseSuppressionProcessor | null>(null);
export const virtualBackgroundProcessor = signal<VirtualBackgroundProcessor | null>(null);

// --- UI 状態 ---
export const mute = signal<boolean>(false);
export const mediaStats = signal<boolean>(false);
export const showStats = signal<boolean>(false);
export const debug = signal<boolean>(false);
export const debugType = signal<DebugType>("timeline");
export const debugFilterText = signal<string>("");
export const debugApiUrl = signal<string>("http://localhost:3000");
// expand: true = 全て開く, false = 全て閉じる, null = 初期状態
export const timelineExpandAll = signal<boolean | null>(null);
export const maxNotifyMessages = signal<number>(1000);

// --- メッセージ ---
export const alertMessages = signal<AlertMessage[]>([]);
export const logMessages = signal<LogMessage[]>([]);
export const timelineMessages = signal<TimelineMessage[]>([]);
export const notifyMessages = signal<NotifyMessage[]>([]);
export const pushMessages = signal<PushMessage[]>([]);
export const signalingMessages = signal<SignalingMessage[]>([]);

// --- RPC/API ---
export const rpcObjects = signal<RpcObject[]>([]);
export const apiObjects = signal<ApiObject[]>([]);

// --- バージョン ---
export const version = signal<string>(packageJSON.version);

// --- Sora 接続状態 ---
export const connectionStatus =
  signal<SoraDevtoolsState["soraContents"]["connectionStatus"]>("initializing");
export const reconnecting = signal<boolean>(false);
export const reconnectingTrials = signal<number>(0);
export const sora = signal<ConnectionPublisher | ConnectionSubscriber | null>(null);
export const connectionId = signal<string | null>(null);
export const soraClientId = signal<string | null>(null);
export const sessionId = signal<string | null>(null);
export const localMediaStream = signal<MediaStream | null>(null);
export const remoteClients = signal<RemoteClient[]>([]);
export const prevStatsReport = signal<RTCStats[]>([]);
export const statsReport = signal<RTCStats[]>([]);
export const soraDataChannels = signal<DataChannelConfiguration[]>([]);
export const turnUrl = signal<string | null>(null);

// --- 派生状態 ---
export const isFormDisabled = computed(() => {
  const status = connectionStatus.value;
  return status === "preparing" || status === "connected" || status === "connecting";
});

// アラートメッセージの最大保持件数。unshift 後にこの件数までトリムする
const MAX_ALERT_MESSAGES = 10;

// --- ヘルパー関数 ---
function setAlertMessagesAndLogMessages(alertMessage: AlertMessage): void {
  let currentAlertMessages = [...alertMessages.value];
  const currentLogMessages = [...logMessages.value];

  // unshift 後に MAX_ALERT_MESSAGES 件以下になるよう先にトリムする
  if (currentAlertMessages.length >= MAX_ALERT_MESSAGES) {
    currentAlertMessages = currentAlertMessages.slice(0, MAX_ALERT_MESSAGES - 1);
  }
  currentAlertMessages.unshift(alertMessage);
  currentLogMessages.push({
    timestamp: alertMessage.timestamp,
    message: {
      title: `ALERT MESSAGE ${alertMessage.title}`,
      description: JSON.stringify({
        title: alertMessage.title,
        type: alertMessage.type,
        message: alertMessage.message,
      }),
    },
  });

  alertMessages.value = currentAlertMessages;
  logMessages.value = currentLogMessages;
}

// --- アクション ---
export const setAudio = (value: boolean): void => {
  audio.value = value;
};
export const setAudioInput = (value: string): void => {
  audioInput.value = value;
};
export const setAudioOutput = (value: string): void => {
  audioOutput.value = value;
};
export const setAudioBitRate = (value: SoraDevtoolsState["audioBitRate"]): void => {
  audioBitRate.value = value;
};
export const setAudioCodecType = (value: SoraDevtoolsState["audioCodecType"]): void => {
  audioCodecType.value = value;
};
export const setAudioContentHint = (value: SoraDevtoolsState["audioContentHint"]): void => {
  audioContentHint.value = value;
  if (localMediaStream.value) {
    for (const track of localMediaStream.value.getAudioTracks()) {
      setTrackContentHint(track, value);
    }
  }
};
export const setAutoGainControl = (value: SoraDevtoolsState["autoGainControl"]): void => {
  autoGainControl.value = value;
};
export const setClientId = (value: string): void => {
  clientId.value = value;
};
export const setChannelId = (value: string): void => {
  channelId.value = value;
};
export const setTimelineMessage = (message: TimelineMessage): void => {
  timelineMessages.value = [...timelineMessages.value, message];
};
export const setDataChannelSignaling = (value: SoraDevtoolsState["dataChannelSignaling"]): void => {
  dataChannelSignaling.value = value;
};
export const setDataChannels = (value: string): void => {
  dataChannels.value = value;
};
export const setDataChannelMessage = (message: DataChannelMessage): void => {
  dataChannelMessages.value = [...dataChannelMessages.value, message];
};
export const setGoogCpuOveruseDetection = (value: boolean): void => {
  googCpuOveruseDetection.value = value;
};
export const setDisplayResolution = (value: SoraDevtoolsState["displayResolution"]): void => {
  displayResolution.value = value;
};
export const setEchoCancellation = (value: SoraDevtoolsState["echoCancellation"]): void => {
  echoCancellation.value = value;
};
export const setEchoCancellationType = (value: SoraDevtoolsState["echoCancellationType"]): void => {
  echoCancellationType.value = value;
};
export const setEnabledClientId = (value: boolean): void => {
  enabledClientId.value = value;
};
export const setEnabledDataChannels = (value: boolean): void => {
  enabledDataChannels.value = value;
};
export const setEnabledDataChannel = (value: boolean): void => {
  enabledDataChannel.value = value;
};
export const setEnabledMetadata = (value: boolean): void => {
  enabledMetadata.value = value;
};
export const setIgnoreDisconnectWebSocket = (
  value: SoraDevtoolsState["ignoreDisconnectWebSocket"],
): void => {
  ignoreDisconnectWebSocket.value = value;
};
export const setSignalingMessage = (message: SignalingMessage): void => {
  signalingMessages.value = [...signalingMessages.value, message];
};
export const setEnabledForwardingFilters = (value: boolean): void => {
  enabledForwardingFilters.value = value;
};
export const setEnabledSignalingNotifyMetadata = (value: boolean): void => {
  enabledSignalingNotifyMetadata.value = value;
};
export const setEnabledSignalingUrlCandidates = (value: boolean): void => {
  enabledSignalingUrlCandidates.value = value;
};
export const setEnabledVideoVP9Params = (value: boolean): void => {
  enabledVideoVP9Params.value = value;
};
export const setEnabledVideoH264Params = (value: boolean): void => {
  enabledVideoH264Params.value = value;
};
export const setEnabledVideoH265Params = (value: boolean): void => {
  enabledVideoH265Params.value = value;
};
export const setEnabledVideoAV1Params = (value: boolean): void => {
  enabledVideoAV1Params.value = value;
};
export const setFakeVolume = (value: string): void => {
  const volume = Number.parseFloat(value);
  let newVolume: string;
  if (Number.isNaN(volume)) {
    newVolume = "0";
  } else if (volume > 1) {
    newVolume = "1";
  } else {
    newVolume = String(volume);
  }
  fakeVolume.value = newVolume;
  if (fakeContents.value.gainNode) {
    fakeContents.value.gainNode.gain.setValueAtTime(Number.parseFloat(newVolume), 0);
  }
};
export const setFakeContentsAudio = (
  audioContext: AudioContext | null,
  gainNode: GainNode | null,
): void => {
  fakeContents.value = { ...fakeContents.value, gainNode, audioContext };
};
// fakeContents の AudioContext を close して signal をクリアする
// AudioContext は GC で解放されないため明示的に close する必要がある
// close しないと Chrome のハードウェアコンテキスト上限に到達して NotAllowedError になる
export const closeFakeContentsAudio = (): void => {
  const previousAudioContext = fakeContents.value.audioContext;
  if (previousAudioContext !== null) {
    void previousAudioContext.close();
  }
  fakeContents.value = { ...fakeContents.value, gainNode: null, audioContext: null };
};
export const setFakeVideoShowChannelId = (value: boolean): void => {
  fakeVideoShowChannelId.value = value;
  if (fakeContents.value.worker) {
    fakeContents.value.worker.postMessage({
      type: "setShowInfo",
      data: { showChannelId: value },
    });
  }
};
export const setInitialFakeContents = (): void => {
  const worker = new FakeVideoWorker();
  fakeContents.value = { ...fakeContents.value, worker };
};
export const setFrameRate = (value: SoraDevtoolsState["frameRate"]): void => {
  frameRate.value = value;
};
export const setMute = (value: boolean): void => {
  mute.value = value;
};
export const setMediaStats = (value: boolean): void => {
  mediaStats.value = value;
};
export const setMp4MediaStream = (value: Mp4MediaStream | null): void => {
  mp4MediaStream.value = value;
};
export const setNoiseSuppression = (value: SoraDevtoolsState["noiseSuppression"]): void => {
  noiseSuppression.value = value;
};
export const setMediaType = (value: SoraDevtoolsState["mediaType"]): void => {
  mediaType.value = value;
};
export const setMetadata = (value: string): void => {
  metadata.value = value;
};
export const setResolution = (value: SoraDevtoolsState["resolution"]): void => {
  resolution.value = value;
};
export const setSignalingNotifyMetadata = (value: string): void => {
  signalingNotifyMetadata.value = value;
};
export const setSignalingUrlCandidates = (value: string[]): void => {
  signalingUrlCandidates.value = value;
};
export const setForwardingFilters = (value: string): void => {
  forwardingFilters.value = value;
};
export const setSimulcastRid = (value: SoraDevtoolsState["simulcastRid"]): void => {
  simulcastRid.value = value;
};
export const setSimulcastRequestRid = (value: SoraDevtoolsState["simulcastRequestRid"]): void => {
  simulcastRequestRid.value = value;
};
export const setSpotlightNumber = (value: SoraDevtoolsState["spotlightNumber"]): void => {
  spotlightNumber.value = value;
};
export const setSpotlightFocusRid = (value: SoraDevtoolsState["spotlightFocusRid"]): void => {
  spotlightFocusRid.value = value;
};
export const setSpotlightUnfocusRid = (value: SoraDevtoolsState["spotlightUnfocusRid"]): void => {
  spotlightUnfocusRid.value = value;
};
export const setVideo = (value: boolean): void => {
  video.value = value;
};
export const setVideoInput = (value: string): void => {
  videoInput.value = value;
};
export const setVideoBitRate = (value: SoraDevtoolsState["videoBitRate"]): void => {
  videoBitRate.value = value;
};
export const setVideoCodecType = (value: SoraDevtoolsState["videoCodecType"]): void => {
  videoCodecType.value = value;
};
export const setVideoContentHint = (value: SoraDevtoolsState["videoContentHint"]): void => {
  videoContentHint.value = value;
  if (localMediaStream.value) {
    for (const track of localMediaStream.value.getVideoTracks()) {
      setTrackContentHint(track, value);
    }
  }
};
export const setVideoVP9Params = (value: string): void => {
  videoVP9Params.value = value;
};
export const setVideoH264Params = (value: string): void => {
  videoH264Params.value = value;
};
export const setVideoH265Params = (value: string): void => {
  videoH265Params.value = value;
};
export const setVideoAV1Params = (value: string): void => {
  videoAV1Params.value = value;
};
export const setSora = (value: ConnectionPublisher | ConnectionSubscriber | null): void => {
  sora.value = value;
  if (!value) {
    soraDataChannels.value = [];
  }
};
export const setSoraSessionId = (value: string | null): void => {
  sessionId.value = value;
  // Fake Video Worker に session_id を送信
  if (fakeContents.value.worker) {
    fakeContents.value.worker.postMessage({
      type: "setMetadata",
      data: { sessionId: value },
    });
  }
};
export const setSoraConnectionId = (value: string | null): void => {
  connectionId.value = value;
  // Fake Video Worker に connection_id を送信
  if (fakeContents.value.worker) {
    fakeContents.value.worker.postMessage({
      type: "setMetadata",
      data: { connectionId: value },
    });
  }
};
export const setSoraClientId = (value: string | null): void => {
  soraClientId.value = value;
};
export const setSoraTurnUrl = (value: string | null): void => {
  turnUrl.value = value;
};
export const setSoraConnectionStatus = (
  value: SoraDevtoolsState["soraContents"]["connectionStatus"],
): void => {
  connectionStatus.value = value;
};
export const setSoraReconnecting = (value: boolean): void => {
  reconnecting.value = value;
  if (!value) {
    reconnectingTrials.value = 0;
  }
};
export const setSoraReconnectingTrials = (value: number): void => {
  reconnectingTrials.value = value;
};
export const setSoraDataChannels = (dataChannel: DataChannelConfiguration): void => {
  soraDataChannels.value = [...soraDataChannels.value, dataChannel];
};
export const setLocalMediaStream = (mediaStream: MediaStream | null): void => {
  if (localMediaStream.value) {
    for (const track of localMediaStream.value.getTracks()) {
      track.stop();
    }
  }
  localMediaStream.value = mediaStream;
};
export const setRemoteClient = (remoteClient: RemoteClient): void => {
  remoteClients.value = [...remoteClients.value, remoteClient];
};
export const setSoraRemoteClientId = (payload: {
  connectionId: string;
  clientId: string;
}): void => {
  remoteClients.value = remoteClients.value.map((client) => {
    if (client.connectionId === payload.connectionId) {
      return { ...client, clientId: payload.clientId };
    }
    return client;
  });
};
export const setStatsReport = (report: RTCStats[]): void => {
  prevStatsReport.value = statsReport.value;
  statsReport.value = report;
};
export const removeRemoteClient = (connId: string): void => {
  remoteClients.value = remoteClients.value.filter((client) => client.connectionId !== connId);
};
export const removeAllRemoteClients = (): void => {
  remoteClients.value = [];
};
export const setAudioInputDevices = (devices: MediaDeviceInfo[]): void => {
  audioInputDevices.value = devices;
};
export const setVideoInputDevices = (devices: MediaDeviceInfo[]): void => {
  videoInputDevices.value = devices;
};
export const setAudioOutputDevices = (devices: MediaDeviceInfo[]): void => {
  audioOutputDevices.value = devices;
};
export const setSoraInfoAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: "Sora info",
    type: "info",
    message,
    timestamp: Date.now(),
  };
  setAlertMessagesAndLogMessages(alertMessage);
};
export const setSoraErrorAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: "Sora error",
    type: "error",
    message,
    timestamp: Date.now(),
  };
  setAlertMessagesAndLogMessages(alertMessage);
};
export const setAPIInfoAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: "API info",
    type: "info",
    message,
    timestamp: Date.now(),
  };
  setAlertMessagesAndLogMessages(alertMessage);
};
export const setAPIErrorAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: "API error",
    type: "error",
    message,
    timestamp: Date.now(),
  };
  setAlertMessagesAndLogMessages(alertMessage);
};
export const setRPCErrorAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: "RPC error",
    type: "error",
    message,
    timestamp: Date.now(),
  };
  setAlertMessagesAndLogMessages(alertMessage);
};
export const deleteAlertMessage = (timestamp: number): void => {
  alertMessages.value = alertMessages.value.filter(
    (alertMessage) => alertMessage.timestamp !== timestamp,
  );
};
export const setDebug = (value: boolean): void => {
  debug.value = value;
};
export const setDebugFilterText = (value: string): void => {
  debugFilterText.value = value;
};
export const setDebugType = (value: DebugType): void => {
  debugFilterText.value = "";
  debugType.value = value;
};
export const setLogMessages = (message: LogMessage["message"]): void => {
  logMessages.value = [
    ...logMessages.value,
    {
      timestamp: Date.now(),
      message: {
        title: message.title,
        description: message.description,
      },
    },
  ];
};
export const setNotifyMessages = (message: NotifyMessage): void => {
  const messages = [...notifyMessages.value, message];
  notifyMessages.value = messages.slice(-maxNotifyMessages.value);
};
export const setMaxNotifyMessages = (max: number): void => {
  maxNotifyMessages.value = max;
  // 現在のメッセージ数が上限を超えていたら切り詰める
  if (notifyMessages.value.length > max) {
    notifyMessages.value = notifyMessages.value.slice(-max);
  }
};
export const setPushMessages = (message: PushMessage): void => {
  pushMessages.value = [...pushMessages.value, message];
};
export const setFocusedSpotlightConnectionId = (connId: string): void => {
  focusedSpotlightConnectionIds.value = { ...focusedSpotlightConnectionIds.value, [connId]: true };
};
export const setUnFocusedSpotlightConnectionId = (connId: string): void => {
  focusedSpotlightConnectionIds.value = { ...focusedSpotlightConnectionIds.value, [connId]: false };
};
export const deleteFocusedSpotlightConnectionId = (connId: string): void => {
  const { [connId]: _, ...rest } = focusedSpotlightConnectionIds.value;
  focusedSpotlightConnectionIds.value = rest;
};
export const setShowStats = (value: boolean): void => {
  showStats.value = value;
};
export const setCameraDevice = (value: boolean): void => {
  cameraDevice.value = value;
};
export const setMicDevice = (value: boolean): void => {
  micDevice.value = value;
};
export const setAudioTrack = (value: boolean): void => {
  audioTrack.value = value;
  if (localMediaStream.value) {
    for (const track of localMediaStream.value.getAudioTracks()) {
      track.enabled = value;
    }
  }
};
export const setVideoTrack = (value: boolean): void => {
  videoTrack.value = value;
  if (localMediaStream.value) {
    for (const track of localMediaStream.value.getVideoTracks()) {
      track.enabled = value;
    }
  }
};
export const setRole = (value: Role): void => {
  role.value = value;
};
export const setSimulcast = (value: SoraDevtoolsState["simulcast"]): void => {
  simulcast.value = value;
};
export const setSpotlight = (value: SoraDevtoolsState["spotlight"]): void => {
  spotlight.value = value;
};
export const setReconnect = (value: boolean): void => {
  reconnect.value = value;
};
export const setApiUrl = (value: string): void => {
  apiUrl.value = value;
};
export const setDebugApiUrl = (value: string): void => {
  debugApiUrl.value = value;
};
export const clearDataChannelMessages = (): void => {
  dataChannelMessages.value = [];
};
export const setRpcObject = (rpcObject: RpcObject): void => {
  rpcObjects.value = [rpcObject, ...rpcObjects.value];
};
export const clearRpcObjects = (): void => {
  rpcObjects.value = [];
};
export const setApiObject = (apiObject: ApiObject): void => {
  apiObjects.value = [apiObject, ...apiObjects.value];
};
export const clearApiObjects = (): void => {
  apiObjects.value = [];
};
export const setAspectRatio = (value: SoraDevtoolsState["aspectRatio"]): void => {
  aspectRatio.value = value;
};
export const setResizeMode = (value: SoraDevtoolsState["resizeMode"]): void => {
  resizeMode.value = value;
};
export const setBlurRadius = (value: SoraDevtoolsState["blurRadius"]): void => {
  if (value !== "" && virtualBackgroundProcessor.value === null) {
    const assetsPath = import.meta.env.VITE_VIRTUAL_BACKGROUND_ASSETS_PATH || "";
    const processor = new VirtualBackgroundProcessor(assetsPath);
    virtualBackgroundProcessor.value = processor;
  }
  blurRadius.value = value;
};
export const setMediaProcessorsNoiseSuppression = (value: boolean): void => {
  if (value && noiseSuppressionProcessor.value === null) {
    const processor = new NoiseSuppressionProcessor();
    noiseSuppressionProcessor.value = processor;
  }
  mediaProcessorsNoiseSuppression.value = value;
};
export const setBundleId = (value: string): void => {
  bundleId.value = value;
};
export const setEnabledBundleId = (value: boolean): void => {
  enabledBundleId.value = value;
};
export const setFacingMode = (value: SoraDevtoolsState["facingMode"]): void => {
  facingMode.value = value;
};
export const setAudioStreamingLanguageCode = (value: string): void => {
  audioStreamingLanguageCode.value = value;
};
export const setEnabledAudioStreamingLanguageCode = (value: boolean): void => {
  enabledAudioStreamingLanguageCode.value = value;
};
export const setForceStereoOutput = (value: boolean): void => {
  forceStereoOutput.value = value;
};

// --- リセット用ヘルパー関数 ---

// Audio 関連の signal を初期値にリセットする
function resetAudioState(): void {
  audio.value = true;
  audioBitRate.value = "";
  audioCodecType.value = "";
  audioContentHint.value = "";
  audioInput.value = "";
  audioInputDevices.value = [];
  audioOutput.value = "";
  audioOutputDevices.value = [];
  autoGainControl.value = "";
  audioStreamingLanguageCode.value = "";
  enabledAudioStreamingLanguageCode.value = false;
  audioTrack.value = true;
}

// Video 関連の signal を初期値にリセットする
function resetVideoState(): void {
  video.value = true;
  videoBitRate.value = "";
  videoCodecType.value = "";
  videoContentHint.value = "";
  videoInput.value = "";
  videoInputDevices.value = [];
  videoVP9Params.value = "";
  videoH264Params.value = "";
  videoH265Params.value = "";
  videoAV1Params.value = "";
  videoTrack.value = true;
  enabledVideoVP9Params.value = false;
  enabledVideoH264Params.value = false;
  enabledVideoH265Params.value = false;
  enabledVideoAV1Params.value = false;
}

// 接続設定関連の signal を初期値にリセットする
function resetConnectionSettingsState(): void {
  channelId.value = "sora";
  clientId.value = "";
  bundleId.value = "";
  enabledBundleId.value = false;
  enabledClientId.value = false;
  role.value = "sendrecv";
  reconnect.value = false;
  apiUrl.value = null;
}

// Simulcast/Spotlight 関連の signal を初期値にリセットする
function resetSimulcastSpotlightState(): void {
  simulcast.value = "";
  simulcastRid.value = "";
  simulcastRequestRid.value = "";
  spotlight.value = "";
  spotlightNumber.value = "";
  spotlightFocusRid.value = "";
  spotlightUnfocusRid.value = "";
  focusedSpotlightConnectionIds.value = {};
}

// DataChannel 関連の signal を初期値にリセットする
function resetDataChannelState(): void {
  dataChannelSignaling.value = "";
  dataChannels.value = "";
  enabledDataChannels.value = false;
  enabledDataChannel.value = false;
  dataChannelMessages.value = [];
}

// メタデータ関連の signal を初期値にリセットする
function resetMetadataState(): void {
  metadata.value = "";
  enabledMetadata.value = false;
  signalingNotifyMetadata.value = "";
  enabledSignalingNotifyMetadata.value = false;
  signalingUrlCandidates.value = [];
  enabledSignalingUrlCandidates.value = false;
  forwardingFilters.value = "";
  enabledForwardingFilters.value = false;
}

// メディア設定関連の signal を初期値にリセットする
function resetMediaSettingsState(): void {
  frameRate.value = "";
  resolution.value = "";
  displayResolution.value = "";
  aspectRatio.value = "";
  resizeMode.value = "";
  facingMode.value = "";
  mediaType.value = "getUserMedia";
  blurRadius.value = "";
  mediaProcessorsNoiseSuppression.value = false;
  noiseSuppression.value = "";
  echoCancellation.value = "";
  echoCancellationType.value = "";
  ignoreDisconnectWebSocket.value = "";
  forceStereoOutput.value = false;
  fakeVolume.value = "0";
  // 旧 AudioContext を close してから signal をリセットする
  const previousAudioContext = fakeContents.value.audioContext;
  if (previousAudioContext !== null) {
    void previousAudioContext.close();
  }
  fakeContents.value = { worker: null, gainNode: null, audioContext: null };
  cameraDevice.value = true;
  micDevice.value = true;
  googCpuOveruseDetection.value = null;
  mp4MediaStream.value = null;
  noiseSuppressionProcessor.value = null;
  virtualBackgroundProcessor.value = null;
}

// UI 状態関連の signal を初期値にリセットする
function resetUiState(): void {
  mute.value = false;
  mediaStats.value = false;
  showStats.value = false;
  debug.value = false;
  debugType.value = "timeline";
  debugFilterText.value = "";
  debugApiUrl.value = "http://localhost:3000";
}

// メッセージ関連の signal を初期値にリセットする
function resetMessagesState(): void {
  alertMessages.value = [];
  logMessages.value = [];
  timelineMessages.value = [];
  notifyMessages.value = [];
  pushMessages.value = [];
  signalingMessages.value = [];
  rpcObjects.value = [];
  apiObjects.value = [];
}

// Sora 接続状態関連の signal を初期値にリセットする
function resetSoraConnectionState(): void {
  connectionStatus.value = "initializing";
  reconnecting.value = false;
  reconnectingTrials.value = 0;
  sora.value = null;
  connectionId.value = null;
  soraClientId.value = null;
  sessionId.value = null;
  localMediaStream.value = null;
  remoteClients.value = [];
  prevStatsReport.value = [];
  statsReport.value = [];
  soraDataChannels.value = [];
  turnUrl.value = null;
}

// 全ての signal を初期値にリセットする
export const resetState = (): void => {
  batch(() => {
    resetAudioState();
    resetVideoState();
    resetConnectionSettingsState();
    resetSimulcastSpotlightState();
    resetDataChannelState();
    resetMetadataState();
    resetMediaSettingsState();
    resetUiState();
    resetMessagesState();
    resetSoraConnectionState();
  });
};

// soraContents 互換オブジェクト（既存コードとの互換性のため）
export const soraContents = computed(() => ({
  connectionStatus: connectionStatus.value,
  reconnecting: reconnecting.value,
  reconnectingTrials: reconnectingTrials.value,
  sora: sora.value,
  connectionId: connectionId.value,
  clientId: soraClientId.value,
  sessionId: sessionId.value,
  localMediaStream: localMediaStream.value,
  remoteClients: remoteClients.value,
  prevStatsReport: prevStatsReport.value,
  statsReport: statsReport.value,
  dataChannels: soraDataChannels.value,
  turnUrl: turnUrl.value,
}));
