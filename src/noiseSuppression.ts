import type { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";

interface NoiseSuppressionModule {
  NoiseSuppressionProcessor: {
    new (): NoiseSuppressionProcessor;
    isSupported(): boolean;
  };
}

let noiseSuppressionModulePromise: Promise<NoiseSuppressionModule> | null = null;
let noiseSuppressionProcessorPromise: Promise<NoiseSuppressionProcessor> | null = null;
let noiseSuppressionProcessorLockPromise: Promise<void> = Promise.resolve();

/**
 * @shiguredo/noise-suppression モジュールの事前読み込みを開始する
 *
 * mediaProcessorsNoiseSuppression 有効化時に呼ばれ、getUserMedia 前にモジュールを取得しておく
 * 失敗してもユーザーへの通知は行わず、実際にプロセッサ生成が必要になった時点でエラーになる
 */
export function preloadNoiseSuppressionModule(): void {
  void loadNoiseSuppressionModule();
}

// @shiguredo/noise-suppression を動的 import する
// 1 度だけ import し、2 回目以降はキャッシュされた Promise を返す
async function loadNoiseSuppressionModule(): Promise<NoiseSuppressionModule> {
  noiseSuppressionModulePromise ??= import("@shiguredo/noise-suppression");
  return noiseSuppressionModulePromise;
}

// NoiseSuppressionProcessor を遅延生成する
// 複数同時呼び出しでも 1 件だけ生成され、同じインスタンスが返る
// 失敗時は Promise キャッシュをクリアし次回再試行可能にする
async function createNoiseSuppressionProcessor(): Promise<NoiseSuppressionProcessor> {
  noiseSuppressionProcessorPromise ??= (async () => {
    try {
      const module = await loadNoiseSuppressionModule();
      return new module.NoiseSuppressionProcessor();
    } catch (error) {
      noiseSuppressionProcessorPromise = null;
      throw error;
    }
  })();
  return noiseSuppressionProcessorPromise;
}

/**
 * NoiseSuppressionProcessor の開始・停止を直列化するロック
 *
 * 前のロック保持者の成否に関わらず待機し、callback 実行後にロックを解放する
 * これにより startProcessing / stopProcessing の並行実行を防止する
 */
export async function runWithNoiseSuppressionProcessorLock<T>(
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- ロック機構の API として callback パターンが意図的
  callback: () => Promise<T> | T,
): Promise<T> {
  let resolveLock: () => void = () => {};
  const nextLockPromise = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });

  const previousLockPromise = noiseSuppressionProcessorLockPromise;
  noiseSuppressionProcessorLockPromise = nextLockPromise;

  try {
    await previousLockPromise;
  } catch {
    // 前のロック保持者が失敗してもロックは解放済みのため次の処理に進む
  }

  try {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- ロック機構の API として callback パターンが意図的
    return await callback();
  } finally {
    resolveLock();
  }
}

/**
 * Insertable Streams が利用可能かどうかを判定する
 *
 * @shiguredo/noise-suppression を動的 import せずにサポート判定するため自前で実装している
 * NoiseSuppressionProcessor.isSupported と同等の判定ロジック
 */
export function isNoiseSuppressionSupported(): boolean {
  return !(
    typeof MediaStreamTrackProcessor === "undefined" ||
    typeof MediaStreamTrackGenerator === "undefined"
  );
}

/**
 * ノイズ抑制プロセッサを取得する
 *
 * 既存の currentProcessor があればそれを返し、なければ遅延生成する
 * 初回呼び出し時に @shiguredo/noise-suppression を動的 import する
 */
export async function getOrCreateNoiseSuppressionProcessor(
  currentProcessor: NoiseSuppressionProcessor | null,
): Promise<NoiseSuppressionProcessor> {
  if (currentProcessor !== null) {
    return currentProcessor;
  }
  return createNoiseSuppressionProcessor();
}

// テスト用の状態リセット関数
export function resetForTesting(): void {
  noiseSuppressionModulePromise = null;
  noiseSuppressionProcessorPromise = null;
  noiseSuppressionProcessorLockPromise = Promise.resolve();
}
