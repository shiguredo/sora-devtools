import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import Sora, { ConnectionOptions, ConnectionPublisher, ConnectionSubscriber } from "sora-js-sdk";

import {
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  ECHO_CANCELLATION_TYPES,
  FRAME_RATES,
  RESOLUTIONS,
  SIMULCAST_QUARITY,
  SPOTLIGHT_NUMBERS,
  SPOTLIGHTS,
  VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
  WORKER_SCRIPT,
} from "@/constants";
import {
  createAudioConstraints,
  createFakeMediaConstraints,
  createFakeMediaStream,
  createSignalingURL,
  createVideoConstraints,
  drawFakeCanvas,
  parseQueryString,
  parseSpotlight,
  SoraDemoMediaDevices,
} from "@/utils";

type SoraLogMessage = {
  timestamp: number;
  title: string;
  description: string;
};

type DebugType = "log" | "notify" | "stats";

type SoraNotifyMessage = {
  type: string;
  event_type: string;
  timestamp: number;
  [x: string]: unknown;
};

export type SoraDemoState = {
  audio: boolean;
  audioBitRate: typeof AUDIO_BIT_RATES[number];
  audioCodecType: typeof AUDIO_CODEC_TYPES[number];
  audioInput: string;
  audioInputDevices: MediaDeviceInfo[];
  audioOutput: string;
  audioOutputDevices: MediaDeviceInfo[];
  autoGainControl: boolean;
  channelId: string;
  cpuOveruseDetection: boolean;
  debug: boolean;
  debugType: DebugType;
  echoCancellation: boolean;
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  enabledCamera: boolean;
  enabledMic: boolean;
  errorMessage: string | null;
  fake: boolean;
  fakeContents: {
    worker: Worker | null;
    colorCode: number;
    gainNode: GainNode | null;
  };
  fakeVolume: string;
  frameRate: typeof FRAME_RATES[number];
  getDisplayMedia: boolean;
  immutable: {
    sora: ConnectionPublisher | ConnectionSubscriber | null;
    localMediaStream: MediaStream | null;
    remoteMediaStreams: MediaStream[];
  };
  logMessages: SoraLogMessage[];
  mute: boolean;
  noiseSuppression: boolean;
  notifyMessages: SoraNotifyMessage[];
  resolution: typeof RESOLUTIONS[number];
  simulcastQuality: typeof SIMULCAST_QUARITY[number];
  spotlightConnectionIds: {
    [key: string]: string;
  };
  spotlight: typeof SPOTLIGHTS[number];
  spotlightNumber: typeof SPOTLIGHT_NUMBERS[number];
  video: boolean;
  videoBitRate: typeof VIDEO_BIT_RATES[number];
  videoCodecType: typeof VIDEO_CODEC_TYPES[number];
  videoInput: string;
  videoInputDevices: MediaDeviceInfo[];
};

const initialState: SoraDemoState = {
  audio: true,
  audioBitRate: "",
  audioCodecType: "OPUS",
  audioInput: "",
  audioInputDevices: [],
  audioOutput: "",
  audioOutputDevices: [],
  autoGainControl: true,
  channelId: "sora",
  cpuOveruseDetection: false,
  debug: false,
  debugType: "log",
  echoCancellation: true,
  echoCancellationType: "",
  enabledCamera: false,
  enabledMic: false,
  errorMessage: null,
  fake: false,
  fakeVolume: "0",
  fakeContents: {
    worker: null,
    colorCode: 0,
    gainNode: null,
  },
  frameRate: "",
  getDisplayMedia: false,
  immutable: {
    sora: null,
    localMediaStream: null,
    remoteMediaStreams: [],
  },
  logMessages: [],
  mute: false,
  noiseSuppression: true,
  notifyMessages: [],
  resolution: "",
  simulcastQuality: "low",
  spotlight: "2",
  spotlightNumber: "3",
  spotlightConnectionIds: {},
  video: true,
  videoBitRate: "500",
  videoCodecType: "VP9",
  videoInput: "",
  videoInputDevices: [],
};

