import { Dispatch } from "@reduxjs/toolkit";
import { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import type { ConnectionPublisher, ConnectionSubscriber, TransportType } from "sora-js-sdk";
import Sora from "sora-js-sdk";

import type {
  ConnectionOptionsState,
  Json,
  QueryStringParameters,
  SoraDevtoolsState,
  SoraNotifyMessage,
  SoraPushMessage,
  TimelineMessage,
} from "@/types";
import {
  copy2clipboard,
  createAudioConstraints,
  createConnectOptions,
  createFakeMediaConstraints,
  createFakeMediaStream,
  createGetDisplayMediaConstraints,
  createSignalingURL,
  createVideoConstraints,
  drawFakeCanvas,
  getBlurRadiusNumber,
  getDefaultVideoCodecType,
  getDevices,
  getMediaStreamTrackProperties,
  parseMetadata,
  parseQueryString,
} from "@/utils";

import { slice } from "./slice";

// ページ初期化処理
export const setInitialParameter = () => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    dispatch(slice.actions.resetState());
    const qsParams = parseQueryString();
    if (qsParams.audio !== undefined) {
      dispatch(slice.actions.setAudio(qsParams.audio));
    }
    if (qsParams.audioBitRate !== undefined) {
      dispatch(slice.actions.setAudioBitRate(qsParams.audioBitRate));
    }
    if (qsParams.audioCodecType !== undefined) {
      dispatch(slice.actions.setAudioCodecType(qsParams.audioCodecType));
    }
    // 存在しない Device の場合はセットしない
    const deviceInfos = await getDevices();
    // audioinput
    const audioInputDevice = deviceInfos.find((d) => d.kind === "audioinput" && d.deviceId === qsParams.audioInput);
    if (audioInputDevice !== undefined) {
      dispatch(slice.actions.setAudioInput(audioInputDevice.deviceId));
    }
    // audiooutput
    const audioOutputDevice = deviceInfos.find((d) => d.kind === "audiooutput" && d.deviceId === qsParams.audioOutput);
    if (audioOutputDevice !== undefined) {
      dispatch(slice.actions.setAudioOutput(audioOutputDevice.deviceId));
    }
    // videoinput
    const videoInputDevice = deviceInfos.find((d) => d.kind === "videoinput" && d.deviceId === qsParams.videoInput);
    if (videoInputDevice !== undefined) {
      dispatch(slice.actions.setVideoInput(videoInputDevice.deviceId));
    }
    if (qsParams.autoGainControl !== undefined) {
      dispatch(slice.actions.setAutoGainControl(qsParams.autoGainControl));
    }
    if (qsParams.channelId !== undefined) {
      dispatch(slice.actions.setChannelId(qsParams.channelId));
    }
    if (qsParams.displayResolution !== undefined) {
      dispatch(slice.actions.setDisplayResolution(qsParams.displayResolution));
    }
    if (qsParams.e2ee !== undefined) {
      dispatch(slice.actions.setE2EE(qsParams.e2ee));
    }
    if (qsParams.echoCancellation !== undefined) {
      dispatch(slice.actions.setEchoCancellation(qsParams.echoCancellation));
    }
    if (qsParams.echoCancellationType !== undefined) {
      dispatch(slice.actions.setEchoCancellationType(qsParams.echoCancellationType));
    }
    if (qsParams.mediaType !== undefined) {
      dispatch(slice.actions.setMediaType(qsParams.mediaType));
    }
    if (qsParams.facingMode !== undefined) {
      dispatch(slice.actions.setFacingMode(qsParams.facingMode));
    }
    if (qsParams.fakeVolume !== undefined) {
      dispatch(slice.actions.setFakeVolume(qsParams.fakeVolume));
    }
    if (qsParams.frameRate !== undefined) {
      dispatch(slice.actions.setFrameRate(qsParams.frameRate));
    }
    if (qsParams.multistream !== undefined) {
      dispatch(slice.actions.setMultistream(qsParams.multistream));
    }
    if (qsParams.noiseSuppression !== undefined) {
      dispatch(slice.actions.setNoiseSuppression(qsParams.noiseSuppression));
    }
    if (qsParams.resolution !== undefined) {
      dispatch(slice.actions.setResolution(qsParams.resolution));
    }
    if (qsParams.showStats !== undefined) {
      dispatch(slice.actions.setShowStats(qsParams.showStats));
    }
    if (qsParams.simulcast !== undefined) {
      dispatch(slice.actions.setSimulcast(qsParams.simulcast));
    }
    if (qsParams.simulcastRid !== undefined) {
      dispatch(slice.actions.setSimulcastRid(qsParams.simulcastRid));
    }
    if (qsParams.spotlight !== undefined) {
      dispatch(slice.actions.setSpotlight(qsParams.spotlight));
    }
    if (qsParams.spotlightNumber !== undefined) {
      dispatch(slice.actions.setSpotlightNumber(qsParams.spotlightNumber));
    }
    if (qsParams.spotlightFocusRid !== undefined) {
      dispatch(slice.actions.setSpotlightFocusRid(qsParams.spotlightFocusRid));
    }
    if (qsParams.spotlightUnfocusRid !== undefined) {
      dispatch(slice.actions.setSpotlightUnfocusRid(qsParams.spotlightUnfocusRid));
    }
    if (qsParams.video !== undefined) {
      dispatch(slice.actions.setVideo(qsParams.video));
    }
    if (qsParams.videoBitRate !== undefined) {
      dispatch(slice.actions.setVideoBitRate(qsParams.videoBitRate));
    }
    // videoCodecType は query string の指定がない場合、ブラウザが対応している codec type を選択する
    if (qsParams.videoCodecType !== undefined) {
      dispatch(slice.actions.setVideoCodecType(qsParams.videoCodecType));
    } else {
      dispatch(slice.actions.setVideoCodecType(getDefaultVideoCodecType()));
    }
    if (qsParams.debug !== undefined) {
      dispatch(slice.actions.setDebug(qsParams.debug));
    }
    if (qsParams.debugType !== undefined) {
      dispatch(slice.actions.setDebugType(qsParams.debugType));
    }
    if (qsParams.mute !== undefined) {
      dispatch(slice.actions.setMute(qsParams.mute));
    }
    if (qsParams.dataChannelSignaling !== undefined) {
      dispatch(slice.actions.setDataChannelSignaling(qsParams.dataChannelSignaling));
    }
    if (qsParams.ignoreDisconnectWebSocket !== undefined) {
      dispatch(slice.actions.setIgnoreDisconnectWebSocket(qsParams.ignoreDisconnectWebSocket));
    }
    if (qsParams.micDevice !== undefined) {
      dispatch(slice.actions.setMicDevice(qsParams.micDevice));
    }
    if (qsParams.cameraDevice !== undefined) {
      dispatch(slice.actions.setCameraDevice(qsParams.cameraDevice));
    }
    if (qsParams.audioTrack !== undefined) {
      dispatch(slice.actions.setAudioTrack(qsParams.audioTrack));
    }
    if (qsParams.videoTrack !== undefined) {
      dispatch(slice.actions.setVideoTrack(qsParams.videoTrack));
    }
    if (qsParams.googCpuOveruseDetection !== undefined && qsParams.googCpuOveruseDetection !== null) {
      dispatch(slice.actions.setGoogCpuOveruseDetection(qsParams.googCpuOveruseDetection));
    }
    if (qsParams.bundleId !== undefined) {
      dispatch(slice.actions.setBundleId(qsParams.bundleId));
    }
    if (qsParams.clientId !== undefined) {
      dispatch(slice.actions.setClientId(qsParams.clientId));
    }
    if (qsParams.metadata !== undefined) {
      dispatch(slice.actions.setMetadata(qsParams.metadata));
    }
    if (qsParams.signalingNotifyMetadata !== undefined) {
      dispatch(slice.actions.setSignalingNotifyMetadata(qsParams.signalingNotifyMetadata));
    }
    if (qsParams.signalingUrlCandidates !== undefined) {
      dispatch(slice.actions.setSignalingUrlCandidates(qsParams.signalingUrlCandidates));
    }
    if (qsParams.dataChannels !== undefined) {
      dispatch(slice.actions.setDataChannels(qsParams.dataChannels));
    }
    if (qsParams.audioContentHint !== undefined) {
      dispatch(slice.actions.setAudioContentHint(qsParams.audioContentHint));
    }
    if (qsParams.videoContentHint !== undefined) {
      dispatch(slice.actions.setVideoContentHint(qsParams.videoContentHint));
    }
    if (qsParams.reconnect !== undefined) {
      dispatch(slice.actions.setReconnect(qsParams.reconnect));
    }
    if (qsParams.aspectRatio !== undefined) {
      dispatch(slice.actions.setAspectRatio(qsParams.aspectRatio));
    }
    if (qsParams.resizeMode !== undefined) {
      dispatch(slice.actions.setResizeMode(qsParams.resizeMode));
    }
    if (qsParams.blurRadius !== undefined) {
      dispatch(slice.actions.setBlurRadius(qsParams.blurRadius));
    }
    if (qsParams.mediaProcessorsNoiseSuppression !== undefined) {
      dispatch(slice.actions.setMediaProcessorsNoiseSuppression(qsParams.mediaProcessorsNoiseSuppression));
    }
    if (qsParams.apiUrl !== undefined && qsParams.apiUrl !== null) {
      dispatch(slice.actions.setApiUrl(qsParams.apiUrl));
    }
    if (qsParams.role !== undefined) {
      dispatch(slice.actions.setRole(qsParams.role));
    }
    if (qsParams.audioStreamingLanguageCode !== undefined) {
      dispatch(slice.actions.setAudioStreamingLanguageCode(qsParams.audioStreamingLanguageCode));
    }
    dispatch(slice.actions.setInitialFakeContents());
    // e2ee が有効な場合は e2ee 初期化処理をする
    const {
      audioStreamingLanguageCode,
      bundleId,
      clientId,
      dataChannelSignaling,
      dataChannels,
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
    // bundleId が存在した場合は enabledBundleId をセットする
    if (bundleId !== "") {
      dispatch(slice.actions.setEnabledBundleId(true));
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
    // audioStreamingLanguageCode が存在した場合は enabledAudioStreamingLanguageCode をセットする
    if (audioStreamingLanguageCode !== "") {
      dispatch(slice.actions.setEnabledAudioStreamingLanguageCode(true));
    }
    dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
  };
};

// URL をクリップボードにコピーする
// Component で state を参照すると状態変更で再レンダリングされてしまうため action でコピーする
export const copyURL = () => {
  return (_: Dispatch, getState: () => SoraDevtoolsState): void => {
    const state = getState();
    const parameters: Partial<QueryStringParameters> = {
      channelId: state.channelId,
      role: state.role,
      audio: state.audio,
      video: state.video,
      debug: state.debug,
      // URL の長さ短縮のため初期値と同じ場合は query string に含めない
      mediaType: state.mediaType !== "getUserMedia" ? state.mediaType : undefined,
      // URL の長さ短縮のため空文字列は query string に含めない
      audioBitRate: state.audioBitRate !== "" ? state.audioBitRate : undefined,
      audioCodecType: state.audioCodecType !== "" ? state.audioCodecType : undefined,
      videoBitRate: state.videoBitRate !== "" ? state.videoBitRate : undefined,
      videoCodecType: state.videoCodecType !== "" ? state.videoCodecType : undefined,
      audioContentHint: state.audioContentHint !== "" ? state.audioContentHint : undefined,
      autoGainControl: state.autoGainControl !== "" ? state.autoGainControl : undefined,
      noiseSuppression: state.noiseSuppression !== "" ? state.noiseSuppression : undefined,
      echoCancellation: state.echoCancellation !== "" ? state.echoCancellation : undefined,
      echoCancellationType: state.echoCancellationType !== "" ? state.echoCancellationType : undefined,
      videoContentHint: state.videoContentHint !== "" ? state.videoContentHint : undefined,
      resolution: state.resolution !== "" ? state.resolution : undefined,
      facingMode: state.facingMode !== "" ? state.facingMode : undefined,
      frameRate: state.frameRate !== "" ? state.frameRate : undefined,
      aspectRatio: state.aspectRatio !== "" ? state.aspectRatio : undefined,
      resizeMode: state.resizeMode !== "" ? state.resizeMode : undefined,
      blurRadius: state.blurRadius !== "" ? state.blurRadius : undefined,
      multistream: state.multistream !== "" ? state.multistream : undefined,
      simulcast: state.simulcast !== "" ? state.simulcast : undefined,
      simulcastRid: state.simulcastRid !== "" ? state.simulcastRid : undefined,
      spotlight: state.spotlight !== "" ? state.spotlight : undefined,
      spotlightNumber: state.spotlightNumber !== "" ? state.spotlightNumber : undefined,
      spotlightFocusRid: state.spotlightFocusRid !== "" ? state.spotlightFocusRid : undefined,
      spotlightUnfocusRid: state.spotlightUnfocusRid !== "" ? state.spotlightUnfocusRid : undefined,
      audioInput: state.audioInput !== "" ? state.audioInput : undefined,
      audioOutput: state.audioOutput !== "" ? state.audioOutput : undefined,
      videoInput: state.videoInput !== "" ? state.videoInput : undefined,
      displayResolution: state.displayResolution !== "" ? state.displayResolution : undefined,
      bundleId: state.bundleId !== "" && state.enabledBundleId ? state.bundleId : undefined,
      clientId: state.clientId !== "" && state.enabledClientId ? state.clientId : undefined,
      metadata: state.metadata !== "" && state.enabledMetadata ? state.metadata : undefined,
      signalingNotifyMetadata:
        state.signalingNotifyMetadata !== "" && state.enabledSignalingNotifyMetadata
          ? state.signalingNotifyMetadata
          : undefined,
      dataChannelSignaling:
        state.dataChannelSignaling !== "" && state.enabledDataChannel ? state.dataChannelSignaling : undefined,
      ignoreDisconnectWebSocket:
        state.ignoreDisconnectWebSocket !== "" && state.enabledDataChannel
          ? state.ignoreDisconnectWebSocket
          : undefined,
      dataChannels: state.dataChannels !== "" && state.enabledDataChannels ? state.dataChannels : undefined,
      // URL の長さ短縮のため true 以外は query string に含めない
      reconnect: state.reconnect === true ? true : undefined,
      e2ee: state.e2ee === true ? true : undefined,
      mediaProcessorsNoiseSuppression: state.mediaProcessorsNoiseSuppression === true ? true : undefined,
      // URL の長さ短縮のため false 以外は query string に含めない
      micDevice: state.micDevice === false ? false : undefined,
      cameraDevice: state.cameraDevice === false ? true : undefined,
      audioTrack: state.audioTrack === false ? true : undefined,
      videoTrack: state.videoTrack === false ? false : undefined,
      // signalingUrlCandidates
      signalingUrlCandidates:
        0 < state.signalingUrlCandidates.length && state.enabledSignalingUrlCandidates
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
        state.audioStreamingLanguageCode !== "" && state.enabledAudioStreamingLanguageCode
          ? state.audioStreamingLanguageCode
          : undefined,
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
    window.history.replaceState(null, "", `${location.pathname}?${queryStrings.join("&")}`);
  };
};

// State に応じて MediaStream インスタンスを生成する
// Fake の場合には volume control 用の GainNode も同時に生成する
type craeteMediaStreamPickedState = Pick<
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
  dispatch: Dispatch,
  state: craeteMediaStreamPickedState
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
      resizeMode: state.resizeMode,
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
      dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track)));
    }
    return [stream, null];
  }
  if (state.mediaType === "mediacaptureRegion") {
    if (!state.video || !state.cameraDevice) {
      return [new MediaStream(), null];
    }
    if (window.CropTarget === undefined) {
      throw new Error("Failed to call CropTarget");
    }
    if (navigator.mediaDevices === undefined) {
      throw new Error("Failed to call getDisplayMedia. Make sure domain is secure");
    }
    const constraints = createGetDisplayMediaConstraints({
      frameRate: state.frameRate,
      resolution: state.resolution,
      aspectRatio: state.aspectRatio,
      resizeMode: state.resizeMode,
    });
    constraints["preferCurrentTab"] = true;
    dispatch(slice.actions.setLogMessages({ title: LOG_TITLE, description: JSON.stringify(constraints) }));
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("media-constraints", constraints)));
    const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    const targetElement = document.querySelector("#cropArea");
    if (targetElement === null) {
      throw new Error("Failed to get CropTraget Element");
    }
    const cropTarget = await window.CropTarget.fromElement(targetElement);
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-get-display-media")));
    for (const track of stream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
      await track.cropTo(cropTarget);
      dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track)));
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
      dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track)));
    }
    for (const track of mediaStream.getAudioTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.audioContentHint;
      }
      track.enabled = state.audioTrack;
      dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track)));
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
    let audioTrack = audioMediaStream.getAudioTracks()[0];
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", audioTrack)));
    if (state.mediaProcessorsNoiseSuppression && NoiseSuppressionProcessor.isSupported()) {
      if (state.noiseSuppressionProcessor === null) {
        throw new Error("Failed to start NoiseSuppressionProcessor. NoiseSuppressionProcessor is 'null'");
      }
      state.noiseSuppressionProcessor.stopProcessing();
      audioTrack = await state.noiseSuppressionProcessor.startProcessing(audioTrack);
    }
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-audio-get-user-media")));
    mediaStream.addTrack(audioTrack);
  }
  const videoConstraints = createVideoConstraints({
    aspectRatio: state.aspectRatio,
    frameRate: state.frameRate,
    resizeMode: state.resizeMode,
    resolution: state.resolution,
    video: state.video && state.cameraDevice,
    videoInput: state.videoInput,
    facingMode: state.facingMode,
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
    const videoMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints }).catch((error) => {
      // video track の getUserMedia が失敗した場合には audio track が存在している可能性があるので止める
      mediaStream.getTracks().forEach((t) => {
        t.stop();
      });
      throw error;
    });
    let videoTrack = videoMediaStream.getVideoTracks()[0];
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", videoTrack)));
    if (state.blurRadius !== "" && VirtualBackgroundProcessor.isSupported()) {
      if (state.virtualBackgroundProcessor === null) {
        throw new Error("Failed to start VirtualBackgroundProcessor. VirtualBackgroundProcessor is 'null'");
      }
      const options = {
        blurRadius: getBlurRadiusNumber(state.blurRadius),
      };
      state.virtualBackgroundProcessor.stopProcessing();
      videoTrack = await state.virtualBackgroundProcessor.startProcessing(videoTrack, options);
    }
    dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-video-get-user-media")));
    mediaStream.addTrack(videoTrack);
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
      for (const track of event.streams[0].getTracks()) {
        dispatch(
          slice.actions.setTimelineMessage(
            createSoraDevtoolsTimelineMessage(
              `remote-${track.kind}-mediastream-track`,
              getMediaStreamTrackProperties(track)
            )
          )
        );
      }
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
    const { fakeContents, soraContents, reconnect, noiseSuppressionProcessor, virtualBackgroundProcessor } = getState();
    const { localMediaStream, remoteMediaStreams } = soraContents;
    if (virtualBackgroundProcessor && virtualBackgroundProcessor.isProcessing()) {
      const originalTrack = virtualBackgroundProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack)));
      }
      virtualBackgroundProcessor.stopProcessing();
    } else {
      if (localMediaStream) {
        localMediaStream.getVideoTracks().forEach((track) => {
          track.stop();
          dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track)));
        });
      }
    }
    if (noiseSuppressionProcessor && noiseSuppressionProcessor.isProcessing()) {
      const originalTrack = noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack)));
      }
      noiseSuppressionProcessor.stopProcessing();
    } else {
      if (localMediaStream) {
        localMediaStream.getAudioTracks().forEach((track) => {
          track.stop();
          dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track)));
        });
      }
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
    dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
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
    e2ee: state.e2ee,
    enabledAudioStreamingLanguageCode: state.enabledAudioStreamingLanguageCode,
    enabledBundleId: state.enabledBundleId,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSoraDevtoolsMediaStreamTrackLog(action: "start" | "stop", track: MediaStreamTrack): TimelineMessage {
  const properties = getMediaStreamTrackProperties(track);
  return createSoraDevtoolsTimelineMessage(`${action}-${track.kind}-mediastream-track`, properties);
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

export const connectSora = () => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
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

    // FIXME:
    if (connectionOptions.audioCodecType === "LYRA") {
      // TODO: 既に初期化済みかどうかをチェック
      Sora.initLyraModule("https://lyra-wasm.shiguredo.app/2022.1.0/", "https://lyra-wasm.shiguredo.app/2022.1.0/");
    }

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
      if (state.virtualBackgroundProcessor && state.virtualBackgroundProcessor.isProcessing()) {
        const originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
        if (originalTrack) {
          originalTrack.stop();
          dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack)));
        }
        state.virtualBackgroundProcessor.stopProcessing();
      } else {
        if (mediaStream) {
          mediaStream.getVideoTracks().forEach((track) => {
            track.stop();
            dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track)));
          });
        }
      }
      if (state.noiseSuppressionProcessor && state.noiseSuppressionProcessor.isProcessing()) {
        const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
        if (originalTrack) {
          originalTrack.stop();
          dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack)));
        }
        state.noiseSuppressionProcessor.stopProcessing();
      } else {
        if (mediaStream) {
          mediaStream.getAudioTracks().forEach((track) => {
            track.stop();
            dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track)));
          });
        }
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
    // disconnect 時に stream を止めないためのハック
    sora.stream = null;
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
};

