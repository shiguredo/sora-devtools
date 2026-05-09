import { fc, test } from "@fast-check/vitest";
import { assert } from "vite-plus/test";
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
} from "./constants.ts";
import {
  formatUnixtime,
  getVideoSizeByResolution,
  parseBooleanString,
  parseMetadata,
  parseQueryString,
} from "./utils.ts";

// オブジェクトから URLSearchParams を作成するヘルパー関数
function createSearchParams(parameters: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) {
      if (typeof value === "object") {
        // オブジェクトや配列を JSON 文字列に変換
        searchParams.set(key, JSON.stringify(value));
      } else {
        // その他の値を文字列に変換
        searchParams.set(key, String(value as string | number | boolean));
      }
    }
  }
  return searchParams;
}

// 異なるパラメータタイプの Arbitraries

// 文字列パラメータの Arbitrary
const stringParamArb = fc.string();

// 真偽値パラメータの Arbitrary
const booleanParamArb = fc.boolean();

// 定義済みリストからの文字列パラメータの Arbitrary
const audioCodecTypeArb = fc.constantFrom(...AUDIO_CODEC_TYPES);
const roleArb = fc.constantFrom(...ROLES);
const videoCodecTypeArb = fc.constantFrom(...VIDEO_CODEC_TYPES);
const spotlightArb = fc.constantFrom(...SPOTLIGHT);
const simulcastArb = fc.constantFrom(...SIMULCAST);
const simulcastRidArb = fc.constantFrom(...SIMULCAST_RID);
const autoGainControlArb = fc.constantFrom(...AUTO_GAIN_CONTROLS);
const echoCancellationArb = fc.constantFrom(...ECHO_CANCELLATIONS);
const echoCancellationTypeArb = fc.constantFrom(...ECHO_CANCELLATION_TYPES);
const noiseSuppressionArb = fc.constantFrom(...NOISE_SUPPRESSIONS);
const debugTypeArb = fc.constantFrom(...DEBUG_TYPES);
const mediaTypeArb = fc.constantFrom(...MEDIA_TYPES);
const dataChannelSignalingArb = fc.constantFrom(...DATA_CHANNEL_SIGNALING);
const ignoreDisconnectWebSocketArb = fc.constantFrom(...IGNORE_DISCONNECT_WEBSOCKET);
const aspectRatioArb = fc.constantFrom(...ASPECT_RATIO_TYPES);
const resizeModeArb = fc.constantFrom(...RESIZE_MODE_TYPES);
const audioContentHintArb = fc.constantFrom(...AUDIO_CONTENT_HINTS);
const videoContentHintArb = fc.constantFrom(...VIDEO_CONTENT_HINTS);
const spotlightNumberArb = fc.constantFrom(...SPOTLIGHT_NUMBERS);
const spotlightFocusRidArb = fc.constantFrom(...SPOTLIGHT_FOCUS_RIDS);
const facingModeArb = fc.constantFrom(...FACING_MODES);
const blurRadiusArb = fc.constantFrom(...BLUR_RADIUS);

// signalingUrlCandidates 用の文字列配列の Arbitrary
const signalingUrlCandidatesArb = fc.array(fc.webUrl());

// 解像度の Arbitrary（形式: "幅 x 高さ"）
const resolutionArb = fc
  .tuple(fc.integer({ min: 1, max: 3840 }), fc.integer({ min: 1, max: 2160 }))
  .map(([width, height]) => `${width}x${height}`);

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
  audioBitRate: fc.option(fc.integer({ min: 1, max: 1000 }).map(String), {
    nil: undefined,
  }),
  videoBitRate: fc.option(fc.integer({ min: 1, max: 10_000 }).map(String), {
    nil: undefined,
  }),
  frameRate: fc.option(fc.integer({ min: 1, max: 60 }).map(String), {
    nil: undefined,
  }),
  fakeVolume: fc.option(fc.float({ min: 0, max: 1 }).map(String), {
    nil: undefined,
  }),
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
  mediaProcessorsNoiseSuppression: fc.option(booleanParamArb, {
    nil: undefined,
  }),

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
  ignoreDisconnectWebSocket: fc.option(ignoreDisconnectWebSocketArb, {
    nil: undefined,
  }),
  aspectRatio: fc.option(aspectRatioArb, { nil: undefined }),
  resizeMode: fc.option(resizeModeArb, { nil: undefined }),
  audioContentHint: fc.option(audioContentHintArb, { nil: undefined }),
  videoContentHint: fc.option(videoContentHintArb, { nil: undefined }),
  spotlightNumber: fc.option(spotlightNumberArb, { nil: undefined }),
  spotlightFocusRid: fc.option(spotlightFocusRidArb, { nil: undefined }),
  spotlightUnfocusRid: fc.option(spotlightFocusRidArb, { nil: undefined }),
  facingMode: fc.option(facingModeArb, { nil: undefined }),
  blurRadius: fc.option(blurRadiusArb, { nil: undefined }),

  // Special parameters
  signalingUrlCandidates: fc.option(signalingUrlCandidatesArb, {
    nil: undefined,
  }),
  resolution: fc.option(resolutionArb, { nil: undefined }),
  displayResolution: fc.option(resolutionArb, { nil: undefined }),
});

