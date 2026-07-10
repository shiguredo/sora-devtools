import { test } from "@playwright/test";

// Sora 接続テストに必要な環境変数を解決した結果
export interface SoraConnectionEnv {
  signalingUrl: string;
  channelIdPrefix: string;
  accessToken: string;
}

// 環境変数を読み込み、必須が未設定なら undefined を返す
// `E2E_TEST_SORA_SIGNALING_URL` のみ必須。`undefined` または空文字を「未設定」とみなす
// `E2E_TEST_SORA_CHANNEL_ID_PREFIX` 未設定時は空文字を既定値とする
// `E2E_TEST_ACCESS_TOKEN` 未設定時は空文字を既定値とする (任意値でよい変数のため、未設定は空文字に正規化する)
export function getSoraConnectionEnv(): SoraConnectionEnv | undefined {
  const signalingUrl = process.env.E2E_TEST_SORA_SIGNALING_URL;

  if (signalingUrl === undefined || signalingUrl === "") {
    return undefined;
  }

  const channelIdPrefix = process.env.E2E_TEST_SORA_CHANNEL_ID_PREFIX ?? "";
  const accessToken = process.env.E2E_TEST_ACCESS_TOKEN ?? "";

  return {
    signalingUrl,
    channelIdPrefix,
    accessToken,
  };
}

// Playwright の test コールバック (または beforeEach) の先頭で呼び出すと
// 必須環境変数未設定時は test.skip() で当該テストを skip し
// 設定済みなら narrow 済みの SoraConnectionEnv を返す
// skip 理由として未設定の環境変数名を含むメッセージを Playwright のレポートに残す
export function requireSoraConnectionEnv(): SoraConnectionEnv {
  const env = getSoraConnectionEnv();
  if (env === undefined) {
    const reason = "E2E_TEST_SORA_SIGNALING_URL が未設定です";
    // Playwright runner はこの行で abort するが TypeScript の型 narrow のため throw も書く
    test.skip(true, reason);
    // CODEBASE.md「エラーメッセージは英語」。日本語の reason は埋め込まない
    throw new Error("unreachable: test.skip should abort before this throw");
  }
  return env;
}
