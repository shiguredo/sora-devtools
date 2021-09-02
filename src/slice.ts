import { ActionCreatorWithPayload, createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import type { ConnectionOptions, ConnectionPublisher, ConnectionSubscriber, TransportType } from "sora-js-sdk";
import Sora from "sora-js-sdk";

import {
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  DATA_CHANNEL_SIGNALING,
  DISPLAY_RESOLUTIONS,
  ECHO_CANCELLATION_TYPES,
  FRAME_RATES,
  IGNORE_DISCONNECT_WEBSOCKET,
  MEDIA_TYPES,
  RESOLUTIONS,
  SIMULCAST_RID,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  SPOTLIGHTS,
  VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
  WORKER_SCRIPT,
} from "@/constants";
import {
  AlertMessage,
  createAudioConstraints,
  createFakeMediaConstraints,
  createFakeMediaStream,
  createSignalingURL,
  createVideoConstraints,
  DebugType,
  drawFakeCanvas,
  getDevices,
  Json,
  LogMessage,
  NotifyMessage,
  parseMetadata,
  parseQueryString,
  PushMessage,
  SignalingMessage,
  SoraDemoMediaDevices,
  SoraNotifyMessage,
  SoraPushMessage,
  TimelineMessage,
} from "@/utils";

import packageJSON from "../package.json";

export type SoraDemoState = {
  alertMessages: AlertMessage[];
  audio: boolean;
  audioBitRate: typeof AUDIO_BIT_RATES[number];
  audioCodecType: typeof AUDIO_CODEC_TYPES[number];
  audioInput: string;
  audioInputDevices: MediaDeviceInfo[];
  audioOutput: string;
  audioOutputDevices: MediaDeviceInfo[];
  autoGainControl: boolean;
  channelId: string;
  clientId: string;
  googCpuOveruseDetection: boolean | null;
  timelineMessages: TimelineMessage[];
  debug: boolean;
  debugType: DebugType;
  dataChannelSignaling: typeof DATA_CHANNEL_SIGNALING[number];
  displayResolution: typeof DISPLAY_RESOLUTIONS[number];
  echoCancellation: boolean;
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  e2ee: boolean;
  enabledClientId: boolean;
  enabledDataChannel: boolean;
  enabledMetadata: boolean;
  enabledSignalingNotifyMetadata: boolean;
  enabledSignalingUrlCandidates: boolean;
  fakeContents: {
    worker: Worker | null;
    colorCode: number;
    gainNode: GainNode | null;
  };
  fakeVolume: string;
  frameRate: typeof FRAME_RATES[number];
  soraContents: {
    connectionStatus: "disconnected" | "disconnecting" | "connected" | "connecting";
    sora: ConnectionPublisher | ConnectionSubscriber | null;
    connectionId: string | null;
    clientId: string | null;
    localMediaStream: MediaStream | null;
    remoteMediaStreams: MediaStream[];
    prevStatsReport: RTCStats[];
    statsReport: RTCStats[];
  };
  ignoreDisconnectWebSocket: typeof IGNORE_DISCONNECT_WEBSOCKET[number];
  logMessages: LogMessage[];
  mediaType: typeof MEDIA_TYPES[number];
  metadata: string;
  mute: boolean;
  noiseSuppression: boolean;
  notifyMessages: NotifyMessage[];
  pushMessages: PushMessage[];
  resolution: typeof RESOLUTIONS[number];
  showStats: boolean;
  signalingNotifyMetadata: string;
  signalingUrlCandidates: string[];
  signalingMessages: SignalingMessage[];
  simulcastRid: typeof SIMULCAST_RID[number];
  focusedSpotlightConnectionIds: {
    [key: string]: boolean;
  };
  spotlight: typeof SPOTLIGHTS[number];
  spotlightNumber: typeof SPOTLIGHT_NUMBERS[number];
  spotlightFocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  spotlightUnfocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  video: boolean;
  videoBitRate: typeof VIDEO_BIT_RATES[number];
  videoCodecType: typeof VIDEO_CODEC_TYPES[number];
  videoInput: string;
  videoInputDevices: MediaDeviceInfo[];
  version: string;
  cameraDevice: boolean;
  videoTrack: boolean;
  micDevice: boolean;
  audioTrack: boolean;
};

const initialState: SoraDemoState = {
  alertMessages: [],
  audio: true,
  audioBitRate: "",
  audioCodecType: "",
  audioInput: "",
  audioInputDevices: [],
  audioOutput: "",
  audioOutputDevices: [],
  autoGainControl: true,
  clientId: "",
  channelId: "sora",
  googCpuOveruseDetection: null,
  timelineMessages: [],
  debug: false,
  debugType: "timeline",
  dataChannelSignaling: "",
  displayResolution: "",
  e2ee: false,
  echoCancellation: true,
  echoCancellationType: "",
  enabledDataChannel: false,
  enabledClientId: false,
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
    sora: null,
    connectionId: null,
    clientId: null,
    localMediaStream: null,
    remoteMediaStreams: [],
    prevStatsReport: [],
    statsReport: [],
  },
  ignoreDisconnectWebSocket: "",
  logMessages: [],
  mediaType: "getUserMedia",
  metadata: "",
  mute: false,
  noiseSuppression: true,
  notifyMessages: [],
  pushMessages: [],
  resolution: "",
  showStats: false,
  signalingMessages: [],
  signalingNotifyMetadata: "",
  signalingUrlCandidates: [],
  simulcastRid: "",
  spotlight: "2",
  spotlightNumber: "",
  spotlightFocusRid: "",
  spotlightUnfocusRid: "",
  focusedSpotlightConnectionIds: {},
  video: true,
  videoBitRate: "",
  videoCodecType: "",
  videoInput: "",
  videoInputDevices: [],
  version: packageJSON.version,
  cameraDevice: true,
  videoTrack: true,
  micDevice: true,
  audioTrack: true,
};

