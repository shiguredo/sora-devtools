# 0043-bug-fix-video-effect-audio-output-dep

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-video-effect-audio-output-dep
- Polished: 2026-06-09

ファイル名末尾の `dep` は `dependency` の略。

## 目的

`src/components/Video/Video.tsx` の stream 設定 effect が `audioOutput` を依存配列に含むため、出力デバイス変更だけで `srcObject` が再代入され Chrome 黒画面回避用の `track.enabled = false → true` ワークアラウンドが毎回再走する。さらに cleanup が effect 進入時の `originalEnabled` を強制復元するため、特定の操作順序で「映像 ON にしたつもりが track.enabled が false に戻る」経路がある。effect を機能ごとに分割し、`originalEnabled` 復元自体をやめて根本的に絶つ。

## 優先度根拠

出力デバイス切替は通常運用で行われる操作で、そのたびに全 video が一瞬黒画面になる UX 劣化を引き起こす。`videoTrack` signal を `false → true` に切り替えた直後に出力デバイスを切り替えると黒画面のまま残る経路があり、ユーザーは「映像が出ない」と認識してリロードに走る。`setSinkId` の Promise を `void` で投げ捨てているため、未対応ブラウザや出力デバイス拒否時のフィードバックがゼロな点も並行して直す。

## 現状の問題

`src/components/Video/Video.tsx` の effect は Polished 時点 (2026-06-09) で 40-85 行付近にある。実装時に行番号がずれている可能性があるため、対象は「`stream` / `audioOutput` を依存配列に持つ `useEffect` 全体」とする。

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
2. `originalEnabled` を「effect 進入時のスナップショット」で cleanup 復元するため、`videoTrack` signal を `false → true` に切り替えた直後に `audioOutput` が変わると、`originalEnabled = true` で OK の経路はあるが、その逆順（`audioOutput` 変更 → `videoTrack` 切替）では cleanup 時に旧値で上書きされる経路がある。
3. `void videoElement.setSinkId(audioOutput)` で Promise を投げ捨てており、未対応ブラウザ（Firefox 等）や `NotFoundError` / `NotAllowedError` 時にユーザーへのフィードバックがない。

`Video` コンポーネントは `LocalVideo.tsx` と `RemoteVideos.tsx` の両方から呼ばれており、修正は両方に影響する。

closed/0022 で「`setSinkId` の呼び出しを `ResizeObserver` 用 effect から削除して 1 箇所に集約」が行われた経緯がある。本 issue は集約後の effect を再分割するが、**`ResizeObserver` 効果に `setSinkId` を戻さない**ことを必須条件とする。

## 設計方針

`Video.tsx` の effect を以下の 3 構成にする。`mute` effect (`mute === true` のときだけ `muted = true` を書く非対称な既存挙動) は本 issue ではそのまま維持し、別 issue で扱う。

### 1. stream 設定 effect（依存: `[stream]`）

`srcObject` の代入 / null クリア、Chrome 黒画面回避ワークアラウンドを担う。**cleanup での `originalEnabled` 強制復元はやめる**。理由:

- ローカル / リモートのいずれでも、cleanup 時に track.enabled を旧値に戻したいシナリオは現実的にない。
- `videoTrack` signal はローカル送信側のみで（`src/app/signals.ts` の `setVideoTrack` が `localMediaStream.value.getVideoTracks()` だけを操作）、リモート Video には信号がない。`videoTrack` signal 参照案はリモートでは機能しないので採用しない。
- 黒画面回避は「effect 進入時に `track.enabled = false` → `loadedmetadata` リスナで `true` に戻す → リスナを 1 度で除去」だけで成立する。stream 入替時のアンマウントでは cleanup で `loadedmetadata` リスナを除去するだけにする。

擬似コード:

```tsx
useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;
  if (stream === null) {
    videoElement.srcObject = null;
    return;
  }
  for (const track of stream.getVideoTracks()) {
    track.enabled = false;
  }
  const onLoadedMetadata = () => {
    for (const track of stream.getVideoTracks()) {
      track.enabled = true;
    }
  };
  videoElement.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
  videoElement.srcObject = stream;
  return () => {
    videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
  };
}, [stream]);
```

### 2. `setSinkId` effect（依存: `[stream, audioOutput]`）

出力デバイス変更を反映する専用 effect。エラーは `setAPIErrorAlertMessage` で通知する。`audioOutput === ""` の場合は `setSinkId("")` を呼ばずスキップ（既存挙動を維持）。

擬似コード:

