# 0057-bug-fix-download-report-blob-leak

- Priority: Low
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-download-report-blob-leak
- Polished: 2026-06-16

## 目的

`DownloadReportButton` (`src/components/Header/DownloadReportButton.tsx`) は click のたびに `globalThis.URL.createObjectURL(blob)` で Blob URL を生成して `<a>` の `href` にセットして `click()` するが、`URL.revokeObjectURL` を呼んでいない。W3C File API の Blob URL Store に古いエントリが残り続け、Blob 本体も GC されない。長いデバッグセッションで何度か押すと数 MB 〜 数十 MB の Blob が積み上がる。`useRef<string | null>` で前回 URL を保持し、次回 click 時に `revokeObjectURL` で解放する。`useEffect` cleanup でアンマウント時の最終 URL も解放する。

## 優先度根拠

- 即時の致命ではないため High ではない。
- `createDownloadReport` の戻り値は `timelineMessages` / `notifyMessages` / `statsReport` の JSON シリアライズ。長セッションで `timelineMessages` 数千 〜 数万件 (数 MB 〜 数十 MB)、`statsReport` は WebRTC stats フルダンプで毎秒更新の累計で数 MB に達する。1 回 click で生成される Blob は数 MB 〜 数十 MB 規模。
- W3C File API の Blob URL Store 仕様: `URL.createObjectURL(blob)` は Blob 本体への strong reference を持つエントリを生成し、`revokeObjectURL` を呼ぶまでエントリは削除されず Blob は GC されない。`<a>.href` を上書きしても Blob URL Store のエントリは独立に残る (節番号は W3C File API 仕様の版で変動するため引用しない)。
- ユーザーがレポート確認のために連続でボタンを押すデバッグセッション（5 〜 10 回 / 数十分単位）で容易に踏める。即時クラッシュではないため Low で確定する。
- 修正は数行で完結し、影響範囲は `DownloadReportButton.tsx` 1 ファイル限定。

## 現状の問題

行番号は陳腐化するため記載しない。各箇所はコンポーネント名（`DownloadReportButton`）および関数名（`createDownloadReport` / `onClick`）で特定する。

### 該当コード

`src/components/Header/DownloadReportButton.tsx` の `DownloadReportButton.onClick` 内:

```ts
anchorRef.current.href = globalThis.URL.createObjectURL(blob);
anchorRef.current.click();
```

`URL.revokeObjectURL` の呼び出しが存在しない。

### Blob URL のライフサイクル

W3C File API では `URL.createObjectURL(blob)` は内部の Blob URL Store エントリを作成し、Blob 本体への参照を保持すると規定。 `URL.revokeObjectURL(url)` を呼ぶまでエントリは削除されず Blob 本体は GC されない。

`anchorRef.current.href = newUrl` で href を上書きしても、これは HTMLAnchorElement の DOM 属性の置き換えに過ぎず、 Blob URL Store のエントリは独立。古い URL は internal store に残り続け、対応する Blob 本体もメモリに留まる。

### `revokeObjectURL` の安全性 (次回 click タイミングでの解放)

W3C File API の `createObjectURL` / `revokeObjectURL` 節の Note は次のとおり規定する:

> Requests that were started before the url was revoked should still succeed.

つまり「`anchor.click()` で発火した download fetch が `revokeObjectURL` 呼び出し前に開始されていれば、 fetch は成功すべきである」と仕様で保証されている。よって「次回 click で新 URL を生成 → 直前 URL を `revokeObjectURL`」の順は、先発 click の download fetch を成功させた状態を維持する。

## 設計方針

### `useRef<string | null>` で前回 URL を保持

採用理由:

- `DownloadReportButton.tsx` は既に `anchorRef = useRef<HTMLAnchorElement>(null)` を持っており、同パターンの第 2 ref を追加するだけで設計の対称性が高い。
- `setTimeout(0)` 案は、コンポーネントアンマウント時の `clearTimeout` 漏れリスク / 連続 click 時の競合（先発 setTimeout の前に後発 createObjectURL）/ 不必要な microtask 経由などの副次問題を抱える。
- W3C File API の仕様 Note (前節「`revokeObjectURL` の安全性」で引用) で「revoke 前に開始した requests は成功すべき」と規定されており、 「click 直後の `revokeObjectURL` でダウンロードキャンセル」のリスクは仕様上存在しない。次回 click タイミングで前回 URL を revoke する設計で十分。

