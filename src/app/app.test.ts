import { assert, beforeEach, test, vi } from 'vitest'

import {
  ASPECT_RATIO_TYPES,
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  ECHO_CANCELLATIONS,
  ECHO_CANCELLATION_TYPES,
  IGNORE_DISCONNECT_WEBSOCKET,
  MEDIA_TYPES,
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
} from '../constants.ts'
import { setInitialParameter } from './actions.ts'
import { useSoraDevtoolsStore } from './store.ts'

// このテストは query string にしていた値が適切に割り当てられているかをチェックする

function setLocationSearch(parameters: Record<string, unknown>): void {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        // オブジェクトや配列の場合は JSON 文字列に変換
        searchParams.set(key, JSON.stringify(value))
      } else {
        // それ以外の場合は文字列に変換
        searchParams.set(key, String(value))
      }
    }
  }
  // location.search を parseQueryString で引っ張るので location.search にダミーを入れる
  vi.stubGlobal('location', { search: `?${searchParams.toString()}` })
}

// XXX(v): 悲しいけど Mock 化するしかない
beforeEach(() => {
  URL.createObjectURL = vi.fn()
  globalThis.Worker = vi.fn()
})

// setInitialParameter tests
test("should handle 'role'", async () => {
  for (const value of ROLES) {
    setLocationSearch({ role: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().role, value)
  }
})

test("should handle 'aspectRatio'", async () => {
  for (const value of ASPECT_RATIO_TYPES) {
    setLocationSearch({ aspectRatio: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().aspectRatio, value)
  }
})

test("should handle 'audioCodecType'", async () => {
  for (const value of AUDIO_CODEC_TYPES) {
    setLocationSearch({ audioCodecType: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().audioCodecType, value)
  }
})

test("should handle 'audioBitRate'", async () => {
  for (const value of AUDIO_BIT_RATES) {
    setLocationSearch({ audioBitRate: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().audioBitRate, value)
  }
})

test("should handle 'audioContentHint'", async () => {
  for (const value of AUDIO_CONTENT_HINTS) {
    setLocationSearch({ audioContentHint: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().audioContentHint, value)
  }
})

test("should handle 'autoGainControl'", async () => {
  for (const value of AUTO_GAIN_CONTROLS) {
    setLocationSearch({ autoGainControl: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().autoGainControl, value)
  }
})

test("should handle 'dataChannelSignaling'", async () => {
  for (const value of DATA_CHANNEL_SIGNALING) {
    setLocationSearch({ dataChannelSignaling: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().dataChannelSignaling, value)
  }
})

test("should handle 'debugType'", async () => {
  for (const value of DEBUG_TYPES) {
    setLocationSearch({ debugType: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().debugType, value)
  }
})

test("should handle 'displayResolution'", async () => {
  const value = '1920x1080'
  setLocationSearch({ displayResolution: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().displayResolution, value)
})

test("should handle 'echoCancellationType'", async () => {
  for (const value of ECHO_CANCELLATION_TYPES) {
    setLocationSearch({ echoCancellationType: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().echoCancellationType, value)
  }
})

test("should handle 'echoCancellation'", async () => {
  for (const value of ECHO_CANCELLATIONS) {
    setLocationSearch({ echoCancellation: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().echoCancellation, value)
  }
})

test("should handle 'frameRate'", async () => {
  const value = '60'
  setLocationSearch({ frameRate: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().frameRate, value)
})

test("should handle 'ignoreDisconnectWebSocket'", async () => {
  for (const value of IGNORE_DISCONNECT_WEBSOCKET) {
    setLocationSearch({ ignoreDisconnectWebSocket: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().ignoreDisconnectWebSocket, value)
  }
})

test("should handle 'mediaType'", async () => {
  for (const value of MEDIA_TYPES) {
    setLocationSearch({ mediaType: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().mediaType, value)
  }
})

test("should handle 'noiseSuppression'", async () => {
  for (const value of NOISE_SUPPRESSIONS) {
    setLocationSearch({ noiseSuppression: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().noiseSuppression, value)
  }
})

test("should handle 'resizeMode'", async () => {
  for (const value of RESIZE_MODE_TYPES) {
    setLocationSearch({ resizeMode: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().resizeMode, value)
  }
})

test("should handle 'resolution'", async () => {
  const value = '1920x1080'
  setLocationSearch({ resolution: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().resolution, value)
})

test("should handle 'simulcast'", async () => {
  for (const value of SIMULCAST) {
    setLocationSearch({ simulcast: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().simulcast, value)
  }
})

test("should handle 'simulcastRid'", async () => {
  for (const value of SIMULCAST_RID) {
    setLocationSearch({ simulcastRid: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().simulcastRid, value)
  }
})

test("should handle 'spotlight'", async () => {
  for (const value of SPOTLIGHT) {
    setLocationSearch({ spotlight: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().spotlight, value)
  }
})

test("should handle 'spotlightFocusRid'", async () => {
  for (const value of SPOTLIGHT_FOCUS_RIDS) {
    setLocationSearch({ spotlightFocusRid: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().spotlightFocusRid, value)
  }
})

test("should handle 'spotlightUnfocusRid'", async () => {
  for (const value of SPOTLIGHT_FOCUS_RIDS) {
    setLocationSearch({ spotlightUnfocusRid: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().spotlightUnfocusRid, value)
  }
})

test("should handle 'spotlightNumber'", async () => {
  for (const value of SPOTLIGHT_NUMBERS) {
    setLocationSearch({ spotlightNumber: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().spotlightNumber, value)
  }
})

test("should handle 'videoBitRate'", async () => {
  for (const value of VIDEO_BIT_RATES) {
    setLocationSearch({ videoBitRate: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().videoBitRate, value)
  }
})

test("should handle 'videoCodecType'", async () => {
  for (const value of VIDEO_CODEC_TYPES) {
    setLocationSearch({ videoCodecType: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().videoCodecType, value)
  }
})

test("should handle 'videoContentHint'", async () => {
  for (const value of VIDEO_CONTENT_HINTS) {
    setLocationSearch({ videoContentHint: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().videoContentHint, value)
  }
})

test("should handle 'audio'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ audio: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().audio, value)
  }
})

test("should handle 'showStats'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ showStats: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().showStats, value)
  }
})

test("should handle 'mute'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ mute: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().mute, value)
  }
})

test("should handle 'video'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ video: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().video, value)
  }
})

test("should handle 'micDevice'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ micDevice: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().micDevice, value)
  }
})

test("should handle 'cameraDevice'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ cameraDevice: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().cameraDevice, value)
  }
})

test("should handle 'audioTrack'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ audioTrack: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().audioTrack, value)
  }
})

test("should handle 'videoTrack'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ videoTrack: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().videoTrack, value)
  }
})

test("should handle 'googCpuOveruseDetection'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ googCpuOveruseDetection: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().googCpuOveruseDetection, value)
  }
})

test("should handle 'reconnect'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ reconnect: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().reconnect, value)
  }
})

test("should handle 'debug'", async () => {
  for (const value of [true, false]) {
    setLocationSearch({ debug: value })
    await setInitialParameter()
    assert.equal(useSoraDevtoolsStore.getState().debug, value)
  }
})

test("should handle 'channelId'", async () => {
  const value = 'channelId'
  setLocationSearch({ channelId: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().channelId, value)
})

test("should handle 'clientId'", async () => {
  const value = 'clientId'
  setLocationSearch({ clientId: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().clientId, value)
})

test("should handle 'fakeVolume'", async () => {
  const value = '0.5'
  setLocationSearch({ fakeVolume: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().fakeVolume, value)
})

test("should handle 'metadata'", async () => {
  const value = 'metadata'
  setLocationSearch({ metadata: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().metadata, value)
})

test("should handle 'signalingNotifyMetadata'", async () => {
  const value = 'signalingNotifyMetadata'
  setLocationSearch({ signalingNotifyMetadata: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().signalingNotifyMetadata, value)
})

test("should handle 'forwardingFilters'", async () => {
  const value = 'forwardingFilters'
  setLocationSearch({ forwardingFilters: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().forwardingFilters, value)
})

test("should handle 'forwardingFilter'", async () => {
  const value = 'forwardingFilter'
  setLocationSearch({ forwardingFilter: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().forwardingFilter, value)
})

test("should handle 'dataChannels'", async () => {
  const value = 'dataChannels'
  setLocationSearch({ dataChannels: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().dataChannels, value)
})

test("should handle 'signalingUrlCandidates'", async () => {
  const value = ['ws://localhost:5000/signaling']
  setLocationSearch({ signalingUrlCandidates: JSON.stringify(value) })
  await setInitialParameter()
  assert.deepEqual(useSoraDevtoolsStore.getState().signalingUrlCandidates, value)
})

test("should handle 'apiUrl'", async () => {
  const value = 'http://localhost:5000/api'
  setLocationSearch({ apiUrl: value })
  await setInitialParameter()
  assert.equal(useSoraDevtoolsStore.getState().apiUrl, value)
})