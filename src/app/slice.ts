import { ActionCreatorWithPayload, createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import type {
  ConnectionOptions,
  ConnectionPublisher,
  ConnectionSubscriber,
  DataChannelConfiguration,
  Role,
  TransportType,
} from "sora-js-sdk";
import Sora from "sora-js-sdk";

import { WORKER_SCRIPT } from "@/constants";
import type {
  AlertMessage,
  ConnectionOptionsState,
  DataChannelMessage,
  DebugType,
  DisplaySettings,
  Json,
  LogMessage,
  NotifyMessage,
  PageInitialParameters,
  PushMessage,
  QueryStringParameters,
  SignalingMessage,
  SoraDevtoolsState,
  SoraNotifyMessage,
  SoraPushMessage,
  TimelineMessage,
} from "@/types";
import {
  copy2clipboard,
  createAudioConstraints,
  createDisplaySettings,
  createFakeMediaConstraints,
  createFakeMediaStream,
  createGetDisplayMediaConstraints,
  createSignalingURL,
  createVideoConstraints,
  drawFakeCanvas,
  getDevices,
  parseMetadata,
  parseQueryString,
} from "@/utils";

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
  displaySettings: {
    audio: false,
    audioBitRate: false,
    audioCodecType: false,
    audioContentHint: false,
    audioConstraints: false,
    audioInput: false,
    audioOutput: false,
    audioTrack: false,
    cameraDevice: false,
    displayResolution: false,
    mediaType: false,
    micDevice: false,
    simulcastRid: false,
    spotlightFocusRid: false,
    spotlightNumber: false,
    spotlightUnfocusRid: false,
    video: false,
    videoBitRate: false,
    videoCodecType: false,
    videoContentHint: false,
    videoConstraints: false,
    videoInput: false,
    videoTrack: false,
  },
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
  mediaType: "getUserMedia",
  metadata: "",
  multistream: false,
  mute: false,
  noiseSuppression: "",
  notifyMessages: [],
  pushMessages: [],
  resolution: "",
  showStats: false,
  simulcast: false,
  spotlight: false,
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
};

const slice = createSlice({
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
    setInitialDisplaySettings: (state, action: PayloadAction<DisplaySettings>) => {
      state.displaySettings = action.payload;
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
    setMultistream: (state, action: PayloadAction<boolean>) => {
      state.multistream = action.payload;
    },
    setSimulcast: (state, action: PayloadAction<boolean>) => {
      state.simulcast = action.payload;
    },
    setSpotlight: (state, action: PayloadAction<boolean>) => {
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
    setAspectRatio: (state, action: PayloadAction<string>) => {
      state.aspectRatio = action.payload;
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

// State に応じて MediaStream インスタンスを生成する
// Fake の場合には volume control 用の GainNode も同時に生成する
type craeteMediaStreamPickedSttate = Pick<
  SoraDevtoolsState,
  | "aspectRatio"
  | "audio"
  | "audioInput"
  | "audioTrack"
  | "audioContentHint"
  | "autoGainControl"
  | "cameraDevice"
  | "echoCancellation"
  | "echoCancellationType"
  | "fakeContents"
  | "fakeVolume"
  | "frameRate"
  | "mediaType"
  | "micDevice"
  | "noiseSuppression"
  | "resolution"
  | "video"
  | "videoContentHint"
  | "videoInput"
  | "videoTrack"
>;
async function createMediaStream(
  dispatch: Dispatch,
  state: craeteMediaStreamPickedSttate
): Promise<[MediaStream, GainNode | null]> {
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  if (state.mediaType === "getDisplayMedia") {
    if (!state.video || !state.cameraDevice) {
      return [new MediaStream(), null];
    }
    if (navigator.mediaDevices === undefined) {
      throw new Error("Failed to call getUserMedia. Make sure domain is secure");
    }
    const constraints = createGetDisplayMediaConstraints({
      frameRate: state.frameRate,
      resolution: state.resolution,
      aspectRatio: state.aspectRatio,
    });
    dispatch(slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify(constraints) }));
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("media-constraints", constraints)));
    const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-get-display-media")));
    for (const track of stream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
    }
    return [stream, null];
  }
  if (state.mediaType === "fakeMedia" && state.fakeContents.worker) {
    const constraints = createFakeMediaConstraints({
      audio: state.audio && state.micDevice,
      video: state.video && state.cameraDevice,
      frameRate: state.frameRate,
      resolution: state.resolution,
      volume: state.fakeVolume,
    });
    dispatch(slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify(constraints) }));
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("media-constraints", constraints)));
    const { canvas, mediaStream, gainNode } = createFakeMediaStream(constraints);
    if (canvas !== null) {
      state.fakeContents.worker.onmessage = (event) => {
        const data = event.data;
        if (data.type !== "update") {
          return;
        }
        drawFakeCanvas(canvas, state.fakeContents.colorCode, constraints.fontSize, data.counter.toString());
      };
      state.fakeContents.worker.postMessage({ type: "stop" });
      state.fakeContents.worker.postMessage({ type: "start", interval: 1000 / constraints.frameRate });
    }
    for (const track of mediaStream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
    }
    for (const track of mediaStream.getAudioTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.audioContentHint;
      }
      track.enabled = state.audioTrack;
    }
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-create-fake-media")));
    return [mediaStream, gainNode];
  }
  if (navigator.mediaDevices === undefined) {
    throw new Error("Failed to call getUserMedia. Make sure domain is secure");
  }
  const mediaStream = new MediaStream();
  const audioConstraints = createAudioConstraints({
    audio: state.audio && state.micDevice,
    autoGainControl: state.autoGainControl,
    noiseSuppression: state.noiseSuppression,
    echoCancellation: state.echoCancellation,
    echoCancellationType: state.echoCancellationType,
    audioInput: state.audioInput,
  });
  if (audioConstraints) {
    dispatch(
      slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify({ audio: audioConstraints }) })
    );
    dispatch(
      slice.actions.setTimelineMessage(
        createSoraDevtoolsTimelineMessage("audio-media-constraints", { audio: audioConstraints })
      )
    );
    const audioMediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-audio-get-user-media")));
    mediaStream.addTrack(audioMediaStream.getAudioTracks()[0]);
  }
  const videoConstraints = createVideoConstraints({
    video: state.video && state.cameraDevice,
    frameRate: state.frameRate,
    resolution: state.resolution,
    videoInput: state.videoInput,
  });
  if (videoConstraints) {
    dispatch(
      slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify({ video: videoConstraints }) })
    );
    dispatch(
      slice.actions.setTimelineMessage(
        createSoraDevtoolsTimelineMessage("video-media-constraints", { video: videoConstraints })
      )
    );
    const videoMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-video-get-user-media")));
    mediaStream.addTrack(videoMediaStream.getVideoTracks()[0]);
  }
  for (const track of mediaStream.getVideoTracks()) {
    if (track.contentHint !== undefined) {
      track.contentHint = state.videoContentHint;
    }
    track.enabled = state.videoTrack;
  }
  for (const track of mediaStream.getAudioTracks()) {
    if (track.contentHint !== undefined) {
      track.contentHint = state.audioContentHint;
    }
    track.enabled = state.audioTrack;
  }
  return [mediaStream, null];
}

