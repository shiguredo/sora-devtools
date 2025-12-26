import { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import type { ConnectionPublisher, ConnectionSubscriber, TransportType } from "sora-js-sdk";
import Sora from "sora-js-sdk";

import type {
  ConnectionOptionsState,
  Json,
  QueryStringParameters,
  RTCIceLocalCandidateStats,
  SoraDevtoolsState,
  SoraNotifyMessage,
  SoraPushMessage,
  TimelineMessage,
} from "./../types.ts";
import {
  copy2clipboard,
  createAudioConstraints,
  createConnectOptions,
  createFakeMediaConstraints,
  createFakeMediaStream,
  createGetDisplayMediaAudioConstraints,
  createGetDisplayMediaVideoConstraints,
  createSignalingURL,
  createVideoConstraints,
  drawFakeCanvas,
  getBlurRadiusNumber,
  getDevices,
  getMediaStreamTrackProperties,
  parseMetadata,
  parseQueryString,
} from "./../utils.ts";
import { useSoraDevtoolsStore } from "./store.ts";

// ページ初期化処理
export const setInitialParameter = async (): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  store.resetState();

  const qsParams = parseQueryString(new URLSearchParams(location.search));
  if (qsParams.audio !== undefined) {
    store.setAudio(qsParams.audio);
  }
  if (qsParams.audioBitRate !== undefined) {
    store.setAudioBitRate(qsParams.audioBitRate);
  }
  if (qsParams.audioCodecType !== undefined) {
    store.setAudioCodecType(qsParams.audioCodecType);
  }
  // 存在しない Device の場合はセットしない
  const deviceInfos = await getDevices();
  // audioinput
  const audioInputDevice = deviceInfos.find(
    (d) => d.kind === "audioinput" && d.deviceId === qsParams.audioInput,
  );
  if (audioInputDevice !== undefined) {
    store.setAudioInput(audioInputDevice.deviceId);
  }
  // audiooutput
  const audioOutputDevice = deviceInfos.find(
    (d) => d.kind === "audiooutput" && d.deviceId === qsParams.audioOutput,
  );
  if (audioOutputDevice !== undefined) {
    store.setAudioOutput(audioOutputDevice.deviceId);
  }
  // videoinput
  const videoInputDevice = deviceInfos.find(
    (d) => d.kind === "videoinput" && d.deviceId === qsParams.videoInput,
  );
  if (videoInputDevice !== undefined) {
    store.setVideoInput(videoInputDevice.deviceId);
  }
  if (qsParams.autoGainControl !== undefined) {
    store.setAutoGainControl(qsParams.autoGainControl);
  }
  if (qsParams.channelId !== undefined) {
    store.setChannelId(qsParams.channelId);
  }
  if (qsParams.displayResolution !== undefined) {
    store.setDisplayResolution(qsParams.displayResolution);
  }
  if (qsParams.echoCancellation !== undefined) {
    store.setEchoCancellation(qsParams.echoCancellation);
  }
  if (qsParams.echoCancellationType !== undefined) {
    store.setEchoCancellationType(qsParams.echoCancellationType);
  }
  if (qsParams.mediaStats !== undefined) {
    store.setMediaStats(qsParams.mediaStats);
  }
  if (qsParams.mediaType !== undefined) {
    store.setMediaType(qsParams.mediaType);
  }
  if (qsParams.facingMode !== undefined) {
    store.setFacingMode(qsParams.facingMode);
  }
  if (qsParams.fakeVolume !== undefined) {
    store.setFakeVolume(qsParams.fakeVolume);
  }
  if (qsParams.frameRate !== undefined) {
    store.setFrameRate(qsParams.frameRate);
  }
  if (qsParams.noiseSuppression !== undefined) {
    store.setNoiseSuppression(qsParams.noiseSuppression);
  }
  if (qsParams.resolution !== undefined) {
    store.setResolution(qsParams.resolution);
  }
  if (qsParams.showStats !== undefined) {
    store.setShowStats(qsParams.showStats);
  }
  if (qsParams.simulcast !== undefined) {
    store.setSimulcast(qsParams.simulcast);
  }
  if (qsParams.simulcastRid !== undefined) {
    store.setSimulcastRid(qsParams.simulcastRid);
  }
  if (qsParams.simulcastRequestRid !== undefined) {
    store.setSimulcastRequestRid(qsParams.simulcastRequestRid);
  }
  if (qsParams.spotlight !== undefined) {
    store.setSpotlight(qsParams.spotlight);
  }
  if (qsParams.spotlightNumber !== undefined) {
    store.setSpotlightNumber(qsParams.spotlightNumber);
  }
  if (qsParams.spotlightFocusRid !== undefined) {
    store.setSpotlightFocusRid(qsParams.spotlightFocusRid);
  }
  if (qsParams.spotlightUnfocusRid !== undefined) {
    store.setSpotlightUnfocusRid(qsParams.spotlightUnfocusRid);
  }
  if (qsParams.video !== undefined) {
    store.setVideo(qsParams.video);
  }
  if (qsParams.videoBitRate !== undefined) {
    store.setVideoBitRate(qsParams.videoBitRate);
  }
  if (qsParams.videoCodecType !== undefined) {
    store.setVideoCodecType(qsParams.videoCodecType);
  }
  if (qsParams.videoVP9Params !== undefined) {
    store.setVideoVP9Params(qsParams.videoVP9Params);
  }
  if (qsParams.videoH264Params !== undefined) {
    store.setVideoH264Params(qsParams.videoH264Params);
  }
  if (qsParams.videoH265Params !== undefined) {
    store.setVideoH265Params(qsParams.videoH265Params);
  }
  if (qsParams.videoAV1Params !== undefined) {
    store.setVideoAV1Params(qsParams.videoAV1Params);
  }
  if (qsParams.debug !== undefined) {
    store.setDebug(qsParams.debug);
  }
  if (qsParams.debugType !== undefined) {
    store.setDebugType(qsParams.debugType);
  }
  if (qsParams.debugApiUrl !== undefined) {
    store.setDebugApiUrl(qsParams.debugApiUrl);
  }
  if (qsParams.mute !== undefined) {
    store.setMute(qsParams.mute);
  }
  if (qsParams.dataChannelSignaling !== undefined) {
    store.setDataChannelSignaling(qsParams.dataChannelSignaling);
  }
  if (qsParams.ignoreDisconnectWebSocket !== undefined) {
    store.setIgnoreDisconnectWebSocket(qsParams.ignoreDisconnectWebSocket);
  }
  if (qsParams.micDevice !== undefined) {
    store.setMicDevice(qsParams.micDevice);
  }
  if (qsParams.cameraDevice !== undefined) {
    store.setCameraDevice(qsParams.cameraDevice);
  }
  if (qsParams.audioTrack !== undefined) {
    store.setAudioTrack(qsParams.audioTrack);
  }
  if (qsParams.videoTrack !== undefined) {
    store.setVideoTrack(qsParams.videoTrack);
  }
  if (qsParams.googCpuOveruseDetection !== undefined && qsParams.googCpuOveruseDetection !== null) {
    store.setGoogCpuOveruseDetection(qsParams.googCpuOveruseDetection);
  }
  if (qsParams.bundleId !== undefined) {
    store.setBundleId(qsParams.bundleId);
  }
  if (qsParams.clientId !== undefined) {
    store.setClientId(qsParams.clientId);
  }
  if (qsParams.metadata !== undefined) {
    store.setMetadata(qsParams.metadata);
  }
  if (qsParams.signalingNotifyMetadata !== undefined) {
    store.setSignalingNotifyMetadata(qsParams.signalingNotifyMetadata);
  }
  if (qsParams.signalingUrlCandidates !== undefined) {
    store.setSignalingUrlCandidates(qsParams.signalingUrlCandidates);
  }
  if (qsParams.forwardingFilters !== undefined) {
    store.setForwardingFilters(qsParams.forwardingFilters);
  }
  if (qsParams.dataChannels !== undefined) {
    store.setDataChannels(qsParams.dataChannels);
  }
  if (qsParams.audioContentHint !== undefined) {
    store.setAudioContentHint(qsParams.audioContentHint);
  }
  if (qsParams.videoContentHint !== undefined) {
    store.setVideoContentHint(qsParams.videoContentHint);
  }
  if (qsParams.reconnect !== undefined) {
    store.setReconnect(qsParams.reconnect);
  }
  if (qsParams.aspectRatio !== undefined) {
    store.setAspectRatio(qsParams.aspectRatio);
  }
  if (qsParams.resizeMode !== undefined) {
    store.setResizeMode(qsParams.resizeMode);
  }
  if (qsParams.blurRadius !== undefined) {
    store.setBlurRadius(qsParams.blurRadius);
  }
  if (qsParams.mediaProcessorsNoiseSuppression !== undefined) {
    store.setMediaProcessorsNoiseSuppression(qsParams.mediaProcessorsNoiseSuppression);
  }
  if (qsParams.apiUrl !== undefined && qsParams.apiUrl !== null) {
    store.setApiUrl(qsParams.apiUrl);
  }
  if (qsParams.role !== undefined) {
    store.setRole(qsParams.role);
  }
  if (qsParams.audioStreamingLanguageCode !== undefined) {
    store.setAudioStreamingLanguageCode(qsParams.audioStreamingLanguageCode);
  }
  if (qsParams.forceStereoOutput !== undefined) {
    store.setForceStereoOutput(qsParams.forceStereoOutput);
  }
  store.setInitialFakeContents();

  const state = useSoraDevtoolsStore.getState();
  const {
    audioStreamingLanguageCode,
    bundleId,
    clientId,
    dataChannelSignaling,
    dataChannels,
    ignoreDisconnectWebSocket,
    metadata,
    signalingNotifyMetadata,
    signalingUrlCandidates,
    forwardingFilters,
    videoVP9Params,
    videoH264Params,
    videoH265Params,
    videoAV1Params,
  } = state;
  // bundleId が存在した場合は enabledBundleId をセットする
  if (bundleId !== "") {
    store.setEnabledBundleId(true);
  }
  // clientId が存在した場合は enabledClientId をセットする
  if (clientId !== "") {
    store.setEnabledClientId(true);
  }
  // metadata が存在した場合は enabledMetadata をセットする
  if (metadata !== "") {
    store.setEnabledMetadata(true);
  }
  // signalingNotifyMetadata が存在した場合は enabledSignalingNotifyMetadata をセットする
  if (signalingNotifyMetadata !== "") {
    store.setEnabledSignalingNotifyMetadata(true);
  }
  // signalingUrlCandidates が存在した場合は enabledSignalingUrlCandidates をセットする
  if (signalingUrlCandidates.length > 0) {
    store.setEnabledSignalingUrlCandidates(true);
  }
  // forwardingFilters が存在した場合は enabledForwardingFilters をセットする
  if (forwardingFilters !== "") {
    store.setEnabledForwardingFilters(true);
  }
  // dataChannelSignaling または ignoreDisconnectWebSocket が存在した場合は enabledDataChannel をセットする
  if (dataChannelSignaling !== "" || ignoreDisconnectWebSocket !== "") {
    store.setEnabledDataChannel(true);
  }
  // dataChannels が存在した場合は enabledDataChannels をセットする
  if (dataChannels !== "") {
    store.setEnabledDataChannels(true);
  }
  // audioStreamingLanguageCode が存在した場合は enabledAudioStreamingLanguageCode をセットする
  if (audioStreamingLanguageCode !== "") {
    store.setEnabledAudioStreamingLanguageCode(true);
  }
  // videoVP9Params が存在した場合は enabledVideoVP9Params をセットする
  if (videoVP9Params !== "") {
    store.setEnabledVideoVP9Params(true);
  }
  // videoH264Params が存在した場合は enabledH264Params をセットする
  if (videoH264Params !== "") {
    store.setEnabledVideoH264Params(true);
  }
  // videoH265Params が存在した場合は enabledH265Params をセットする
  if (videoH265Params !== "") {
    store.setEnabledVideoH265Params(true);
  }
  // videoAV1Params が存在した場合は enabledVideoAV1Params をセットする
  if (videoAV1Params !== "") {
    store.setEnabledVideoAV1Params(true);
  }
  store.setSoraConnectionStatus("disconnected");
};

