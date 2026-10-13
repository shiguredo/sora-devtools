import { test } from "@playwright/test";
import type { Page } from "@playwright/test";

const DEVTOOLS_URL = "http://localhost:3333/devtools/";

// 音声信号が存在すると判定する RMS の下限
// fakeVolume 0.5 の正弦波 (振幅 1) の RMS は約 0.35 のため、0.05 は十分に余裕のある閾値
const AUDIO_RMS_THRESHOLD = 0.05;

interface AudioTrackAnalysis {
  trackId: string;
  hasAudioTrack: boolean;
  readyState: string;
  muted: boolean;
  rms: number;
}

// fakeVolume の range 入力を設定する
// FakeVolumeForm の input には id 属性がないため、FormGroup の data-control-id から特定する
async function setFakeVolume(page: Page, value: string): Promise<void> {
  await page.locator('[data-control-id="fakeVolume"] input[type="range"]').fill(value);
}

// デバイス選択の select を先頭の実デバイスに切り替える
// option の先頭は「未指定」(value が空文字) のため、実デバイスは 2 番目以降にある
async function selectFirstDevice(
  page: Page,
  controlId: "audioInput" | "videoInput",
): Promise<void> {
  await page.locator(`[data-control-id="${controlId}"] select`).selectOption({ index: 1 });
}

// request media を押して、#local-video に音声トラックと映像トラックが載るまで待つ
async function requestMediaAndWaitForLocalTracks(page: Page): Promise<void> {
  await page.getByRole("button", { name: "request media" }).click();
  await page.waitForFunction(
    () => {
      const videoElement = document.querySelector("#local-video");
      if (videoElement === null) {
        return false;
      }
      const stream = (videoElement as HTMLVideoElement).srcObject;
      if (!(stream instanceof MediaStream)) {
        return false;
      }
      if (stream.getVideoTracks().length === 0) {
        return false;
      }
      return stream.getAudioTracks().length > 0;
    },
    undefined,
    { timeout: 5000 },
  );
}

// fakeMedia のプレビュー状態 (request media 後・Sora 未接続) まで進める
// - mediaType を fakeMedia にする
// - audio / micDevice を有効化し、fakeVolume を 0.5 にする
// - request media でフェイク音声 (正弦波) とフェイク映像を開始する
async function startFakeMediaInPreview(page: Page): Promise<void> {
  await page.goto(DEVTOOLS_URL);
  await page.locator('button[name="connect"]').waitFor({ timeout: 5000 });
  await page.locator("#fakeMedia").check();
  await page.locator("#audio").check();
  await page.locator("#micDevice").check();
  await setFakeVolume(page, "0.5");
  await requestMediaAndWaitForLocalTracks(page);
}

// getUserMedia のプレビュー状態 (request media 後・Sora 未接続) まで進める
// - mediaType は既定値の getUserMedia をそのまま使う
// - audio / micDevice を有効化し、request media で実デバイスの音声と映像を開始する
//   e2e では playwright.config.ts の起動オプションにより Chromium の fake device が使われる
// - audioInput / videoInput の select は getUserMedia のときだけ表示される
async function startUserMediaInPreview(page: Page): Promise<void> {
  await page.goto(DEVTOOLS_URL);
  await page.locator('button[name="connect"]').waitFor({ timeout: 5000 });
  await page.locator("#audio").check();
  await page.locator("#micDevice").check();
  await requestMediaAndWaitForLocalTracks(page);
}

// video 要素の srcObject から音声トラックを取り出し、トラック状態と音声信号の RMS を計測して返す
// アプリの AudioContext / GainNode はモジュールスコープのためテストから直接観測できない。
// そのため解析用の AudioContext を作り、トラックに実際に音声信号が流れているかを観測する
async function getAudioTrackAnalysis(page: Page): Promise<AudioTrackAnalysis> {
  return page.evaluate(async () => {
    const videoElement = document.querySelector<HTMLVideoElement>("#local-video");
    if (videoElement === null) {
      throw new Error("video element #local-video not found");
    }
    const stream = videoElement.srcObject;
    if (!(stream instanceof MediaStream)) {
      throw new Error("expected #local-video srcObject to be MediaStream");
    }
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      return {
        trackId: "",
        hasAudioTrack: false,
        readyState: "absent",
        muted: false,
        rms: 0,
      };
    }
    const [audioTrack] = audioTracks;
    const audioContext = new AudioContext();
    const sourceNode = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect(analyser);
    // アナライザーに音声信号が流れ込むのを待ってから計測する
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    const timeDomainData = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(timeDomainData);
    await audioContext.close();
    let squaredSum = 0;
    for (const value of timeDomainData) {
      squaredSum += value * value;
    }
    const rms = Math.sqrt(squaredSum / timeDomainData.length);
    return {
      trackId: audioTrack.id,
      hasAudioTrack: true,
      readyState: audioTrack.readyState,
      muted: audioTrack.muted,
      rms,
    };
  });
}