// Sora connection オブジェクトに callback をセットする
function setSoraCallbacks(
  dispatch: Dispatch,
  getState: () => SoraDevtoolsState,
  sora: ConnectionPublisher | ConnectionSubscriber
): void {
  sora.on("log", (title: string, description: Json) => {
    dispatch(
      slice.actions.setLogMessages({
        title: title,
        description: JSON.stringify(description),
      })
    );
  });
  sora.on("notify", (message: SoraNotifyMessage, transportType: TransportType) => {
    if (message.event_type === "spotlight.focused" && typeof message.connection_id === "string") {
      dispatch(slice.actions.setFocusedSpotlightConnectionId(message.connection_id));
    }
    if (message.event_type === "spotlight.unfocused" && typeof message.connection_id === "string") {
      dispatch(slice.actions.setUnFocusedSpotlightConnectionId(message.connection_id));
    }
    if (message.event_type === "connection.destroyed" && typeof message.connection_id === "string") {
      dispatch(slice.actions.deleteFocusedSpotlightConnectionId(message.connection_id));
    }
    dispatch(
      slice.actions.setNotifyMessages({
        timestamp: new Date().getTime(),
        message: message,
        transportType: transportType,
      })
    );
  });
  sora.on("push", (message: SoraPushMessage, transportType: TransportType) => {
    dispatch(
      slice.actions.setPushMessages({
        timestamp: new Date().getTime(),
        message: message,
        transportType: transportType,
      })
    );
  });
  sora.on("track", (event: RTCTrackEvent) => {
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track")));
    const { soraContents } = getState();
    const mediaStream = soraContents.remoteMediaStreams.find((stream) => stream.id === event.streams[0].id);
    if (!mediaStream) {
      dispatch(slice.actions.setRemoteMediaStream(event.streams[0]));
    }
  });
  sora.on("removetrack", (event: MediaStreamTrackEvent) => {
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-removetrack")));
    const { soraContents } = getState();
    const mediaStream = soraContents.remoteMediaStreams.find((stream) => {
      if (event?.target) {
        return stream.id === (event.target as MediaStream).id;
      }
    });
    if (mediaStream) {
      dispatch(slice.actions.removeRemoteMediaStream((event.target as MediaStream).id));
    }
  });
  sora.on("disconnect", (event) => {
    const message: Record<string, unknown> = {
      type: event.type,
      title: event.title,
    };
    if (event.code !== undefined) {
      message["code"] = event.code;
    }
    if (event.reason !== undefined) {
      message["reason"] = event.reason;
    }
    if (event.params !== undefined) {
      message["params"] = event.params;
    }
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-disconnect", message)));
    const { fakeContents, soraContents, reconnect } = getState();
    const { localMediaStream, remoteMediaStreams } = soraContents;

    if (localMediaStream) {
      localMediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    remoteMediaStreams.forEach((mediaStream) => {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    });
    if (fakeContents.worker) {
      fakeContents.worker.postMessage({ type: "stop" });
    }
    dispatch(slice.actions.setSora(null));
    dispatch(slice.actions.setLocalMediaStream(null));
    dispatch(slice.actions.removeAllRemoteMediaStreams());
    dispatch(slice.actions.setSoraInfoAlertMessage("Disconnect Sora."));
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected")));
    if (event.type === "abend" && reconnect) {
      // 再接続処理開始フラグ
      dispatch(slice.actions.setSoraReconnecting(true));
    }
  });
  sora.on("timeline", (event) => {
    const message = {
      timestamp: new Date().getTime(),
      type: event.type,
      data: event.data,
      dataChannelId: event.dataChannelId,
      dataChannelLabel: event.dataChannelLabel,
      logType: event.logType,
    };
    dispatch(slice.actions.setTimelineMessage(message));
    if (event.data && typeof event.data === "object" && "sdp" in event.data) {
      dispatch(
        slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage(`${event.type}-sdp`, event.data.sdp))
      );
    }
  });
  sora.on("signaling", (event) => {
    const message = {
      timestamp: new Date().getTime(),
      transportType: event.transportType,
      type: event.type,
      data: event.data,
    };
    dispatch(slice.actions.setSignalingMessage(message));
  });
  sora.on("message", (event) => {
    dispatch(
      slice.actions.setDataChannelMessage({
        timestamp: new Date().getTime(),
        label: event.label,
        data: event.data,
      })
    );
  });
  sora.on("datachannel", (event) => {
    dispatch(slice.actions.setSoraDataChannels(event.datachannel));
  });
}