// URL をクリップボードにコピーする
export const copyURL = (): void => {
  const state = useSoraDevtoolsStore.getState();
  const appendAudioVideoParams = state.role !== "recvonly";
  const appendReceiverParams = state.role !== "sendonly";
  const parameters: Partial<QueryStringParameters> = {
    channelId: state.channelId,
    role: state.role,
    audio: state.audio,
    video: state.video,
    debug: state.debug,
    // debug が true の場合のみ debugType を含める
    debugType: state.debug && state.debugType !== "timeline" ? state.debugType : undefined,
    // debug が true の場合のみ debugApiUrl を含める
    debugApiUrl:
      state.debug && state.debugApiUrl !== "http://localhost:3000" ? state.debugApiUrl : undefined,
    // URL の長さ短縮のため初期値と同じ場合は query string に含めない
    mediaType: state.mediaType !== "getUserMedia" ? state.mediaType : undefined,
    // URL の長さ短縮のため空文字列は query string に含めない
    audioBitRate:
      appendAudioVideoParams && state.audioBitRate !== "" ? state.audioBitRate : undefined,
    audioCodecType:
      appendAudioVideoParams && state.audioCodecType !== "" ? state.audioCodecType : undefined,
    videoBitRate:
      appendAudioVideoParams && state.videoBitRate !== "" ? state.videoBitRate : undefined,
    videoCodecType:
      appendAudioVideoParams && state.videoCodecType !== "" ? state.videoCodecType : undefined,
    videoVP9Params:
      appendAudioVideoParams && state.videoVP9Params !== "" && state.enabledVideoVP9Params
        ? state.videoVP9Params
        : undefined,
    videoH264Params:
      appendAudioVideoParams && state.videoH264Params !== "" && state.enabledVideoH264Params
        ? state.videoH264Params
        : undefined,
    videoH265Params:
      appendAudioVideoParams && state.videoH265Params !== "" && state.enabledVideoH265Params
        ? state.videoH265Params
        : undefined,
    videoAV1Params:
      appendAudioVideoParams && state.videoAV1Params !== "" && state.enabledVideoAV1Params
        ? state.videoAV1Params
        : undefined,
    forceStereoOutput: appendReceiverParams && state.forceStereoOutput === true ? true : undefined,
    audioContentHint: state.audioContentHint !== "" ? state.audioContentHint : undefined,
    autoGainControl: state.autoGainControl !== "" ? state.autoGainControl : undefined,
    noiseSuppression: state.noiseSuppression !== "" ? state.noiseSuppression : undefined,
    echoCancellation: state.echoCancellation !== "" ? state.echoCancellation : undefined,
    echoCancellationType:
      state.echoCancellationType !== "" ? state.echoCancellationType : undefined,
    videoContentHint: state.videoContentHint !== "" ? state.videoContentHint : undefined,
    resolution: state.resolution !== "" ? state.resolution : undefined,
    facingMode: state.facingMode !== "" ? state.facingMode : undefined,
    frameRate: state.frameRate !== "" ? state.frameRate : undefined,
    aspectRatio: state.aspectRatio !== "" ? state.aspectRatio : undefined,
    resizeMode: state.resizeMode !== "" ? state.resizeMode : undefined,
    blurRadius: state.blurRadius !== "" ? state.blurRadius : undefined,
    simulcast: state.simulcast !== "" ? state.simulcast : undefined,
    simulcastRid: state.simulcastRid !== "" ? state.simulcastRid : undefined,
    simulcastRequestRid: state.simulcastRequestRid !== "" ? state.simulcastRequestRid : undefined,
    spotlight: state.spotlight !== "" ? state.spotlight : undefined,
    spotlightNumber: state.spotlightNumber !== "" ? state.spotlightNumber : undefined,
    spotlightFocusRid: state.spotlightFocusRid !== "" ? state.spotlightFocusRid : undefined,
    spotlightUnfocusRid: state.spotlightUnfocusRid !== "" ? state.spotlightUnfocusRid : undefined,
    audioInput:
      state.mediaType === "getUserMedia" && state.audioInput !== "" ? state.audioInput : undefined,
    audioOutput: state.audioOutput !== "" ? state.audioOutput : undefined,
    videoInput:
      state.mediaType === "getUserMedia" && state.videoInput !== "" ? state.videoInput : undefined,
    displayResolution: state.displayResolution !== "" ? state.displayResolution : undefined,
    // URL の長さ短縮のため true 以外は query string に含めない
    mediaStats: state.mediaStats === true ? true : undefined,
    bundleId: state.bundleId !== "" && state.enabledBundleId ? state.bundleId : undefined,
    clientId: state.clientId !== "" && state.enabledClientId ? state.clientId : undefined,
    metadata: state.metadata !== "" && state.enabledMetadata ? state.metadata : undefined,
    signalingNotifyMetadata:
      state.signalingNotifyMetadata !== "" && state.enabledSignalingNotifyMetadata
        ? state.signalingNotifyMetadata
        : undefined,
    forwardingFilters:
      state.forwardingFilters !== "" && state.enabledForwardingFilters
        ? state.forwardingFilters
        : undefined,
    dataChannelSignaling:
      state.dataChannelSignaling !== "" && state.enabledDataChannel
        ? state.dataChannelSignaling
        : undefined,
    ignoreDisconnectWebSocket:
      state.ignoreDisconnectWebSocket !== "" && state.enabledDataChannel
        ? state.ignoreDisconnectWebSocket
        : undefined,
    dataChannels:
      state.dataChannels !== "" && state.enabledDataChannels ? state.dataChannels : undefined,
    // URL の長さ短縮のため true 以外は query string に含めない
    reconnect: state.reconnect === true ? true : undefined,
    mediaProcessorsNoiseSuppression:
      state.mediaProcessorsNoiseSuppression === true ? true : undefined,
    // URL の長さ短縮のため false 以外は query string に含めない
    micDevice: state.micDevice === false ? false : undefined,
    cameraDevice: state.cameraDevice === false ? false : undefined,
    audioTrack: state.audioTrack === false ? false : undefined,
    videoTrack: state.videoTrack === false ? false : undefined,
    // signalingUrlCandidates
    signalingUrlCandidates:
      state.signalingUrlCandidates.length > 0 && state.enabledSignalingUrlCandidates
        ? state.signalingUrlCandidates
        : undefined,
    // apiUrl
    apiUrl: state.apiUrl !== null ? state.apiUrl : undefined,
    // fakeVolume
    fakeVolume: state.mediaType === "fakeMedia" ? state.fakeVolume : undefined,
    // mute
    mute: state.mute === true ? true : undefined,
    // audioStreamingLanguageCode
    audioStreamingLanguageCode:
      appendAudioVideoParams &&
      state.audioStreamingLanguageCode !== "" &&
      state.enabledAudioStreamingLanguageCode
        ? state.audioStreamingLanguageCode
        : undefined,
  };
  const queryStrings = Object.keys(parameters)
    .map((key) => {
      const value = (parameters as Record<string, unknown>)[key];
      if (value === undefined) {
        return undefined;
      }
      // signalingUrlCandidates は Array なので JSON.stringify する
      if (key === "signalingUrlCandidates") {
        return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
      }
      return `${key}=${encodeURIComponent(value as string)}`;
    })
    .filter((value) => value !== undefined);
  void copy2clipboard(`${location.origin}${location.pathname}?${queryStrings.join("&")}`);
  window.history.replaceState(null, "", `${location.pathname}?${queryStrings.join("&")}`);
};

