import { Dispatch } from "@reduxjs/toolkit";
import Sora from "sora-js-sdk";

import type { QueryStringParameters, SoraDevtoolsState } from "@/types";
import { copy2clipboard, getDefaultVideoCodecType, getDevices, parseQueryString } from "@/utils";

import { slice } from "./slice";

// ページ初期化処理
export const setInitialParameter = (role: SoraDevtoolsState["role"]) => {
  return async (dispatch: Dispatch, getState: () => SoraDevtoolsState): Promise<void> => {
    dispatch(slice.actions.resetState());
    const qsParams = parseQueryString();
    dispatch(slice.actions.setRole(role));
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
    dispatch(slice.actions.setInitialFakeContents());
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

    // TODO(yuito): multistream, simulcat, spotlight フラグを qs から受け取るようにする

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
};

// URL をクリップボードにコピーする
// Component で state を参照すると状態変更で再レンダリングされてしまうため action でコピーする
export const copyURL = () => {
  return (_: Dispatch, getState: () => SoraDevtoolsState): void => {
    const state = getState();
    const parameters: Partial<QueryStringParameters> = {
      // URL の長さ短縮のため初期値と同じ場合は query string に含めない
      mediaType: state.mediaType !== "getUserMedia" ? state.mediaType : undefined,
      channelId: state.channelId,
      audio: state.audio,
      video: state.video,
      audioBitRate: state.audioBitRate,
      audioCodecType: state.audioCodecType,
      videoBitRate: state.videoBitRate,
      videoCodecType: state.videoCodecType,
      // URL の長さ短縮のため空文字列は query string に含めない
      audioContentHint: state.audioContentHint !== "" ? state.audioContentHint : undefined,
      autoGainControl: state.autoGainControl !== "" ? state.autoGainControl : undefined,
      noiseSuppression: state.noiseSuppression !== "" ? state.noiseSuppression : undefined,
      echoCancellation: state.echoCancellation !== "" ? state.echoCancellation : undefined,
      echoCancellationType: state.echoCancellationType,
      videoContentHint: state.videoContentHint !== "" ? state.videoContentHint : undefined,
      resolution: state.resolution !== "" ? state.resolution : undefined,
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
      // URL の長さ短縮のため true 以外は query string に含めない
      mediaProcessorsNoiseSuppression: state.mediaProcessorsNoiseSuppression === true ? true : undefined,
      micDevice: state.micDevice === true ? true : undefined,
      cameraDevice: state.cameraDevice === true ? true : undefined,
      audioTrack: state.audioTrack === true ? true : undefined,
      videoTrack: state.videoTrack === true ? true : undefined,
      // spotlight
      // options
      e2ee: state.e2ee,
      clientId: state.clientId,
      metadata: state.metadata,
      signalingNotifyMetadata: state.signalingNotifyMetadata,
      dataChannelSignaling: state.dataChannelSignaling,
      ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
      signalingUrlCandidates: state.signalingUrlCandidates,
      dataChannels: state.dataChannels,
      reconnect: state.reconnect,
      debug: state.debug,
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
};
