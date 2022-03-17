import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import type { ConnectionPublisher, ConnectionSubscriber, DataChannelConfiguration, Role } from "sora-js-sdk";

import { WORKER_SCRIPT } from "@/constants";
import type {
  AlertMessage,
  DataChannelMessage,
  DebugType,
  LogMessage,
  NotifyMessage,
  PushMessage,
  SignalingMessage,
  SoraDevtoolsState,
  TimelineMessage,
} from "@/types";

import packageJSON from "../../package.json";

const initialState: SoraDevtoolsState = {
  alertMessages: [],
  audio: true,
  audioBitRate: "",
  audioCodecType: "",
  audioContentHint: "",
  audioInput: "",
  audioInputDevices: [],
  audioOutput: "",
  audioOutputDevices: [],
  autoGainControl: "",
  blurRadius: "",
  clientId: "",
  channelId: "sora",
  googCpuOveruseDetection: null,
  timelineMessages: [],
  debug: false,
  debugFilterText: "",
  debugType: "timeline",
  dataChannelSignaling: "",
  dataChannels: "",
  dataChannelMessages: [],
  displayResolution: "",
  e2ee: false,
  echoCancellation: "",
  echoCancellationType: "",
  enabledClientId: false,
  enabledDataChannel: false,
  enabledDataChannels: false,
  enabledMetadata: false,
  enabledSignalingNotifyMetadata: false,
  enabledSignalingUrlCandidates: false,
  fakeVolume: "0",
  fakeContents: {
    worker: null,
    colorCode: 0,
    gainNode: null,
  },
  frameRate: "",
  soraContents: {
    connectionStatus: "disconnected",
    reconnecting: false,
    reconnectingTrials: 0,
    sora: null,
    connectionId: null,
    clientId: null,
    localMediaStream: null,
    remoteMediaStreams: [],
    prevStatsReport: [],
    statsReport: [],
    datachannels: [],
  },
  ignoreDisconnectWebSocket: "",
  logMessages: [],
  mediaProcessorsNoiseSuppression: false,
  mediaType: "getUserMedia",
  metadata: "",
  multistream: "",
  mute: false,
  noiseSuppression: "",
  notifyMessages: [],
  pushMessages: [],
  resolution: "",
  showStats: false,
  simulcast: "",
  spotlight: "",
  signalingMessages: [],
  signalingNotifyMetadata: "",
  signalingUrlCandidates: [],
  simulcastRid: "",
  spotlightNumber: "",
  spotlightFocusRid: "",
  spotlightUnfocusRid: "",
  focusedSpotlightConnectionIds: {},
  video: true,
  videoBitRate: "",
  videoCodecType: "",
  videoContentHint: "",
  videoInput: "",
  videoInputDevices: [],
  version: packageJSON.version,
  cameraDevice: true,
  videoTrack: true,
  micDevice: true,
  audioTrack: true,
  role: "sendonly",
  reconnect: false,
  apiUrl: null,
  aspectRatio: "",
  resizeMode: "",
  noiseSuppressionProcessor: null,
  virtualBackgroundProcessor: null,
};

