// このテストは Cline https://cline.bot/ による自動生成です。

// biome-ignore lint/correctness/noUndeclaredDependencies: test のため
// biome-ignore lint/style/noNamespaceImport: test のため
import * as fc from 'fast-check'
import { expect, test } from 'vitest'
import {
  ASPECT_RATIO_TYPES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  BLUR_RADIUS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  ECHO_CANCELLATIONS,
  ECHO_CANCELLATION_TYPES,
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

// オブジェクトから URLSearchParams を作成するヘルパー関数
function createSearchParams(parameters: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        // オブジェクトや配列を JSON 文字列に変換
        searchParams.set(key, JSON.stringify(value))
      } else {
        // その他の値を文字列に変換
        searchParams.set(key, String(value))
      }
    }
  }
  return searchParams
}

// 異なるパラメータタイプの Arbitraries

// 文字列パラメータの Arbitrary
const stringParamArb = fc.string()

// 真偽値パラメータの Arbitrary
const booleanParamArb = fc.boolean()

// 定義済みリストからの文字列パラメータの Arbitrary
const audioCodecTypeArb = fc.constantFrom(...AUDIO_CODEC_TYPES)
const roleArb = fc.constantFrom(...ROLES)
const videoCodecTypeArb = fc.constantFrom(...VIDEO_CODEC_TYPES)
const spotlightArb = fc.constantFrom(...SPOTLIGHT)
const simulcastArb = fc.constantFrom(...SIMULCAST)
const simulcastRidArb = fc.constantFrom(...SIMULCAST_RID)
const autoGainControlArb = fc.constantFrom(...AUTO_GAIN_CONTROLS)
const echoCancellationArb = fc.constantFrom(...ECHO_CANCELLATIONS)
const echoCancellationTypeArb = fc.constantFrom(...ECHO_CANCELLATION_TYPES)
const noiseSuppressionArb = fc.constantFrom(...NOISE_SUPPRESSIONS)
const debugTypeArb = fc.constantFrom(...DEBUG_TYPES)
const mediaTypeArb = fc.constantFrom(...MEDIA_TYPES)
const dataChannelSignalingArb = fc.constantFrom(...DATA_CHANNEL_SIGNALING)
const ignoreDisconnectWebSocketArb = fc.constantFrom(...IGNORE_DISCONNECT_WEBSOCKET)
const aspectRatioArb = fc.constantFrom(...ASPECT_RATIO_TYPES)
const resizeModeArb = fc.constantFrom(...RESIZE_MODE_TYPES)
const audioContentHintArb = fc.constantFrom(...AUDIO_CONTENT_HINTS)
const videoContentHintArb = fc.constantFrom(...VIDEO_CONTENT_HINTS)
const spotlightNumberArb = fc.constantFrom(...SPOTLIGHT_NUMBERS)
const spotlightFocusRidArb = fc.constantFrom(...SPOTLIGHT_FOCUS_RIDS)
const facingModeArb = fc.constantFrom(...FACING_MODES)
const blurRadiusArb = fc.constantFrom(...BLUR_RADIUS)
const lightAdjustmentArb = fc.constantFrom(...LIGHT_ADJUSTMENT)

// signalingUrlCandidates 用の文字列配列の Arbitrary
const signalingUrlCandidatesArb = fc.array(fc.webUrl())

// 解像度の Arbitrary（形式: "幅 x 高さ"）
const resolutionArb = fc
  .tuple(fc.integer({ min: 1, max: 3840 }), fc.integer({ min: 1, max: 2160 }))
  .map(([width, height]) => `${width}x${height}`)