// 映像トラックが期待する状態になるまで待つ。
// デバイス切替は既存の video track を removeTrack してから addTrack するため、
// DOM のチェックが終わっても track の付け替えが完了していないことがある
// "live" はトラックが live かつ映像フレームが描画されている (videoWidth > 0) ことを意味する。
// canvas captureStream のトラックは OffscreenCanvas の描画と独立に live になるため、
// videoWidth で実フレームの到着を確認する
// expected には "absent" (トラックなし) または "live" (トラックあり) を渡す
async function waitForVideoTrackState(page: Page, expected: "absent" | "live"): Promise<void> {
  await page.waitForFunction(
    (expectedState) => {
      const videoElement = document.querySelector("#local-video");
      if (videoElement === null) {
        return false;
      }
      const stream = (videoElement as HTMLVideoElement).srcObject;
      if (!(stream instanceof MediaStream)) {
        return false;
      }
      const videoTracks = stream.getVideoTracks();
      if (expectedState === "absent") {
        return videoTracks.length === 0;
      }
      return (
        videoTracks.length > 0 &&
        videoTracks[0].readyState === "live" &&
        (videoElement as HTMLVideoElement).videoWidth > 0
      );
    },
    expected,
    { timeout: 5000 },
  );
}

// 音声トラックが新しい ID に置き換わり、映像トラックも残っている状態になるまで待つ
// メディアの再生成が実効化されず、音声トラックの停止・削除だけが起きた場合はタイムアウトする。
// 原因を追いやすくするため、タイムアウト時は現在のトラック状態を添えて throw する
// 再生成には getUserMedia によるデバイス取得が含まれ、環境によっては数秒かかるため待ち時間を長めに取る
async function waitForAudioTrackReplacement(page: Page, previousTrackId: string): Promise<void> {
  try {
    await page.waitForFunction(
      (previousId) => {
        const videoElement = document.querySelector("#local-video");
        if (videoElement === null) {
          return false;
        }
        const stream = (videoElement as HTMLVideoElement).srcObject;
        if (!(stream instanceof MediaStream)) {
          return false;
        }
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0 || audioTracks[0].id === previousId) {
          return false;
        }
        return stream.getVideoTracks().length > 0;
      },
      previousTrackId,
      { timeout: 10_000 },
    );
  } catch {
    const state = await page.evaluate(() => {
      const videoElement = document.querySelector<HTMLVideoElement>("#local-video");
      if (videoElement === null) {
        return { videoElement: "missing" };
      }
      const stream = videoElement.srcObject;
      if (!(stream instanceof MediaStream)) {
        return { stream: "not-mediastream" };
      }
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      return {
        audioTrackCount: audioTracks.length,
        audioTrackId: audioTracks[0]?.id ?? null,
        audioReadyState: audioTracks[0]?.readyState ?? null,
        videoTrackCount: videoTracks.length,
        videoReadyState: videoTracks[0]?.readyState ?? null,
      };
    });
    throw new Error(
      `expected audio track replaced from "${previousTrackId}", got ${JSON.stringify(state)}`,
    );
  }
}

// 音声トラックが存在して live・muted でないことを検証して失敗時は throw する
// 音声信号の有無は検証しないため、信号を伴わない経路 (getUserMedia) の検証にも使える
// step は検証箇所を表すラベル
function expectActiveAudio(step: string, analysis: AudioTrackAnalysis): void {
  if (!analysis.hasAudioTrack) {
    throw new Error(`${step}: expected audio track, got none`);
  }
  if (analysis.readyState !== "live") {
    throw new Error(
      `${step}: expected audio track readyState "live", got "${analysis.readyState}"`,
    );
  }
  if (analysis.muted) {
    throw new Error(`${step}: expected audio track not muted`);
  }
}

