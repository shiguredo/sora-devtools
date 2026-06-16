import { assert, test } from "vite-plus/test";
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
import type { ConnectionOptionsState } from "./types.ts";
import {
  createConnectOptions,
  createFakeMediaConstraints,
  getValueByAspectRatio,
  parseMetadata,
  parseQueryString,
} from "./utils.ts";

// ConnectionOptionsState の完全な default を生成するヘルパー。
// signals.ts の初期値をインポートしないのは、signals.ts 側の初期値変更がテストに直接波及するのを避けるため。
// boolean / string / リテラル型は signals.ts と同じ既定値で書き下し、overrides で上書きできるようにする。
// PBT 側 utils.prop.ts からも import して二重定義を避ける。
export function createTestConnectionOptionsState(
  overrides: Partial<ConnectionOptionsState> = {},
): ConnectionOptionsState {
  const defaults: ConnectionOptionsState = {
    audio: true,
    audioBitRate: "",
    audioCodecType: "",
    audioStreamingLanguageCode: "",
    bundleId: "",
    clientId: "",
    dataChannelSignaling: "",
    dataChannels: "",
    enabledAudioStreamingLanguageCode: false,
    enabledBundleId: false,
    enabledClientId: false,
    enabledDataChannel: false,
    enabledSignalingNotifyMetadata: false,
    enabledForwardingFilters: false,
    enabledVideoVP9Params: false,
    enabledVideoH264Params: false,
    enabledVideoH265Params: false,
    enabledVideoAV1Params: false,
    ignoreDisconnectWebSocket: "",
    signalingNotifyMetadata: "",
    forwardingFilters: "",
    simulcast: "",
    simulcastRid: "",
    simulcastRequestRid: "",
    spotlight: "",
    spotlightFocusRid: "",
    spotlightNumber: "",
    spotlightUnfocusRid: "",
    video: true,
    videoBitRate: "",
    videoCodecType: "",
    videoVP9Params: "",
    videoH264Params: "",
    videoH265Params: "",
    videoAV1Params: "",
    forceStereoOutput: false,
    role: "sendrecv",
  };
  return { ...defaults, ...overrides };
}

// テスト用のヘルパー関数
function createSearchParams(parameters: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) {
      if (typeof value === "object") {
        // オブジェクトや配列の場合は JSON 文字列に変換
        searchParams.set(key, JSON.stringify(value));
      } else {
        // それ以外の場合は文字列に変換
        searchParams.set(key, String(value as string | number | boolean));
      }
    }
  }
  return searchParams;
}

test("空のクエリ文字列の場合、空のオブジェクトを返す", () => {
  const searchParams = new URLSearchParams();
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {});
});

test("単一の文字列パラメータを解析する", () => {
  const searchParams = createSearchParams({ channelId: "test-channel" });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, { channelId: "test-channel" });
});