// 完全なパラメータセットの Arbitrary
const parametersArb = fc.record({
  // String parameters
  apiUrl: fc.option(stringParamArb, { nil: undefined }),
  channelId: fc.option(stringParamArb, { nil: undefined }),
  clientId: fc.option(stringParamArb, { nil: undefined }),
  bundleId: fc.option(stringParamArb, { nil: undefined }),
  metadata: fc.option(stringParamArb, { nil: undefined }),
  signalingNotifyMetadata: fc.option(stringParamArb, { nil: undefined }),
  forwardingFilters: fc.option(stringParamArb, { nil: undefined }),
  forwardingFilter: fc.option(stringParamArb, { nil: undefined }),
  audioBitRate: fc.option(fc.integer({ min: 1, max: 1000 }).map(String), { nil: undefined }),
  videoBitRate: fc.option(fc.integer({ min: 1, max: 10000 }).map(String), { nil: undefined }),
  frameRate: fc.option(fc.integer({ min: 1, max: 60 }).map(String), { nil: undefined }),
  fakeVolume: fc.option(fc.float({ min: 0, max: 1 }).map(String), { nil: undefined }),
  audioStreamingLanguageCode: fc.option(stringParamArb, { nil: undefined }),
  videoVP9Params: fc.option(stringParamArb, { nil: undefined }),
  videoH264Params: fc.option(stringParamArb, { nil: undefined }),
  videoH265Params: fc.option(stringParamArb, { nil: undefined }),
  videoAV1Params: fc.option(stringParamArb, { nil: undefined }),
  audioInput: fc.option(stringParamArb, { nil: undefined }),
  videoInput: fc.option(stringParamArb, { nil: undefined }),
  audioOutput: fc.option(stringParamArb, { nil: undefined }),
  dataChannels: fc.option(stringParamArb, { nil: undefined }),

  // Boolean parameters
  audio: fc.option(booleanParamArb, { nil: undefined }),
  video: fc.option(booleanParamArb, { nil: undefined }),
  googCpuOveruseDetection: fc.option(booleanParamArb, { nil: undefined }),
  debug: fc.option(booleanParamArb, { nil: undefined }),
  mediaStats: fc.option(booleanParamArb, { nil: undefined }),
  showStats: fc.option(booleanParamArb, { nil: undefined }),
  mute: fc.option(booleanParamArb, { nil: undefined }),
  micDevice: fc.option(booleanParamArb, { nil: undefined }),
  cameraDevice: fc.option(booleanParamArb, { nil: undefined }),
  audioTrack: fc.option(booleanParamArb, { nil: undefined }),
  videoTrack: fc.option(booleanParamArb, { nil: undefined }),
  reconnect: fc.option(booleanParamArb, { nil: undefined }),
  mediaProcessorsNoiseSuppression: fc.option(booleanParamArb, { nil: undefined }),

  // Specified string parameters
  audioCodecType: fc.option(audioCodecTypeArb, { nil: undefined }),
  role: fc.option(roleArb, { nil: undefined }),
  videoCodecType: fc.option(videoCodecTypeArb, { nil: undefined }),
  spotlight: fc.option(spotlightArb, { nil: undefined }),
  simulcast: fc.option(simulcastArb, { nil: undefined }),
  simulcastRid: fc.option(simulcastRidArb, { nil: undefined }),
  autoGainControl: fc.option(autoGainControlArb, { nil: undefined }),
  echoCancellation: fc.option(echoCancellationArb, { nil: undefined }),
  echoCancellationType: fc.option(echoCancellationTypeArb, { nil: undefined }),
  noiseSuppression: fc.option(noiseSuppressionArb, { nil: undefined }),
  debugType: fc.option(debugTypeArb, { nil: undefined }),
  mediaType: fc.option(mediaTypeArb, { nil: undefined }),
  dataChannelSignaling: fc.option(dataChannelSignalingArb, { nil: undefined }),
  ignoreDisconnectWebSocket: fc.option(ignoreDisconnectWebSocketArb, { nil: undefined }),
  aspectRatio: fc.option(aspectRatioArb, { nil: undefined }),
  resizeMode: fc.option(resizeModeArb, { nil: undefined }),
  audioContentHint: fc.option(audioContentHintArb, { nil: undefined }),
  videoContentHint: fc.option(videoContentHintArb, { nil: undefined }),
  spotlightNumber: fc.option(spotlightNumberArb, { nil: undefined }),
  spotlightFocusRid: fc.option(spotlightFocusRidArb, { nil: undefined }),
  spotlightUnfocusRid: fc.option(spotlightFocusRidArb, { nil: undefined }),
  facingMode: fc.option(facingModeArb, { nil: undefined }),
  blurRadius: fc.option(blurRadiusArb, { nil: undefined }),
  lightAdjustment: fc.option(lightAdjustmentArb, { nil: undefined }),

  // Special parameters
  signalingUrlCandidates: fc.option(signalingUrlCandidatesArb, { nil: undefined }),
  resolution: fc.option(resolutionArb, { nil: undefined }),
  displayResolution: fc.option(resolutionArb, { nil: undefined }),
})