// State に応じて MediaStream インスタンスを生成する
// Fake の場合には volume control 用の GainNode も同時に生成する
type createMediaStreamPickedState = Pick<
  SoraDevtoolsState,
  | "aspectRatio"
  | "audio"
  | "audioInput"
  | "audioTrack"
  | "audioContentHint"
  | "autoGainControl"
  | "blurRadius"
  | "cameraDevice"
  | "echoCancellation"
  | "echoCancellationType"
  | "facingMode"
  | "fakeContents"
  | "fakeVolume"
  | "frameRate"
  | "mediaProcessorsNoiseSuppression"
  | "mediaType"
  | "mp4MediaStream"
  | "micDevice"
  | "noiseSuppression"
  | "noiseSuppressionProcessor"
  | "resizeMode"
  | "resolution"
  | "video"
  | "videoContentHint"
  | "videoInput"
  | "videoTrack"
  | "virtualBackgroundProcessor"
>;
async function createMediaStream(
  state: createMediaStreamPickedState,
): Promise<[MediaStream, GainNode | null]> {
  const store = useSoraDevtoolsStore.getState();
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  if (state.mediaType === "getDisplayMedia") {
    if (!state.video || !state.cameraDevice) {
      return [new MediaStream(), null];
    }
    if (navigator.mediaDevices === undefined) {
      throw new Error("Failed to call getUserMedia. Make sure domain is secure");
    }
    const mediaConstraints = {
      // getDisplayMedia では配信する画面の音声を利用するため、デバイス指定 (audioInput) は使わない
      audio: createGetDisplayMediaAudioConstraints({
        audio: state.audio,
        autoGainControl: state.autoGainControl,
        noiseSuppression: state.noiseSuppression,
        echoCancellation: state.echoCancellation,
        echoCancellationType: state.echoCancellationType,
      }),
      video: createGetDisplayMediaVideoConstraints({
        frameRate: state.frameRate,
        resolution: state.resolution,
        aspectRatio: state.aspectRatio,
        resizeMode: state.resizeMode,
      }),
    };
    store.setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(mediaConstraints),
    });
    store.setTimelineMessage(
      createSoraDevtoolsTimelineMessage("media-constraints", mediaConstraints),
    );
    const stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints);
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-get-display-media"));
    for (const track of stream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
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
      aspectRatio: state.aspectRatio,
      resizeMode: state.resizeMode,
    });
    store.setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(constraints),
    });
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("media-constraints", constraints));
    const { canvas, mediaStream, gainNode } = createFakeMediaStream(constraints);
    if (canvas !== null) {
      state.fakeContents.worker.onmessage = (event) => {
        const data = event.data;
        if (data.type !== "update") {
          return;
        }
        drawFakeCanvas(
          canvas,
          state.fakeContents.colorCode,
          constraints.fontSize,
          data.counter.toString(),
        );
      };
      state.fakeContents.worker.postMessage({ type: "stop" });
      state.fakeContents.worker.postMessage({
        type: "start",
        interval: 1000 / constraints.frameRate,
      });
    }
    for (const track of mediaStream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
    }
    for (const track of mediaStream.getAudioTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.audioContentHint;
      }
      track.enabled = state.audioTrack;
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
    }
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-create-fake-media"));
    return [mediaStream, gainNode];
  }
  if (state.mediaType === "mp4Media") {
    if (state.mp4MediaStream === null) {
      throw new Error("No MP4 file has been selected");
    }

    // 指定の MP4 を再生するための MediaStream を返す
    // DevTools ではいったん常に繰り返し再生にしておく
    return [await state.mp4MediaStream.play({ repeat: true }), null];
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
  const videoConstraints = createVideoConstraints({
    aspectRatio: state.aspectRatio,
    frameRate: state.frameRate,
    resizeMode: state.resizeMode,
    resolution: state.resolution,
    video: state.video && state.cameraDevice,
    videoInput: state.videoInput,
    facingMode: state.facingMode,
  });
  if (audioConstraints || videoConstraints) {
    const mediaStreamConstraints: MediaStreamConstraints = {};
    if (audioConstraints) {
      mediaStreamConstraints.audio = audioConstraints;
    }
    if (videoConstraints) {
      mediaStreamConstraints.video = videoConstraints;
    }
    store.setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(mediaStreamConstraints),
    });
    store.setTimelineMessage(
      createSoraDevtoolsTimelineMessage("media-constraints", mediaStreamConstraints),
    );
    const gumMediaStream = await navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .catch((error) => {
        // video track の getUserMedia が失敗した場合には audio track が存在している可能性があるので止める
        mediaStream.getTracks().forEach((t) => {
          t.stop();
        });
        throw error;
      });
    if (audioConstraints) {
      let audioTrack = gumMediaStream.getAudioTracks()[0];
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", audioTrack));
      if (state.mediaProcessorsNoiseSuppression && NoiseSuppressionProcessor.isSupported()) {
        if (state.noiseSuppressionProcessor === null) {
          throw new Error(
            "Failed to start NoiseSuppressionProcessor. NoiseSuppressionProcessor is 'null'",
          );
        }
        state.noiseSuppressionProcessor.stopProcessing();
        audioTrack = await state.noiseSuppressionProcessor.startProcessing(audioTrack);
      }
      store.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-audio-get-user-media"));
      mediaStream.addTrack(audioTrack);
    }
    if (videoConstraints) {
      let videoTrack = gumMediaStream.getVideoTracks()[0];
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", videoTrack));
      if (state.blurRadius !== "" && VirtualBackgroundProcessor.isSupported()) {
        if (state.virtualBackgroundProcessor === null) {
          throw new Error(
            "Failed to start VirtualBackgroundProcessor. VirtualBackgroundProcessor is 'null'",
          );
        }
        const options = {
          blurRadius: getBlurRadiusNumber(state.blurRadius),
        };
        state.virtualBackgroundProcessor.stopProcessing();
        videoTrack = await state.virtualBackgroundProcessor.startProcessing(videoTrack, options);
      }
      store.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-video-get-user-media"));
      mediaStream.addTrack(videoTrack);
    }
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
function setSoraCallbacks(sora: ConnectionPublisher | ConnectionSubscriber): void {
  const store = useSoraDevtoolsStore.getState();
  sora.on("log", (title: string, description: Json) => {
    store.setLogMessages({
      title: title,
      description: JSON.stringify(description),
    });
  });
  sora.on("notify", (message: SoraNotifyMessage, transportType: TransportType) => {
    if (message.event_type === "spotlight.focused" && typeof message.connection_id === "string") {
      store.setFocusedSpotlightConnectionId(message.connection_id);
    }
    if (message.event_type === "spotlight.unfocused" && typeof message.connection_id === "string") {
      store.setUnFocusedSpotlightConnectionId(message.connection_id);
    }
    if (
      message.event_type === "connection.destroyed" &&
      typeof message.connection_id === "string"
    ) {
      store.deleteFocusedSpotlightConnectionId(message.connection_id);
    }
    const { soraContents } = useSoraDevtoolsStore.getState();
    if (
      message.event_type === "connection.created" &&
      typeof message.connection_id === "string" &&
      // notify の connection_id と offer で受け取った自身の connection id が一致すること
      message.connection_id === soraContents.sora?.connectionId
    ) {
      if (typeof message.session_id === "string") {
        store.setSoraSessionId(message.session_id);
      }
      if (typeof message.connection_id === "string") {
        store.setSoraConnectionId(message.connection_id);
      }
      if (typeof message.client_id === "string") {
        store.setSoraClientId(message.client_id);
      }
      // 接続時点で存在する remote client の client_id を保存する
      if (Array.isArray(message.data)) {
        for (const remoteClient of message.data) {
          if (
            typeof remoteClient.connection_id === "string" &&
            typeof remoteClient.client_id === "string"
          ) {
            store.setSoraRemoteClientId({
              connectionId: remoteClient.connection_id,
              clientId: remoteClient.client_id,
            });
          }
        }
      }
    } else if (
      message.event_type === "connection.created" &&
      typeof message.connection_id === "string"
    ) {
      // 自身以外の notify
      if (typeof message.client_id === "string") {
        store.setSoraRemoteClientId({
          connectionId: message.connection_id,
          clientId: message.client_id,
        });
      }
    }
    store.setNotifyMessages({
      timestamp: Date.now(),
      message: message,
      transportType: transportType,
    });
  });
  sora.on("push", (message: SoraPushMessage, transportType: TransportType) => {
    store.setPushMessages({
      timestamp: Date.now(),
      message: message,
      transportType: transportType,
    });
  });
  sora.on("track", (event: RTCTrackEvent) => {
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track"));
    const { soraContents } = useSoraDevtoolsStore.getState();
    const mediaStream = soraContents.remoteClients.find(
      (client) => client.connectionId === event.streams[0].id,
    );
    if (!mediaStream) {
      for (const track of event.streams[0].getTracks()) {
        store.setTimelineMessage(
          createSoraDevtoolsTimelineMessage(
            `remote-${track.kind}-mediastream-track`,
            getMediaStreamTrackProperties(track),
          ),
        );
      }
      store.setRemoteClient({
        mediaStream: event.streams[0],
        connectionId: event.streams[0].id,
        clientId: null,
      });
    }
  });
  sora.on("removetrack", (event: MediaStreamTrackEvent) => {
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-removetrack"));
    const { soraContents } = useSoraDevtoolsStore.getState();
    const remoteClient = soraContents.remoteClients.find((client) => {
      if (event?.target) {
        return client.connectionId === (event.target as MediaStream).id;
      }
      return false;
    });
    if (remoteClient) {
      store.removeRemoteClient(remoteClient.connectionId);
    }
  });
  sora.on("disconnect", (event) => {
    const message: Record<string, unknown> = {
      type: event.type,
      title: event.title,
    };
    if (event.code !== undefined) {
      message.code = event.code;
    }
    if (event.reason !== undefined) {
      message.reason = event.reason;
    }
    if (event.params !== undefined) {
      message.params = event.params;
    }
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-disconnect", message));
    const {
      fakeContents,
      soraContents,
      reconnect,
      virtualBackgroundProcessor,
      noiseSuppressionProcessor,
    } = useSoraDevtoolsStore.getState();
    const { localMediaStream, remoteClients } = soraContents;
    // media processor は同期処理で停止する
    const originalTrack = stopVideoProcessors(virtualBackgroundProcessor);
    // video track は停止の際に非同期処理が必要なため、最小限の処理に絞って非同期処理にする
    void (async () => {
      // ローカルの MediaStream の Track と MediaProcessor を止める
      await stopLocalVideoTrack(localMediaStream, originalTrack);
    })();
    stopLocalAudioTrack(localMediaStream, noiseSuppressionProcessor);
    remoteClients.forEach((client) => {
      client.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    });
    if (fakeContents.worker) {
      fakeContents.worker.postMessage({ type: "stop" });
    }
    store.setSora(null);
    store.setSoraSessionId(null);
    store.setSoraConnectionId(null);
    store.setSoraClientId(null);
    store.setSoraTurnUrl(null);
    store.setSoraConnectionStatus("disconnected");
    store.setLocalMediaStream(null);
    store.removeAllRemoteClients();
    store.setSoraInfoAlertMessage("Disconnect Sora.");
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected"));
    if (event.type === "abend" && reconnect) {
      // 再接続処理開始フラグ
      store.setSoraReconnecting(true);
    }
  });
  sora.on("timeline", (event) => {
    const message = {
      timestamp: Date.now(),
      type: event.type,
      data: event.data,
      dataChannelId: event.dataChannelId,
      dataChannelLabel: event.dataChannelLabel,
      logType: event.logType,
    };
    store.setTimelineMessage(message);
    if (event.data && typeof event.data === "object" && "sdp" in event.data) {
      store.setTimelineMessage(
        createSoraDevtoolsTimelineMessage(`${event.type}-sdp`, event.data.sdp),
      );
    }
  });
  sora.on("signaling", (event) => {
    const message = {
      timestamp: Date.now(),
      transportType: event.transportType,
      type: event.type,
      data: event.data,
    };
    store.setSignalingMessage(message);
  });
  sora.on("message", (event) => {
    store.setDataChannelMessage({
      timestamp: Date.now(),
      label: event.label,
      data: event.data,
    });
  });
  sora.on("datachannel", (event) => {
    store.setSoraDataChannels(event.datachannel);
  });
  sora.on("switched", (message) => {
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-switched", message));
  });
  sora.on("connected", (message) => {
    store.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-connected", message));
  });
}