修正後コード:

**before**:

```tsx
export function DownloadReportButton() {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const onClick = (): void => {
    const report = createDownloadReport();
    const data = JSON.stringify(report);
    const blob = new Blob([data], { type: "text/plain" });
    // 対象ブラウザはすべて URL.createObjectURL をネイティブサポート済みのため webkitURL fallback は不要
    if (anchorRef.current) {
      const datetimeString = new Date().toISOString().replaceAll(":", "_").replaceAll(".", "_");
      anchorRef.current.download = `sora-devtools-report-${datetimeString}.json`;
      anchorRef.current.href = globalThis.URL.createObjectURL(blob);
      anchorRef.current.click();
    }
  };
  // ...
}
```

**after**:

```tsx
import { useEffect, useRef } from "preact/hooks";
// ... 既存 import 維持

export function DownloadReportButton() {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  // 直前に発行した Blob URL を保持する。次回 click 時に revokeObjectURL で解放する。
  // W3C File API: createObjectURL は Blob URL Store にエントリを生成し Blob 本体への
  // 参照を保持する。revokeObjectURL を呼ばないと Blob は GC されない。
  const previousBlobUrlRef = useRef<string | null>(null);
  const onClick = (): void => {
    const report = createDownloadReport();
    const data = JSON.stringify(report);
    const blob = new Blob([data], { type: "text/plain" });
    // 対象ブラウザはすべて URL.createObjectURL をネイティブサポート済みのため webkitURL fallback は不要
    if (anchorRef.current) {
      const datetimeString = new Date().toISOString().replaceAll(":", "_").replaceAll(".", "_");
      anchorRef.current.download = `sora-devtools-report-${datetimeString}.json`;
      const blobUrl = globalThis.URL.createObjectURL(blob);
      anchorRef.current.href = blobUrl;
      anchorRef.current.click();
      // 直前の URL を revoke する。
      // W3C File API: revokeObjectURL は Blob URL Store のエントリを削除するが、
      // 仕様 Note 「Requests that were started before the url was revoked should still succeed」
      // により、 anchor.click() で開始した download fetch は revoke 後も成功する。
      // 初回 click 時は previousBlobUrlRef.current が null のため no-op。
      if (previousBlobUrlRef.current !== null) {
        globalThis.URL.revokeObjectURL(previousBlobUrlRef.current);
      }
      previousBlobUrlRef.current = blobUrl;
    }
  };
  // アンマウント時に最終 URL を解放する。Header は通常永続だが、leak を完全に閉じるため明示する。
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current !== null) {
        globalThis.URL.revokeObjectURL(previousBlobUrlRef.current);
        previousBlobUrlRef.current = null;
      }
    };
  }, []);
  return (
    <>
      <Button variant="light" size="sm" className="ml-1" onClick={onClick}>
        Download report
      </Button>
      {/* プログラムからファイルダウンロードを行うための非表示アンカー */}
      <a ref={anchorRef} style={{ display: "none" }} />
    </>
  );
}
```

`import { useRef } from "preact/hooks";` を `import { useEffect, useRef } from "preact/hooks";` に変更する。

### エッジケース一覧

| 状態                                | `previousBlobUrlRef.current` | 挙動                                                                |
| ----------------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| 初回 click                          | `null`                       | `revokeObjectURL` は skip、新 URL を保存                            |
| 2 回目以降の click                  | 直前の blob URL              | 直前 URL を `revokeObjectURL`、新 URL で上書き                      |
| アンマウント時（最終 URL あり）     | 最後の blob URL              | `useEffect` cleanup で `revokeObjectURL`、null クリア               |
| アンマウント時（一度も click 無し） | `null`                       | cleanup は skip（`null` チェック）                                  |
| `anchorRef.current` が null         | 変化なし                     | `onClick` 冒頭の `if` で早期 return、`createObjectURL` も呼ばれない |

## テスト戦略