test.prop([parametersArb])(
  "parseQueryString は有効な入力に対して例外をスローしないこと",
  (params) => {
    const searchParams = createSearchParams(params);
    // 有効な入力に対して例外をスローしないこと
    const result = parseQueryString(searchParams);
    // 結果はオブジェクトであること
    assert.equal(typeof result, "object");
  },
);

test.prop([fc.constant(new URLSearchParams())])(
  "parseQueryString は空の入力に対して空のオブジェクトを返すこと",
  (searchParams) => {
    const result = parseQueryString(searchParams);
    assert.deepEqual(result, {});
  },
);

test.prop([fc.string(), fc.string()])(
  "parseQueryString は文字列パラメータを正しく解析すること",
  (channelId, clientId) => {
    const params = { channelId, clientId };
    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.equal(result.channelId, channelId);
    assert.equal(result.clientId, clientId);
  },
);

test.prop([fc.boolean(), fc.boolean()])(
  "parseQueryString は真偽値パラメータを正しく解析すること",
  (audio, video) => {
    const params = { audio, video };
    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.equal(result.audio, audio);
    assert.equal(result.video, video);
  },
);

test.prop([fc.boolean(), fc.boolean()])(
  "parseQueryString は真偽値を表す文字列を正しく解析すること",
  (audio, video) => {
    // 真偽値を文字列に変換
    const params = {
      audio: audio ? "true" : "false",
      video: video ? "true" : "false",
    };
    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.equal(result.audio, audio);
    assert.equal(result.video, video);
  },
);

test.prop([audioCodecTypeArb, roleArb, videoCodecTypeArb])(
  "parseQueryString は指定された文字列パラメータを正しく解析すること",
  (audioCodecType, role, videoCodecType) => {
    // 定数から正確な型でパラメータを作成
    const params: Record<string, unknown> = {
      audioCodecType,
      role,
      videoCodecType,
    };

    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.equal(result.audioCodecType, audioCodecType);
    assert.equal(result.role, role);
    assert.equal(result.videoCodecType, videoCodecType);
  },
);

test.prop([
  fc.string().filter((s) => !AUDIO_CODEC_TYPES.includes(s as "" | "OPUS")),
  fc.string().filter((s) => !ROLES.includes(s as "sendrecv" | "sendonly" | "recvonly")),
])(
  "parseQueryString は無効な指定文字列パラメータを無視すること",
  (invalidAudioCodec, invalidRole) => {
    const params = { audioCodecType: invalidAudioCodec, role: invalidRole };
    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.isUndefined(result.audioCodecType);
    assert.isUndefined(result.role);
  },
);

test.prop([fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 })])(
  "parseQueryString は signalingUrlCandidates を正しく解析すること",
  (candidates) => {
    const params = { signalingUrlCandidates: candidates };
    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.deepEqual(result.signalingUrlCandidates, candidates);
  },
);

test.prop([
  fc.string().filter((s) => {
    try {
      JSON.parse(s);
      return false; // 有効なJSONの場合は除外
    } catch {
      return true; // 無効なJSONの場合は保持
    }
  }),
])("parseQueryString は無効な JSON の signalingUrlCandidates を処理すること", (invalidJson) => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", invalidJson);
  const result = parseQueryString(searchParams);

  assert.isUndefined(result.signalingUrlCandidates);
});

test.prop([fc.string(), fc.string().filter((s) => !AUDIO_CODEC_TYPES.includes(s as "" | "OPUS"))])(
  "parseQueryString は undefined のプロパティを削除すること",
  (channelId, invalidAudioCodec) => {
    const params = { channelId, audioCodecType: invalidAudioCodec };
    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.equal(result.channelId, channelId);
    assert.notProperty(result, "audioCodecType");
  },
);