// Sora の connectOptions を生成する
function createConnectOptions(connectionOptionsState: ConnectionOptionsState): ConnectionOptions {
  const connectionOptions: ConnectionOptions = {
    audio: connectionOptionsState.audio,
    video: connectionOptionsState.video,
  };
  if (connectionOptionsState.audioCodecType) {
    connectionOptions.audioCodecType = connectionOptionsState.audioCodecType;
  }
  const parsedAudioBitRate = parseInt(connectionOptionsState.audioBitRate, 10);
  if (parsedAudioBitRate) {
    connectionOptions.audioBitRate = parsedAudioBitRate;
  }
  if (connectionOptionsState.videoCodecType) {
    connectionOptions.videoCodecType = connectionOptionsState.videoCodecType;
  }
  const parsedVideoBitRate = parseInt(connectionOptionsState.videoBitRate, 10);
  if (parsedVideoBitRate) {
    connectionOptions.videoBitRate = parsedVideoBitRate;
  }
  if (connectionOptionsState.multistream) {
    connectionOptions.multistream = true;
  }
  if (connectionOptionsState.e2ee) {
    connectionOptions.e2ee = true;
  }
  if (connectionOptionsState.spotlight) {
    connectionOptions.spotlight = true;
    if (connectionOptionsState.spotlightNumber) {
      connectionOptions.spotlightNumber = parseInt(connectionOptionsState.spotlightNumber);
    }
    if (connectionOptions.spotlight === true && connectionOptionsState.spotlightFocusRid) {
      connectionOptions.spotlightFocusRid = connectionOptionsState.spotlightFocusRid;
    }
    if (connectionOptions.spotlight === true && connectionOptionsState.spotlightUnfocusRid) {
      connectionOptions.spotlightUnfocusRid = connectionOptionsState.spotlightUnfocusRid;
    }
  }
  if (connectionOptionsState.simulcast) {
    connectionOptions.simulcast = true;
    if (connectionOptionsState.simulcastRid) {
      connectionOptions.simulcastRid = connectionOptionsState.simulcastRid;
    }
  }
  if (connectionOptionsState.enabledSignalingNotifyMetadata) {
    connectionOptions.signalingNotifyMetadata = parseMetadata(true, connectionOptionsState.signalingNotifyMetadata);
  }
  if (connectionOptionsState.enabledClientId) {
    connectionOptions.clientId = connectionOptionsState.clientId;
  }
  if (connectionOptionsState.enabledDataChannel) {
    if (connectionOptionsState.dataChannelSignaling === "true") {
      connectionOptions.dataChannelSignaling = true;
    } else if (connectionOptionsState.dataChannelSignaling === "false") {
      connectionOptions.dataChannelSignaling = false;
    }

    if (connectionOptionsState.ignoreDisconnectWebSocket === "true") {
      connectionOptions.ignoreDisconnectWebSocket = true;
    } else if (connectionOptionsState.ignoreDisconnectWebSocket === "false") {
      connectionOptions.ignoreDisconnectWebSocket = false;
    }
  }
  if (connectionOptionsState.dataChannels !== "") {
    let dataChannels = [];
    try {
      dataChannels = JSON.parse(connectionOptionsState.dataChannels);
    } catch (_) {
      // サンプル実装なので warning で回避
      console.warn("Illegal format DataChannels");
    }
    if (Array.isArray(dataChannels)) {
      connectionOptions.dataChannels = dataChannels;
    }
  }
  return connectionOptions;
}