const slice = createSlice({
  name: "soraDemo",
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
    setAudioBitRate: (state, action: PayloadAction<typeof AUDIO_BIT_RATES[number]>) => {
      state.audioBitRate = action.payload;
    },
    setAudioCodecType: (state, action: PayloadAction<typeof AUDIO_CODEC_TYPES[number]>) => {
      state.audioCodecType = action.payload;
    },
    setAutoGainControl: (state, action: PayloadAction<boolean>) => {
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
    setDataChannelSignaling: (state, action: PayloadAction<typeof DATA_CHANNEL_SIGNALING[number]>) => {
      state.dataChannelSignaling = action.payload;
    },
    setGoogCpuOveruseDetection: (state, action: PayloadAction<boolean>) => {
      state.googCpuOveruseDetection = action.payload;
    },
    setDisplayResolution: (state, action: PayloadAction<typeof DISPLAY_RESOLUTIONS[number]>) => {
      state.displayResolution = action.payload;
    },
    setE2EE: (state, action: PayloadAction<boolean>) => {
      state.e2ee = action.payload;
    },
    setEchoCancellation: (state, action: PayloadAction<boolean>) => {
      state.echoCancellation = action.payload;
    },
    setEchoCancellationType: (state, action: PayloadAction<typeof ECHO_CANCELLATION_TYPES[number]>) => {
      state.echoCancellationType = action.payload;
    },
    setEnabledClientId: (state, action: PayloadAction<boolean>) => {
      state.enabledClientId = action.payload;
    },
    setEnabledDataChannel: (state, action: PayloadAction<boolean>) => {
      state.enabledDataChannel = action.payload;
    },
    setEnabledMetadata: (state, action: PayloadAction<boolean>) => {
      state.enabledMetadata = action.payload;
    },
    setIgnoreDisconnectWebSocket: (state, action: PayloadAction<typeof IGNORE_DISCONNECT_WEBSOCKET[number]>) => {
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
    setFrameRate: (state, action: PayloadAction<typeof FRAME_RATES[number]>) => {
      state.frameRate = action.payload;
    },
    setMute: (state, action: PayloadAction<boolean>) => {
      state.mute = action.payload;
    },
    setNoiseSuppression: (state, action: PayloadAction<boolean>) => {
      state.noiseSuppression = action.payload;
    },
    setMediaType: (state, action: PayloadAction<typeof MEDIA_TYPES[number]>) => {
      state.mediaType = action.payload;
    },
    setMetadata: (state, action: PayloadAction<string>) => {
      state.metadata = action.payload;
    },
    setResolution: (state, action: PayloadAction<typeof RESOLUTIONS[number]>) => {
      state.resolution = action.payload;
    },
    setSignalingNotifyMetadata: (state, action: PayloadAction<string>) => {
      state.signalingNotifyMetadata = action.payload;
    },
    setSignalingUrlCandidates: (state, action: PayloadAction<string[]>) => {
      state.signalingUrlCandidates = action.payload;
    },
    setSimulcastRid: (state, action: PayloadAction<typeof SIMULCAST_RID[number]>) => {
      state.simulcastRid = action.payload;
    },
    setSpotlight: (state, action: PayloadAction<typeof SPOTLIGHTS[number]>) => {
      state.spotlight = action.payload;
    },
    setSpotlightNumber: (state, action: PayloadAction<typeof SPOTLIGHT_NUMBERS[number]>) => {
      state.spotlightNumber = action.payload;
    },
    setSpotlightFocusRid: (state, action: PayloadAction<typeof SPOTLIGHT_FOCUS_RIDS[number]>) => {
      state.spotlightFocusRid = action.payload;
    },
    setSpotlightUnfocusRid: (state, action: PayloadAction<typeof SPOTLIGHT_FOCUS_RIDS[number]>) => {
      state.spotlightUnfocusRid = action.payload;
    },
    setVideo: (state, action: PayloadAction<boolean>) => {
      state.video = action.payload;
    },
    setVideoInput: (state, action: PayloadAction<string>) => {
      state.videoInput = action.payload;
    },
    setVideoBitRate: (state, action: PayloadAction<typeof VIDEO_BIT_RATES[number]>) => {
      state.videoBitRate = action.payload;
    },
    setVideoCodecType: (state, action: PayloadAction<typeof VIDEO_CODEC_TYPES[number]>) => {
      state.videoCodecType = action.payload;
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
      }
    },
    setSoraConnectionStatus: (state, action: PayloadAction<SoraDemoState["soraContents"]["connectionStatus"]>) => {
      state.soraContents.connectionStatus = action.payload;
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
    setDebugType: (state, action: PayloadAction<DebugType>) => {
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
  },
});

function setAlertMessagesAndLogMessages(
  alertMessages: SoraDemoState["alertMessages"],
  logMessages: SoraDemoState["logMessages"],
  alertMessage: AlertMessage
): void {
  if (5 <= alertMessages.length) {
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
  SoraDemoState,
  | "audio"
  | "audioInput"
  | "audioTrack"
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
    const constraints = {
      video: true,
    };
    dispatch(slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify(constraints) }));
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("media-constraints", constraints)));
    const stream = await (navigator.mediaDevices as SoraDemoMediaDevices).getDisplayMedia(constraints);
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("succeed-get-display-media")));
    for (const track of stream.getVideoTracks()) {
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
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("media-constraints", constraints)));
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
      track.enabled = state.videoTrack;
    }
    for (const track of mediaStream.getAudioTracks()) {
      track.enabled = state.audioTrack;
    }
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("succeed-create-fake-media")));
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
        createSoraDemoTimelineMessage("audio-media-constraints", { audio: audioConstraints })
      )
    );
    const audioMediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("succeed-audio-get-user-media")));
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
        createSoraDemoTimelineMessage("video-media-constraints", { video: videoConstraints })
      )
    );
    const videoMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("succeed-video-get-user-media")));
    mediaStream.addTrack(videoMediaStream.getVideoTracks()[0]);
  }
  for (const track of mediaStream.getVideoTracks()) {
    track.enabled = state.videoTrack;
  }
  for (const track of mediaStream.getAudioTracks()) {
    track.enabled = state.audioTrack;
  }
  return [mediaStream, null];
}

