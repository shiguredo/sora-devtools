# 0043-bug-fix-video-effect-audio-output-dep

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-video-effect-audio-output-dep
- Polished: 2026-06-15

## 目的

`src/components/Video/Video.tsx` の stream 設定 effect が `audioOutput` を依存配列に含むため、出力デバイス変更だけで `srcObject` が再代入され Chrome 黒画面回避用の `track.enabled = false → true` ワークアラウンドが毎回再走する。さらに cleanup が effect 進入時の `originalEnabled` を強制復元するため、特定の操作順序で「映像 ON にしたつもりが track.enabled が false に戻る」経路がある。effect を機能ごとに分割し、`originalEnabled` 復元自体をやめて根本的に絶つ。あわせて、現状 `void` で投げ捨てている `setSinkId` の Promise を `.catch` で受け、失敗時にユーザーへ AlertMessages で通知する（effect 分割と密接で別 issue に切り出すと旧コードが新 effect 内に残り不自然になるため、本 issue で同時に実施）。

## 優先度根拠

出力デバイス切替は通常運用で行われる操作で、そのたびに全 video が一瞬黒画面になる UX 劣化を引き起こす。`videoTrack` signal を `false → true` に切り替えた直後に出力デバイスを切り替えると黒画面のまま残る経路があり、ユーザーは「映像が出ない」と認識してリロードに走る。`setSinkId` の Promise を `void` で投げ捨てているため、未対応ブラウザや出力デバイス拒否時のフィードバックがゼロな点も同時に解消する。

## 現状の問題

`src/components/Video/Video.tsx` の修正対象は「`stream` / `audioOutput` を依存配列に持つ `useEffect` 全体」とする（行番号は陳腐化するため記載しない）。現状は概略次の構造になっている。

```tsx
useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;
  if (stream === null) {
    videoElement.srcObject = null;
    return;
  }
  let originalEnabled: boolean | undefined;
  for (const track of stream.getVideoTracks()) {
    originalEnabled = track.enabled;
    track.enabled = false;
  }
  // ... loadedmetadata で track.enabled を originalEnabled に戻すワークアラウンド
  videoElement.srcObject = stream;
  if (audioOutput && stream.getAudioTracks().length > 0) {
    void videoElement.setSinkId(audioOutput);
  }
  return () => {
    if (originalEnabled !== undefined) {
      for (const track of stream.getVideoTracks()) track.enabled = originalEnabled;
    }
  };
}, [stream, audioOutput]);
```

主要な問題は以下。

1. `audioOutput` 変更だけで effect が再走し、stream は同一インスタンスのまま `srcObject` 再代入と `track.enabled = false → true` ワークアラウンドが再走する。
2. `originalEnabled` を「effect 進入時のスナップショット」で cleanup 復元するため、`videoTrack` signal を `false → true` に切り替えた直後に `audioOutput` が変わる経路で、cleanup 時に旧値で上書きされる。
3. `void videoElement.setSinkId(audioOutput)` で Promise を投げ捨てており、未対応ブラウザ（Firefox 等）や `NotFoundError` / `NotAllowedError` 時にユーザーへのフィードバックがない。

`Video` コンポーネントは `LocalVideo.tsx` と `RemoteVideos.tsx` の両方から呼ばれており、修正は両方に影響する。

closed/0022 で「`setSinkId` の呼び出しを `ResizeObserver` 用 effect から削除して 1 箇所に集約」が行われた経緯がある。本 issue は集約後の effect を再分割するが、**`ResizeObserver` effect に `setSinkId` を戻さない**ことを必須条件とする。

## 設計方針

`Video.tsx` の `VideoElement` 関数内 effect を以下の順序で並べる（ResizeObserver / mute は現状維持、stream を再分割して setSinkId を独立 effect として追加）。

| 順序 | effect         | 依存配列                | 役割                                 | 本 issue での扱い                                           |
| ---- | -------------- | ----------------------- | ------------------------------------ | ----------------------------------------------------------- |
| 1    | ResizeObserver | `[setHeight]`           | サイズ通知                           | 現状維持                                                    |
| 2    | mute           | `[mute]`                | `muted = true` の書き込み            | 現状維持（スコープ外）                                      |
| 3    | stream 設定    | `[stream]`              | `srcObject` 代入と Chrome 黒画面回避 | 既存 effect から `setSinkId` / `originalEnabled` 復元を分離 |
| 4    | setSinkId      | `[stream, audioOutput]` | `setSinkId` 呼び出しとエラー通知     | 新規分離                                                    |

