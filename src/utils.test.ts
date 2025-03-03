import { assert, test } from 'vitest'
import {
  ASPECT_RATIO_TYPES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  BLUR_RADIUS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  ECHO_CANCELLATIONS,
  FACING_MODES,
  IGNORE_DISCONNECT_WEBSOCKET,
  LIGHT_ADJUSTMENT,
  MEDIA_TYPES,
  NOISE_SUPPRESSIONS,
  RESIZE_MODE_TYPES,
  ROLES,
  SIMULCAST,
  SIMULCAST_RID,
  SPOTLIGHT,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  VIDEO_CODEC_TYPES,
  VIDEO_CONTENT_HINTS,
} from './constants.ts'
import { parseQueryString } from './utils.ts'

// テスト用のヘルパー関数
function createSearchParams(parameters: Record<string, unknown>): URLSearchParams {
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
  return searchParams
}

test('空のクエリ文字列の場合、空のオブジェクトを返す', () => {
  const searchParams = new URLSearchParams()
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {})
})

test('単一の文字列パラメータを解析する', () => {
  const searchParams = createSearchParams({ channelId: 'test-channel' })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, { channelId: 'test-channel' })
})

test('複数のパラメータを解析する', () => {
  const searchParams = createSearchParams({
    channelId: 'test-channel',
    clientId: 'test-client',
    metadata: 'test-metadata',
  })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {
    channelId: 'test-channel',
    clientId: 'test-client',
    metadata: 'test-metadata',
  })
})

test('真偽値パラメータを解析する', () => {
  const searchParams = createSearchParams({
    audio: true,
    video: false,
    debug: true,
    showStats: false,
  })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {
    audio: true,
    video: false,
    debug: true,
    showStats: false,
  })
})

test('文字列として渡された真偽値パラメータを解析する', () => {
  const searchParams = createSearchParams({
    audio: 'true',
    video: 'false',
    debug: 'true',
    showStats: 'false',
  })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {
    audio: true,
    video: false,
    debug: true,
    showStats: false,
  })
})

test('特定の文字列リストからの値を解析する - audioCodecType', () => {
  for (const value of AUDIO_CODEC_TYPES) {
    const searchParams = createSearchParams({ audioCodecType: value })
    const result = parseQueryString(searchParams)
    assert.deepEqual(result, { audioCodecType: value })
  }
})

test('特定の文字列リストからの値を解析する - role', () => {
  for (const value of ROLES) {
    const searchParams = createSearchParams({ role: value })
    const result = parseQueryString(searchParams)
    assert.deepEqual(result, { role: value })
  }
})

test('特定の文字列リストからの値を解析する - videoCodecType', () => {
  for (const value of VIDEO_CODEC_TYPES) {
    const searchParams = createSearchParams({ videoCodecType: value })
    const result = parseQueryString(searchParams)
    assert.deepEqual(result, { videoCodecType: value })
  }
})

test('特定の文字列リストに含まれない値は無視される', () => {
  const searchParams = createSearchParams({
    audioCodecType: 'invalid-codec',
    role: 'invalid-role',
    videoCodecType: 'invalid-codec',
  })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {})
})

test('signalingUrlCandidates を JSON として解析する', () => {
  const candidates = ['ws://example.com/signaling', 'wss://example.com/signaling']
  const searchParams = createSearchParams({ signalingUrlCandidates: candidates })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, { signalingUrlCandidates: candidates })
})

test('無効な JSON の signalingUrlCandidates は undefined になる', () => {
  const searchParams = new URLSearchParams()
  searchParams.set('signalingUrlCandidates', '{invalid-json}')
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {})
})

test('signalingUrlCandidates が配列でない場合は undefined になる', () => {
  const searchParams = createSearchParams({ signalingUrlCandidates: { key: 'value' } })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {})
})

test('undefined の項目は削除される', () => {
  const searchParams = createSearchParams({
    channelId: 'test-channel',
    audioCodecType: 'invalid-codec', // 無効な値なので undefined になる
    role: 'sendrecv',
  })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {
    channelId: 'test-channel',
    role: 'sendrecv',
  })
  // audioCodecType が結果に含まれていないことを確認
  assert.notExists(result.audioCodecType)
})

test('数値パラメータを文字列として解析する', () => {
  const searchParams = createSearchParams({
    frameRate: 30,
    fakeVolume: 0.5,
  })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {
    frameRate: '30',
    fakeVolume: '0.5',
  })
})

test('解像度パラメータを解析する', () => {
  const searchParams = createSearchParams({
    resolution: '1280x720',
    displayResolution: '1920x1080',
  })
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, {
    resolution: '1280x720',
    displayResolution: '1920x1080',
  })
})

test('すべての特定の文字列リストからの値を解析する', () => {
  // 各定数リストから最初の値をテスト
  const params = {
    audioCodecType: AUDIO_CODEC_TYPES[0],
    role: ROLES[0],
    videoCodecType: VIDEO_CODEC_TYPES[0],
    spotlight: SPOTLIGHT[0],
    simulcast: SIMULCAST[0],
    simulcastRid: SIMULCAST_RID[0],
    autoGainControl: AUTO_GAIN_CONTROLS[0],
    echoCancellation: ECHO_CANCELLATIONS[0],
    noiseSuppression: NOISE_SUPPRESSIONS[0],
    debugType: DEBUG_TYPES[0],
    mediaType: MEDIA_TYPES[0],
    dataChannelSignaling: DATA_CHANNEL_SIGNALING[0],
    ignoreDisconnectWebSocket: IGNORE_DISCONNECT_WEBSOCKET[0],
    aspectRatio: ASPECT_RATIO_TYPES[0],
    resizeMode: RESIZE_MODE_TYPES[0],
    audioContentHint: AUDIO_CONTENT_HINTS[0],
    videoContentHint: VIDEO_CONTENT_HINTS[0],
    spotlightNumber: SPOTLIGHT_NUMBERS[0],
    spotlightFocusRid: SPOTLIGHT_FOCUS_RIDS[0],
    spotlightUnfocusRid: SPOTLIGHT_FOCUS_RIDS[0],
    facingMode: FACING_MODES[0],
    blurRadius: BLUR_RADIUS[0],
    lightAdjustment: LIGHT_ADJUSTMENT[0],
  }

  const searchParams = createSearchParams(params)
  const result = parseQueryString(searchParams)
  assert.deepEqual(result, params)
})