// Sora connection オブジェクトに callback をセットする
function setSoraCallbacks(
  dispatch: Dispatch,
  getState: () => SoraDemoState,
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
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("event-on-track")));
    const { soraContents } = getState();
    const mediaStream = soraContents.remoteMediaStreams.find((stream) => stream.id === event.streams[0].id);
    if (!mediaStream) {
      dispatch(slice.actions.setRemoteMediaStream(event.streams[0]));
    }
  });
  sora.on("removetrack", (event: MediaStreamTrackEvent) => {
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("event-on-removetrack")));
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
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("event-on-disconnect", message)));
    const { fakeContents, soraContents } = getState();
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
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("disconnected")));
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
}

// Sora の connectOptions を生成する
function createConnectOptions(
  pickedState: Pick<
    SoraDemoState,
    | "audio"
    | "audioBitRate"
    | "audioCodecType"
    | "clientId"
    | "dataChannelSignaling"
    | "enabledClientId"
    | "e2ee"
    | "enabledDataChannel"
    | "enabledSignalingNotifyMetadata"
    | "ignoreDisconnectWebSocket"
    | "signalingNotifyMetadata"
    | "simulcastRid"
    | "spotlight"
    | "spotlightFocusRid"
    | "spotlightNumber"
    | "spotlightUnfocusRid"
    | "video"
    | "videoBitRate"
    | "videoCodecType"
  >,
  multistream: boolean,
  spotlight: boolean,
  simulcast: boolean
): ConnectionOptions {
  const connectionOptions: ConnectionOptions = {
    audio: pickedState.audio,
    video: pickedState.video,
  };
  if (pickedState.audioCodecType) {
    connectionOptions.audioCodecType = pickedState.audioCodecType;
  }
  const parsedAudioBitRate = parseInt(pickedState.audioBitRate, 10);
  if (parsedAudioBitRate) {
    connectionOptions.audioBitRate = parsedAudioBitRate;
  }
  if (pickedState.videoCodecType) {
    connectionOptions.videoCodecType = pickedState.videoCodecType;
  }
  const parsedVideoBitRate = parseInt(pickedState.videoBitRate, 10);
  if (parsedVideoBitRate) {
    connectionOptions.videoBitRate = parsedVideoBitRate;
  }
  if (multistream) {
    connectionOptions.multistream = true;
  }
  if (pickedState.e2ee) {
    connectionOptions.e2ee = true;
  }
  if (spotlight) {
    connectionOptions.spotlight = true;
    if (pickedState.spotlightNumber) {
      connectionOptions.spotlightNumber = parseInt(pickedState.spotlightNumber);
    }
    if (connectionOptions.spotlight === true && pickedState.spotlightFocusRid) {
      connectionOptions.spotlightFocusRid = pickedState.spotlightFocusRid;
    }
    if (connectionOptions.spotlight === true && pickedState.spotlightUnfocusRid) {
      connectionOptions.spotlightUnfocusRid = pickedState.spotlightUnfocusRid;
    }
  }
  if (simulcast) {
    connectionOptions.simulcast = true;
    if (pickedState.simulcastRid) {
      connectionOptions.simulcastRid = pickedState.simulcastRid;
    }
  }
  if (pickedState.enabledSignalingNotifyMetadata) {
    connectionOptions.signalingNotifyMetadata = parseMetadata(true, pickedState.signalingNotifyMetadata);
  }
  if (pickedState.enabledClientId) {
    connectionOptions.clientId = pickedState.clientId;
  }
  if (pickedState.enabledDataChannel) {
    if (pickedState.dataChannelSignaling === "true") {
      connectionOptions.dataChannelSignaling = true;
    } else if (pickedState.dataChannelSignaling === "false") {
      connectionOptions.dataChannelSignaling = false;
    }

    if (pickedState.ignoreDisconnectWebSocket === "true") {
      connectionOptions.ignoreDisconnectWebSocket = true;
    } else if (pickedState.ignoreDisconnectWebSocket === "false") {
      connectionOptions.ignoreDisconnectWebSocket = false;
    }
  }
  return connectionOptions;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSoraDemoTimelineMessage(type: string, data?: any): TimelineMessage {
  return {
    type: type,
    logType: "sora-demo",
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

// Sora との配信のみ接続
type SendonlyOption = {
  multistream?: boolean;
  spotlight?: boolean;
  simulcast?: boolean;
};
export const sendonlyConnectSora =
  (options?: SendonlyOption) =>
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("start-connection")));
    dispatch(slice.actions.setSoraConnectionStatus("connecting"));
    const state = getState();
    if (state.soraContents.sora) {
      await state.soraContents.sora.disconnect();
    }
    const [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
      dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      throw error;
    });
    const signalingUrlCandidates = createSignalingURL(
      state.enabledSignalingUrlCandidates,
      state.signalingUrlCandidates
    );
    dispatch(
      slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingUrlCandidates) })
    );
    const connection = Sora.connection(signalingUrlCandidates, state.debug);
    const connectionOptions = createConnectOptions(
      {
        audio: state.audio,
        audioBitRate: state.audioBitRate,
        audioCodecType: state.audioCodecType,
        clientId: state.clientId,
        dataChannelSignaling: state.dataChannelSignaling,
        enabledClientId: state.enabledClientId,
        enabledDataChannel: state.enabledDataChannel,
        e2ee: state.e2ee,
        enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
        ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
        signalingNotifyMetadata: state.signalingNotifyMetadata,
        simulcastRid: "",
        spotlight: state.spotlight,
        spotlightNumber: state.spotlightNumber,
        spotlightFocusRid: state.spotlightFocusRid,
        spotlightUnfocusRid: state.spotlightUnfocusRid,
        video: state.video,
        videoBitRate: state.videoBitRate,
        videoCodecType: state.videoCodecType,
      },
      options?.multistream === true,
      options?.spotlight === true,
      options?.simulcast === true
    );
    const sora = connection.sendonly(state.channelId, null, connectionOptions);
    sora.metadata = parseMetadata(state.enabledMetadata, state.metadata);
    if (typeof state.googCpuOveruseDetection === "boolean") {
      sora.constraints = {
        optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
      };
    }
    setSoraCallbacks(dispatch, getState, sora);
    try {
      await sora.connect(mediaStream);
      dispatch(slice.actions.setSoraInfoAlertMessage("Succeeded to connect Sora."));
    } catch (error) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      dispatch(slice.actions.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`));
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      throw error;
    }
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
    dispatch(slice.actions.setLocalMediaStream(mediaStream));
    dispatch(slice.actions.setFakeContentsGainNode(gainNode));
    dispatch(slice.actions.setSoraConnectionStatus("connected"));
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("connected")));
  };

// Sora との視聴のみ接続
type RecvonlyOption = {
  multistream?: boolean;
  spotlight?: boolean;
  simulcast?: boolean;
};
export const recvonlyConnectSora =
  (options?: RecvonlyOption) =>
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("start-connection")));
    dispatch(slice.actions.setSoraConnectionStatus("connecting"));
    const state = getState();
    if (state.soraContents.sora) {
      await state.soraContents.sora.disconnect();
    }
    const signalingUrlCandidates = createSignalingURL(
      state.enabledSignalingUrlCandidates,
      state.signalingUrlCandidates
    );
    dispatch(
      slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingUrlCandidates) })
    );
    const connection = Sora.connection(signalingUrlCandidates, state.debug);
    const connectionOptions = createConnectOptions(
      {
        audio: state.audio,
        audioBitRate: state.audioBitRate,
        audioCodecType: state.audioCodecType,
        clientId: state.clientId,
        dataChannelSignaling: state.dataChannelSignaling,
        enabledClientId: state.enabledClientId,
        enabledDataChannel: state.enabledDataChannel,
        e2ee: state.e2ee,
        enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
        ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
        signalingNotifyMetadata: state.signalingNotifyMetadata,
        simulcastRid: state.simulcastRid,
        spotlight: state.spotlight,
        spotlightNumber: state.spotlightNumber,
        spotlightFocusRid: state.spotlightFocusRid,
        spotlightUnfocusRid: state.spotlightUnfocusRid,
        video: state.video,
        videoBitRate: state.videoBitRate,
        videoCodecType: state.videoCodecType,
      },
      options?.multistream === true,
      options?.spotlight === true,
      options?.simulcast === true
    );
    const sora = connection.recvonly(state.channelId, null, connectionOptions);
    sora.metadata = parseMetadata(state.enabledMetadata, state.metadata);
    setSoraCallbacks(dispatch, getState, sora);
    try {
      await sora.connect();
      dispatch(slice.actions.setSoraInfoAlertMessage("Succeeded to connect Sora."));
    } catch (error) {
      dispatch(slice.actions.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`));
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      throw error;
    }
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
    dispatch(slice.actions.setSoraConnectionStatus("connected"));
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("connected")));
  };