test('parseQueryString は有効な入力に対して例外をスローしないこと', () => {
  fc.assert(
    fc.property(parametersArb, (params) => {
      const searchParams = createSearchParams(params)
      // 有効な入力に対して例外をスローしないこと
      const result = parseQueryString(searchParams)
      // 結果はオブジェクトであること
      expect(typeof result).toBe('object')
      return true
    }),
  )
})

test('parseQueryString は空の入力に対して空のオブジェクトを返すこと', () => {
  fc.assert(
    fc.property(fc.constant(new URLSearchParams()), (searchParams) => {
      const result = parseQueryString(searchParams)
      expect(result).toEqual({})
      return true
    }),
  )
})

test('parseQueryString は文字列パラメータを正しく解析すること', () => {
  fc.assert(
    fc.property(fc.string(), fc.string(), (channelId, clientId) => {
      const params = { channelId, clientId }
      const searchParams = createSearchParams(params)
      const result = parseQueryString(searchParams)

      expect(result.channelId).toBe(channelId)
      expect(result.clientId).toBe(clientId)
      return true
    }),
  )
})

test('parseQueryString は真偽値パラメータを正しく解析すること', () => {
  fc.assert(
    fc.property(fc.boolean(), fc.boolean(), (audio, video) => {
      const params = { audio, video }
      const searchParams = createSearchParams(params)
      const result = parseQueryString(searchParams)

      expect(result.audio).toBe(audio)
      expect(result.video).toBe(video)
      return true
    }),
  )
})

test('parseQueryString は真偽値を表す文字列を正しく解析すること', () => {
  fc.assert(
    fc.property(fc.boolean(), fc.boolean(), (audio, video) => {
      // 真偽値を文字列に変換
      const params = {
        audio: audio ? 'true' : 'false',
        video: video ? 'true' : 'false',
      }
      const searchParams = createSearchParams(params)
      const result = parseQueryString(searchParams)

      expect(result.audio).toBe(audio)
      expect(result.video).toBe(video)
      return true
    }),
  )
})

test('parseQueryString は指定された文字列パラメータを正しく解析すること', () => {
  fc.assert(
    fc.property(
      audioCodecTypeArb,
      roleArb,
      videoCodecTypeArb,
      (audioCodecType, role, videoCodecType) => {
        // 定数から正確な型でパラメータを作成
        const params: Record<string, unknown> = {}
        params.audioCodecType = audioCodecType
        params.role = role
        params.videoCodecType = videoCodecType

        const searchParams = createSearchParams(params)
        const result = parseQueryString(searchParams)

        expect(result.audioCodecType).toBe(audioCodecType)
        expect(result.role).toBe(role)
        expect(result.videoCodecType).toBe(videoCodecType)
        return true
      },
    ),
  )
})