const slice = createSlice({
  name: "soraDemo",
  initialState,
  reducers: {
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
    setChannelId: (state, action: PayloadAction<string>) => {
      state.channelId = action.payload;
    },
    setCpuOveruseDetection: (state, action: PayloadAction<boolean>) => {
      state.cpuOveruseDetection = action.payload;
    },
    setEchoCancellation: (state, action: PayloadAction<boolean>) => {
      state.echoCancellation = action.payload;
    },
    setEchoCancellationType: (state, action: PayloadAction<typeof ECHO_CANCELLATION_TYPES[number]>) => {
      state.echoCancellationType = action.payload;
    },
    setFake: (state, action: PayloadAction<boolean>) => {
      state.fake = action.payload;
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
      state.fakeContents.colorCode = Math.floor(Math.random() * 0xffffff);
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
    setGetDisplayMedia: (state, action: PayloadAction<boolean>) => {
      state.getDisplayMedia = action.payload;
    },
    setResolution: (state, action: PayloadAction<typeof RESOLUTIONS[number]>) => {
      state.resolution = action.payload;
    },
    setSimulcastQuality: (state, action: PayloadAction<typeof SIMULCAST_QUARITY[number]>) => {
      state.simulcastQuality = action.payload;
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
      state.immutable.sora = <any>action.payload;
    },
    setLocalMediaStream: (state, action: PayloadAction<MediaStream | null>) => {
      if (state.immutable.localMediaStream) {
        state.immutable.localMediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      state.immutable.localMediaStream = action.payload;
      if (action.payload) {
        state.enabledMic = action.payload.getAudioTracks().some((track) => track.enabled);
        state.enabledCamera = action.payload.getVideoTracks().some((track) => track.enabled);
      } else {
        state.enabledMic = false;
        state.enabledCamera = false;
      }
    },
    setRemoteMediaStream: (state, action: PayloadAction<MediaStream>) => {
      state.immutable.remoteMediaStreams.push(action.payload);
    },
    removeRemoteMediaStream: (state, action: PayloadAction<string>) => {
      const remoteMediaStreams = state.immutable.remoteMediaStreams.filter((stream) => stream.id !== action.payload);
      state.immutable.remoteMediaStreams = remoteMediaStreams;
    },
    removeAllRemoteMediaStreams: (state) => {
      state.immutable.remoteMediaStreams = [];
    },
    toggleEnabledMic: (state) => {
      state.enabledMic = !state.enabledMic;
      if (state.immutable.localMediaStream) {
        state.immutable.localMediaStream.getAudioTracks().forEach((track) => {
          track.enabled = state.enabledMic;
        });
      }
    },
    toggleEnabledCamera: (state) => {
      state.enabledCamera = !state.enabledCamera;
      if (state.immutable.localMediaStream) {
        state.immutable.localMediaStream.getVideoTracks().forEach((track) => {
          track.enabled = state.enabledCamera;
        });
      }
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
    setErrorMessage: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
    },
    setDebug: (state, action: PayloadAction<boolean>) => {
      state.debug = action.payload;
    },
    setDebugType: (state, action: PayloadAction<DebugType>) => {
      state.debugType = action.payload;
    },
    setLogMessages: (state, action: PayloadAction<SoraLogMessage>) => {
      state.logMessages.push(action.payload);
    },
    setNotifyMessages: (state, action: PayloadAction<SoraNotifyMessage>) => {
      state.notifyMessages.push(action.payload);
    },
    setSpotlightConnectionIds: (state, action: PayloadAction<{ spotlightId: string; connectionId: string }>) => {
      const spotlightConnectionIds = Object.assign(state.spotlightConnectionIds, {
        [action.payload.spotlightId]: action.payload.connectionId,
      });
      state.spotlightConnectionIds = spotlightConnectionIds;
    },
  },
});

async function createMediaStream(state: SoraDemoState): Promise<[MediaStream, GainNode | null]> {
  if (state.getDisplayMedia) {
    return [await (navigator.mediaDevices as SoraDemoMediaDevices).getDisplayMedia({ video: true }), null];
  }
  if (state.fake && state.fakeContents.worker) {
    const constraints = createFakeMediaConstraints({
      audio: state.audio,
      video: state.video,
      frameRate: state.frameRate,
      resolution: state.resolution,
      volume: state.fakeVolume,
    });
    const { canvas, stream, gainNode } = createFakeMediaStream(constraints);
    state.fakeContents.worker.onmessage = (event) => {
      const json = JSON.parse(event.data);
      if (json.type !== "update") return;
      drawFakeCanvas(canvas, state.fakeContents.colorCode, constraints.fontSize, json.counter.toString());
    };
    state.fakeContents.worker.postMessage(JSON.stringify({ type: "start", interval: 1000 / constraints.frameRate }));
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
    const videoMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
    mediaStream.addTrack(videoMediaStream.getVideoTracks()[0]);
  }
  return [mediaStream, null];
}

function setSoraCallbacks(
  dispatch: Dispatch,
  getState: () => SoraDemoState,
  sora: ConnectionPublisher | ConnectionSubscriber
): void {
  sora.on("log", (title: string, description: boolean | number | string | Record<string, unknown>) => {
    dispatch(
      slice.actions.setLogMessages({
        title: title,
        description: JSON.stringify(description, null, 2),
        timestamp: new Date().getTime(),
      })
    );
  });
  sora.on("notify", (message: SoraNotifyMessage) => {
    if (
      message.event_type === "spotlight.changed" &&
      typeof message.spotlight_id === "string" &&
      typeof message.connection_id === "string"
    ) {
      dispatch(
        slice.actions.setSpotlightConnectionIds({
          spotlightId: message.spotlight_id,
          connectionId: message.connection_id,
        })
      );
    }
    message.timestamp = new Date().getTime();
    dispatch(slice.actions.setNotifyMessages(message));
  });
  sora.on("track", (event: RTCTrackEvent) => {
    const { immutable } = getState();
    const mediaStream = immutable.remoteMediaStreams.find((stream) => stream.id === event.streams[0].id);
    if (!mediaStream) {
      dispatch(slice.actions.setRemoteMediaStream(event.streams[0]));
    }
  });
  sora.on("removetrack", (event: MediaStreamTrackEvent) => {
    const { immutable } = getState();
    const mediaStream = immutable.remoteMediaStreams.find((stream) => {
      if (event && event.target) {
        return stream.id === (event.target as MediaStream).id;
      }
      return false;
    });
    if (mediaStream) {
      dispatch(slice.actions.removeRemoteMediaStream((event.target as MediaStream).id));
    }
  });
  sora.on("disconnect", () => {
    const { fakeContents, immutable } = getState();
    const { localMediaStream, remoteMediaStreams } = immutable;

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
      fakeContents.worker.postMessage(JSON.stringify({ type: "stop" }));
    }
    dispatch(slice.actions.setSora(null));
    dispatch(slice.actions.setLocalMediaStream(null));
    dispatch(slice.actions.removeAllRemoteMediaStreams());
  });
}

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
  if (state.immutable.sora) {
    await state.immutable.sora.disconnect();
  }
  const [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
    dispatch(slice.actions.setErrorMessage(error.toString()));
    throw error;
  });
  const signalingURL = createSignalingURL();
  const connection = Sora.connection(signalingURL, state.debug);
  const connectionOptions: ConnectionOptions = {
    audio: state.audio,
    audioCodecType: state.audioCodecType || undefined,
    audioBitRate: parseInt(state.audioBitRate, 10) || undefined,
    video: state.video,
    videoCodecType: state.videoCodecType || undefined,
    videoBitRate: parseInt(state.videoBitRate, 10) || undefined,
    multistream: options?.multistream === true ? true : false,
    spotlight: options?.spotlight ? parseSpotlight(state.spotlight) : undefined,
    spotlightNumber: options?.spotlight ? parseInt(state.spotlightNumber) : undefined,
    simulcast: options?.simulcast === true ? true : false,
  };
  const sora = connection.sendonly(state.channelId, null, connectionOptions);
  if (!state.cpuOveruseDetection) {
    sora.constraints = {
      optional: [{ googCpuOveruseDetection: false }],
    };
  }
  setSoraCallbacks(dispatch, getState, sora);
  try {
    await sora.connect(mediaStream);
  } catch (error) {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
    dispatch(slice.actions.setErrorMessage("Failed to connect Sora"));
    throw error;
  }
  dispatch(slice.actions.setSora(sora));
  dispatch(slice.actions.setLocalMediaStream(mediaStream));
  dispatch(slice.actions.setFakeContentsGainNode(gainNode));
  dispatch(slice.actions.setErrorMessage(null));
};

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
  if (state.immutable.sora) {
    await state.immutable.sora.disconnect();
  }
  const signalingURL = createSignalingURL();
  const connection = Sora.connection(signalingURL, state.debug);
  const connectionOptions: ConnectionOptions = {
    audio: state.audio,
    audioCodecType: state.audioCodecType || undefined,
    audioBitRate: parseInt(state.audioBitRate, 10) || undefined,
    video: state.video,
    videoCodecType: state.videoCodecType || undefined,
    videoBitRate: parseInt(state.videoBitRate, 10) || undefined,
    multistream: options?.multistream === true ? true : false,
    spotlight: options?.spotlight ? parseSpotlight(state.spotlight) : undefined,
    spotlightNumber: options?.spotlight ? parseInt(state.spotlightNumber) : undefined,
    simulcast: options?.simulcast === true ? true : false,
    simulcastQuality: options?.simulcast === true && state.simulcastQuality !== "" ? state.simulcastQuality : undefined,
  };
  const sora = connection.recvonly(state.channelId, null, connectionOptions);
  setSoraCallbacks(dispatch, getState, sora);
  try {
    await sora.connect();
  } catch (error) {
    dispatch(slice.actions.setErrorMessage("Failed to connect Sora"));
    throw error;
  }
  dispatch(slice.actions.setSora(sora));
  dispatch(slice.actions.setErrorMessage(null));
};