// SoraDevtoolsState から ConnectionOptionsState を生成する
function pickConnectionOptionsState(state: SoraDevtoolsState): ConnectionOptionsState {
  return {
    audio: state.audio,
    audioBitRate: state.audioBitRate,
    audioCodecType: state.audioCodecType,
    audioStreamingLanguageCode: state.audioStreamingLanguageCode,
    bundleId: state.bundleId,
    clientId: state.clientId,
    dataChannelSignaling: state.dataChannelSignaling,
    dataChannels: state.enabledDataChannels ? state.dataChannels : "",
    enabledAudioStreamingLanguageCode: state.enabledAudioStreamingLanguageCode,
    enabledBundleId: state.enabledBundleId,
    enabledClientId: state.enabledClientId,
    enabledDataChannel: state.enabledDataChannel,
    enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
    enabledForwardingFilters: state.enabledForwardingFilters,
    enabledVideoVP9Params: state.enabledVideoVP9Params,
    enabledVideoH264Params: state.enabledVideoH264Params,
    enabledVideoH265Params: state.enabledVideoH265Params,
    enabledVideoAV1Params: state.enabledVideoAV1Params,
    ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
    signalingNotifyMetadata: state.signalingNotifyMetadata,
    forwardingFilters: state.forwardingFilters,
    simulcast: state.simulcast,
    simulcastRid: state.simulcastRid,
    simulcastRequestRid: state.simulcastRequestRid,
    spotlight: state.spotlight,
    spotlightFocusRid: state.spotlightFocusRid,
    spotlightNumber: state.spotlightNumber,
    spotlightUnfocusRid: state.spotlightUnfocusRid,
    video: state.video,
    videoBitRate: state.videoBitRate,
    videoCodecType: state.videoCodecType,
    videoVP9Params: state.videoVP9Params,
    videoH264Params: state.videoH264Params,
    videoH265Params: state.videoH265Params,
    videoAV1Params: state.videoAV1Params,
    forceStereoOutput: state.forceStereoOutput,
    role: state.role,
  };
}