// Sora との配信/視聴接続
type SendrecvOption = {
  spotlight?: boolean;
  simulcast?: boolean;
};
export const sendrecvConnectSora =
  (options?: SendrecvOption) =>
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("start-connection")));
    dispatch(slice.actions.setSoraConnectionStatus("connecting"));
    const state = getState();
    if (state.soraContents.sora) {
      await state.soraContents.sora.disconnect();
    }
    const [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
      dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      throw error;
    });
    const signalingUrlCandidates = createSignalingURL(
      state.enabledSignalingUrlCandidates,
      state.signalingUrlCandidates
    );
    dispatch(
      slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingUrlCandidates) })
    );
    const connection = Sora.connection(signalingUrlCandidates, state.debug);
    const connectionOptions = createConnectOptions(
      {
        audio: state.audio,
        audioBitRate: state.audioBitRate,
        audioCodecType: state.audioCodecType,
        clientId: state.clientId,
        dataChannelSignaling: state.dataChannelSignaling,
        enabledClientId: state.enabledClientId,
        enabledDataChannel: state.enabledDataChannel,
        e2ee: state.e2ee,
        enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
        ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
        signalingNotifyMetadata: state.signalingNotifyMetadata,
        simulcastRid: state.simulcastRid,
        spotlight: state.spotlight,
        spotlightNumber: state.spotlightNumber,
        spotlightFocusRid: state.spotlightFocusRid,
        spotlightUnfocusRid: state.spotlightUnfocusRid,
        video: state.video,
        videoBitRate: state.videoBitRate,
        videoCodecType: state.videoCodecType,
      },
      true,
      options?.spotlight === true,
      options?.simulcast === true
    );
    const sora = connection.sendrecv(state.channelId, null, connectionOptions);
    sora.metadata = parseMetadata(state.enabledMetadata, state.metadata);
    if (typeof state.googCpuOveruseDetection === "boolean") {
      sora.constraints = {
        optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
      };
    }
    setSoraCallbacks(dispatch, getState, sora);
    try {
      await sora.connect(mediaStream);
      dispatch(slice.actions.setSoraInfoAlertMessage("Succeeded to connect Sora."));
    } catch (error) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      dispatch(slice.actions.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`));
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
      throw error;
    }
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
    dispatch(slice.actions.setLocalMediaStream(mediaStream));
    dispatch(slice.actions.setFakeContentsGainNode(gainNode));
    dispatch(slice.actions.setSoraConnectionStatus("connected"));
    dispatch(slice.actions.setTimelineMessage(createSoraDemoTimelineMessage("connected")));
  };

// Sora との切断処理
export const disconnectSora =
  () =>
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
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
  async (dispatch: Dispatch, _getState: () => SoraDemoState): Promise<void> => {
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
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
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
  async (dispatch: Dispatch, _getState: () => SoraDemoState): Promise<void> => {
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
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
    const state = getState();
    if (!state.soraContents.localMediaStream || !state.soraContents.sora) {
      dispatch(slice.actions.setMicDevice(micDevice));
      return;
    }
    if (micDevice) {
      const pickedState = {
        audio: state.audio,
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
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
    const state = getState();
    if (!state.soraContents.localMediaStream || !state.soraContents.sora) {
      dispatch(slice.actions.setCameraDevice(cameraDevice));
      return;
    }
    if (cameraDevice) {
      const pickedState = {
        audio: false,
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
// component レンダリング後に画面初期状態を更新
export const setInitialParameter =
  (pageInitialParameters: Partial<SoraDemoState>) =>
  async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
    dispatch(slice.actions.resetState());
    const queryStringParameters = parseQueryString();
    setInitialState<SoraDemoState["audio"]>(
      dispatch,
      slice.actions.setAudio,
      pageInitialParameters.audio,
      queryStringParameters.audio
    );
    setInitialState<SoraDemoState["audioBitRate"]>(
      dispatch,
      slice.actions.setAudioBitRate,
      pageInitialParameters.audioBitRate,
      queryStringParameters.audioBitRate
    );
    setInitialState<SoraDemoState["audioCodecType"]>(
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
      setInitialState<SoraDemoState["audioInput"]>(
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
      setInitialState<SoraDemoState["audioOutput"]>(
        dispatch,
        slice.actions.setAudioOutput,
        pageInitialParameters.audioOutput,
        queryStringParameters.audioOutput
      );
    }
    if (
      deviceInfos.find((d) => d.kind === "videoinput" && d.deviceId === queryStringParameters.videoInput) !== undefined
    ) {
      setInitialState<SoraDemoState["videoInput"]>(
        dispatch,
        slice.actions.setVideoInput,
        pageInitialParameters.videoInput,
        queryStringParameters.videoInput
      );
    }
    setInitialState<SoraDemoState["autoGainControl"]>(
      dispatch,
      slice.actions.setAutoGainControl,
      pageInitialParameters.autoGainControl,
      queryStringParameters.autoGainControl
    );
    setInitialState<SoraDemoState["channelId"]>(
      dispatch,
      slice.actions.setChannelId,
      pageInitialParameters.channelId,
      queryStringParameters.channelId
    );
    setInitialState<SoraDemoState["displayResolution"]>(
      dispatch,
      slice.actions.setDisplayResolution,
      pageInitialParameters.displayResolution,
      queryStringParameters.displayResolution
    );
    setInitialState<SoraDemoState["e2ee"]>(
      dispatch,
      slice.actions.setE2EE,
      pageInitialParameters.e2ee,
      queryStringParameters.e2ee
    );
    setInitialState<SoraDemoState["echoCancellation"]>(
      dispatch,
      slice.actions.setEchoCancellation,
      pageInitialParameters.echoCancellation,
      queryStringParameters.echoCancellation
    );
    setInitialState<SoraDemoState["echoCancellationType"]>(
      dispatch,
      slice.actions.setEchoCancellationType,
      pageInitialParameters.echoCancellationType,
      queryStringParameters.echoCancellationType
    );
    setInitialState<SoraDemoState["mediaType"]>(
      dispatch,
      slice.actions.setMediaType,
      pageInitialParameters.mediaType,
      queryStringParameters.mediaType
    );
    setInitialState<SoraDemoState["fakeVolume"]>(
      dispatch,
      slice.actions.setFakeVolume,
      pageInitialParameters.fakeVolume,
      queryStringParameters.fakeVolume
    );
    setInitialState<SoraDemoState["frameRate"]>(
      dispatch,
      slice.actions.setFrameRate,
      pageInitialParameters.frameRate,
      queryStringParameters.frameRate
    );
    setInitialState<SoraDemoState["noiseSuppression"]>(
      dispatch,
      slice.actions.setNoiseSuppression,
      pageInitialParameters.noiseSuppression,
      queryStringParameters.noiseSuppression
    );
    setInitialState<SoraDemoState["resolution"]>(
      dispatch,
      slice.actions.setResolution,
      pageInitialParameters.resolution,
      queryStringParameters.resolution
    );
    setInitialState<SoraDemoState["showStats"]>(
      dispatch,
      slice.actions.setShowStats,
      pageInitialParameters.showStats,
      queryStringParameters.showStats
    );
    setInitialState<SoraDemoState["simulcastRid"]>(
      dispatch,
      slice.actions.setSimulcastRid,
      pageInitialParameters.simulcastRid,
      queryStringParameters.simulcastRid
    );
    setInitialState<SoraDemoState["spotlight"]>(
      dispatch,
      slice.actions.setSpotlight,
      pageInitialParameters.spotlight,
      queryStringParameters.spotlight
    );
    setInitialState<SoraDemoState["spotlightNumber"]>(
      dispatch,
      slice.actions.setSpotlightNumber,
      pageInitialParameters.spotlightNumber,
      queryStringParameters.spotlightNumber
    );
    setInitialState<SoraDemoState["spotlightFocusRid"]>(
      dispatch,
      slice.actions.setSpotlightFocusRid,
      pageInitialParameters.spotlightFocusRid,
      queryStringParameters.spotlightFocusRid
    );
    setInitialState<SoraDemoState["spotlightUnfocusRid"]>(
      dispatch,
      slice.actions.setSpotlightUnfocusRid,
      pageInitialParameters.spotlightUnfocusRid,
      queryStringParameters.spotlightUnfocusRid
    );
    setInitialState<SoraDemoState["video"]>(
      dispatch,
      slice.actions.setVideo,
      pageInitialParameters.video,
      queryStringParameters.video
    );
    setInitialState<SoraDemoState["videoBitRate"]>(
      dispatch,
      slice.actions.setVideoBitRate,
      pageInitialParameters.videoBitRate,
      queryStringParameters.videoBitRate
    );
    setInitialState<SoraDemoState["videoCodecType"]>(
      dispatch,
      slice.actions.setVideoCodecType,
      pageInitialParameters.videoCodecType,
      queryStringParameters.videoCodecType
    );
    setInitialState<SoraDemoState["debug"]>(
      dispatch,
      slice.actions.setDebug,
      pageInitialParameters.debug,
      queryStringParameters.debug
    );
    setInitialState<SoraDemoState["mute"]>(
      dispatch,
      slice.actions.setMute,
      pageInitialParameters.mute,
      queryStringParameters.mute
    );
    setInitialState<SoraDemoState["dataChannelSignaling"]>(
      dispatch,
      slice.actions.setDataChannelSignaling,
      pageInitialParameters.dataChannelSignaling,
      queryStringParameters.dataChannelSignaling
    );
    setInitialState<SoraDemoState["ignoreDisconnectWebSocket"]>(
      dispatch,
      slice.actions.setIgnoreDisconnectWebSocket,
      pageInitialParameters.ignoreDisconnectWebSocket,
      queryStringParameters.ignoreDisconnectWebSocket
    );
    setInitialState<SoraDemoState["micDevice"]>(
      dispatch,
      slice.actions.setMicDevice,
      pageInitialParameters.micDevice,
      queryStringParameters.micDevice
    );
    setInitialState<SoraDemoState["cameraDevice"]>(
      dispatch,
      slice.actions.setCameraDevice,
      pageInitialParameters.cameraDevice,
      queryStringParameters.cameraDevice
    );
    setInitialState<SoraDemoState["audioTrack"]>(
      dispatch,
      slice.actions.setAudioTrack,
      pageInitialParameters.audioTrack,
      queryStringParameters.audioTrack
    );
    setInitialState<SoraDemoState["videoTrack"]>(
      dispatch,
      slice.actions.setVideoTrack,
      pageInitialParameters.videoTrack,
      queryStringParameters.videoTrack
    );
    // googCpuOveruseDetection は query string からのみ受け付ける
    if (queryStringParameters.googCpuOveruseDetection !== undefined) {
      dispatch(slice.actions.setGoogCpuOveruseDetection(queryStringParameters.googCpuOveruseDetection));
    }
    // clientId が存在した場合は enabledClientId と clientId 両方をセットする
    if (queryStringParameters.clientId !== undefined) {
      dispatch(slice.actions.setEnabledClientId(true));
      setInitialState<SoraDemoState["clientId"]>(
        dispatch,
        slice.actions.setClientId,
        pageInitialParameters.clientId,
        queryStringParameters.clientId
      );
    }
    // metadata が存在した場合は enabledMetadata と metadata 両方をセットする
    if (queryStringParameters.metadata !== undefined) {
      dispatch(slice.actions.setEnabledMetadata(true));
      setInitialState<SoraDemoState["metadata"]>(
        dispatch,
        slice.actions.setMetadata,
        pageInitialParameters.metadata,
        queryStringParameters.metadata
      );
    }
    // signalingNotifyMetadata が存在した場合は enabledSignalingNotifyMetadata と signalingNotifyMetadata 両方をセットする
    if (queryStringParameters.signalingNotifyMetadata !== undefined) {
      dispatch(slice.actions.setEnabledSignalingNotifyMetadata(true));
      setInitialState<SoraDemoState["signalingNotifyMetadata"]>(
        dispatch,
        slice.actions.setSignalingNotifyMetadata,
        pageInitialParameters.signalingNotifyMetadata,
        queryStringParameters.signalingNotifyMetadata
      );
    }
    // signalingUrlCandidates が存在した場合は enabledSignalingUrlCandidates と signalingUrlCandidates 両方をセットする
    if (queryStringParameters.signalingUrlCandidates !== undefined) {
      dispatch(slice.actions.setEnabledSignalingUrlCandidates(true));
      setInitialState<SoraDemoState["signalingUrlCandidates"]>(
        dispatch,
        slice.actions.setSignalingUrlCandidates,
        pageInitialParameters.signalingUrlCandidates,
        queryStringParameters.signalingUrlCandidates
      );
    }

    // dataChannelSignaling または ignoreDisconnectWebSocket が存在した場合は enabledDataChannel をセットする
    if (
      queryStringParameters.dataChannelSignaling !== undefined ||
      queryStringParameters.ignoreDisconnectWebSocket !== undefined
    ) {
      dispatch(slice.actions.setEnabledDataChannel(true));
    }
    dispatch(slice.actions.setInitialFakeContents());
    // e2ee が有効な場合は e2ee 初期化処理をする
    const { e2ee } = getState();
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
  };

export const {
  deleteAlertMessage,
  setAPIErrorAlertMessage,
  setAPIInfoAlertMessage,
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAudioInput,
  setAudioOutput,
  setAudioTrack,
  setAutoGainControl,
  setChannelId,
  setClientId,
  setDataChannelSignaling,
  setDebug,
  setDebugType,
  setDisplayResolution,
  setEchoCancellation,
  setEchoCancellationType,
  setEnabledClientId,
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
  setSignalingNotifyMetadata,
  setSignalingUrlCandidates,
  setSimulcastRid,
  setSora,
  setSoraErrorAlertMessage,
  setSoraInfoAlertMessage,
  setSpotlight,
  setSpotlightFocusRid,
  setSpotlightNumber,
  setSpotlightUnfocusRid,
  setVideo,
  setVideoBitRate,
  setVideoCodecType,
  setVideoInput,
  setVideoTrack,
} = slice.actions;

export default slice.reducer;