test("複数のパラメータを解析する", () => {
  const searchParams = createSearchParams({
    channelId: "test-channel",
    clientId: "test-client",
    metadata: "test-metadata",
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {
    channelId: "test-channel",
    clientId: "test-client",
    metadata: "test-metadata",
  });
});

test("真偽値パラメータを解析する", () => {
  const searchParams = createSearchParams({
    audio: true,
    video: false,
    debug: true,
    showStats: false,
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {
    audio: true,
    video: false,
    debug: true,
    showStats: false,
  });
});

test("文字列として渡された真偽値パラメータを解析する", () => {
  const searchParams = createSearchParams({
    audio: "true",
    video: "false",
    debug: "true",
    showStats: "false",
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {
    audio: true,
    video: false,
    debug: true,
    showStats: false,
  });
});

test("特定の文字列リストからの値を解析する - audioCodecType", () => {
  for (const value of AUDIO_CODEC_TYPES) {
    const searchParams = createSearchParams({ audioCodecType: value });
    const result = parseQueryString(searchParams);
    assert.deepEqual(result, { audioCodecType: value });
  }
});

test("特定の文字列リストからの値を解析する - role", () => {
  for (const value of ROLES) {
    const searchParams = createSearchParams({ role: value });
    const result = parseQueryString(searchParams);
    assert.deepEqual(result, { role: value });
  }
});

test("特定の文字列リストからの値を解析する - videoCodecType", () => {
  for (const value of VIDEO_CODEC_TYPES) {
    const searchParams = createSearchParams({ videoCodecType: value });
    const result = parseQueryString(searchParams);
    assert.deepEqual(result, { videoCodecType: value });
  }
});

test("特定の文字列リストに含まれない値は無視される", () => {
  const searchParams = createSearchParams({
    audioCodecType: "invalid-codec",
    role: "invalid-role",
    videoCodecType: "invalid-codec",
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {});
});

test("signalingUrlCandidates を JSON として解析する", () => {
  const candidates = ["ws://example.com/signaling", "wss://example.com/signaling"];
  const searchParams = createSearchParams({
    signalingUrlCandidates: candidates,
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, { signalingUrlCandidates: candidates });
});

test("無効な JSON の signalingUrlCandidates は undefined になる", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", "{invalid-json}");
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {});
});

test("signalingUrlCandidates が配列でない場合は undefined になる", () => {
  const searchParams = createSearchParams({
    signalingUrlCandidates: { key: "value" },
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {});
});

test("undefined の項目は削除される", () => {
  const searchParams = createSearchParams({
    channelId: "test-channel",
    audioCodecType: "invalid-codec", // 無効な値なので undefined になる
    role: "sendrecv",
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {
    channelId: "test-channel",
    role: "sendrecv",
  });
  // audioCodecType が結果に含まれていないことを確認
  assert.notExists(result.audioCodecType);
});

test("数値パラメータを文字列として解析する", () => {
  const searchParams = createSearchParams({
    frameRate: 30,
    fakeVolume: 0.5,
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {
    frameRate: "30",
    fakeVolume: "0.5",
  });
});

test("解像度パラメータを解析する", () => {
  const searchParams = createSearchParams({
    resolution: "1280x720",
    displayResolution: "1920x1080",
  });
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, {
    resolution: "1280x720",
    displayResolution: "1920x1080",
  });
});

test("すべての特定の文字列リストからの値を解析する", () => {
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
  };

  const searchParams = createSearchParams(params);
  const result = parseQueryString(searchParams);
  assert.deepEqual(result, params);
});

// getValueByAspectRatio のテスト
test("getValueByAspectRatio: 4:3 は 4/3 を返す", () => {
  assert.equal(getValueByAspectRatio("4:3"), 4 / 3);
});

test("getValueByAspectRatio: 16:9 は 16/9 を返す", () => {
  assert.equal(getValueByAspectRatio("16:9"), 16 / 9);
});

test("getValueByAspectRatio: 21:9 は 21/9 を返す", () => {
  assert.equal(getValueByAspectRatio("21:9"), 21 / 9);
});

test("getValueByAspectRatio: 未対応の値は NaN を返す", () => {
  assert.isTrue(Number.isNaN(getValueByAspectRatio("unknown")));
});

// parseMetadata のテスト
test("parseMetadata: enabledMetadata=false なら undefined を返す", () => {
  assert.equal(parseMetadata(false, '{"a":1}'), undefined);
});

test("parseMetadata: 有効な JSON はパース済みオブジェクトを返す", () => {
  assert.deepEqual(parseMetadata(true, '{"a":1,"b":"x"}'), { a: 1, b: "x" });
});

test("parseMetadata: 無効な JSON は undefined を返す", () => {
  assert.equal(parseMetadata(true, "{invalid}"), undefined);
});

test("parseMetadata: 空文字列も undefined を返す", () => {
  assert.equal(parseMetadata(true, ""), undefined);
});

// createFakeMediaConstraints の frameRate 境界値テスト
// 0 / 負数 / 上限超過は worker の暴走描画につながるため utils 側でクランプする責務を確認する
test("createFakeMediaConstraints は frameRate に '0' を渡すと parsedFrameRate を 30 に補正する", () => {
  const result = createFakeMediaConstraints({
    audio: false,
    video: true,
    frameRate: "0",
    resolution: "",
    volume: "0",
    aspectRatio: "",
    resizeMode: "",
  });
  assert.equal(result.frameRate, 30);
});

test("createFakeMediaConstraints は frameRate に '1' を渡すと parsedFrameRate を 1 に保つ (下限境界)", () => {
  const result = createFakeMediaConstraints({
    audio: false,
    video: true,
    frameRate: "1",
    resolution: "",
    volume: "0",
    aspectRatio: "",
    resizeMode: "",
  });
  assert.equal(result.frameRate, 1);
});

test("createFakeMediaConstraints は frameRate に '60' を渡すと parsedFrameRate を 60 に保つ (上限境界)", () => {
  const result = createFakeMediaConstraints({
    audio: false,
    video: true,
    frameRate: "60",
    resolution: "",
    volume: "0",
    aspectRatio: "",
    resizeMode: "",
  });
  assert.equal(result.frameRate, 60);
});

test("createFakeMediaConstraints は frameRate に '99999' を渡すと parsedFrameRate を 60 にクランプする", () => {
  const result = createFakeMediaConstraints({
    audio: false,
    video: true,
    frameRate: "99999",
    resolution: "",
    volume: "0",
    aspectRatio: "",
    resizeMode: "",
  });
  assert.equal(result.frameRate, 60);
});

// createConnectOptions の parseMetadata 戻り値型検証テスト
// videoXxxParams / signalingNotifyMetadata は object (非 null・非 array) のみ受理する責務を確認する
test("createConnectOptions: videoVP9Params が '42' + enable=true なら未代入", () => {
  // number が parseMetadata から返ってきても代入しないこと
  const state = createTestConnectionOptionsState({
    enabledVideoVP9Params: true,
    videoVP9Params: "42",
  });
  const result = createConnectOptions(state);
  assert.equal(result.videoVP9Params, undefined);
});

test("createConnectOptions: videoVP9Params が '{\"a\":1}' + enable=true なら object を代入 (正常系)", () => {
  // object が parseMetadata から返ってきたらそのまま代入すること
  const state = createTestConnectionOptionsState({
    enabledVideoVP9Params: true,
    videoVP9Params: '{"a":1}',
  });
  const result = createConnectOptions(state);
  assert.deepEqual(result.videoVP9Params, { a: 1 });
});

test("createConnectOptions: videoVP9Params が 'null' + enable=true なら未代入", () => {
  // null も object 判定で除外すること
  const state = createTestConnectionOptionsState({
    enabledVideoVP9Params: true,
    videoVP9Params: "null",
  });
  const result = createConnectOptions(state);
  assert.equal(result.videoVP9Params, undefined);
});

test("createConnectOptions: videoAV1Params が '42' + enable=true なら未代入", () => {
  // AV1 が VP9 と同じ判定パスを通っていることを smoke で確認する
  const state = createTestConnectionOptionsState({
    enabledVideoAV1Params: true,
    videoAV1Params: "42",
  });
  const result = createConnectOptions(state);
  assert.equal(result.videoAV1Params, undefined);
});

test("createConnectOptions: videoH264Params が '42' + enable=true なら未代入", () => {
  // H264 が VP9 と同じ判定パスを通っていることを smoke で確認する
  const state = createTestConnectionOptionsState({
    enabledVideoH264Params: true,
    videoH264Params: "42",
  });
  const result = createConnectOptions(state);
  assert.equal(result.videoH264Params, undefined);
});

test("createConnectOptions: videoH265Params が '42' + enable=true なら未代入", () => {
  // H265 が VP9 と同じ判定パスを通っていることを smoke で確認する
  const state = createTestConnectionOptionsState({
    enabledVideoH265Params: true,
    videoH265Params: "42",
  });
  const result = createConnectOptions(state);
  assert.equal(result.videoH265Params, undefined);
});

test("createConnectOptions: signalingNotifyMetadata が 'null' + enable=true なら未代入", () => {
  // signalingNotifyMetadata カテゴリでも null を除外すること
  const state = createTestConnectionOptionsState({
    enabledSignalingNotifyMetadata: true,
    signalingNotifyMetadata: "null",
  });
  const result = createConnectOptions(state);
  assert.equal(result.signalingNotifyMetadata, undefined);
});

test('createConnectOptions: signalingNotifyMetadata が \'{"user":"x"}\' + enable=true なら object を代入 (正常系)', () => {
  // object が parseMetadata から返ってきたらそのまま代入すること
  const state = createTestConnectionOptionsState({
    enabledSignalingNotifyMetadata: true,
    signalingNotifyMetadata: '{"user":"x"}',
  });
  const result = createConnectOptions(state);
  assert.deepEqual(result.signalingNotifyMetadata, { user: "x" });
});