function createSoraDevtoolsTimelineMessage(type: string, data?: unknown): TimelineMessage {
  return {
    type: type,
    logType: "sora-devtools",
    timestamp: Date.now(),
    data: data,
  };
}

function createSoraDevtoolsMediaStreamTrackLog(
  action: "start" | "stop",
  track: MediaStreamTrack,
): TimelineMessage {
  const properties = getMediaStreamTrackProperties(track);
  return createSoraDevtoolsTimelineMessage(`${action}-${track.kind}-mediastream-track`, properties);
}

// statsReport を更新
async function setStatsReport(sora: ConnectionPublisher | ConnectionSubscriber): Promise<void> {
  const store = useSoraDevtoolsStore.getState();
  if (sora.pc && sora.pc?.iceConnectionState !== "closed") {
    const stats = await sora.pc.getStats();
    const statsReport: RTCStats[] = [];
    const localCandidateStats: RTCIceLocalCandidateStats[] = [];
    for (const s of stats.values()) {
      const stat = s as RTCStats;
      statsReport.push(stat);
      if (stat.type === "local-candidate") {
        localCandidateStats.push(stat as RTCIceLocalCandidateStats);
      }
    }

    store.setStatsReport(statsReport);

    // local-candidate の最初に出現する TURN サーバーの URL を取得
    for (const s of localCandidateStats) {
      const localCandidate = s as RTCIceLocalCandidateStats;
      if (localCandidate.url !== undefined) {
        store.setSoraTurnUrl(localCandidate.url);
        break;
      }
    }
  }
}

