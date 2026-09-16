import { test } from "@playwright/test";
import type { Page } from "@playwright/test";

const DEVTOOLS_URL = "http://localhost:3333/devtools/";

// 音声信号が存在すると判定する RMS の下限
// fakeVolume 0.5 の正弦波 (振幅 1) の RMS は約 0.35 のため、0.05 は十分に余裕のある閾値
const AUDIO_RMS_THRESHOLD = 0.05;
// 音声信号が静音と判定する RMS の上限 (fakeVolume 0 で gain が 0 になると RMS はほぼ 0)
const SILENCE_RMS_THRESHOLD = 0.02;

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

// ページのセットアップ:
// - mediaType を fakeMedia にする
// - audio / micDevice を有効化し、fakeVolume を 0.5 にする
// - request media で音声と映像を含む Fake Media を開始する
// メディアが開始できるまで (音声トラックと映像トラックが srcObject に載るまで) 待ってから返る
async function startFakeMediaWithAudio(page: Page): Promise<void> {
  await page.goto(DEVTOOLS_URL);
  await page.locator('button[name="connect"]').waitFor({ timeout: 5000 });
  await page.locator("#fakeMedia").check();
  await page.locator("#audio").check();
  await page.locator("#micDevice").check();
  await setFakeVolume(page, "0.5");
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
// setCameraDeviceAction は既存の video track を removeTrack してから addTrack するため、
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

// 音声トラックが存在して live・muted でなく、音声信号が流れていることを検証して失敗時は throw する
// step は検証箇所を表すラベル
function expectLiveAudio(step: string, analysis: AudioTrackAnalysis): void {
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
  if (analysis.rms < AUDIO_RMS_THRESHOLD) {
    throw new Error(`${step}: expected audio rms >= ${AUDIO_RMS_THRESHOLD}, got ${analysis.rms}`);
  }
}

// 音声信号が静音になっていることを検証して失敗時は throw する
// トラック消失を静音と誤判定しないよう、トラックの存在と状態も確認する
function expectSilentAudio(step: string, analysis: AudioTrackAnalysis): void {
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
  if (analysis.rms > SILENCE_RMS_THRESHOLD) {
    throw new Error(`${step}: expected audio rms <= ${SILENCE_RMS_THRESHOLD}, got ${analysis.rms}`);
  }
}

// 音声トラックが期待する track id に一致することを検証して失敗時は throw する
function expectSameAudioTrack(
  step: string,
  expectedTrackId: string,
  actual: AudioTrackAnalysis,
): void {
  if (actual.trackId !== expectedTrackId) {
    throw new Error(
      `${step}: expected audio track id "${expectedTrackId}", got "${actual.trackId}"`,
    );
  }
}

test("fakeMedia: カメラ切り替え前後で音声トラックとフェイク音声の AudioContext が維持される", async ({
  page,
}) => {
  await startFakeMediaWithAudio(page);

  // request media 直後の音声信号から開始状態を記録する
  const initialAudio = await getAudioTrackAnalysis(page);
  expectLiveAudio("initial state", initialAudio);

  // カメラを off にする: 映像トラックは停止・削除されるが、音声トラックとフェイク音声の
  // AudioContext / GainNode は維持される
  await page.locator("#cameraDevice").uncheck();
  await waitForVideoTrackState(page, "absent");
  const cameraOffAudio = await getAudioTrackAnalysis(page);
  expectLiveAudio("after camera off", cameraOffAudio);
  // カメラ切り替えで音声トラックが置き換えられていないことを確認する。
  // 音声停止の検出は RMS が担い、track id の一致はトラックの入れ替えがないことの確認
  expectSameAudioTrack("after camera off", initialAudio.trackId, cameraOffAudio);

  // カメラを on にする: 映像トラックが復元され、音声トラックとフェイク音声の
  // AudioContext / GainNode が維持される
  await page.locator("#cameraDevice").check();
  await waitForVideoTrackState(page, "live");
  const cameraOnAudio = await getAudioTrackAnalysis(page);
  expectLiveAudio("after camera on", cameraOnAudio);
  expectSameAudioTrack("after camera on", initialAudio.trackId, cameraOnAudio);

  // GainNode が維持されていること: fakeVolume を 0 にすると静音、
  // 0.5 に戻すと音声信号が復帰する (GainNode が null に上書きされていると音量は動かない)
  await setFakeVolume(page, "0");
  const volumeZeroAudio = await getAudioTrackAnalysis(page);
  expectSilentAudio("after fakeVolume is set to 0", volumeZeroAudio);
  await setFakeVolume(page, "0.5");
  const volumeHalfAudio = await getAudioTrackAnalysis(page);
  expectLiveAudio("after fakeVolume is set back to 0.5", volumeHalfAudio);
  expectSameAudioTrack("after changing fakeVolume", initialAudio.trackId, volumeHalfAudio);
});

test("fakeMedia: 通常の再生成後も新しい AudioContext で音声トラックが動く", async ({ page }) => {
  await startFakeMediaWithAudio(page);

  const initialAudio = await getAudioTrackAnalysis(page);
  expectLiveAudio("initial state", initialAudio);

  // 通常の Fake Media 再生成 (音声を含む再生成) では、既存実装で AudioContext を
  // close して新しく生成するため、音声トラックは別物に置き換わり音声信号は継続する。
  // しかしプレビュー状態 (Sora 未接続・connectionStatus が "disconnected" のまま) では、
  // updateMediaStreamImpl の末尾の中断ガードが新規生成したトラックを停止して AudioContext を
  // close し return するため、update-mediastream では音声トラックの更新が発生せず検証できない。
  // そのため dispose 後の request media (解放からの通常再生成) で検証する:
  // dispose media で AudioContext を含むメディアを解放し、再生成したときに
  // 新しい AudioContext で音声トラックが動くことを確認する
  await page.getByRole("button", { name: "dispose media" }).click();
  await page.waitForFunction(
    () => {
      const videoElement = document.querySelector("#local-video");
      if (videoElement === null) {
        return true;
      }
      const stream = (videoElement as HTMLVideoElement).srcObject;
      return !(stream instanceof MediaStream) || stream.getTracks().length === 0;
    },
    undefined,
    { timeout: 5000 },
  );

  await page.getByRole("button", { name: "request media" }).click();
  await page.waitForFunction(
    (previousTrackId) => {
      const videoElement = document.querySelector("#local-video");
      if (videoElement === null) {
        return false;
      }
      const stream = (videoElement as HTMLVideoElement).srcObject;
      if (!(stream instanceof MediaStream)) {
        return false;
      }
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        return false;
      }
      return stream.getVideoTracks().length > 0 && audioTracks[0].id !== previousTrackId;
    },
    initialAudio.trackId,
    { timeout: 5000 },
  );

  const regeneratedAudio = await getAudioTrackAnalysis(page);
  expectLiveAudio("after regeneration", regeneratedAudio);
  if (regeneratedAudio.trackId === initialAudio.trackId) {
    throw new Error(
      `after regeneration: expected audio track updated with new AudioContext, got same id "${initialAudio.trackId}"`,
    );
  }
});