test('parseQueryString は無効な指定文字列パラメータを無視すること', () => {
  fc.assert(
    fc.property(
      fc.string().filter((s) => !AUDIO_CODEC_TYPES.includes(s as '' | 'OPUS')),
      fc.string().filter((s) => !ROLES.includes(s as 'sendrecv' | 'sendonly' | 'recvonly')),
      (invalidAudioCodec, invalidRole) => {
        const params = { audioCodecType: invalidAudioCodec, role: invalidRole }
        const searchParams = createSearchParams(params)
        const result = parseQueryString(searchParams)

        expect(result.audioCodecType).toBeUndefined()
        expect(result.role).toBeUndefined()
        return true
      },
    ),
  )
})

test('parseQueryString は signalingUrlCandidates を正しく解析すること', () => {
  fc.assert(
    fc.property(fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }), (candidates) => {
      const params = { signalingUrlCandidates: candidates }
      const searchParams = createSearchParams(params)
      const result = parseQueryString(searchParams)

      expect(result.signalingUrlCandidates).toEqual(candidates)
      return true
    }),
  )
})

test('parseQueryString は無効な JSON の signalingUrlCandidates を処理すること', () => {
  fc.assert(
    fc.property(
      fc.string().filter((s) => {
        try {
          JSON.parse(s)
          return false // 有効なJSONの場合は除外
        } catch {
          return true // 無効なJSONの場合は保持
        }
      }),
      (invalidJson) => {
        const searchParams = new URLSearchParams()
        searchParams.set('signalingUrlCandidates', invalidJson)
        const result = parseQueryString(searchParams)

        expect(result.signalingUrlCandidates).toBeUndefined()
        return true
      },
    ),
  )
})

test('parseQueryString は undefined のプロパティを削除すること', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.string().filter((s) => !AUDIO_CODEC_TYPES.includes(s as '' | 'OPUS')),
      (channelId, invalidAudioCodec) => {
        const params = { channelId, audioCodecType: invalidAudioCodec }
        const searchParams = createSearchParams(params)
        const result = parseQueryString(searchParams)

        expect(result.channelId).toBe(channelId)
        expect(result).not.toHaveProperty('audioCodecType')
        return true
      },
    ),
  )
})

test('parseQueryString は解像度の形式を正しく処理すること', () => {
  fc.assert(
    fc.property(
      fc.tuple(fc.integer({ min: 1, max: 3840 }), fc.integer({ min: 1, max: 2160 })),
      ([width, height]) => {
        const resolution = `${width}x${height}`
        const params = { resolution }
        const searchParams = createSearchParams(params)
        const result = parseQueryString(searchParams)

        expect(result.resolution).toBe(resolution)
        return true
      },
    ),
  )
})

test('parseQueryString は有効な入力に対して冪等であること', () => {
  fc.assert(
    fc.property(parametersArb, (params) => {
      const searchParams = createSearchParams(params)
      const result1 = parseQueryString(searchParams)

      // 結果から新しい searchParams を作成して再度解析
      const searchParams2 = createSearchParams(result1 as Record<string, unknown>)
      const result2 = parseQueryString(searchParams2)

      // 結果は同じであるべき
      expect(result2).toEqual(result1)
      return true
    }),
  )
})

test('parseQueryString はすべてのパラメータタイプの混合を処理すること', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.boolean(),
      audioCodecTypeArb,
      fc.array(fc.webUrl(), { minLength: 1, maxLength: 3 }),
      resolutionArb,
      (channelId, audio, audioCodecType, signalingUrlCandidates, resolution) => {
        // 定数から正確な型でパラメータを作成
        const params: Record<string, unknown> = {}
        params.channelId = channelId
        params.audio = audio
        params.audioCodecType = audioCodecType
        params.signalingUrlCandidates = signalingUrlCandidates
        params.resolution = resolution

        const searchParams = createSearchParams(params)
        const result = parseQueryString(searchParams)

        expect(result.channelId).toBe(channelId)
        expect(result.audio).toBe(audio)
        expect(result.audioCodecType).toBe(audioCodecType)
        expect(result.signalingUrlCandidates).toEqual(signalingUrlCandidates)
        expect(result.resolution).toBe(resolution)
        return true
      },
    ),
  )
})