export const reconnectSora = () => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
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
};

// Sora との切断処理
export const disconnectSora = () => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    const { soraContents } = getState();
    if (soraContents.sora) {
      dispatch(slice.actions.setSoraConnectionStatus("disconnecting"));
      await soraContents.sora.disconnect();
      dispatch(slice.actions.setSoraConnectionStatus("disconnected"));
    }
  };
};

// デバイス一覧を取得
export const setMediaDevices = () => {
  return async (dispatch: Dispatch, _getState: () => SoraDevtoolsState): Promise<void> => {
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
};

// デバイスの変更時などに Sora との接続を維持したまま MediaStream のみ更新
export const updateMediaStream = () => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    const state = getState();
    if (!state.soraContents.sora) {
      return;
    }
    if (state.virtualBackgroundProcessor && state.virtualBackgroundProcessor.isProcessing()) {
      const originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack)));
      }
      state.virtualBackgroundProcessor.stopProcessing();
    } else {
      if (state.soraContents.localMediaStream) {
        state.soraContents.localMediaStream.getVideoTracks().forEach((track) => {
          track.stop();
          dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track)));
        });
      }
    }

    if (state.noiseSuppressionProcessor && state.noiseSuppressionProcessor.isProcessing()) {
      const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack)));
      }
      state.noiseSuppressionProcessor.stopProcessing();
    } else {
      if (state.soraContents.localMediaStream) {
        state.soraContents.localMediaStream.getAudioTracks().forEach((track) => {
          track.stop();
          dispatch(slice.actions.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track)));
        });
      }
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
};

export const setE2EE = (e2ee: boolean) => {
  return async (dispatch: Dispatch, _getState: () => SoraDevtoolsState): Promise<void> => {
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
};

export const setMicDevice = (micDevice: boolean) => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
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
};

export const setCameraDevice = (cameraDevice: boolean) => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
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
  setBlurRadius,
  setBundleId,
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
  setEnabledBundleId,
  setEnabledClientId,
  setEnabledDataChannels,
  setEnabledDataChannel,
  setEnabledMetadata,
  setEnabledSignalingNotifyMetadata,
  setEnabledSignalingUrlCandidates,
  setAudioStreamingLanguageCode,
  setEnabledAudioStreamingLanguageCode,
  setFakeVolume,
  setFacingMode,
  setFrameRate,
  setIgnoreDisconnectWebSocket,
  setLocalMediaStream,
  setLogMessages,
  setMediaProcessorsNoiseSuppression,
  setMediaType,
  setMetadata,
  setMultistream,
  setNoiseSuppression,
  setNotifyMessages,
  setReconnect,
  setResizeMode,
  setRole,
  setResolution,
  setSignalingNotifyMetadata,
  setSignalingUrlCandidates,
  setSimulcast,
  setSimulcastRid,
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
} = slice.actions;