type SendrecvOption = {
  spotlight?: boolean;
  simulcast?: boolean;
};
export const sendrecvConnectSora = (options?: SendrecvOption) => async (
  dispatch: Dispatch,
  getState: () => SoraDemoState
): Promise<void> => {
  const state = getState();
  if (state.immutable.sora) {
    await state.immutable.sora.disconnect();
  }
  const [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
    dispatch(slice.actions.setErrorMessage(error.toString()));
    throw error;
  });
  const signalingURL = createSignalingURL();
  const connection = Sora.connection(signalingURL, state.debug);
  const connectionOptions: ConnectionOptions = {
    audio: state.audio,
    audioCodecType: state.audioCodecType || undefined,
    audioBitRate: parseInt(state.audioBitRate, 10) || undefined,
    video: state.video,
    videoCodecType: state.videoCodecType || undefined,
    videoBitRate: parseInt(state.videoBitRate, 10) || undefined,
    multistream: true,
    spotlight: options?.spotlight ? parseSpotlight(state.spotlight) : undefined,
    spotlightNumber: options?.spotlight ? parseInt(state.spotlightNumber) : undefined,
    simulcast: options?.simulcast === true ? true : false,
    simulcastQuality: options?.simulcast === true && state.simulcastQuality !== "" ? state.simulcastQuality : undefined,
  };
  const sora = connection.sendrecv(state.channelId, null, connectionOptions);
  if (!state.cpuOveruseDetection) {
    sora.constraints = {
      optional: [{ googCpuOveruseDetection: false }],
    };
  }
  setSoraCallbacks(dispatch, getState, sora);
  try {
    await sora.connect(mediaStream);
  } catch (error) {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
    dispatch(slice.actions.setErrorMessage("Failed to connect Sora"));
    throw error;
  }
  dispatch(slice.actions.setSora(sora));
  dispatch(slice.actions.setLocalMediaStream(mediaStream));
  dispatch(slice.actions.setFakeContentsGainNode(gainNode));
  dispatch(slice.actions.setErrorMessage(null));
};