// SoraDevtoolsState から ConnectionOptionsState を生成する
function pickConnectionOptionsState(state: SoraDevtoolsState): ConnectionOptionsState {
  return {
    audio: state.audio,
    audioBitRate: state.audioBitRate,
    audioCodecType: state.audioCodecType,
    clientId: state.clientId,
    dataChannels: state.enabledDataChannels ? state.dataChannels : "",
    dataChannelSignaling: state.dataChannelSignaling,
    e2ee: state.e2ee,
    enabledClientId: state.enabledClientId,
    enabledDataChannel: state.enabledDataChannel,
    enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
    ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
    multistream: state.multistream,
    signalingNotifyMetadata: state.signalingNotifyMetadata,
    simulcast: state.simulcast,
    simulcastRid: state.simulcastRid,
    spotlight: state.spotlight,
    spotlightFocusRid: state.spotlightFocusRid,
    spotlightNumber: state.spotlightNumber,
    spotlightUnfocusRid: state.spotlightUnfocusRid,
    video: state.video,
    videoBitRate: state.videoBitRate,
    videoCodecType: state.videoCodecType,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSoraDevtoolsTimelineMessage(type: string, data?: any): TimelineMessage {
  return {
    type: type,
    logType: "sora-devtools",
    timestamp: new Date().getTime(),
    data: data,
  };
}

// statsReport を更新
async function setStatsReport(dispatch: Dispatch, sora: ConnectionPublisher | ConnectionSubscriber): Promise<void> {
  if (sora.pc && sora.pc?.iceConnectionState !== "closed") {
    const stats = await sora.pc.getStats();
    const statsReport: RTCStats[] = [];
    stats.forEach((s) => {
      statsReport.push(s);
    });
    dispatch(slice.actions.setStatsReport(statsReport));
  }
}

export const connectSora =
  () =>
  async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-connection")));
    dispatch(slice.actions.setSoraConnectionStatus("connecting"));
    const state = getState();
    // 接続中の場合は切断する
    if (state.soraContents.sora) {
      await state.soraContents.sora.disconnect();
    }
    // シグナリング候補のURLリストを作成する
    const signalingUrlCandidates = createSignalingURL(
      state.enabledSignalingUrlCandidates,
      state.signalingUrlCandidates
    );
    dispatch(
      slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingUrlCandidates) })
    );
    const connection = Sora.connection(signalingUrlCandidates, state.debug);
    const connectionOptionsState = pickConnectionOptionsState(state);
    const connectionOptions = createConnectOptions(connectionOptionsState);
    const metadata = parseMetadata(state.enabledMetadata, state.metadata);
    let sora, mediaStream, gainNode;
    try {
      if (state.role === "sendonly") {
        sora = connection.sendonly(state.channelId, null, connectionOptions);
        sora.metadata = metadata;
        // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
        if (typeof state.googCpuOveruseDetection === "boolean") {
          sora.constraints = {
            optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
          };
        }
        setSoraCallbacks(dispatch, getState, sora);
        [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
          dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
          dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
          throw error;
        });
        await sora.connect(mediaStream);
      } else if (state.role === "sendrecv") {
        sora = connection.sendrecv(state.channelId, null, connectionOptions);
        sora.metadata = metadata;
        // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
        if (typeof state.googCpuOveruseDetection === "boolean") {
          sora.constraints = {
            optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
          };
        }
        setSoraCallbacks(dispatch, getState, sora);
        [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
          dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
          dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
          throw error;
        });
        await sora.connect(mediaStream);
      } else if (state.role === "recvonly") {
        sora = connection.recvonly(state.channelId, null, connectionOptions);
        sora.metadata = metadata;
        setSoraCallbacks(dispatch, getState, sora);
        await sora.connect();
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatch(slice.actions.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`));
      }
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      throw error;
    }
    if (sora === undefined) {
      throw new Error("Failed to connect Sora. Connection object is 'undefined'");
    }
    dispatch(slice.actions.setSoraInfoAlertMessage("Succeeded to connect Sora."));
    await setStatsReport(dispatch, sora);
    const timerId = setInterval(async () => {
      const { soraContents } = getState();
      if (soraContents.sora) {
        await setStatsReport(dispatch, soraContents.sora);
      } else {
        clearInterval(timerId);
      }
    }, 1000);
    dispatch(slice.actions.setSora(sora));
    if (mediaStream) {
      dispatch(slice.actions.setLocalMediaStream(mediaStream));
    }
    if (gainNode) {
      dispatch(slice.actions.setFakeContentsGainNode(gainNode));
    }
    dispatch(slice.actions.setSoraConnectionStatus("connected"));
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected")));
  };

export const reconnectSora =
  () =>
  async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-reconnect")));
    dispatch(slice.actions.setSoraConnectionStatus("connecting"));
    const state = getState();
    // 接続中の場合は切断する
    if (state.soraContents.sora) {
      await state.soraContents.sora.disconnect();
    }
    // シグナリング候補のURLリストを作成する
    const signalingUrlCandidates = createSignalingURL(
      state.enabledSignalingUrlCandidates,
      state.signalingUrlCandidates
    );
    dispatch(
      slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingUrlCandidates) })
    );
    const connection = Sora.connection(signalingUrlCandidates, state.debug);
    const connectionOptionsState = pickConnectionOptionsState(state);
    const connectionOptions = createConnectOptions(connectionOptionsState);
    const metadata = parseMetadata(state.enabledMetadata, state.metadata);
    let sora, mediaStream, gainNode;
    if (state.role === "sendonly" || state.role === "sendrecv") {
      [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
        dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
        dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
        throw error;
      });
    }
    for (let i = 1; i <= 10; i++) {
      const { soraContents } = getState();
      if (soraContents.reconnecting === false) {
        break;
      }
      dispatch(slice.actions.setSoraReconnectingTrials(i));
      try {
        if (state.role === "sendonly") {
          sora = connection.sendonly(state.channelId, null, connectionOptions);
          sora.metadata = metadata;
          // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
          if (typeof state.googCpuOveruseDetection === "boolean") {
            sora.constraints = {
              optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
            };
          }
          setSoraCallbacks(dispatch, getState, sora);
          if (mediaStream) {
            await sora.connect(mediaStream);
          }
        } else if (state.role === "sendrecv") {
          sora = connection.sendrecv(state.channelId, null, connectionOptions);
          sora.metadata = metadata;
          // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
          if (typeof state.googCpuOveruseDetection === "boolean") {
            sora.constraints = {
              optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
            };
          }
          setSoraCallbacks(dispatch, getState, sora);
          if (mediaStream) {
            await sora.connect(mediaStream);
          }
        } else if (state.role === "recvonly") {
          sora = connection.recvonly(state.channelId, null, connectionOptions);
          sora.metadata = metadata;
          setSoraCallbacks(dispatch, getState, sora);
          await sora.connect();
        }
      } catch (error) {
        if (error instanceof Error) {
          dispatch(slice.actions.setSoraErrorAlertMessage(`(trials ${i}) Failed to connect Sora. ${error.message}`));
        }
        sora = undefined;
      }
      if (sora !== undefined) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, i * 500 + 500));
    }
    if (sora === undefined) {
      dispatch(slice.actions.setSoraErrorAlertMessage("Failed to reconnect Sora."));
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      dispatch(slice.actions.setSoraReconnecting(false));
      return;
    }
    dispatch(slice.actions.setSoraInfoAlertMessage("Succeeded to reconnect Sora."));
    await setStatsReport(dispatch, sora);
    const timerId = setInterval(async () => {
      const { soraContents } = getState();
      if (soraContents.sora) {
        await setStatsReport(dispatch, soraContents.sora);
      } else {
        clearInterval(timerId);
      }
    }, 1000);
    dispatch(slice.actions.setSora(sora));
    if (mediaStream) {
      dispatch(slice.actions.setLocalMediaStream(mediaStream));
    }
    if (gainNode) {
      dispatch(slice.actions.setFakeContentsGainNode(gainNode));
    }
    dispatch(slice.actions.setSoraConnectionStatus("connected"));
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected")));
    dispatch(slice.actions.setSoraReconnecting(false));
  };

// Sora との切断処理
export const disconnectSora =
  () =>
  async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    const { soraContents } = getState();
    if (soraContents.sora) {
      dispatch(slice.actions.setSoraConnectionStatus("disconnecting"));
      await soraContents.sora.disconnect();
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
    }
  };

// デバイス一覧を取得
export const setMediaDevices =
  () =>
  async (dispatch: Dispatch, _getState: () => SoraDevtoolsState): Promise<void> => {
    const deviceInfos = await getDevices();
    const audioInputDevices: MediaDeviceInfo[] = [];
    const videoInputDevices: MediaDeviceInfo[] = [];
    const audioOutputDevices: MediaDeviceInfo[] = [];
    deviceInfos.forEach((deviceInfo) => {
      if (deviceInfo.deviceId === "") {
        return;
      }
      if (deviceInfo.kind === "audioinput") {
        audioInputDevices.push(deviceInfo.toJSON());
      } else if (deviceInfo.kind === "audiooutput") {
        audioOutputDevices.push(deviceInfo.toJSON());
      } else if (deviceInfo.kind === "videoinput") {
        videoInputDevices.push(deviceInfo.toJSON());
      }
    });
    dispatch(slice.actions.setAudioInputDevices(audioInputDevices));
    dispatch(slice.actions.setVideoInputDevices(videoInputDevices));
    dispatch(slice.actions.setAudioOutputDevices(audioOutputDevices));
  };

// デバイスの変更時などに Sora との接続を維持したまま MediaStream のみ更新
export const updateMediaStream =
  () =>
  async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    const state = getState();
    if (!state.soraContents.sora) {
      return;
    }
    if (state.soraContents.localMediaStream) {
      state.soraContents.localMediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    const [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
      dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      throw error;
    });
    mediaStream.getTracks().forEach((track) => {
      if (!state.soraContents.sora || !state.soraContents.sora.pc) {
        return;
      }
      const sender = state.soraContents.sora.pc.getSenders().find((s) => {
        if (!s.track) {
          return false;
        }
        return s.track.kind === track.kind;
      });
      if (sender) {
        sender.replaceTrack(track);
      }
    });
    dispatch(slice.actions.setLocalMediaStream(mediaStream));
    dispatch(slice.actions.setFakeContentsGainNode(gainNode));
  };

export const setE2EE =
  (e2ee: boolean) =>
  async (dispatch: Dispatch, _getState: () => SoraDevtoolsState): Promise<void> => {
    if (e2ee) {
      const message = `Faild to execute WebAssembly '${process.env.NEXT_PUBLIC_E2EE_WASM_URL}'.`;
      // wasm url が存在する場合は e2ee の初期化処理をする
      if (!process.env.NEXT_PUBLIC_E2EE_WASM_URL) {
        dispatch(slice.actions.setSoraErrorAlertMessage(message));
        return;
      }
      try {
        await Sora.initE2EE(process.env.NEXT_PUBLIC_E2EE_WASM_URL);
      } catch (e) {
        dispatch(slice.actions.setSoraErrorAlertMessage(message));
        return;
      }
    }
    dispatch(slice.actions.setE2EE(e2ee));
  };

export const setMicDevice =
  (micDevice: boolean) =>
  async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    const state = getState();
    if (!state.soraContents.localMediaStream || !state.soraContents.sora) {
      dispatch(slice.actions.setMicDevice(micDevice));
      return;
    }
    if (micDevice) {
      const pickedState = {
        aspectRatio: state.aspectRatio,
        audio: state.audio,
        audioContentHint: state.audioContentHint,
        audioInput: state.audioInput,
        audioTrack: state.audioTrack,
        autoGainControl: state.autoGainControl,
        cameraDevice: state.cameraDevice,
        echoCancellation: state.echoCancellation,
        echoCancellationType: state.echoCancellationType,
        fakeContents: state.fakeContents,
        fakeVolume: state.fakeVolume,
        frameRate: state.frameRate,
        mediaType: state.mediaType,
        micDevice: micDevice,
        noiseSuppression: state.noiseSuppression,
        resolution: state.resolution,
        video: false,
        videoContentHint: state.videoContentHint,
        videoInput: state.videoInput,
        videoTrack: state.videoTrack,
      };
      const [mediaStream, gainNode] = await createMediaStream(dispatch, pickedState).catch((error) => {
        dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
        throw error;
      });
      if (0 < mediaStream.getAudioTracks().length) {
        await state.soraContents.sora.replaceAudioTrack(
          state.soraContents.localMediaStream,
          mediaStream.getAudioTracks()[0]
        );
        dispatch(slice.actions.setFakeContentsGainNode(gainNode));
      }
    } else {
      state.soraContents.sora.stopAudioTrack(state.soraContents.localMediaStream);
    }
    dispatch(slice.actions.setMicDevice(micDevice));
  };

export const setCameraDevice =
  (cameraDevice: boolean) =>
  async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    const state = getState();
    if (!state.soraContents.localMediaStream || !state.soraContents.sora) {
      dispatch(slice.actions.setCameraDevice(cameraDevice));
      return;
    }
    if (cameraDevice) {
      const pickedState = {
        aspectRatio: state.aspectRatio,
        audio: false,
        audioContentHint: state.audioContentHint,
        audioInput: state.audioInput,
        audioTrack: state.audioTrack,
        autoGainControl: state.autoGainControl,
        cameraDevice: cameraDevice,
        echoCancellation: state.echoCancellation,
        echoCancellationType: state.echoCancellationType,
        fakeContents: state.fakeContents,
        fakeVolume: state.fakeVolume,
        frameRate: state.frameRate,
        mediaType: state.mediaType,
        micDevice: state.micDevice,
        noiseSuppression: state.noiseSuppression,
        resolution: state.resolution,
        video: state.video,
        videoContentHint: state.videoContentHint,
        videoInput: state.videoInput,
        videoTrack: state.videoTrack,
      };
      const [mediaStream, gainNode] = await createMediaStream(dispatch, pickedState).catch((error) => {
        dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
        throw error;
      });
      if (0 < mediaStream.getVideoTracks().length) {
        state.soraContents.sora.replaceVideoTrack(state.soraContents.localMediaStream, mediaStream.getVideoTracks()[0]);
        dispatch(slice.actions.setFakeContentsGainNode(gainNode));
      }
    } else {
      state.soraContents.sora.stopVideoTrack(state.soraContents.localMediaStream);
    }
    dispatch(slice.actions.setCameraDevice(cameraDevice));
  };

// QueryString の値とページから渡されたパラメーターを適切に action に渡すためのメソッド
function setInitialState<T>(
  dispatch: Dispatch,
  action: ActionCreatorWithPayload<T, string>,
  pageValue: T | undefined,
  queryStringValue: T | undefined
): void {
  if (pageValue !== undefined) {
    dispatch(action(pageValue));
  }
  if (queryStringValue !== undefined) {
    dispatch(action(queryStringValue));
  }
}

export const setInitialParameter =
  (pageInitialParameters: PageInitialParameters) =>
  async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    dispatch(slice.actions.resetState());
    const queryStringParameters = parseQueryString();
    setInitialState<SoraDevtoolsState["audio"]>(
      dispatch,
      slice.actions.setAudio,
      pageInitialParameters.audio,
      queryStringParameters.audio
    );
    setInitialState<SoraDevtoolsState["audioBitRate"]>(
      dispatch,
      slice.actions.setAudioBitRate,
      pageInitialParameters.audioBitRate,
      queryStringParameters.audioBitRate
    );
    setInitialState<SoraDevtoolsState["audioCodecType"]>(
      dispatch,
      slice.actions.setAudioCodecType,
      pageInitialParameters.audioCodecType,
      queryStringParameters.audioCodecType
    );
    // 存在しない Device の場合はセットしない
    const deviceInfos = await getDevices();
    if (
      deviceInfos.find((d) => d.kind === "audioinput" && d.deviceId === queryStringParameters.audioInput) !== undefined
    ) {
      setInitialState<SoraDevtoolsState["audioInput"]>(
        dispatch,
        slice.actions.setAudioInput,
        pageInitialParameters.audioInput,
        queryStringParameters.audioInput
      );
    }
    if (
      deviceInfos.find((d) => d.kind === "audiooutput" && d.deviceId === queryStringParameters.audioOutput) !==
      undefined
    ) {
      setInitialState<SoraDevtoolsState["audioOutput"]>(
        dispatch,
        slice.actions.setAudioOutput,
        pageInitialParameters.audioOutput,
        queryStringParameters.audioOutput
      );
    }
    if (
      deviceInfos.find((d) => d.kind === "videoinput" && d.deviceId === queryStringParameters.videoInput) !== undefined
    ) {
      setInitialState<SoraDevtoolsState["videoInput"]>(
        dispatch,
        slice.actions.setVideoInput,
        pageInitialParameters.videoInput,
        queryStringParameters.videoInput
      );
    }
    setInitialState<SoraDevtoolsState["autoGainControl"]>(
      dispatch,
      slice.actions.setAutoGainControl,
      pageInitialParameters.autoGainControl,
      queryStringParameters.autoGainControl
    );
    setInitialState<SoraDevtoolsState["channelId"]>(
      dispatch,
      slice.actions.setChannelId,
      pageInitialParameters.channelId,
      queryStringParameters.channelId
    );
    setInitialState<SoraDevtoolsState["displayResolution"]>(
      dispatch,
      slice.actions.setDisplayResolution,
      pageInitialParameters.displayResolution,
      queryStringParameters.displayResolution
    );
    setInitialState<SoraDevtoolsState["e2ee"]>(
      dispatch,
      slice.actions.setE2EE,
      pageInitialParameters.e2ee,
      queryStringParameters.e2ee
    );
    setInitialState<SoraDevtoolsState["echoCancellation"]>(
      dispatch,
      slice.actions.setEchoCancellation,
      pageInitialParameters.echoCancellation,
      queryStringParameters.echoCancellation
    );
    setInitialState<SoraDevtoolsState["echoCancellationType"]>(
      dispatch,
      slice.actions.setEchoCancellationType,
      pageInitialParameters.echoCancellationType,
      queryStringParameters.echoCancellationType
    );
    setInitialState<SoraDevtoolsState["mediaType"]>(
      dispatch,
      slice.actions.setMediaType,
      pageInitialParameters.mediaType,
      queryStringParameters.mediaType
    );
    setInitialState<SoraDevtoolsState["fakeVolume"]>(
      dispatch,
      slice.actions.setFakeVolume,
      pageInitialParameters.fakeVolume,
      queryStringParameters.fakeVolume
    );
    setInitialState<SoraDevtoolsState["frameRate"]>(
      dispatch,
      slice.actions.setFrameRate,
      pageInitialParameters.frameRate,
      queryStringParameters.frameRate
    );
    setInitialState<SoraDevtoolsState["noiseSuppression"]>(
      dispatch,
      slice.actions.setNoiseSuppression,
      pageInitialParameters.noiseSuppression,
      queryStringParameters.noiseSuppression
    );
    setInitialState<SoraDevtoolsState["resolution"]>(
      dispatch,
      slice.actions.setResolution,
      pageInitialParameters.resolution,
      queryStringParameters.resolution
    );
    setInitialState<SoraDevtoolsState["showStats"]>(
      dispatch,
      slice.actions.setShowStats,
      pageInitialParameters.showStats,
      queryStringParameters.showStats
    );
    setInitialState<SoraDevtoolsState["simulcastRid"]>(
      dispatch,
      slice.actions.setSimulcastRid,
      pageInitialParameters.simulcastRid,
      queryStringParameters.simulcastRid
    );
    setInitialState<SoraDevtoolsState["spotlightNumber"]>(
      dispatch,
      slice.actions.setSpotlightNumber,
      pageInitialParameters.spotlightNumber,
      queryStringParameters.spotlightNumber
    );
    setInitialState<SoraDevtoolsState["spotlightFocusRid"]>(
      dispatch,
      slice.actions.setSpotlightFocusRid,
      pageInitialParameters.spotlightFocusRid,
      queryStringParameters.spotlightFocusRid
    );
    setInitialState<SoraDevtoolsState["spotlightUnfocusRid"]>(
      dispatch,
      slice.actions.setSpotlightUnfocusRid,
      pageInitialParameters.spotlightUnfocusRid,
      queryStringParameters.spotlightUnfocusRid
    );
    setInitialState<SoraDevtoolsState["video"]>(
      dispatch,
      slice.actions.setVideo,
      pageInitialParameters.video,
      queryStringParameters.video
    );
    setInitialState<SoraDevtoolsState["videoBitRate"]>(
      dispatch,
      slice.actions.setVideoBitRate,
      pageInitialParameters.videoBitRate,
      queryStringParameters.videoBitRate
    );
    setInitialState<SoraDevtoolsState["videoCodecType"]>(
      dispatch,
      slice.actions.setVideoCodecType,
      pageInitialParameters.videoCodecType,
      queryStringParameters.videoCodecType
    );
    setInitialState<SoraDevtoolsState["debug"]>(
      dispatch,
      slice.actions.setDebug,
      pageInitialParameters.debug,
      queryStringParameters.debug
    );
    setInitialState<SoraDevtoolsState["debugType"]>(
      dispatch,
      slice.actions.setDebugType,
      pageInitialParameters.debugType,
      queryStringParameters.debugType
    );
    setInitialState<SoraDevtoolsState["mute"]>(
      dispatch,
      slice.actions.setMute,
      pageInitialParameters.mute,
      queryStringParameters.mute
    );
    setInitialState<SoraDevtoolsState["dataChannelSignaling"]>(
      dispatch,
      slice.actions.setDataChannelSignaling,
      pageInitialParameters.dataChannelSignaling,
      queryStringParameters.dataChannelSignaling
    );
    setInitialState<SoraDevtoolsState["ignoreDisconnectWebSocket"]>(
      dispatch,
      slice.actions.setIgnoreDisconnectWebSocket,
      pageInitialParameters.ignoreDisconnectWebSocket,
      queryStringParameters.ignoreDisconnectWebSocket
    );
    setInitialState<SoraDevtoolsState["micDevice"]>(
      dispatch,
      slice.actions.setMicDevice,
      pageInitialParameters.micDevice,
      queryStringParameters.micDevice
    );
    setInitialState<SoraDevtoolsState["cameraDevice"]>(
      dispatch,
      slice.actions.setCameraDevice,
      pageInitialParameters.cameraDevice,
      queryStringParameters.cameraDevice
    );
    setInitialState<SoraDevtoolsState["audioTrack"]>(
      dispatch,
      slice.actions.setAudioTrack,
      pageInitialParameters.audioTrack,
      queryStringParameters.audioTrack
    );
    setInitialState<SoraDevtoolsState["videoTrack"]>(
      dispatch,
      slice.actions.setVideoTrack,
      pageInitialParameters.videoTrack,
      queryStringParameters.videoTrack
    );
    // googCpuOveruseDetection は query string からのみ受け付ける
    if (typeof queryStringParameters.googCpuOveruseDetection === "boolean") {
      dispatch(slice.actions.setGoogCpuOveruseDetection(queryStringParameters.googCpuOveruseDetection));
    }
    setInitialState<SoraDevtoolsState["clientId"]>(
      dispatch,
      slice.actions.setClientId,
      pageInitialParameters.clientId,
      queryStringParameters.clientId
    );
    setInitialState<SoraDevtoolsState["metadata"]>(
      dispatch,
      slice.actions.setMetadata,
      pageInitialParameters.metadata,
      queryStringParameters.metadata
    );
    setInitialState<SoraDevtoolsState["signalingNotifyMetadata"]>(
      dispatch,
      slice.actions.setSignalingNotifyMetadata,
      pageInitialParameters.signalingNotifyMetadata,
      queryStringParameters.signalingNotifyMetadata
    );
    setInitialState<SoraDevtoolsState["signalingUrlCandidates"]>(
      dispatch,
      slice.actions.setSignalingUrlCandidates,
      pageInitialParameters.signalingUrlCandidates,
      queryStringParameters.signalingUrlCandidates
    );
    setInitialState<SoraDevtoolsState["dataChannels"]>(
      dispatch,
      slice.actions.setDataChannels,
      pageInitialParameters.dataChannels,
      queryStringParameters.dataChannels
    );
    setInitialState<SoraDevtoolsState["audioContentHint"]>(
      dispatch,
      slice.actions.setAudioContentHint,
      pageInitialParameters.audioContentHint,
      queryStringParameters.audioContentHint
    );
    setInitialState<SoraDevtoolsState["videoContentHint"]>(
      dispatch,
      slice.actions.setVideoContentHint,
      pageInitialParameters.videoContentHint,
      queryStringParameters.videoContentHint
    );
    setInitialState<SoraDevtoolsState["reconnect"]>(
      dispatch,
      slice.actions.setReconnect,
      pageInitialParameters.reconnect,
      queryStringParameters.reconnect
    );
    // apiUrl は query string からのみ受け付ける
    if (typeof queryStringParameters.apiUrl === "string") {
      dispatch(slice.actions.setApiUrl(queryStringParameters.apiUrl));
    }
    dispatch(slice.actions.setInitialFakeContents());
    // role
    if (pageInitialParameters.role !== null && pageInitialParameters.role !== undefined) {
      dispatch(slice.actions.setRole(pageInitialParameters.role));
    } else {
      throw new Error(`Failed to initialize. Invalid role parameter '${pageInitialParameters.role}'.`);
    }
    // multistream
    if (typeof pageInitialParameters.multistream === "boolean") {
      dispatch(slice.actions.setMultistream(pageInitialParameters.multistream));
    } else {
      throw new Error(`Failed to initialize. Invalid multistream parameter '${pageInitialParameters.multistream}'.`);
    }
    // simulcast
    if (typeof pageInitialParameters.simulcast === "boolean") {
      dispatch(slice.actions.setSimulcast(pageInitialParameters.simulcast));
    } else {
      throw new Error(`Failed to initialize. Invalid simulcast parameter '${pageInitialParameters.simulcast}'.`);
    }
    // spotlight
    if (typeof pageInitialParameters.spotlight === "boolean") {
      dispatch(slice.actions.setSpotlight(pageInitialParameters.spotlight));
    } else {
      throw new Error(`Failed to initialize. Invalid spotlight parameter '${pageInitialParameters.spotlight}'.`);
    }
    dispatch(
      slice.actions.setInitialDisplaySettings(
        createDisplaySettings(
          pageInitialParameters.role,
          pageInitialParameters.multistream,
          pageInitialParameters.simulcast,
          pageInitialParameters.spotlight,
          !!pageInitialParameters.dataChannelMessagingOnly
        )
      )
    );
    // e2ee が有効な場合は e2ee 初期化処理をする
    const {
      clientId,
      dataChannels,
      dataChannelSignaling,
      e2ee,
      ignoreDisconnectWebSocket,
      metadata,
      signalingNotifyMetadata,
      signalingUrlCandidates,
    } = getState();
    if (e2ee) {
      const message = `Faild to execute WebAssembly '${process.env.NEXT_PUBLIC_E2EE_WASM_URL}'.`;
      // wasm url が存在する場合は e2ee の初期化処理をする
      if (!process.env.NEXT_PUBLIC_E2EE_WASM_URL) {
        dispatch(slice.actions.setSoraErrorAlertMessage(message));
        return;
      }
      try {
        await Sora.initE2EE(process.env.NEXT_PUBLIC_E2EE_WASM_URL);
      } catch (e) {
        dispatch(slice.actions.setSoraErrorAlertMessage(message));
        return;
      }
    }

    // clientId が存在した場合は enabledClientId をセットする
    if (clientId !== "") {
      dispatch(slice.actions.setEnabledClientId(true));
    }
    // metadata が存在した場合は enabledMetadata をセットする
    if (metadata !== "") {
      dispatch(slice.actions.setEnabledMetadata(true));
    }
    // signalingNotifyMetadata が存在した場合は enabledSignalingNotifyMetadata をセットする
    if (signalingNotifyMetadata !== "") {
      dispatch(slice.actions.setEnabledSignalingNotifyMetadata(true));
    }
    // signalingUrlCandidates が存在した場合は enabledSignalingUrlCandidates をセットする
    if (0 < signalingUrlCandidates.length) {
      dispatch(slice.actions.setEnabledSignalingUrlCandidates(true));
    }
    // dataChannelSignaling または ignoreDisconnectWebSocket が存在した場合は enabledDataChannel をセットする
    if (dataChannelSignaling !== "" || ignoreDisconnectWebSocket !== "") {
      dispatch(slice.actions.setEnabledDataChannel(true));
    }
    // dataChannels が存在した場合は enabledDataChannels をセットする
    if (dataChannels !== "") {
      dispatch(slice.actions.setEnabledDataChannels(true));
    }
  };

// state から query string 付きの URL を生成する
function queryStringValue<T>(stateValue: T, enabled: boolean): T | undefined {
  if (enabled) {
    return stateValue;
  }
  return undefined;
}

export const copyURL =
  () =>
  (_: Dispatch, getState: () => SoraDevtoolsState): void => {
    const state = getState();
    const parameters: Partial<QueryStringParameters> = {
      // mediaType
      mediaType: queryStringValue<QueryStringParameters["mediaType"]>(
        state.mediaType,
        state.mediaType !== "getUserMedia" && state.displaySettings.mediaType
      ),
      // channelId
      channelId: state.channelId,
      // audio
      audio: queryStringValue<QueryStringParameters["audio"]>(state.audio, state.displaySettings.audio),
      audioBitRate: queryStringValue<QueryStringParameters["audioBitRate"]>(
        state.audioBitRate,
        state.displaySettings.audioBitRate
      ),
      audioCodecType: queryStringValue<QueryStringParameters["audioCodecType"]>(
        state.audioCodecType,
        state.displaySettings.audioCodecType
      ),
      audioContentHint: queryStringValue<QueryStringParameters["audioContentHint"]>(
        state.audioContentHint,
        state.audioContentHint !== "" && state.displaySettings.audioContentHint
      ),
      // audio constraints
      autoGainControl: queryStringValue<QueryStringParameters["autoGainControl"]>(
        state.autoGainControl,
        state.autoGainControl !== "" && state.displaySettings.audioConstraints
      ),
      noiseSuppression: queryStringValue<QueryStringParameters["noiseSuppression"]>(
        state.noiseSuppression,
        state.noiseSuppression !== "" && state.displaySettings.audioConstraints
      ),
      echoCancellation: queryStringValue<QueryStringParameters["echoCancellation"]>(
        state.echoCancellation,
        state.echoCancellation !== "" && state.displaySettings.audioConstraints
      ),
      echoCancellationType: queryStringValue<QueryStringParameters["echoCancellationType"]>(
        state.echoCancellationType,
        state.echoCancellationType !== "" && state.displaySettings.audioConstraints
      ),
      // video
      video: queryStringValue<QueryStringParameters["video"]>(state.video, state.displaySettings.video),
      videoBitRate: queryStringValue<QueryStringParameters["videoBitRate"]>(
        state.videoBitRate,
        state.displaySettings.videoBitRate
      ),
      videoCodecType: queryStringValue<QueryStringParameters["videoCodecType"]>(
        state.videoCodecType,
        state.displaySettings.videoCodecType
      ),
      videoContentHint: queryStringValue<QueryStringParameters["videoContentHint"]>(
        state.videoContentHint,
        state.videoContentHint !== "" && state.displaySettings.videoContentHint
      ),
      // video constraints
      resolution: queryStringValue<QueryStringParameters["resolution"]>(
        state.resolution,
        state.displaySettings.videoConstraints
      ),
      frameRate: queryStringValue<QueryStringParameters["frameRate"]>(
        state.frameRate,
        state.frameRate !== "" && state.displaySettings.videoConstraints
      ),
      // simulcast
      simulcastRid: queryStringValue<QueryStringParameters["simulcastRid"]>(
        state.simulcastRid,
        state.displaySettings.simulcastRid
      ),
      // devices
      audioInput: queryStringValue<QueryStringParameters["audioInput"]>(
        state.audioInput,
        state.audioInput !== "" && state.displaySettings.audioInput
      ),
      audioOutput: queryStringValue<QueryStringParameters["audioOutput"]>(
        state.audioOutput,
        state.audioOutput !== "" && state.displaySettings.audioOutput
      ),
      videoInput: queryStringValue<QueryStringParameters["videoInput"]>(
        state.videoInput,
        state.videoInput !== "" && state.displaySettings.videoInput
      ),
      // device settings
      displayResolution: queryStringValue<QueryStringParameters["displayResolution"]>(
        state.displayResolution,
        state.displayResolution !== ""
      ),
      micDevice: queryStringValue<QueryStringParameters["micDevice"]>(
        state.micDevice,
        !state.micDevice && state.displaySettings.micDevice
      ),
      cameraDevice: queryStringValue<QueryStringParameters["cameraDevice"]>(
        state.cameraDevice,
        !state.cameraDevice && state.displaySettings.cameraDevice
      ),
      audioTrack: queryStringValue<QueryStringParameters["audioTrack"]>(
        state.audioTrack,
        !state.audioTrack && state.displaySettings.audioTrack
      ),
      videoTrack: queryStringValue<QueryStringParameters["videoTrack"]>(
        state.videoTrack,
        !state.videoTrack && state.displaySettings.videoTrack
      ),
      // spotlight
      spotlightNumber: queryStringValue<QueryStringParameters["spotlightNumber"]>(
        state.spotlightNumber,
        state.displaySettings.spotlightNumber
      ),
      spotlightFocusRid: queryStringValue<QueryStringParameters["spotlightFocusRid"]>(
        state.spotlightFocusRid,
        state.displaySettings.spotlightFocusRid
      ),
      spotlightUnfocusRid: queryStringValue<QueryStringParameters["spotlightUnfocusRid"]>(
        state.spotlightUnfocusRid,
        state.displaySettings.spotlightUnfocusRid
      ),
      // options
      e2ee: queryStringValue<QueryStringParameters["e2ee"]>(state.e2ee, state.e2ee),
      clientId: queryStringValue<QueryStringParameters["clientId"]>(state.clientId, state.enabledClientId),
      metadata: queryStringValue<QueryStringParameters["metadata"]>(state.metadata, state.enabledMetadata),
      signalingNotifyMetadata: queryStringValue<QueryStringParameters["signalingNotifyMetadata"]>(
        state.signalingNotifyMetadata,
        state.enabledSignalingNotifyMetadata
      ),
      dataChannelSignaling: queryStringValue<QueryStringParameters["dataChannelSignaling"]>(
        state.dataChannelSignaling,
        state.enabledDataChannel
      ),
      ignoreDisconnectWebSocket: queryStringValue<QueryStringParameters["ignoreDisconnectWebSocket"]>(
        state.ignoreDisconnectWebSocket,
        state.enabledDataChannel
      ),
      signalingUrlCandidates: queryStringValue<QueryStringParameters["signalingUrlCandidates"]>(
        state.signalingUrlCandidates,
        state.enabledSignalingUrlCandidates
      ),
      dataChannels: queryStringValue<QueryStringParameters["dataChannels"]>(
        state.dataChannels,
        state.enabledDataChannels
      ),
      reconnect: queryStringValue<QueryStringParameters["reconnect"]>(state.reconnect, state.reconnect),
      // debug
      debug: state.debug,
      // fakeVolume
      fakeVolume: state.mediaType === "fakeMedia" ? state.fakeVolume : undefined,
      // apiUrl
      apiUrl: state.apiUrl !== null ? state.apiUrl : undefined,
    };
    const queryStrings = Object.keys(parameters)
      .map((key) => {
        const value = (parameters as Record<string, unknown>)[key];
        if (value === undefined) {
          return;
        }
        // signalingUrlCandidates は Array なので JSON.stringify する
        if (key === "signalingUrlCandidates") {
          return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${key}=${encodeURIComponent(value as string)}`;
      })
      .filter((value) => value !== undefined);
    copy2clipboard(`${location.origin}${location.pathname}?${queryStrings.join("&")}`);
  };

