import type { Mp4MediaStream } from "@shiguredo/mp4-media-stream";

interface Mp4MediaStreamModule {
  Mp4MediaStream: {
    load(file: Blob): Promise<Mp4MediaStream>;
  };
}

let mp4MediaStreamModulePromise: Promise<Mp4MediaStreamModule> | null = null;

// @shiguredo/mp4-media-stream を動的 import する
// 1 度だけ import し、2 回目以降はキャッシュされた Promise を返す
// import 失敗時のみ Promise キャッシュをクリアし次回再試行可能にする
async function loadMp4MediaStreamModule(): Promise<Mp4MediaStreamModule> {
  mp4MediaStreamModulePromise ??= (async () => {
    try {
      return await import("@shiguredo/mp4-media-stream");
    } catch (error) {
      mp4MediaStreamModulePromise = null;
      throw error;
    }
  })();
  return mp4MediaStreamModulePromise;
}

/**
 * AudioDecoder / VideoDecoder が利用可能かどうかを判定する
 *
 * @shiguredo/mp4-media-stream を動的 import せずにサポート判定するため自前で実装している
 * Mp4MediaStream.isSupported と同等の判定ロジック
 */
export function isMp4MediaStreamSupported(): boolean {
  return !(typeof AudioDecoder === "undefined" || typeof VideoDecoder === "undefined");
}

/**
 * MP4 ファイルをロードし Mp4MediaStream インスタンスを返す
 *
 * 初回呼び出し時に @shiguredo/mp4-media-stream を動的 import する
 * Mp4MediaStream.load() の失敗（不正な MP4 等）ではモジュールキャッシュをクリアしない
 * import 失敗時のみキャッシュをクリアし次回再試行可能にする
 */
export async function loadMp4MediaStream(file: Blob): Promise<Mp4MediaStream> {
  const module = await loadMp4MediaStreamModule();
  return module.Mp4MediaStream.load(file);
}

// テスト用の状態リセット関数
export function resetForTesting(): void {
  mp4MediaStreamModulePromise = null;
}