export const slice = createSlice({
  name: "soraDevtools",
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    setAudio: (state, action: PayloadAction<boolean>) => {
      state.audio = action.payload;
    },
    setAudioInput: (state, action: PayloadAction<string>) => {
      state.audioInput = action.payload;
    },
    setAudioOutput: (state, action: PayloadAction<string>) => {
      state.audioOutput = action.payload;
    },
    setAudioBitRate: (state, action: PayloadAction<SoraDevtoolsState["audioBitRate"]>) => {
      state.audioBitRate = action.payload;
    },
    setAudioCodecType: (state, action: PayloadAction<SoraDevtoolsState["audioCodecType"]>) => {
      state.audioCodecType = action.payload;
    },
    setAudioContentHint: (state, action: PayloadAction<SoraDevtoolsState["audioContentHint"]>) => {
      state.audioContentHint = action.payload;
      if (state.soraContents.localMediaStream) {
        for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
          track.contentHint = state.audioContentHint;
        }
      }
    },
    setAutoGainControl: (state, action: PayloadAction<SoraDevtoolsState["autoGainControl"]>) => {
      state.autoGainControl = action.payload;
    },
    setClientId: (state, action: PayloadAction<string>) => {
      state.clientId = action.payload;
    },
    setChannelId: (state, action: PayloadAction<string>) => {
      state.channelId = action.payload;
    },
    setTimelineMessage: (state, action: PayloadAction<TimelineMessage>) => {
      state.timelineMessages.push(action.payload);
    },
    setDataChannelSignaling: (state, action: PayloadAction<SoraDevtoolsState["dataChannelSignaling"]>) => {
      state.dataChannelSignaling = action.payload;
    },
    setDataChannels: (state, action: PayloadAction<string>) => {
      state.dataChannels = action.payload;
    },
    setDataChannelMessage: (state, action: PayloadAction<DataChannelMessage>) => {
      state.dataChannelMessages.push(action.payload);
    },
    setGoogCpuOveruseDetection: (state, action: PayloadAction<boolean>) => {
      state.googCpuOveruseDetection = action.payload;
    },
    setDisplayResolution: (state, action: PayloadAction<SoraDevtoolsState["displayResolution"]>) => {
      state.displayResolution = action.payload;
    },
    setE2EE: (state, action: PayloadAction<boolean>) => {
      state.e2ee = action.payload;
    },
    setEchoCancellation: (state, action: PayloadAction<SoraDevtoolsState["echoCancellation"]>) => {
      state.echoCancellation = action.payload;
    },
    setEchoCancellationType: (state, action: PayloadAction<SoraDevtoolsState["echoCancellationType"]>) => {
      state.echoCancellationType = action.payload;
    },
    setEnabledClientId: (state, action: PayloadAction<boolean>) => {
      state.enabledClientId = action.payload;
    },
    setEnabledDataChannels: (state, action: PayloadAction<boolean>) => {
      state.enabledDataChannels = action.payload;
    },
    setEnabledDataChannel: (state, action: PayloadAction<boolean>) => {
      state.enabledDataChannel = action.payload;
    },
    setEnabledMetadata: (state, action: PayloadAction<boolean>) => {
      state.enabledMetadata = action.payload;
    },
    setIgnoreDisconnectWebSocket: (state, action: PayloadAction<SoraDevtoolsState["ignoreDisconnectWebSocket"]>) => {
      state.ignoreDisconnectWebSocket = action.payload;
    },
    setSignalingMessage: (state, action: PayloadAction<SignalingMessage>) => {
      state.signalingMessages.push(action.payload);
    },
    setEnabledSignalingNotifyMetadata: (state, action: PayloadAction<boolean>) => {
      state.enabledSignalingNotifyMetadata = action.payload;
    },
    setEnabledSignalingUrlCandidates: (state, action: PayloadAction<boolean>) => {
      state.enabledSignalingUrlCandidates = action.payload;
    },
    setFakeVolume: (state, action: PayloadAction<string>) => {
      const volume = parseFloat(action.payload);
      if (isNaN(volume)) {
        state.fakeVolume = "0";
      } else if (1 < volume) {
        state.fakeVolume = "1";
      } else {
        state.fakeVolume = String(volume);
      }
      if (state.fakeContents.gainNode) {
        state.fakeContents.gainNode.gain.setValueAtTime(parseFloat(state.fakeVolume), 0);
      }
    },
    setFakeContentsGainNode: (state, action: PayloadAction<GainNode | null>) => {
      state.fakeContents.gainNode = action.payload;
    },
    setInitialFakeContents: (state) => {
      // Fake canvas の背景色で使う color code を生成
      state.fakeContents.colorCode = Math.floor(Math.random() * 0xffffff);
      // Fake canvas を表示しているブラウザタブがバックグラウンドへ移動しても canvas のレンダリングを続けるために worker を生成
      const url = URL.createObjectURL(new Blob([WORKER_SCRIPT], { type: "application/javascript" }));
      state.fakeContents.worker = new Worker(url);
    },
    setFrameRate: (state, action: PayloadAction<SoraDevtoolsState["frameRate"]>) => {
      state.frameRate = action.payload;
    },
    setMute: (state, action: PayloadAction<boolean>) => {
      state.mute = action.payload;
    },
    setNoiseSuppression: (state, action: PayloadAction<SoraDevtoolsState["noiseSuppression"]>) => {
      state.noiseSuppression = action.payload;
    },
    setMediaType: (state, action: PayloadAction<SoraDevtoolsState["mediaType"]>) => {
      state.mediaType = action.payload;
    },
    setMetadata: (state, action: PayloadAction<string>) => {
      state.metadata = action.payload;
    },
    setResolution: (state, action: PayloadAction<SoraDevtoolsState["resolution"]>) => {
      state.resolution = action.payload;
    },
    setSignalingNotifyMetadata: (state, action: PayloadAction<string>) => {
      state.signalingNotifyMetadata = action.payload;
    },
    setSignalingUrlCandidates: (state, action: PayloadAction<string[]>) => {
      state.signalingUrlCandidates = action.payload;
    },
    setSimulcastRid: (state, action: PayloadAction<SoraDevtoolsState["simulcastRid"]>) => {
      state.simulcastRid = action.payload;
    },
    setSpotlightNumber: (state, action: PayloadAction<SoraDevtoolsState["spotlightNumber"]>) => {
      state.spotlightNumber = action.payload;
    },
    setSpotlightFocusRid: (state, action: PayloadAction<SoraDevtoolsState["spotlightFocusRid"]>) => {
      state.spotlightFocusRid = action.payload;
    },
    setSpotlightUnfocusRid: (state, action: PayloadAction<SoraDevtoolsState["spotlightUnfocusRid"]>) => {
      state.spotlightUnfocusRid = action.payload;
    },
    setVideo: (state, action: PayloadAction<boolean>) => {
      state.video = action.payload;
    },
    setVideoInput: (state, action: PayloadAction<string>) => {
      state.videoInput = action.payload;
    },
    setVideoBitRate: (state, action: PayloadAction<SoraDevtoolsState["videoBitRate"]>) => {
      state.videoBitRate = action.payload;
    },
    setVideoCodecType: (state, action: PayloadAction<SoraDevtoolsState["videoCodecType"]>) => {
      state.videoCodecType = action.payload;
    },
    setVideoContentHint: (state, action: PayloadAction<SoraDevtoolsState["videoContentHint"]>) => {
      state.videoContentHint = action.payload;
      if (state.soraContents.localMediaStream) {
        for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
          track.contentHint = state.videoContentHint;
        }
      }
    },
    setSora: (state, action: PayloadAction<ConnectionPublisher | ConnectionSubscriber | null>) => {
      // `Type instantiation is excessively deep and possibly infinite` エラーが出るので any に type casting する
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state.soraContents.sora = <any>action.payload;
      if (state.soraContents.sora) {
        state.soraContents.connectionId = state.soraContents.sora.connectionId;
        state.soraContents.clientId = state.soraContents.sora.clientId;
      } else {
        state.soraContents.connectionId = null;
        state.soraContents.clientId = null;
        state.soraContents.datachannels = [];
      }
    },
    setSoraConnectionStatus: (state, action: PayloadAction<SoraDevtoolsState["soraContents"]["connectionStatus"]>) => {
      state.soraContents.connectionStatus = action.payload;
    },
    setSoraReconnecting: (state, action: PayloadAction<SoraDevtoolsState["soraContents"]["reconnecting"]>) => {
      state.soraContents.reconnecting = action.payload;
      if (state.soraContents.reconnecting === false) {
        state.soraContents.reconnectingTrials = 0;
      }
    },
    setSoraReconnectingTrials: (
      state,
      action: PayloadAction<SoraDevtoolsState["soraContents"]["reconnectingTrials"]>
    ) => {
      state.soraContents.reconnectingTrials = action.payload;
    },
    setSoraDataChannels: (state, action: PayloadAction<DataChannelConfiguration>) => {
      state.soraContents.datachannels.push(action.payload);
    },
    setLocalMediaStream: (state, action: PayloadAction<MediaStream | null>) => {
      if (state.soraContents.localMediaStream) {
        state.soraContents.localMediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      state.soraContents.localMediaStream = action.payload;
    },
    setRemoteMediaStream: (state, action: PayloadAction<MediaStream>) => {
      state.soraContents.remoteMediaStreams.push(action.payload);
    },
    setStatsReport: (state, action: PayloadAction<RTCStats[]>) => {
      state.soraContents.prevStatsReport = state.soraContents.statsReport;
      state.soraContents.statsReport = action.payload;
    },
    removeRemoteMediaStream: (state, action: PayloadAction<string>) => {
      const remoteMediaStreams = state.soraContents.remoteMediaStreams.filter((stream) => stream.id !== action.payload);
      state.soraContents.remoteMediaStreams = remoteMediaStreams;
    },
    removeAllRemoteMediaStreams: (state) => {
      state.soraContents.remoteMediaStreams = [];
    },
    setAudioInputDevices: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.audioInputDevices = action.payload;
    },
    setVideoInputDevices: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.videoInputDevices = action.payload;
    },
    setAudioOutputDevices: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.audioOutputDevices = action.payload;
    },
    setSoraInfoAlertMessage: (state, action: PayloadAction<string>) => {
      const alertMessage: AlertMessage = {
        title: "Sora info",
        type: "info",
        message: action.payload,
        timestamp: new Date().getTime(),
      };
      setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage);
    },
    setSoraErrorAlertMessage: (state, action: PayloadAction<string>) => {
      const alertMessage: AlertMessage = {
        title: "Sora error",
        type: "error",
        message: action.payload,
        timestamp: new Date().getTime(),
      };
      setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage);
    },
    setAPIInfoAlertMessage: (state, action: PayloadAction<string>) => {
      const alertMessage: AlertMessage = {
        title: "API info",
        type: "info",
        message: action.payload,
        timestamp: new Date().getTime(),
      };
      setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage);
    },
    setAPIErrorAlertMessage: (state, action: PayloadAction<string>) => {
      const alertMessage: AlertMessage = {
        title: "API error",
        type: "error",
        message: action.payload,
        timestamp: new Date().getTime(),
      };
      setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage);
    },
    deleteAlertMessage: (state, action: PayloadAction<number>) => {
      const filterdAlertMessages = state.alertMessages.filter(
        (alertMessage) => alertMessage.timestamp !== action.payload
      );
      state.alertMessages = filterdAlertMessages;
    },
    setDebug: (state, action: PayloadAction<boolean>) => {
      state.debug = action.payload;
    },
    setDebugFilterText: (state, action: PayloadAction<string>) => {
      state.debugFilterText = action.payload;
    },
    setDebugType: (state, action: PayloadAction<DebugType>) => {
      state.debugFilterText = "";
      state.debugType = action.payload;
    },
    setLogMessages: (state, action: PayloadAction<LogMessage["message"]>) => {
      state.logMessages.push({
        timestamp: new Date().getTime(),
        message: {
          title: action.payload.title,
          description: action.payload.description,
        },
      });
    },
    setNotifyMessages: (state, action: PayloadAction<NotifyMessage>) => {
      state.notifyMessages.push(action.payload);
    },
    setPushMessages: (state, action: PayloadAction<PushMessage>) => {
      state.pushMessages.push(action.payload);
    },
    setFocusedSpotlightConnectionId: (state, action: PayloadAction<string>) => {
      state.focusedSpotlightConnectionIds[action.payload] = true;
    },
    setUnFocusedSpotlightConnectionId: (state, action: PayloadAction<string>) => {
      state.focusedSpotlightConnectionIds[action.payload] = false;
    },
    deleteFocusedSpotlightConnectionId: (state, action: PayloadAction<string>) => {
      delete state.focusedSpotlightConnectionIds[action.payload];
    },
    setShowStats: (state, action: PayloadAction<boolean>) => {
      state.showStats = action.payload;
    },
    setCameraDevice: (state, action: PayloadAction<boolean>) => {
      state.cameraDevice = action.payload;
    },
    setMicDevice: (state, action: PayloadAction<boolean>) => {
      state.micDevice = action.payload;
    },
    setAudioTrack: (state, action: PayloadAction<boolean>) => {
      state.audioTrack = action.payload;
      if (state.soraContents.localMediaStream) {
        for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
          track.enabled = state.audioTrack;
        }
      }
    },
    setVideoTrack: (state, action: PayloadAction<boolean>) => {
      state.videoTrack = action.payload;
      if (state.soraContents.localMediaStream) {
        for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
          track.enabled = state.videoTrack;
        }
      }
    },
    setRole: (state, action: PayloadAction<Role>) => {
      state.role = action.payload;
    },
    setMultistream: (state, action: PayloadAction<SoraDevtoolsState["multistream"]>) => {
      state.multistream = action.payload;
    },
    setSimulcast: (state, action: PayloadAction<SoraDevtoolsState["simulcast"]>) => {
      state.simulcast = action.payload;
    },
    setSpotlight: (state, action: PayloadAction<SoraDevtoolsState["spotlight"]>) => {
      state.spotlight = action.payload;
    },
    setReconnect: (state, action: PayloadAction<boolean>) => {
      state.reconnect = action.payload;
    },
    setApiUrl: (state, action: PayloadAction<string>) => {
      state.apiUrl = action.payload;
    },
    clearDataChannelMessages: (state) => {
      state.dataChannelMessages = [];
    },
    setAspectRatio: (state, action: PayloadAction<SoraDevtoolsState["aspectRatio"]>) => {
      state.aspectRatio = action.payload;
    },
    setResizeMode: (state, action: PayloadAction<SoraDevtoolsState["resizeMode"]>) => {
      state.resizeMode = action.payload;
    },
    setBlurRadius: (state, action: PayloadAction<SoraDevtoolsState["blurRadius"]>) => {
      if (action.payload !== "" && state.virtualBackgroundProcessor === null) {
        const assetsPath = process.env.NEXT_PUBLIC_VIRTUAL_BACKGROUND_ASSETS_PATH || "";
        const processor = new VirtualBackgroundProcessor(assetsPath);
        state.virtualBackgroundProcessor = processor;
      }
      state.blurRadius = action.payload;
    },
    setMediaProcessorsNoiseSuppression: (
      state,
      action: PayloadAction<SoraDevtoolsState["mediaProcessorsNoiseSuppression"]>
    ) => {
      if (action.payload && state.noiseSuppressionProcessor === null) {
        const assetsPath = process.env.NEXT_PUBLIC_NOISE_SUPPRESSION_ASSETS_PATH || "";
        const processor = new NoiseSuppressionProcessor(assetsPath);
        state.noiseSuppressionProcessor = processor;
      }
      state.mediaProcessorsNoiseSuppression = action.payload;
    },
  },
});

function setAlertMessagesAndLogMessages(
  alertMessages: SoraDevtoolsState["alertMessages"],
  logMessages: SoraDevtoolsState["logMessages"],
  alertMessage: AlertMessage
): void {
  if (10 <= alertMessages.length) {
    for (let i = 0; i <= alertMessages.length - 5; i++) {
      alertMessages.pop();
    }
  }
  alertMessages.unshift(alertMessage);
  logMessages.push({
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
}
