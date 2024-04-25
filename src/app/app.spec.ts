import queryString from 'query-string'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ASPECT_RATIO_TYPES,
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  DISPLAY_RESOLUTIONS,
  ECHO_CANCELLATIONS,
  ECHO_CANCELLATION_TYPES,
  FRAME_RATES,
  IGNORE_DISCONNECT_WEBSOCKET,
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
} from '../constants'
import { setInitialParameter } from './actions'
import { store } from './store'

// このテストは query string にしていた値が適切に割り当てられているかをチェックする

function setLocationSearch(parameters: Record<string, unknown>): void {
  const search = queryString.stringify(parameters)
  // location.search を parseQueryString で引っ張るので location.search にダミーを入れる
  vi.stubGlobal('location', { search: search })
}

// XXX(v): 悲しいけど Mock 化するしかない
beforeEach(() => {
  URL.createObjectURL = vi.fn()
  globalThis.Worker = vi.fn()
})

describe('setInitialParameter tests', () => {
  it("should handle 'role'", async () => {
    for (const value of ROLES) {
      setLocationSearch({ role: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().role).toEqual(value)
    }
  })

  it("should handle 'aspectRatio'", async () => {
    for (const value of ASPECT_RATIO_TYPES) {
      setLocationSearch({ aspectRatio: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().aspectRatio).toEqual(value)
    }
  })

  it("should handle 'audioCodecType'", async () => {
    for (const value of AUDIO_CODEC_TYPES) {
      setLocationSearch({ audioCodecType: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().audioCodecType).toEqual(value)
    }
  })

  it("should handle 'audioBitRate'", async () => {
    for (const value of AUDIO_BIT_RATES) {
      setLocationSearch({ audioBitRate: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().audioBitRate).toEqual(value)
    }
  })

  it("should handle 'audioContentHint'", async () => {
    for (const value of AUDIO_CONTENT_HINTS) {
      setLocationSearch({ audioContentHint: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().audioContentHint).toEqual(value)
    }
  })

  it("should handle 'autoGainControl'", async () => {
    for (const value of AUTO_GAIN_CONTROLS) {
      setLocationSearch({ autoGainControl: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().autoGainControl).toEqual(value)
    }
  })

  it("should handle 'dataChannelSignaling'", async () => {
    for (const value of DATA_CHANNEL_SIGNALING) {
      setLocationSearch({ dataChannelSignaling: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().dataChannelSignaling).toEqual(value)
    }
  })

  it("should handle 'debugType'", async () => {
    for (const value of DEBUG_TYPES) {
      setLocationSearch({ debugType: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().debugType).toEqual(value)
    }
  })

  it("should handle 'displayResolution'", async () => {
    for (const value of DISPLAY_RESOLUTIONS) {
      setLocationSearch({ displayResolution: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().displayResolution).toEqual(value)
    }
  })

  it("should handle 'echoCancellationType'", async () => {
    for (const value of ECHO_CANCELLATION_TYPES) {
      setLocationSearch({ echoCancellationType: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().echoCancellationType).toEqual(value)
    }
  })

  it("should handle 'echoCancellation'", async () => {
    for (const value of ECHO_CANCELLATIONS) {
      setLocationSearch({ echoCancellation: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().echoCancellation).toEqual(value)
    }
  })

  it("should handle 'frameRate'", async () => {
    for (const value of FRAME_RATES) {
      setLocationSearch({ frameRate: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().frameRate).toEqual(value)
    }
  })

  it("should handle 'ignoreDisconnectWebSocket'", async () => {
    for (const value of IGNORE_DISCONNECT_WEBSOCKET) {
      setLocationSearch({ ignoreDisconnectWebSocket: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().ignoreDisconnectWebSocket).toEqual(value)
    }
  })

  it("should handle 'mediaType'", async () => {
    for (const value of MEDIA_TYPES) {
      // TODO(v): mediacapture は setInitialParameter に対応していない場合の処理が含まれている
      //          そのためテスト時に判定が getUserMedia になってしまうのでスキップする
      if (value === 'mediacaptureRegion') {
        continue
      }
      setLocationSearch({ mediaType: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().mediaType).toEqual(value)
    }
  })

  it("should handle 'multistream'", async () => {
    for (const value of MULTISTREAM) {
      setLocationSearch({ multistream: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().multistream).toEqual(value)
    }
  })

  it("should handle 'noiseSuppression'", async () => {
    for (const value of NOISE_SUPPRESSIONS) {
      setLocationSearch({ noiseSuppression: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().noiseSuppression).toEqual(value)
    }
  })

  it("should handle 'resizeMode'", async () => {
    for (const value of RESIZE_MODE_TYPES) {
      setLocationSearch({ resizeMode: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().resizeMode).toEqual(value)
    }
  })

  it("should handle 'resolution'", async () => {
    const value = '1920x1080'
    setLocationSearch({ resolution: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().resolution).toEqual(value)
  })

  it("should handle 'simulcast'", async () => {
    for (const value of SIMULCAST) {
      setLocationSearch({ simulcast: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().simulcast).toEqual(value)
    }
  })

  it("should handle 'simulcastRid'", async () => {
    for (const value of SIMULCAST_RID) {
      setLocationSearch({ simulcastRid: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().simulcastRid).toEqual(value)
    }
  })

  it("should handle 'spotlight'", async () => {
    for (const value of SPOTLIGHT) {
      setLocationSearch({ spotlight: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().spotlight).toEqual(value)
    }
  })

  it("should handle 'spotlightFocusRid'", async () => {
    for (const value of SPOTLIGHT_FOCUS_RIDS) {
      setLocationSearch({ spotlightFocusRid: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().spotlightFocusRid).toEqual(value)
    }
  })

  it("should handle 'spotlightUnfocusRid'", async () => {
    for (const value of SPOTLIGHT_FOCUS_RIDS) {
      setLocationSearch({ spotlightUnfocusRid: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().spotlightUnfocusRid).toEqual(value)
    }
  })

  it("should handle 'spotlightNumber'", async () => {
    for (const value of SPOTLIGHT_NUMBERS) {
      setLocationSearch({ spotlightNumber: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().spotlightNumber).toEqual(value)
    }
  })

  it("should handle 'videoBitRate'", async () => {
    for (const value of VIDEO_BIT_RATES) {
      setLocationSearch({ videoBitRate: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().videoBitRate).toEqual(value)
    }
  })

  it("should handle 'videoCodecType'", async () => {
    for (const value of VIDEO_CODEC_TYPES) {
      setLocationSearch({ videoCodecType: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().videoCodecType).toEqual(value)
    }
  })

  it("should handle 'videoContentHint'", async () => {
    for (const value of VIDEO_CONTENT_HINTS) {
      setLocationSearch({ videoContentHint: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().videoContentHint).toEqual(value)
    }
  })

  it("should handle 'audio'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ audio: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().audio).toEqual(value)
    }
  })

  it("should handle 'e2ee'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ e2ee: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().e2ee).toEqual(value)
    }
  })

  it("should handle 'showStats'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ showStats: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().showStats).toEqual(value)
    }
  })

  it("should handle 'mute'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ mute: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().mute).toEqual(value)
    }
  })

  it("should handle 'video'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ video: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().video).toEqual(value)
    }
  })

  it("should handle 'micDevice'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ micDevice: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().micDevice).toEqual(value)
    }
  })

  it("should handle 'cameraDevice'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ cameraDevice: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().cameraDevice).toEqual(value)
    }
  })

  it("should handle 'audioTrack'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ audioTrack: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().audioTrack).toEqual(value)
    }
  })

  it("should handle 'videoTrack'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ videoTrack: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().videoTrack).toEqual(value)
    }
  })

  it("should handle 'googCpuOveruseDetection'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ googCpuOveruseDetection: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().googCpuOveruseDetection).toEqual(value)
    }
  })

  it("should handle 'reconnect'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ reconnect: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().reconnect).toEqual(value)
    }
  })

  it("should handle 'debug'", async () => {
    for (const value of [true, false]) {
      setLocationSearch({ debug: value })
      await store.dispatch(setInitialParameter())
      expect(store.getState().debug).toEqual(value)
    }
  })

  it("should handle 'channelId'", async () => {
    const value = 'channelId'
    setLocationSearch({ channelId: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().channelId).toEqual(value)
  })

  it("should handle 'clientId'", async () => {
    const value = 'clientId'
    setLocationSearch({ clientId: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().clientId).toEqual(value)
  })

  it("should handle 'fakeVolume'", async () => {
    const value = '0.5'
    setLocationSearch({ fakeVolume: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().fakeVolume).toEqual(value)
  })

  it("should handle 'metadata'", async () => {
    const value = 'metadata'
    setLocationSearch({ metadata: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().metadata).toEqual(value)
  })

  it("should handle 'signalingNotifyMetadata'", async () => {
    const value = 'signalingNotifyMetadata'
    setLocationSearch({ signalingNotifyMetadata: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().signalingNotifyMetadata).toEqual(value)
  })

  it("should handle 'forwardingFilter'", async () => {
    const value = 'forwardingFilter'
    setLocationSearch({ forwardingFilter: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().forwardingFilter).toEqual(value)
  })

  it("should handle 'dataChannels'", async () => {
    const value = 'dataChannels'
    setLocationSearch({ dataChannels: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().dataChannels).toEqual(value)
  })

  it("should handle 'signalingUrlCandidates'", async () => {
    const value = ['ws://localhost:5000/signaling']
    setLocationSearch({ signalingUrlCandidates: JSON.stringify(value) })
    await store.dispatch(setInitialParameter())
    expect(store.getState().signalingUrlCandidates).toEqual(value)
  })

  it("should handle 'apiUrl'", async () => {
    const value = 'http://localhost:5000/api'
    setLocationSearch({ apiUrl: value })
    await store.dispatch(setInitialParameter())
    expect(store.getState().apiUrl).toEqual(value)
  })
})