- 単体テスト追加なし: Preact コンポーネントの click ハンドラの副作用を読み取る単体テスト基盤は本リポジトリに無い（0053 / 0054 / 0056 と同様の判断）。`URL.createObjectURL` / `revokeObjectURL` は jsdom 環境で `vi.fn()` でモック化されているが、CLAUDE.md「モックやスタブは絶対に利用しないこと」と両立しない（既存モックは別 issue で取り除く方針）。本 issue では追加しない。
- PBT 追加なし: `createObjectURL` / `revokeObjectURL` の振る舞いは property 化に向かない。
- e2e (Playwright) 追加なし: 既存 e2e は `DownloadReportButton` を踏むシナリオを持たず、Playwright で連続 download を発火させてメモリ使用量を検証するのはオーバー。
- 手動検証（後述「検証手順」）で DevTools Memory タブ + console での Blob 数確認に委ねる。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `DownloadReportButton` の `Blob URL` がリークする問題を修正する
  - `URL.createObjectURL` で発行した `Blob URL` を `useRef` で保持し、次回押下時に `URL.revokeObjectURL` で解放する
  - `useEffect` cleanup でアンマウント時の最終 `Blob URL` も解放する
  - @voluntas
```

## スコープ外

下記は本 issue では扱わない:

- **Blob の MIME type 不整合**: `new Blob([data], { type: "text/plain" })` で生成しているが、ダウンロードファイル名は `.json` 拡張子。MIME と拡張子が一致していないがブラウザはファイル名の拡張子を優先するため実害は無い。`type: "application/json"` への修正は別 issue で扱う。
- **`createObjectURL` 呼び出しの監査**: 現状本リポジトリで `globalThis.URL.createObjectURL` 呼び出しは `DownloadReportButton.tsx` の 1 箇所のみ（grep 確認）。新規追加時の規約化や監査は別 issue。
- **`createDownloadReport` の戻り値サイズ削減 / 増分書き込み / StreamSaver 化**: 大規模リファクタのため別 issue。
- **Header 全体の `useEffect` cleanup 監査**: 他コンポーネントも同様の leak がないか確認するのは別 issue。
- **既存 `URL.createObjectURL` モックの除去**: 「モック禁止」規約との両立は別 issue で扱う。

## 関連 issue

- 直接関連する既存 issue は無い（Blob URL ライフサイクル系は本 issue が初）。
- DevTools Memory タブを使った検証パターンは [[0050-bug-fix-fake-video-worker-busy-loop]] の Worker CPU 計測手順と類似。
- `useEffect` cleanup の参考実装パターン: `src/components/Header/SignalingUrlModal.tsx` の addEventListener / removeEventListener パターン、`src/components/Video/Video.tsx` の loadedmetadata cleanup。

## 検証手順

### A. 修正前の Blob URL 残留の再現（develop ブランチで実施）

1. `pnpm dev` で起動。
2. Chrome DevTools を開き、Performance タブで Heap snapshot を撮影。
3. Header 右上の Download report ボタンを 50 回連打する（毎クリックでブラウザ download dialog が出るので、ダウンロード先を「指定なし」/「自動保存」設定にしておくと連打しやすい）。
4. DevTools console で `Array.from(document.querySelectorAll("a")).map((a) => a.href).filter((href) => href.startsWith("blob:"))` を実行し、anchor の href は最後に発行された 1 つだけが blob URL になっていることを確認する（href の上書きで anchor は 1 つしか持たない）。
5. Memory タブで Heap snapshot を再度撮影し、`Constructor: Blob` の件数差分が 50 件あること（revoke せず leak している）を確認する。

### B. 修正後の確認

6. 本修正を入れた後、A の 2-5 を実行する。Memory タブの 50 回連打前後の Heap snapshot で `Constructor: Blob` の差分が **1 件（最後の click 分のみ）** に収まることを確認する。
7. ページをリロードして Header コンポーネントがアンマウントされた直後の Heap snapshot で、`useEffect` cleanup が走り `Constructor: Blob` の差分が 0 件になっていることを確認する。

### C. ダウンロード正常系の回帰

8. Download report を 1 回押し、ブラウザの download ダイアログが表示されて `sora-devtools-report-<datetime>.json` がダウンロードできることを確認する。
9. 連続して 2 回押し、両方とも完全にダウンロード完了することを確認する（前回 URL の revoke が進行中ダウンロードを中断しないことの確認）。

### D. テスト

10. `pnpm test` が pass すること（既存テストのリグレッション確認）。
11. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること。

## 完了条件

- 検証手順 A-D すべてが通過すること。
- 修正後コード（設計方針 after）と一致して実装されていること。
- `previousBlobUrlRef` の初期値が `null` で、初回 click 時に `revokeObjectURL(null)` が呼ばれないこと（エッジケース一覧の通り）。
- `useEffect` cleanup が登録され、アンマウント時に最終 URL が revoke されること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が pass すること。