export const disconnectSora = () => async (_: Dispatch, getState: () => SoraDemoState): Promise<void> => {
  const { immutable } = getState();
  if (immutable.sora) {
    await immutable.sora.disconnect();
  }
};

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

export const updateMediaStream = () => async (dispatch: Dispatch, getState: () => SoraDemoState): Promise<void> => {
  const state = getState();
  if (!state.immutable.sora) {
    return;
  }
  if (state.immutable.localMediaStream) {
    state.immutable.localMediaStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  const [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
    dispatch(slice.actions.setErrorMessage(error.toString()));
    throw error;
  });
  mediaStream.getTracks().forEach((track) => {
    if (!state.immutable.sora || !state.immutable.sora.pc) {
      return;
    }
    const sender = state.immutable.sora.pc.getSenders().find((s) => {
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

export const setInitialParameter = () => async (dispatch: Dispatch, _: () => SoraDemoState): Promise<void> => {
  const {
    audio,
    audioBitRate,
    audioCodecType,
    audioInput,
    audioOutput,
    autoGainControl,
    channelId,
    cpuOveruseDetection,
    debug,
    echoCancellation,
    echoCancellationType,
    fake,
    fakeVolume,
    frameRate,
    getDisplayMedia,
    noiseSuppression,
    mute,
    spotlight,
    spotlightNumber,
    simulcastQuality,
    resolution,
    video,
    videoBitRate,
    videoCodecType,
    videoInput,
  } = parseQueryString();
  if (audio !== undefined) {
    dispatch(slice.actions.setAudio(audio));
  }
  if (audioBitRate !== undefined) {
    dispatch(slice.actions.setAudioBitRate(audioBitRate));
  }
  if (audioCodecType !== undefined) {
    dispatch(slice.actions.setAudioCodecType(audioCodecType));
  }
  if (audioInput !== undefined) {
    dispatch(slice.actions.setAudioInput(audioInput));
  }
  if (audioOutput !== undefined) {
    dispatch(slice.actions.setAudioOutput(audioOutput));
  }
  if (autoGainControl !== undefined) {
    dispatch(slice.actions.setAutoGainControl(autoGainControl));
  }
  if (channelId !== undefined) {
    dispatch(slice.actions.setChannelId(channelId));
  }
  if (cpuOveruseDetection !== undefined) {
    dispatch(slice.actions.setCpuOveruseDetection(cpuOveruseDetection));
  }
  if (echoCancellation !== undefined) {
    dispatch(slice.actions.setEchoCancellation(echoCancellation));
  }
  if (echoCancellationType !== undefined) {
    dispatch(slice.actions.setEchoCancellationType(echoCancellationType));
  }
  if (getDisplayMedia !== undefined) {
    dispatch(slice.actions.setGetDisplayMedia(getDisplayMedia));
  }
  if (fake !== undefined) {
    dispatch(slice.actions.setFake(fake));
  }
  if (fakeVolume !== undefined) {
    dispatch(slice.actions.setFakeVolume(fakeVolume));
  }
  if (frameRate !== undefined) {
    dispatch(slice.actions.setFrameRate(frameRate));
  }
  if (noiseSuppression !== undefined) {
    dispatch(slice.actions.setNoiseSuppression(noiseSuppression));
  }
  if (resolution !== undefined) {
    dispatch(slice.actions.setResolution(resolution));
  }
  if (simulcastQuality !== undefined) {
    dispatch(slice.actions.setSimulcastQuality(simulcastQuality));
  }
  if (spotlight !== undefined) {
    dispatch(slice.actions.setSpotlight(spotlight));
  }
  if (spotlightNumber !== undefined) {
    dispatch(slice.actions.setSpotlightNumber(spotlightNumber));
  }
  if (video !== undefined) {
    dispatch(slice.actions.setVideo(video));
  }
  if (videoBitRate !== undefined) {
    dispatch(slice.actions.setVideoBitRate(videoBitRate));
  }
  if (videoCodecType !== undefined) {
    dispatch(slice.actions.setVideoCodecType(videoCodecType));
  }
  if (videoInput !== undefined) {
    dispatch(slice.actions.setVideoInput(videoInput));
  }
  if (debug !== undefined) {
    dispatch(slice.actions.setDebug(debug));
  }
  if (mute !== undefined) {
    dispatch(slice.actions.setMute(mute));
  }
  dispatch(slice.actions.setInitialFakeContents());
  dispatch(slice.actions.setErrorMessage(null));
};

export const {
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAudioInput,
  setAudioOutput,
  setAutoGainControl,
  setChannelId,
  setCpuOveruseDetection,
  setDebug,
  setDebugType,
  setEchoCancellation,
  setEchoCancellationType,
  setErrorMessage,
  setFake,
  setFakeVolume,
  setFrameRate,
  setGetDisplayMedia,
  setLocalMediaStream,
  setLogMessages,
  setNoiseSuppression,
  setNotifyMessages,
  setResolution,
  setSimulcastQuality,
  setSpotlight,
  setSpotlightNumber,
  setSora,
  setVideo,
  setVideoBitRate,
  setVideoCodecType,
  setVideoInput,
  toggleEnabledCamera,
  toggleEnabledMic,
} = slice.actions;

export default slice.reducer;
