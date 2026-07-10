import type { Page } from "@playwright/test";

// e2e テストで扱う接続ロール
// `src/` への依存を持たないため Page Object 内で独立定義する
// `src/constants.ts` の `ROLES` に新メンバが追加された場合は本型を追従させる (型レベルの自動検出はできない)
export type Role = "sendrecv" | "sendonly" | "recvonly";

// e2e テストで指定可能な動画コーデック
// `src/constants.ts` の `VIDEO_CODEC_TYPES` から空文字を除いた値を、配列順どおりに採用する
// 空文字 (= 未指定扱い) を URL に乗せたい場合は `videoCodecType: undefined` を使う
export type VideoCodecType = "VP8" | "VP9" | "AV1" | "H264" | "H265";

// Devtools ページに渡す接続パラメータ
// `signalingUrlCandidates` / `metadata` の JSON 化は本 Page Object の `navigate` 内で行う
// `parseQueryString` が受け付けないキー ( `multistream` 等) は意図的に含めない
export interface ConnectionParams {
  role: Role;
  channelId: string;
  signalingUrlCandidates: string[];
  accessToken: string;
  videoCodecType?: VideoCodecType;
}

// Devtools ページの操作をカプセル化する Page Object
// `DevtoolsPage` / `Role` / `VideoCodecType` / `ConnectionParams` はすべて named export とする (default export は使わない)
export class DevtoolsPage {
  // 既存テストと同じくベース URL はクラス内に集約する
  // `playwright.config.ts` に `use.baseURL` は無いため絶対 URL を使う
  private static readonly DEVTOOLS_URL = "http://localhost:3333/devtools/";

  // 接続ボタンのセレクタ
  private static readonly CONNECT_BUTTON_SELECTOR = 'button[name="connect"]';

  // 切断ボタンのセレクタ
  private static readonly DISCONNECT_BUTTON_SELECTOR = 'button[name="disconnect"]';

  // 接続 ID 表示要素のセレクタ
  private static readonly CONNECTION_ID_SELECTOR = "#local-video-connection-id";

  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 論理パラメータを URLSearchParams に組み立て、`page.goto` で遷移する
  // query のキーは channelId / role / signalingUrlCandidates / metadata と、指定時のみ videoCodecType
  // `signalingUrlCandidates` が空配列なら Error を throw する
  async navigate(params: ConnectionParams): Promise<void> {
    if (params.signalingUrlCandidates.length === 0) {
      throw new Error("expected non-empty signalingUrlCandidates, got []");
    }

    const query = new URLSearchParams({
      channelId: params.channelId,
      role: params.role,
      signalingUrlCandidates: JSON.stringify(params.signalingUrlCandidates),
      metadata: JSON.stringify({ access_token: params.accessToken }),
    });

    if (params.videoCodecType !== undefined) {
      query.set("videoCodecType", params.videoCodecType);
    }

    await this.page.goto(`${DevtoolsPage.DEVTOOLS_URL}?${query.toString()}`);
  }

  // 接続ボタンをクリックする
  // Playwright の `Page.click` の actionability 待機は維持する (接続完了の待機は `waitForConnection` の責務)
  async connect(): Promise<void> {
    await this.page.click(DevtoolsPage.CONNECT_BUTTON_SELECTOR);
  }

  // 切断ボタンをクリックする (Playwright の `Page.click` の actionability 待機は維持する。切断完了の待機は本メソッドの責務外)
  async disconnect(): Promise<void> {
    await this.page.click(DevtoolsPage.DISCONNECT_BUTTON_SELECTOR);
  }

  // 接続 ID が表示されるまで待機する
  // デフォルト timeout は既存テストの `page.waitForSelector` に合わせ 5000 ms
  async waitForConnection(timeoutMs = 5000): Promise<void> {
    await this.page.waitForSelector(DevtoolsPage.CONNECTION_ID_SELECTOR, {
      timeout: timeoutMs,
    });
  }

  // 接続 ID 文字列を取得する。`waitForConnection` 直後に呼ぶ前提
  // 戻り値型は既存テストの `page.textContent` をそのまま踏襲する
  async getConnectionId(): Promise<string | null> {
    return this.page.textContent(DevtoolsPage.CONNECTION_ID_SELECTOR);
  }
}