export const requestMedia = async (): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  const LOG_TITLE = "REQUEST_MEDIA";
  const state = useSoraDevtoolsStore.getState();
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  try {
    [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
      throw error;
    });
  } catch (error) {
    if (error instanceof Error) {
      store.setLogMessages({
        title: LOG_TITLE,
        description: JSON.stringify(error.message),
      });
      store.setAPIErrorAlertMessage(`Failed to get user devices. ${error.message}`);
    }
    let originalTrack: MediaStreamVideoTrack | undefined;
    if (state.virtualBackgroundProcessor?.isProcessing()) {
      if (originalTrack === undefined) {
        originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
      }
      state.virtualBackgroundProcessor.stopProcessing();
    }
    if (originalTrack) {
      originalTrack.stop();
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    } else if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.stop();
        store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }

    if (state.noiseSuppressionProcessor?.isProcessing()) {
      const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
      }
      state.noiseSuppressionProcessor.stopProcessing();
    } else if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.stop();
        store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }
    throw error;
  }
  if (gainNode) {
    store.setFakeContentsGainNode(gainNode);
  }
  store.setLocalMediaStream(mediaStream);
};

export const disposeMedia = async (): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  const { fakeContents, soraContents, noiseSuppressionProcessor, virtualBackgroundProcessor } =
    useSoraDevtoolsStore.getState();
  const { localMediaStream } = soraContents;
  let originalTrack: MediaStreamTrack | undefined;
  if (virtualBackgroundProcessor?.isProcessing()) {
    originalTrack = virtualBackgroundProcessor.getOriginalTrack();
    virtualBackgroundProcessor.stopProcessing();
  }
  if (originalTrack !== undefined) {
    originalTrack.stop();
    localMediaStream?.removeTrack(originalTrack);
    store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else if (localMediaStream) {
    localMediaStream.getVideoTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }

  if (noiseSuppressionProcessor?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      localMediaStream?.removeTrack(originalTrack);
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessor.stopProcessing();
  } else if (localMediaStream) {
    localMediaStream.getAudioTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
  if (fakeContents.worker) {
    fakeContents.worker.postMessage({ type: "stop" });
  }
  store.setLocalMediaStream(null);
};

export const connectSora = async (): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  store.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-connection"));
  store.setSoraConnectionStatus("preparing");
  const state = useSoraDevtoolsStore.getState();
  // 強制的に state.soraContents.localMediaStream を作り直すかどうか
  let forceCreateMediaStream = false;
  // 接続中の場合は切断する
  if (state.soraContents.sora) {
    await state.soraContents.sora.disconnect();
    // 接続中の再接続の場合は、MediaStream を作り直し、state.soraContents.localMediaStream を更新する
    forceCreateMediaStream = true;
  }
  // シグナリング候補のURLリストを作成する
  const signalingUrlCandidates = createSignalingURL(
    state.enabledSignalingUrlCandidates,
    state.signalingUrlCandidates,
  );
  store.setLogMessages({
    title: "SIGNALING_URL",
    description: JSON.stringify(signalingUrlCandidates),
  });
  const connection = Sora.connection(signalingUrlCandidates, state.debug);
  const connectionOptionsState = pickConnectionOptionsState(state);
  const connectionOptions = createConnectOptions(connectionOptionsState);
  const metadata = parseMetadata(state.enabledMetadata, state.metadata);
  let sora: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
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
      setSoraCallbacks(sora);
      if (!forceCreateMediaStream && state.soraContents.localMediaStream) {
        mediaStream = state.soraContents.localMediaStream;
      } else {
        [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
          store.setSoraErrorAlertMessage(error.toString());
          store.setSoraConnectionStatus("disconnected");
          throw error;
        });
      }
      store.setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      store.setSora(sora);
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
      setSoraCallbacks(sora);
      if (!forceCreateMediaStream && state.soraContents.localMediaStream) {
        mediaStream = state.soraContents.localMediaStream;
      } else {
        [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
          store.setSoraErrorAlertMessage(error.toString());
          store.setSoraConnectionStatus("disconnected");
          throw error;
        });
      }
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      store.setSora(sora);
      await sora.connect(mediaStream);
    } else if (state.role === "recvonly") {
      sora = connection.recvonly(state.channelId, null, connectionOptions);
      sora.metadata = metadata;
      setSoraCallbacks(sora);
      store.setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      store.setSora(sora);
      await sora.connect();
    }
  } catch (error) {
    // 先に setSora で state を参照できるようにした state の参照を削除
    store.setSora(null);
    if (error instanceof Error) {
      store.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`);
    }
    let originalTrack: MediaStreamVideoTrack | undefined;
    if (state.virtualBackgroundProcessor?.isProcessing()) {
      if (originalTrack === undefined) {
        originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
      }
      state.virtualBackgroundProcessor.stopProcessing();
    }
    if (originalTrack) {
      originalTrack.stop();
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    } else if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.stop();
        store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }

    if (state.noiseSuppressionProcessor?.isProcessing()) {
      const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
      }
      state.noiseSuppressionProcessor.stopProcessing();
    } else if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.stop();
        store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }
    store.setSoraConnectionStatus("disconnected");
    throw error;
  }
  if (sora === undefined) {
    throw new Error("Failed to connect Sora. Connection object is 'undefined'");
  }
  store.setSoraInfoAlertMessage("Succeeded to connect Sora.");
  await setStatsReport(sora);
  const timerId = setInterval(async () => {
    const { soraContents } = useSoraDevtoolsStore.getState();
    if (soraContents.sora) {
      await setStatsReport(soraContents.sora);
    } else {
      clearInterval(timerId);
    }
  }, 1000);
  // disconnect 時に stream を止めないためのハック
  sora.stream = null;
  if (mediaStream && (state.soraContents.localMediaStream === null || forceCreateMediaStream)) {
    store.setLocalMediaStream(mediaStream);
  }
  if (gainNode) {
    store.setFakeContentsGainNode(gainNode);
  }
  store.setSoraConnectionStatus("connected");
  store.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
};

export const reconnectSora = async (): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  store.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-reconnect"));
  store.setSoraConnectionStatus("connecting");
  const state = useSoraDevtoolsStore.getState();
  // 接続中の場合は切断する
  if (state.soraContents.sora && state.soraContents.connectionStatus === "connected") {
    await state.soraContents.sora.disconnect();
  }
  // シグナリング候補のURLリストを作成する
  const signalingUrlCandidates = createSignalingURL(
    state.enabledSignalingUrlCandidates,
    state.signalingUrlCandidates,
  );
  store.setLogMessages({
    title: "SIGNALING_URL",
    description: JSON.stringify(signalingUrlCandidates),
  });
  const connection = Sora.connection(signalingUrlCandidates, state.debug);
  const connectionOptionsState = pickConnectionOptionsState(state);
  const connectionOptions = createConnectOptions(connectionOptionsState);
  const metadata = parseMetadata(state.enabledMetadata, state.metadata);
  let sora: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  if (state.role === "sendonly" || state.role === "sendrecv") {
    [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
      store.setSoraErrorAlertMessage(error.toString());
      store.setSoraConnectionStatus("disconnected");
      throw error;
    });
  }
  for (let i = 1; i <= 10; i++) {
    const { soraContents } = useSoraDevtoolsStore.getState();
    if (soraContents.reconnecting === false) {
      break;
    }
    store.setSoraReconnectingTrials(i);
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
        setSoraCallbacks(sora);
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
        setSoraCallbacks(sora);
        if (mediaStream) {
          await sora.connect(mediaStream);
        }
      } else if (state.role === "recvonly") {
        sora = connection.recvonly(state.channelId, null, connectionOptions);
        sora.metadata = metadata;
        setSoraCallbacks(sora);
        await sora.connect();
      }
    } catch (error) {
      if (error instanceof Error) {
        store.setSoraErrorAlertMessage(`(trials ${i}) Failed to connect Sora. ${error.message}`);
      }
      sora = undefined;
    }
    if (sora !== undefined) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, i * 500 + 500));
  }
  if (sora === undefined) {
    store.setSoraErrorAlertMessage("Failed to reconnect Sora.");
    store.setSoraConnectionStatus("disconnected");
    store.setSoraReconnecting(false);
    return;
  }
  store.setSoraInfoAlertMessage("Succeeded to reconnect Sora.");
  await setStatsReport(sora);
  const timerId = setInterval(async () => {
    const { soraContents } = useSoraDevtoolsStore.getState();
    if (soraContents.sora) {
      await setStatsReport(soraContents.sora);
    } else {
      clearInterval(timerId);
    }
  }, 1000);
  store.setSora(sora);
  if (mediaStream) {
    store.setLocalMediaStream(mediaStream);
  }
  if (gainNode) {
    store.setFakeContentsGainNode(gainNode);
  }
  store.setSoraConnectionStatus("connected");
  store.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
  store.setSoraReconnecting(false);
};

// Sora との切断処理
export const disconnectSora = async (): Promise<void> => {
  const { soraContents } = useSoraDevtoolsStore.getState();
  const store = useSoraDevtoolsStore.getState();
  if (soraContents.sora && soraContents.connectionStatus === "connected") {
    store.setSoraConnectionStatus("disconnecting");
    await soraContents.sora.disconnect();
    store.setSoraConnectionStatus("disconnected");
  }
};

// デバイス一覧を取得
export const setMediaDevices = async (): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
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
  store.setAudioInputDevices(audioInputDevices);
  store.setVideoInputDevices(videoInputDevices);
  store.setAudioOutputDevices(audioOutputDevices);
};

export const unregisterServiceWorker = async (): Promise<void> => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
};

// デバイスの変更時などに Sora との接続を維持したまま MediaStream のみ更新
export const updateMediaStream = async (): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  const state = useSoraDevtoolsStore.getState();
  if (!state.soraContents.localMediaStream) {
    return;
  }
  if (state.virtualBackgroundProcessor?.isProcessing()) {
    const originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    state.virtualBackgroundProcessor.stopProcessing();
  } else if (state.soraContents.localMediaStream) {
    state.soraContents.localMediaStream.getVideoTracks().forEach((track) => {
      track.stop();
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }

  if (state.noiseSuppressionProcessor?.isProcessing()) {
    const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    state.noiseSuppressionProcessor.stopProcessing();
  } else if (state.soraContents.localMediaStream) {
    state.soraContents.localMediaStream.getAudioTracks().forEach((track) => {
      track.stop();
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
  const [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
    store.setSoraErrorAlertMessage(error.toString());
    store.setSoraConnectionStatus("disconnected");
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
      void sender.replaceTrack(track);
    }
  });
  store.setLocalMediaStream(mediaStream);
  store.setFakeContentsGainNode(gainNode);
};

export const setMicDevice = async (micDevice: boolean): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  const state = useSoraDevtoolsStore.getState();
  if (!state.soraContents.localMediaStream || !state.soraContents.sora) {
    store.setMicDevice(micDevice);
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
      blurRadius: state.blurRadius,
      cameraDevice: state.cameraDevice,
      echoCancellation: state.echoCancellation,
      echoCancellationType: state.echoCancellationType,
      facingMode: state.facingMode,
      fakeContents: state.fakeContents,
      fakeVolume: state.fakeVolume,
      frameRate: state.frameRate,
      mediaProcessorsNoiseSuppression: state.mediaProcessorsNoiseSuppression,
      mediaType: state.mediaType,
      mp4MediaStream: state.mp4MediaStream,
      micDevice: micDevice,
      noiseSuppression: state.noiseSuppression,
      noiseSuppressionProcessor: state.noiseSuppressionProcessor,
      resizeMode: state.resizeMode,
      resolution: state.resolution,
      video: false,
      videoContentHint: state.videoContentHint,
      videoInput: state.videoInput,
      videoTrack: state.videoTrack,
      virtualBackgroundProcessor: state.virtualBackgroundProcessor,
    };
    const [mediaStream, gainNode] = await createMediaStream(pickedState).catch((error) => {
      store.setSoraErrorAlertMessage(error.toString());
      throw error;
    });
    if (mediaStream.getAudioTracks().length > 0) {
      if (
        state.soraContents.sora &&
        state.soraContents.connectionStatus === "connected" &&
        state.soraContents.localMediaStream
      ) {
        // Sora 接続中の場合
        await state.soraContents.sora.replaceAudioTrack(
          state.soraContents.localMediaStream,
          mediaStream.getAudioTracks()[0],
        );
      } else if (state.soraContents.localMediaStream) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の AudioTrack を停止、削除してから、新しい AudioTrack を追加する
        state.soraContents.localMediaStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          state.soraContents.localMediaStream?.removeTrack(track);
        });
        state.soraContents.localMediaStream.addTrack(mediaStream.getAudioTracks()[0]);
      }
      store.setFakeContentsGainNode(gainNode);
    }
  } else if (
    state.soraContents.sora &&
    state.soraContents.connectionStatus === "connected" &&
    state.soraContents.localMediaStream
  ) {
    // Sora 接続中の場合
    stopLocalAudioTrack(state.soraContents.localMediaStream, state.noiseSuppressionProcessor);
    void state.soraContents.sora.stopAudioTrack(state.soraContents.localMediaStream);
  } else if (state.soraContents.localMediaStream) {
    // Sora は未接続で media access での表示を行っている場合
    // localMediaStream の AudioTrack を停止して MediaStream から Track を削除する
    stopLocalAudioTrack(state.soraContents.localMediaStream, state.noiseSuppressionProcessor);
  }
  store.setMicDevice(micDevice);
};

export const setCameraDevice = async (cameraDevice: boolean): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  const state = useSoraDevtoolsStore.getState();
  if (
    !state.soraContents.localMediaStream &&
    !state.soraContents.sora &&
    state.soraContents.connectionStatus !== "connected"
  ) {
    store.setCameraDevice(cameraDevice);
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
      blurRadius: state.blurRadius,
      cameraDevice: cameraDevice,
      echoCancellation: state.echoCancellation,
      echoCancellationType: state.echoCancellationType,
      facingMode: state.facingMode,
      fakeContents: state.fakeContents,
      fakeVolume: state.fakeVolume,
      frameRate: state.frameRate,
      mediaProcessorsNoiseSuppression: state.mediaProcessorsNoiseSuppression,
      mediaType: state.mediaType,
      mp4MediaStream: state.mp4MediaStream,
      micDevice: state.micDevice,
      noiseSuppression: state.noiseSuppression,
      noiseSuppressionProcessor: state.noiseSuppressionProcessor,
      resizeMode: state.resizeMode,
      resolution: state.resolution,
      video: state.video,
      videoContentHint: state.videoContentHint,
      videoInput: state.videoInput,
      videoTrack: state.videoTrack,
      virtualBackgroundProcessor: state.virtualBackgroundProcessor,
    };
    const [mediaStream, gainNode] = await createMediaStream(pickedState).catch((error) => {
      store.setSoraErrorAlertMessage(error.toString());
      throw error;
    });
    if (mediaStream.getVideoTracks().length > 0) {
      if (
        state.soraContents.sora &&
        state.soraContents.connectionStatus === "connected" &&
        state.soraContents.localMediaStream
      ) {
        // Sora 接続中の場合
        void state.soraContents.sora.replaceVideoTrack(
          state.soraContents.localMediaStream,
          mediaStream.getVideoTracks()[0],
        );
      } else if (state.soraContents.localMediaStream) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の VideoTrack を停止、削除してから、新しい VideoTrack を追加する
        state.soraContents.localMediaStream.getVideoTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          state.soraContents.localMediaStream?.removeTrack(track);
        });
        state.soraContents.localMediaStream.addTrack(mediaStream.getVideoTracks()[0]);
      }
      store.setFakeContentsGainNode(gainNode);
    }
  } else if (
    state.soraContents.sora &&
    state.soraContents.connectionStatus === "connected" &&
    state.soraContents.localMediaStream
  ) {
    // Sora 接続中の場合
    const originalTrack = stopVideoProcessors(state.virtualBackgroundProcessor);
    await stopLocalVideoTrack(state.soraContents.localMediaStream, originalTrack);
    void state.soraContents.sora.stopVideoTrack(state.soraContents.localMediaStream);
  } else if (state.soraContents.localMediaStream) {
    // Sora は未接続で media access での表示を行っている場合
    // localMediaStream の VideoTrack を停止して MediaStream から Track を削除する
    const originalTrack = stopVideoProcessors(state.virtualBackgroundProcessor);
    await stopLocalVideoTrack(state.soraContents.localMediaStream, originalTrack);
  }
  store.setCameraDevice(cameraDevice);
};

/**
 * 設定されている media processor が実行中の場合は停止し、使用されていた MediaStreamTrack を返す
 * media processor が実行中でない場合は undefined を返す
 */
const stopVideoProcessors = (
  virtualBackgroundProcessor: VirtualBackgroundProcessor | null,
): MediaStreamTrack | undefined => {
  let originalTrack: MediaStreamVideoTrack | undefined;
  if (virtualBackgroundProcessor?.isProcessing()) {
    originalTrack = virtualBackgroundProcessor.getOriginalTrack();
    virtualBackgroundProcessor.stopProcessing();
  }
  return originalTrack;
};

/**
 * devtools のローカルにもっている MediaStream のうち Video Track の停止を行う関数
 * MediaStream から Track の削除も行う
 * originalTrack の引数は stopVideoProcessors を呼び出し取得した MediaStreamTrack を渡す
 */
const stopLocalVideoTrack = async (
  localMediaStream: MediaStream | null,
  originalTrack?: MediaStreamTrack,
): Promise<void> => {
  const store = useSoraDevtoolsStore.getState();
  if (originalTrack !== undefined) {
    originalTrack.enabled = false;
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise((resolve) => setTimeout(resolve, 100));
    originalTrack.stop();
    localMediaStream?.removeTrack(originalTrack);
    store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else {
    if (!localMediaStream) {
      return;
    }
    localMediaStream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise((resolve) => setTimeout(resolve, 100));
    localMediaStream.getVideoTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
};

/**
 * devtools のローカルにもっている MediaStream のうち Audio Track と
 * 映像処理を行っている MediaProcessor の停止を行う関数
 * MediaStream から Track の削除も行う
 */
const stopLocalAudioTrack = (
  localMediaStream: MediaStream | null,
  noiseSuppressionProcessor: NoiseSuppressionProcessor | null,
): void => {
  const store = useSoraDevtoolsStore.getState();
  if (noiseSuppressionProcessor?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      localMediaStream?.removeTrack(originalTrack);
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessor.stopProcessing();
  } else if (localMediaStream) {
    localMediaStream.getAudioTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      store.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
};

export const {
  clearApiObjects,
  clearDataChannelMessages,
  clearRpcObjects,
  deleteAlertMessage,
  setAPIErrorAlertMessage,
  setAPIInfoAlertMessage,
  setRPCErrorAlertMessage,
  setAspectRatio,
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAudioContentHint,
  setAudioInput,
  setAudioOutput,
  setAudioTrack,
  setAutoGainControl,
  setBlurRadius,
  setBundleId,
  setChannelId,
  setClientId,
  setDataChannels,
  setDataChannelSignaling,
  setDebug,
  setDebugApiUrl,
  setDebugFilterText,
  setDebugType,
  setDisplayResolution,
  setEchoCancellation,
  setEchoCancellationType,
  setEnabledBundleId,
  setEnabledClientId,
  setEnabledDataChannels,
  setEnabledDataChannel,
  setEnabledForwardingFilters,
  setEnabledMetadata,
  setEnabledSignalingNotifyMetadata,
  setEnabledSignalingUrlCandidates,
  setEnabledVideoVP9Params,
  setEnabledVideoH264Params,
  setEnabledVideoH265Params,
  setEnabledVideoAV1Params,
  setAudioStreamingLanguageCode,
  setEnabledAudioStreamingLanguageCode,
  setFakeVolume,
  setFacingMode,
  setForceStereoOutput,
  setFrameRate,
  setIgnoreDisconnectWebSocket,
  setLocalMediaStream,
  setLogMessages,
  setMediaProcessorsNoiseSuppression,
  setMediaStats,
  setMediaType,
  setMetadata,
  setMp4MediaStream,
  setNoiseSuppression,
  setNotifyMessages,
  setReconnect,
  setResizeMode,
  setRole,
  setResolution,
  setApiObject,
  setRpcObject,
  setSignalingNotifyMetadata,
  setSignalingUrlCandidates,
  setForwardingFilters,
  setSimulcast,
  setSimulcastRid,
  setSimulcastRequestRid,
  setSora,
  setSoraReconnecting,
  setSoraErrorAlertMessage,
  setSoraInfoAlertMessage,
  setSpotlight,
  setSpotlightFocusRid,
  setSpotlightNumber,
  setSpotlightUnfocusRid,
  setVideo,
  setVideoBitRate,
  setVideoCodecType,
  setVideoContentHint,
  setVideoInput,
  setVideoTrack,
  setVideoVP9Params,
  setVideoH264Params,
  setVideoH265Params,
  setVideoAV1Params,
} = useSoraDevtoolsStore.getState();