Preact / React の `useEffect` は宣言順に effect が走り、複数 effect の cleanup は逆順、effect は宣言順という保証がある。これにより stream 入替時は「(4 の cleanup なし) → (3 の cleanup: `loadedmetadata` リスナ除去) → (3: 新 stream を `srcObject` に代入) → (4: 新 stream に `setSinkId`)」の順で走る。`audioOutput` だけが変わったときは 4 だけが走り、3 はスキップされる。

### stream 設定 effect の詳細（依存: `[stream]`）

`srcObject` の代入 / null クリア、Chrome 黒画面回避ワークアラウンドを担う。**cleanup での `originalEnabled` 強制復元はやめる**。理由:

- リモートには `track.enabled` を制御する signal が存在せず、ローカルでも `videoTrack` signal の true/false 切替は `signals.ts` の `setVideoTrack` で `localMediaStream.value.getVideoTracks()` を直接書き換えて完結する。本 effect が cleanup で復元を試みる必要はない。
- 黒画面回避は「effect 進入時に `track.enabled = false` → `loadedmetadata` リスナで `true` に戻す → リスナを `{ once: true }` で 1 度きり登録」だけで成立する。stream 入替時のアンマウントでは cleanup で `loadedmetadata` リスナを除去するだけにする。

擬似コード（コメント中に「変更点」と書いた箇所が現状からの差分）:

```tsx
useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;
  if (stream === null) {
    videoElement.srcObject = null;
    return;
  }
  // 変更点: originalEnabled スナップショットは廃止し、track.enabled = true 固定にする
  for (const track of stream.getVideoTracks()) {
    track.enabled = false;
  }
  const onLoadedMetadata = () => {
    for (const track of stream.getVideoTracks()) {
      track.enabled = true;
    }
  };
  // 変更点: { once: true } で 1 度きり登録し、リスナ蓄積を防ぐ
  videoElement.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
  videoElement.srcObject = stream;
  return () => {
    // 変更点: cleanup は loadedmetadata リスナ除去のみ。track.enabled の旧値復元はやめる
    videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
  };
}, [stream]);
```

### setSinkId effect の詳細（依存: `[stream, audioOutput]`）

出力デバイス変更を反映する専用 effect。エラーは `setAPIErrorAlertMessage` で通知する。cleanup は持たない。`setSinkId` の Promise を中断する API がなく、stream 入替時は新 stream に対する `setSinkId` を新しく投げるだけで意味的に十分。旧 stream への Promise が解決済みであれば副作用はなく、未解決でも `videoElement.srcObject` は既に新 stream を指しているため映像出力に副作用は無い。

ただし「stream 入替・`audioOutput` 切替後、未解決の旧 `setSinkId(A)` Promise が後から reject すると、`.catch` 内で旧 `deviceId=A` のエラーが AlertMessages に出る」race が残る。これは現行の `void` 投げ捨てでも（通知が出ないだけで）同じ Promise は浮いており、新挙動はそれを表面化させるだけ。UX への影響が軽微なので本 issue では受け入れる（race を抑止するなら `let cancelled = false;` を作って cleanup で `cancelled = true;` し `.catch` 冒頭で抜ける形が最小だが、本 issue ではやらない）。

擬似コード:

```tsx
useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;
  if (stream === null) return;
  // 変更点: audioOutput が falsy（空文字列・undefined）なら setSinkId を呼ばずスキップ（既存挙動を維持）
  if (!audioOutput) return;
  if (stream.getAudioTracks().length === 0) return;
  videoElement.setSinkId(audioOutput).catch((error: unknown) => {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    const errorMessage = error instanceof Error ? error.message : String(error);
    setAPIErrorAlertMessage(
      `setSinkId failed: deviceId=${audioOutput} name=${errorName} message=${errorMessage}`,
    );
  });
}, [stream, audioOutput]);
```

`CustomHTMLVideoElement.setSinkId` の戻り値型は `Promise<void>`（`src/types.ts` の `interface CustomHTMLVideoElement extends HTMLVideoElement { setSinkId(audioId: string): Promise<void>; }` で定義済み）のため `.catch()` は型上そのまま通る。

エラーメッセージは英語、末尾ピリオドなし、`deviceId=${audioOutput}` と `name=${errorName}` / `message=${errorMessage}` で期待値と実際の値を示す（CODEBASE.md エラーメッセージ規約準拠）。

`audioOutput` が無効値のまま固定されると本 effect が stream 切替の度に失敗を発火し、AlertMessages に同種エラーが積み上がる。Sora のリモート参加者の join 時に新 `Video` がマウントされ effect が初回発火する（leave 時は unmount のみで effect は走らない）点も含めて、`alertMessages` は `signals.ts` の `setAlertMessagesAndLogMessages` 経由で MAX 10 件にトリミングされるため OOM 等にはならない。UX 上の連続通知は既知の挙動として受け入れる（失敗を抑止する重複除外は本 issue ではやらない）。