```tsx
useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;
  if (stream === null) return;
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

エラーメッセージは英語、末尾ピリオドなし、`deviceId` と `name` / `message` で期待値と実際の値を示す（AGENTS.md sora-devtools 節準拠）。

closed/0022 で確立した「`setSinkId` は `srcObject` 設定後に呼ぶ」の保証は、Preact の `useEffect` が宣言順で実行される仕様により維持される。stream 設定 effect を `setSinkId` effect より上に置くことで、stream 入替時に「stream effect が先に走り `srcObject` を代入 → 次に `setSinkId` effect が走る」順序が保たれる。

`audioOutput` が無効値のまま固定されると本 effect が stream 切替の度に失敗を発火し、AlertMessages に同種エラーが積み上がる。`alertMessages` は MAX 10 件でトリミングされる（`signals.ts` の `setAPIErrorAlertMessage` 経由）ため OOM 等にはならないが、UX 上の連続通知は既知の挙動として受け入れる（失敗を抑止する重複除外は本 issue ではやらない）。

現状 `Video.tsx` の `videoElement` は `CustomHTMLVideoElement`（`src/types.ts`）で `setSinkId` の戻り値型が定義されている。`.catch()` のチェーンが通るには戻り値が `Promise<void>` 相当である必要があるため、実装時に型を確認する。型上扱えない場合は本 issue の範囲で最小の型修正を併せて行う。

### 3. `mute` effect は現状維持

`useEffect(() => { if (mute) videoElement.muted = true; }, [mute])` の非対称挙動は本 issue のスコープ外（別 issue で扱う）。

### 4. リモート track への扱い

リモート (`RemoteVideos.tsx` 経由の `Video`) でも `track.enabled = false → loadedmetadata → true` のワークアラウンドが走るが、これは現状維持。リモート track の `enabled = false` は受信側のローカル描画/再生制御のみで送信側には伝播しない仕様のため、本 issue の修正で副作用は生じない。リモート側で本当にこのワークアラウンドが必要かの再評価は別 issue で扱う。

### 5. `signals` の import

`Video.tsx` は現状 `signals` を import していない。`setSinkId` のエラー通知のため `import { setAPIErrorAlertMessage } from "@/app/signals"` を追加する（既存の `LocalVideo.tsx` / `RemoteVideos.tsx` 等が `named import` 形式で統一されているのに合わせる）。

### 6. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前、Polished 時点で 200 行台付近）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `Video.tsx` の `srcObject` 設定 effect を分割し、`audioOutput` 変更による黒画面と track.enabled 復元バグを解消する
  - `setSinkId` 失敗時に `setAPIErrorAlertMessage` でユーザーに通知する
  - @voluntas
```

### 7. スコープ外

- `mute` effect の非対称挙動修正
- リモート track の `enabled` ワークアラウンド再評価
- `CustomHTMLVideoElement` 型エイリアスの整理（最新 TypeScript lib では `HTMLMediaElement.setSinkId` が標準で定義されているかの確認込み）

これらは別 issue で扱う。

## 検証手順

1. `vp dev` で起動し、`role=sendrecv` で接続する。
2. ローカル映像を ON にした状態で、出力デバイスを別のデバイスへ切り替える。
3. ローカル映像とリモート映像のいずれもフリッカ（黒画面）しないことを目視する。
4. ローカル映像 ON 状態で `videoTrack` を `false → true → false → true` と切り替え、`audioOutput` の切り替えと混在させても映像が黒画面で固まらないことを確認する。
5. ブラウザの devtools console で `videoElement.srcObject` が同一インスタンスを保ったままであることを確認する（`audioOutput` 変更で `srcObject` が再代入されない）。
6. `setSinkId` の失敗を強制再現する: devtools console で `document.querySelector('video').setSinkId('non-existent-device-id')` 相当を発火させ、AlertMessages にエラーが出ることを確認する。
7. Firefox（`setSinkId` 未対応）で接続し、エラーが AlertMessages で通知されることを確認する。
8. Chrome / Edge / Safari / Firefox の各最新版で 1-7 を確認する。

テスト方針: jsdom には `setSinkId` / `loadedmetadata` 周辺の WebRTC API がなく、Vitest の単体テストで本修正の挙動を検証するのは現実的でない。本 issue では既存 Playwright e2e (`tests/sendrecv.test.ts` 等) にカバレッジを追加し、Vitest 単体テストは追加しない。

## 完了条件

- 検証手順 3 で出力デバイス変更時に video の黒画面化が起きないこと。
- 検証手順 4 で `videoTrack` 切替と `audioOutput` 切替の混在で映像 ON の状態が保たれること。
- 検証手順 5 で `srcObject` が同一インスタンスを維持すること。
- 検証手順 6 / 7 で `setSinkId` 失敗時に AlertMessages にエラーが出ること。
- closed/0022 で確立した「`setSinkId` は `ResizeObserver` 用 effect から呼ばない」設計が維持されていること（再分割で別経路に戻していないこと）。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