// 音声トラックが live で、実際に音声信号が流れていることを検証して失敗時は throw する
// step は検証箇所を表すラベル
function expectLiveAudio(step: string, analysis: AudioTrackAnalysis): void {
  expectActiveAudio(step, analysis);
  if (analysis.rms < AUDIO_RMS_THRESHOLD) {
    throw new Error(`${step}: expected audio rms >= ${AUDIO_RMS_THRESHOLD}, got ${analysis.rms}`);
  }
}

// 音声トラックが新しい track id に置き換わっていることを検証して失敗時は throw する
function expectReplacedAudioTrack(
  step: string,
  previousTrackId: string,
  actual: AudioTrackAnalysis,
): void {
  if (actual.trackId === previousTrackId) {
    throw new Error(
      `${step}: expected audio track replaced from "${previousTrackId}", got same id`,
    );
  }
}

// プレビュー状態 (request media 後・Sora 未接続) の update-mediastream は、
// かつて末尾の中断ガードが connectionStatus の "disconnected" を拾って新規メディアを破棄していた。
// 旧メディアの停止・削除は先に済んでいるため、音声トラックが消え、映像トラックが ended のまま固定されていた。
// このテストはプレビュー状態でも新しいメディアに置き換わることを検証する
test("fakeMedia: プレビュー状態の update-mediastream で音声・映像が再生成される", async ({
  page,
}) => {
  await startFakeMediaInPreview(page);

  const initialAudio = await getAudioTrackAnalysis(page);
  expectLiveAudio("initial state", initialAudio);
  await waitForVideoTrackState(page, "live");

  // update-mediastream ボタンは "Media options" セクションの中にあり、既定では折りたたまれている
  await page.getByRole("button", { name: "Media options" }).click();

  // プレビュー状態 (localMediaStream は取得済み・connectionStatus は disconnected) でも押せること
  const updateMediaStreamButton = page.getByRole("button", { name: "update-mediastream" });
  if (await updateMediaStreamButton.isDisabled()) {
    throw new Error("expected update-mediastream button enabled in preview state");
  }
  await updateMediaStreamButton.click();

  // 音声トラックが新しい ID に置き換わる (旧トラックは停止・削除済みのため再生成の確認になる)
  await waitForAudioTrackReplacement(page, initialAudio.trackId);
  // 映像トラックも live のまま維持される
  await waitForVideoTrackState(page, "live");

  const updatedAudio = await getAudioTrackAnalysis(page);
  // 新しい AudioContext のフェイク音声が鳴り続けていること
  expectLiveAudio("after update-mediastream in preview", updatedAudio);
  expectReplacedAudioTrack(
    "after update-mediastream in preview",
    initialAudio.trackId,
    updatedAudio,
  );
});

// プレビュー状態で audioInput を切り替えると AudioInputForm の onChange から
// updateMediaStream が呼ばれる。update-mediastream ボタンと同じ経路で
// 新しいデバイスのメディアに置き換わることを検証する
test("getUserMedia: プレビュー状態の audioInput 切替で音声・映像が再生成される", async ({
  page,
}) => {
  await startUserMediaInPreview(page);

  const initialAudio = await getAudioTrackAnalysis(page);
  expectActiveAudio("initial state", initialAudio);
  await waitForVideoTrackState(page, "live");

  await selectFirstDevice(page, "audioInput");

  await waitForAudioTrackReplacement(page, initialAudio.trackId);
  await waitForVideoTrackState(page, "live");

  const updatedAudio = await getAudioTrackAnalysis(page);
  expectActiveAudio("after audioInput change in preview", updatedAudio);
  expectReplacedAudioTrack(
    "after audioInput change in preview",
    initialAudio.trackId,
    updatedAudio,
  );
});

// プレビュー状態で videoInput を切り替えると VideoInputForm の onChange から
// updateMediaStream が呼ばれる。映像トラックだけを対象にした切替でも
// メディア全体が消えずに再生成されることを検証する
test("getUserMedia: プレビュー状態の videoInput 切替で音声・映像が再生成される", async ({
  page,
}) => {
  await startUserMediaInPreview(page);

  const initialAudio = await getAudioTrackAnalysis(page);
  expectActiveAudio("initial state", initialAudio);
  await waitForVideoTrackState(page, "live");

  await selectFirstDevice(page, "videoInput");

  await waitForAudioTrackReplacement(page, initialAudio.trackId);
  await waitForVideoTrackState(page, "live");

  const updatedAudio = await getAudioTrackAnalysis(page);
  expectActiveAudio("after videoInput change in preview", updatedAudio);
  expectReplacedAudioTrack(
    "after videoInput change in preview",
    initialAudio.trackId,
    updatedAudio,
  );
});