test.prop([fc.tuple(fc.integer({ min: 1, max: 3840 }), fc.integer({ min: 1, max: 2160 }))])(
  "parseQueryString は解像度の形式を正しく処理すること",
  ([width, height]) => {
    const resolution = `${width}x${height}`;
    const params = { resolution };
    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.equal(result.resolution, resolution);
  },
);

test.prop([parametersArb])("parseQueryString は有効な入力に対して冪等であること", (params) => {
  const searchParams = createSearchParams(params);
  const result1 = parseQueryString(searchParams);

  // 結果から新しい searchParams を作成して再度解析
  const searchParams2 = createSearchParams(result1 as Record<string, unknown>);
  const result2 = parseQueryString(searchParams2);

  // 結果は同じであるべき
  assert.deepEqual(result2, result1);
});

test.prop({
  channelId: fc.string(),
  audio: fc.boolean(),
  audioCodecType: audioCodecTypeArb,
  signalingUrlCandidates: fc.array(fc.webUrl(), { minLength: 1, maxLength: 3 }),
  resolution: resolutionArb,
})(
  "parseQueryString はすべてのパラメータタイプの混合を処理すること",
  ({ channelId, audio, audioCodecType, signalingUrlCandidates, resolution }) => {
    // 定数から正確な型でパラメータを作成
    const params: Record<string, unknown> = {
      channelId,
      audio,
      audioCodecType,
      signalingUrlCandidates,
      resolution,
    };

    const searchParams = createSearchParams(params);
    const result = parseQueryString(searchParams);

    assert.equal(result.channelId, channelId);
    assert.equal(result.audio, audio);
    assert.equal(result.audioCodecType, audioCodecType);
    assert.deepEqual(result.signalingUrlCandidates, signalingUrlCandidates);
    assert.equal(result.resolution, resolution);
  },
);

// parseBooleanString のテスト
test.prop([fc.boolean()])("parseBooleanString は 'true'/'false' を boolean に変換する", (value) => {
  const result = parseBooleanString(String(value));
  assert.equal(result, value);
});

test.prop([fc.string().filter((s) => s !== "true" && s !== "false")])(
  "parseBooleanString は 'true'/'false' 以外の文字列で undefined を返す",
  (value) => {
    assert.equal(parseBooleanString(value), undefined);
  },
);

// formatUnixtime のテスト
test.prop([fc.integer({ min: 0, max: 4_102_444_800_000 })])(
  "formatUnixtime は YYYY-M-D HH:MM:SS.mmm 形式の文字列を返す",
  (time) => {
    const result = formatUnixtime(time);
    assert.match(result, /^\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
  },
);

// parseMetadata のテスト
test.prop([fc.boolean(), fc.json()])(
  "parseMetadata: enabled=true で有効な JSON はパース済みの値を返す",
  (enabled, jsonStr) => {
    const result = parseMetadata(enabled, jsonStr);
    if (enabled) {
      assert.deepEqual(result, JSON.parse(jsonStr));
    } else {
      assert.equal(result, undefined);
    }
  },
);

test.prop([fc.string().filter((s) => s.length > 0 && s !== "null")])(
  "parseMetadata: 任意文字列で常に undefined または有効値を返す（生文字列は返さない）",
  (anyStr) => {
    const result = parseMetadata(true, anyStr);
    if (result === undefined) {
      return;
    }
    // undefined でない場合はパース可能だったので、JSON.parse の結果と一致する
    assert.deepEqual(result, JSON.parse(anyStr));
  },
);

// getVideoSizeByResolution のテスト
test.prop([fc.integer({ min: 1, max: 7680 }), fc.integer({ min: 1, max: 4320 })])(
  "getVideoSizeByResolution: NxM 形式は { width, height } を返す",
  (width, height) => {
    const result = getVideoSizeByResolution(`${width}x${height}`);
    assert.equal(result.width, width);
    assert.equal(result.height, height);
  },
);

test.prop([fc.string().filter((s) => !/^\d+x\d+$/.test(s))])(
  "getVideoSizeByResolution: 不正な形式は { width: 0, height: 0 } を返す",
  (invalidResolution) => {
    const result = getVideoSizeByResolution(invalidResolution);
    assert.equal(result.width, 0);
    assert.equal(result.height, 0);
  },
);
