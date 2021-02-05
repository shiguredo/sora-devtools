import { ActionCreatorWithPayload, createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import Sora, { ConnectionOptions, ConnectionPublisher, ConnectionSubscriber } from "sora-js-sdk";

import {
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  DISPLAY_RESOLUTIONS,
  ECHO_CANCELLATION_TYPES,
  FRAME_RATES,
  MEDIA_TYPES,
  RESOLUTIONS,
  SIMULCAST_RID,
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
  Json,
  LogMessage,
  NotifyMessage,
  parseMetadata,
  parseQueryString,
  parseSpotlight,
  PushMessage,
  SoraDemoMediaDevices,
  SoraNotifyMessage,
  SoraPushMessage,
} from "@/utils";

import { version as SORA_DEMO_VERSION } from "../package.json";

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
  debug: boolean;
  debugType: DebugType;
  displayResolution: typeof DISPLAY_RESOLUTIONS[number];
  echoCancellation: boolean;
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  e2ee: boolean;
  enabledCamera: boolean;
  enabledClientId: boolean;
  enabledMetadata: boolean;
  enabledMic: boolean;
  enabledSignalingNotifyMetadata: boolean;
  fakeContents: {
    worker: Worker | null;
    colorCode: number;
    gainNode: GainNode | null;
  };
  fakeVolume: string;
  frameRate: typeof FRAME_RATES[number];
  soraContents: {
    sora: ConnectionPublisher | ConnectionSubscriber | null;
    connectionId: string | null;
    clientId: string | null;
    localMediaStream: MediaStream | null;
    remoteMediaStreams: MediaStream[];
    statsReport: RTCStats[];
  };
  logMessages: LogMessage[];
  mediaType: typeof MEDIA_TYPES[number];
  metadata: string;
  mute: boolean;
  noiseSuppression: boolean;
  notifyMessages: NotifyMessage[];
  pushMessages: PushMessage[];
  resolution: typeof RESOLUTIONS[number];
  signalingNotifyMetadata: string;
  simulcastRid: typeof SIMULCAST_RID[number];
  spotlightConnectionIds: {
    [key: string]: string;
  };
  focusedSpotlightConnectionIds: {
    [key: string]: boolean;
  };
  spotlight: typeof SPOTLIGHTS[number];
  spotlightNumber: typeof SPOTLIGHT_NUMBERS[number];
  video: boolean;
  videoBitRate: typeof VIDEO_BIT_RATES[number];
  videoCodecType: typeof VIDEO_CODEC_TYPES[number];
  videoInput: string;
  videoInputDevices: MediaDeviceInfo[];
  version: string;
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
  debug: false,
  debugType: "log",
  displayResolution: "",
  e2ee: false,
  echoCancellation: true,
  echoCancellationType: "",
  enabledCamera: false,
  enabledClientId: false,
  enabledMetadata: false,
  enabledMic: false,
  enabledSignalingNotifyMetadata: false,
  fakeVolume: "0",
  fakeContents: {
    worker: null,
    colorCode: 0,
    gainNode: null,
  },
  frameRate: "",
  soraContents: {
    sora: null,
    connectionId: null,
    clientId: null,
    localMediaStream: null,
    remoteMediaStreams: [],
    statsReport: [],
  },
  logMessages: [],
  mediaType: "getUserMedia",
  metadata: "",
  mute: false,
  noiseSuppression: true,
  notifyMessages: [],
  pushMessages: [],
  resolution: "",
  signalingNotifyMetadata: "",
  simulcastRid: "",
  spotlight: "2",
  spotlightNumber: "",
  spotlightConnectionIds: {},
  focusedSpotlightConnectionIds: {},
  video: true,
  videoBitRate: "",
  videoCodecType: "",
  videoInput: "",
  videoInputDevices: [],
  version: SORA_DEMO_VERSION,
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
    setEnabledMetadata: (state, action: PayloadAction<boolean>) => {
      state.enabledMetadata = action.payload;
    },
    setEnabledSignalingNotifyMetadata: (state, action: PayloadAction<boolean>) => {
      state.enabledSignalingNotifyMetadata = action.payload;
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
    setSimulcastRid: (state, action: PayloadAction<typeof SIMULCAST_RID[number]>) => {
      state.simulcastRid = action.payload;
    },
    setSpotlight: (state, action: PayloadAction<typeof SPOTLIGHTS[number]>) => {
      state.spotlight = action.payload;
    },
    setSpotlightNumber: (state, action: PayloadAction<typeof SPOTLIGHT_NUMBERS[number]>) => {
      state.spotlightNumber = action.payload;
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
    setLocalMediaStream: (state, action: PayloadAction<MediaStream | null>) => {
      if (state.soraContents.localMediaStream) {
        state.soraContents.localMediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      state.soraContents.localMediaStream = action.payload;
      if (action.payload) {
        state.enabledMic = action.payload.getAudioTracks().some((track) => track.enabled);
        state.enabledCamera = action.payload.getVideoTracks().some((track) => track.enabled);
      } else {
        state.enabledMic = false;
        state.enabledCamera = false;
      }
    },
    setRemoteMediaStream: (state, action: PayloadAction<MediaStream>) => {
      state.soraContents.remoteMediaStreams.push(action.payload);
    },
    setStatsReport: (state, action: PayloadAction<RTCStats[]>) => {
      state.soraContents.statsReport = action.payload;
    },
    removeRemoteMediaStream: (state, action: PayloadAction<string>) => {
      const remoteMediaStreams = state.soraContents.remoteMediaStreams.filter((stream) => stream.id !== action.payload);
      state.soraContents.remoteMediaStreams = remoteMediaStreams;
    },
    removeAllRemoteMediaStreams: (state) => {
      state.soraContents.remoteMediaStreams = [];
    },
    setEnabledMic: (state, action: PayloadAction<boolean>) => {
      state.enabledMic = action.payload;
    },
    setEnabledCamera: (state, action: PayloadAction<boolean>) => {
      state.enabledCamera = action.payload;
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
    setSpotlightConnectionIds: (state, action: PayloadAction<{ spotlightId: string; connectionId: string }>) => {
      // Spotlight 有効時に streamID(spotligId) と映像の配信者ID(connectionId) のマッピングを保存
      const spotlightConnectionIds = Object.assign(state.spotlightConnectionIds, {
        [action.payload.spotlightId]: action.payload.connectionId,
      });
      state.spotlightConnectionIds = spotlightConnectionIds;
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
async function createMediaStream(dispatch: Dispatch, state: SoraDemoState): Promise<[MediaStream, GainNode | null]> {
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  if (state.mediaType === "getDisplayMedia") {
    const constraints = {
      video: true,
    };
    dispatch(slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify(constraints) }));
    return [await (navigator.mediaDevices as SoraDemoMediaDevices).getDisplayMedia(constraints), null];
  }
  if (state.mediaType === "fakeMedia" && state.fakeContents.worker) {
    const constraints = createFakeMediaConstraints({
      audio: state.audio,
      video: state.video,
      frameRate: state.frameRate,
      resolution: state.resolution,
      volume: state.fakeVolume,
    });
    dispatch(slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify(constraints) }));
    const { canvas, stream, gainNode } = createFakeMediaStream(constraints);
    state.fakeContents.worker.onmessage = (event) => {
      const data = event.data;
      if (data.type !== "update") {
        return;
      }
      drawFakeCanvas(canvas, state.fakeContents.colorCode, constraints.fontSize, data.counter.toString());
    };
    state.fakeContents.worker.postMessage({ type: "start", interval: 1000 / constraints.frameRate });
    return [stream, gainNode];
  }
  const mediaStream = new MediaStream();
  const audioConstraints = createAudioConstraints({
    audio: state.audio,
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
    const audioMediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
    mediaStream.addTrack(audioMediaStream.getAudioTracks()[0]);
  }
  const videoConstraints = createVideoConstraints({
    video: state.video,
    frameRate: state.frameRate,
    resolution: state.resolution,
    videoInput: state.videoInput,
  });
  if (videoConstraints) {
    dispatch(
      slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify({ video: videoConstraints }) })
    );
    const videoMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
    mediaStream.addTrack(videoMediaStream.getVideoTracks()[0]);
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
  sora.on("notify", (message: SoraNotifyMessage) => {
    if (
      message.event_type === "spotlight.changed" &&
      typeof message.spotlight_id === "string" &&
      typeof message.connection_id === "string"
    ) {
      // Spotlight legacy 有効時に stream と映像の配信者の connection_id のマッピングが送られてくるため表示用に保存
      dispatch(
        slice.actions.setSpotlightConnectionIds({
          spotlightId: message.spotlight_id,
          connectionId: message.connection_id,
        })
      );
    }
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
      })
    );
  });
  sora.on("push", (message: SoraPushMessage) => {
    dispatch(
      slice.actions.setPushMessages({
        timestamp: new Date().getTime(),
        message: message,
      })
    );
  });
  sora.on("track", (event: RTCTrackEvent) => {
    const { soraContents } = getState();
    const mediaStream = soraContents.remoteMediaStreams.find((stream) => stream.id === event.streams[0].id);
    if (!mediaStream) {
      dispatch(slice.actions.setRemoteMediaStream(event.streams[0]));
    }
  });
  sora.on("removetrack", (event: MediaStreamTrackEvent) => {
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
  sora.on("disconnect", () => {
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
    | "enabledClientId"
    | "e2ee"
    | "enabledSignalingNotifyMetadata"
    | "signalingNotifyMetadata"
    | "simulcastRid"
    | "spotlight"
    | "spotlightNumber"
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
  // 新/旧 spotlight 互換性のため parsedSpotlight は boolean | number になる
  // parsedSpotlight が number の場合は旧 spotlight 扱いになる
  // parsedSpotlight が true の場合は新 spotlight 扱いになるので spotlightNumber をセットする
  const parsedSpotlight = parseSpotlight(pickedState.spotlight);
  if (spotlight && parsedSpotlight) {
    connectionOptions.spotlight = parsedSpotlight;
    const parsedSpotlightNumber = parseInt(pickedState.spotlightNumber);
    if (parsedSpotlight === true && parsedSpotlightNumber) {
      connectionOptions.spotlightNumber = parsedSpotlightNumber;
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
  return connectionOptions;
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
export const sendonlyConnectSora = (options?: SendonlyOption) => async (
  dispatch: Dispatch,
  getState: () => SoraDemoState
): Promise<void> => {
  const state = getState();
  if (state.soraContents.sora) {
    await state.soraContents.sora.disconnect();
  }
  const [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
    dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
    throw error;
  });
  const signalingURL = createSignalingURL();
  dispatch(slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingURL) }));
  const connection = Sora.connection(signalingURL, state.debug);
  const connectionOptions = createConnectOptions(
    {
      audio: state.audio,
      audioBitRate: state.audioBitRate,
      audioCodecType: state.audioCodecType,
      clientId: state.clientId,
      enabledClientId: state.enabledClientId,
      e2ee: state.e2ee,
      enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
      signalingNotifyMetadata: state.signalingNotifyMetadata,
      simulcastRid: "",
      spotlight: state.spotlight,
      spotlightNumber: state.spotlightNumber,
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
    dispatch(slice.actions.setSoraInfoAlertMessage("Successed to connect Sora."));
  } catch (error) {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
    dispatch(slice.actions.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`));
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
};

// Sora との視聴のみ接続
type RecvonlyOption = {
  multistream?: boolean;
  spotlight?: boolean;
  simulcast?: boolean;
};
export const recvonlyConnectSora = (options?: RecvonlyOption) => async (
  dispatch: Dispatch,
  getState: () => SoraDemoState
): Promise<void> => {
  const state = getState();
  if (state.soraContents.sora) {
    await state.soraContents.sora.disconnect();
  }
  const signalingURL = createSignalingURL();
  dispatch(slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingURL) }));
  const connection = Sora.connection(signalingURL, state.debug);
  const connectionOptions = createConnectOptions(
    {
      audio: state.audio,
      audioBitRate: state.audioBitRate,
      audioCodecType: state.audioCodecType,
      clientId: state.clientId,
      enabledClientId: state.enabledClientId,
      e2ee: state.e2ee,
      enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
      signalingNotifyMetadata: state.signalingNotifyMetadata,
      simulcastRid: state.simulcastRid,
      spotlight: state.spotlight,
      spotlightNumber: state.spotlightNumber,
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
    dispatch(slice.actions.setSoraInfoAlertMessage("Successed to connect Sora."));
  } catch (error) {
    dispatch(slice.actions.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`));
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
};

// Sora との配信/視聴接続
type SendrecvOption = {
  spotlight?: boolean;
  simulcast?: boolean;
};
export const sendrecvConnectSora = (options?: SendrecvOption) => async (
  dispatch: Dispatch,
  getState: () => SoraDemoState
): Promise<void> => {
  const state = getState();
  if (state.soraContents.sora) {
    await state.soraContents.sora.disconnect();
  }
  const [mediaStream, gainNode] = await createMediaStream(dispatch, state).catch((error) => {
    dispatch(slice.actions.setSoraErrorAlertMessage(error.toString()));
    throw error;
  });
  const signalingURL = createSignalingURL();
  dispatch(slice.actions.setLogMessages({ title: "SIGNALING_URL", description: JSON.stringify(signalingURL) }));
  const connection = Sora.connection(signalingURL, state.debug);
  const connectionOptions = createConnectOptions(
    {
      audio: state.audio,
      audioBitRate: state.audioBitRate,
      audioCodecType: state.audioCodecType,
      clientId: state.clientId,
      enabledClientId: state.enabledClientId,
      e2ee: state.e2ee,
      enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
      signalingNotifyMetadata: state.signalingNotifyMetadata,
      simulcastRid: state.simulcastRid,
      spotlight: state.spotlight,
      spotlightNumber: state.spotlightNumber,
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
    dispatch(slice.actions.setSoraInfoAlertMessage("Successed to connect Sora."));
  } catch (error) {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
    dispatch(slice.actions.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`));
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
};

// Sora との切断処理
export const disconnectSora = () => async (_: Dispatch, getState: () => SoraDemoState): Promise<void> => {
  const { soraContents } = getState();
  if (soraContents.sora) {
    await soraContents.sora.disconnect();
  }
};

// デバイス一覧を取得
export const setMediaDevices = () => async (dispatch: Dispatch, _getState: () => SoraDemoState): Promise<void> => {
  const deviceInfos = await navigator.mediaDevices.enumerateDevices();
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
export const updateMediaStream = () => async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
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

export const setE2EE = (e2ee: boolean) => async (dispatch: Dispatch, _getState: () => SoraDemoState): Promise<void> => {
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
export const setInitialParameter = (pageInitialParameters: Partial<SoraDemoState>) => async (
  dispatch: Dispatch,
  getState: () => SoraDemoState
): Promise<void> => {
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
  const deviceInfos = await navigator.mediaDevices.enumerateDevices();
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
    deviceInfos.find((d) => d.kind === "audiooutput" && d.deviceId === queryStringParameters.audioOutput) !== undefined
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

export const toggleEnabledMic = () => async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
  const {
    audio,
    audioInput,
    autoGainControl,
    enabledMic,
    echoCancellation,
    echoCancellationType,
    noiseSuppression,
    soraContents,
  } = getState();
  if (enabledMic) {
    if (soraContents.localMediaStream) {
      Sora.helpers.stopAudioMediaDevice(soraContents.localMediaStream);
    }
  } else {
    if (soraContents.localMediaStream && soraContents.sora?.pc) {
      const audioConstraints = createAudioConstraints({
        audio: audio,
        autoGainControl: autoGainControl,
        noiseSuppression: noiseSuppression,
        echoCancellation: echoCancellation,
        echoCancellationType: echoCancellationType,
        audioInput: audioInput,
      });
      await Sora.helpers.startAudioMediaDevice(soraContents.localMediaStream, soraContents.sora.pc, audioConstraints);
    }
  }
  dispatch(slice.actions.setEnabledMic(!enabledMic));
};

export const toggleEnabledCamera = () => async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
  const { enabledCamera, frameRate, resolution, soraContents, video, videoInput } = getState();
  if (enabledCamera) {
    if (soraContents.localMediaStream) {
      Sora.helpers.stopVideoMediaDevice(soraContents.localMediaStream);
    }
  } else {
    if (soraContents.localMediaStream && soraContents.sora?.pc) {
      const videoConstraints = createVideoConstraints({
        video: video,
        frameRate: frameRate,
        resolution: resolution,
        videoInput: videoInput,
      });
      await Sora.helpers.startVideoMediaDevice(soraContents.localMediaStream, soraContents.sora.pc, videoConstraints);
    }
  }
  dispatch(slice.actions.setEnabledCamera(!enabledCamera));
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
  setAutoGainControl,
  setClientId,
  setChannelId,
  setDebug,
  setDebugType,
  setDisplayResolution,
  setEchoCancellation,
  setEchoCancellationType,
  setEnabledClientId,
  setEnabledMetadata,
  setEnabledSignalingNotifyMetadata,
  setFakeVolume,
  setFrameRate,
  setLocalMediaStream,
  setLogMessages,
  setMediaType,
  setMetadata,
  setNoiseSuppression,
  setNotifyMessages,
  setResolution,
  setSignalingNotifyMetadata,
  setSimulcastRid,
  setSora,
  setSoraErrorAlertMessage,
  setSoraInfoAlertMessage,
  setSpotlight,
  setSpotlightNumber,
  setVideo,
  setVideoBitRate,
  setVideoCodecType,
  setVideoInput,
} = slice.actions;

export default slice.reducer;