### スコープ外

- `mute` effect の非対称挙動（`mute === true` のときだけ `muted = true` を書く）。JSX 側で `<video muted={mute}>` も渡しており effect 自体の必要性も含めて別 issue で精査する。
- リモート track の `enabled` ワークアラウンドの再評価（`MediaStreamTrack.enabled` は W3C 仕様で「source からの出力を muted black/silent frames に置換するローカル制御」と定義されており、リモート side からの送信内容には影響しないため本修正で副作用は出ない、という前提で現状維持）。
- `CustomHTMLVideoElement` 型エイリアスの整理（最新 TypeScript lib で `HTMLMediaElement.setSinkId` が標準定義されているかの確認込み）。

### CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `Video.tsx` の `srcObject` 設定 effect を分割し、`audioOutput` 変更による黒画面と `track.enabled` 復元バグを解消する
  - `setSinkId` 失敗時に `setAPIErrorAlertMessage` でユーザーに通知する
  - @voluntas
```

## 検証手順

1. `pnpm dev`（または `vp dev`）で起動し、`role=sendrecv` で接続する。
2. ローカル映像を ON にした状態で、出力デバイスを別のデバイスへ切り替える。
3. ローカル映像とリモート映像のいずれもフリッカ（黒画面）しないことを目視する。
4. ローカル映像 ON 状態で `videoTrack` を `false → true → false → true` と切り替え、`audioOutput` の切り替えと混在させても映像が黒画面で固まらないことを確認する。
5. ブラウザの devtools console で `videoElement.srcObject` が同一インスタンスを保ったままであることを確認する（`audioOutput` 変更で `srcObject` が再代入されない）。
6. `setSinkId` の失敗を強制再現する: URL パラメータの `audioOutput` を `non-existent-device-id` 等の無効値に書き換えて再ロードし、本 issue の `setSinkId` effect 経由でエラーが発火し AlertMessages にエラーが出ることを確認する（devtools console で `document.querySelector('video').setSinkId(...)` を直叩きしても本 effect の `.catch` は通らないため、URL パラメータ経由で必ず effect を通すこと）。
7. Firefox（`setSinkId` 未対応）で接続し、エラーが AlertMessages で通知されることを確認する。
8. Chrome / Edge / Safari / Firefox の各最新版で 1-7 を確認する。

テスト方針: jsdom には `setSinkId` / `loadedmetadata` 周辺の WebRTC API がなく、Vitest の単体テストで本修正の挙動を検証するのは現実的でない。既存 Playwright e2e の `tests/sendrecv.test.ts` に以下のシナリオを追加する。

- `sendrecv` で接続後、`page.evaluate(() => document.querySelector('video')?.srcObject)` で `srcObject` を取得し、`audioOutput` を変更（`page.locator('select[name="audioOutput"]').selectOption({ index: 1 })` で 2 番目の有効デバイスを選択し Preact 側に `change` を発火）した後にも同一参照であることを `evaluate` で確認する。`audioOutputDevices.value` が空のとき select は `disabled` になるため、Chromium 起動オプション（`--use-fake-device-for-media-stream` 等）や `tests/global-setup.ts` の準備で有効デバイスが列挙されていることを前提とする。列挙されない環境ではこのシナリオを skip し、URL パラメータ経由（次項）でカバーする。
- 無効な `audioOutput` 値を URL パラメータで指定して再ロードし、AlertMessages 領域に `setAPIErrorAlertMessage` 由来のメッセージが出現することを待ち受ける。`setAPIErrorAlertMessage`（`src/app/signals.ts`）は `title: "API error"` 固定で投げるため、AlertMessages の見出し `<strong>` には `API error`、本文 `<p class="break-words mb-0">` 内に「`setSinkId failed: deviceId=... name=... message=...`」が出る。Playwright では本文側で `page.locator('text=setSinkId failed:')` を待つこと（title 側だけで待つと特定できない）。

## 完了条件

- 検証手順 3 で出力デバイス変更時に video の黒画面化が起きないこと。
- 検証手順 4 で `videoTrack` 切替と `audioOutput` 切替の混在で映像 ON の状態が保たれること。
- 検証手順 5 で `srcObject` が同一インスタンスを維持すること。
- 検証手順 6 / 7 で `setSinkId` 失敗時に AlertMessages にエラーが出ること（`void` 投げ捨ての解消）。
- `ResizeObserver` 用 effect から `setSinkId` を呼ばない設計（closed/0022 の合意）が維持されていること。
- 追加した Playwright e2e シナリオが pass すること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e（`pnpm test:e2e`）が通ること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