export const {
  clearDataChannelMessages,
  deleteAlertMessage,
  setAPIErrorAlertMessage,
  setAPIInfoAlertMessage,
  setAspectRatio,
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAudioContentHint,
  setAudioInput,
  setAudioOutput,
  setAudioTrack,
  setAutoGainControl,
  setChannelId,
  setClientId,
  setDataChannels,
  setDataChannelSignaling,
  setDebug,
  setDebugFilterText,
  setDebugType,
  setDisplayResolution,
  setEchoCancellation,
  setEchoCancellationType,
  setEnabledClientId,
  setEnabledDataChannels,
  setEnabledDataChannel,
  setEnabledMetadata,
  setEnabledSignalingNotifyMetadata,
  setEnabledSignalingUrlCandidates,
  setFakeVolume,
  setFrameRate,
  setIgnoreDisconnectWebSocket,
  setLocalMediaStream,
  setLogMessages,
  setMediaType,
  setMetadata,
  setNoiseSuppression,
  setNotifyMessages,
  setResolution,
  setReconnect,
  setSignalingNotifyMetadata,
  setSignalingUrlCandidates,
  setSimulcastRid,
  setSora,
  setSoraReconnecting,
  setSoraErrorAlertMessage,
  setSoraInfoAlertMessage,
  setSpotlightFocusRid,
  setSpotlightNumber,
  setSpotlightUnfocusRid,
  setVideo,
  setVideoBitRate,
  setVideoCodecType,
  setVideoContentHint,
  setVideoInput,
  setVideoTrack,
} = slice.actions;

export const reducer = slice.reducer;
