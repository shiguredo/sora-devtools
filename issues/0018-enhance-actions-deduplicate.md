# 0018 actions.ts の重複コードを共通化する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`src/app/actions.ts` (1901行) に大規模なコード重複が 2 箇所存在する。

## 重複 1: `connectSora` と `reconnectSora`

- `connectSora` (`src/app/actions.ts:1326-1402`)
- `reconnectSora` (`src/app/actions.ts:1404-1482`)

両関数で以下が重複:

- `prepareSignalingConnection()` の呼び出し
- `createMediaStream` の呼び出し
- `createSoraConnectionByRole` の呼び出し
- `setStatsReportInternal` + `startStatsReportTimer`
- `setLocalMediaStream` + `setFakeContentsGainNode` + `setSoraConnectionStatus("connected")`

`reconnectSora` は接続リトライループ（最大 10 回）を追加した以外は `connectSora` と同一。

## 重複 2: `setMicDeviceAction` と `setCameraDeviceAction`

- `setMicDeviceAction` (`src/app/actions.ts:1585-1655`, 70 行)
- `setCameraDeviceAction` (`src/app/actions.ts:1657-1729`, 72 行)

同一の構造:

- 同一ガード条件（ただし実装が異なる: `||` vs `&&`）
- device ON 時の `pickedState` 構築（20+ フィールドを手動指定）
- `createMediaStream` → track 差し替え → MediaStream 更新
- device OFF 時の track 停止処理

`"audio"` / `"video"` の違いのみ。

## 修正方針

### 1. `connectSora` と `reconnectSora` の共通化

共通化した関数 `doConnect` を新設する。`connectSora` は `doConnect({ retry: false })`、`reconnectSora` は `doConnect({ retry: true })` として呼ぶ:

```typescript
interface DoConnectOptions {
  retry: boolean;
  maxRetries?: number; // デフォルト 10
}

async function doConnect(options: DoConnectOptions): Promise<void> {
  // prepareSignalingConnection → createMediaStream → createSoraConnectionByRole
  // → await connect → setStatsReportInternal → startStatsReportTimer
  // → setLocalMediaStream / setFakeContentsGainNode → setSoraConnectionStatus("connected")
  // の共通ロジック
  //
  // options.retry === true の場合、失敗時にループで retry する
}
```

### 2. `setMicDeviceAction` と `setCameraDeviceAction` の共通化

`kind` (`"audio"` | `"video"`) をパラメータとする `setDeviceAction(kind, enabled)` に統合する:

```typescript
type DeviceKind = "audio" | "video";

async function setDeviceAction(kind: DeviceKind, enabled: boolean): Promise<void> {
  const state = getStateForMediaStream();
  const signalMap = {
    audio: { setSignal: signals.setMicDevice, trackGetter: "getAudioTracks" /* ... */ },
    video: { setSignal: signals.setCameraDevice, trackGetter: "getVideoTracks" /* ... */ },
  };
  // 共通ロジック
}
```

### 3. ガード条件の不一致を修正

`setMicDeviceAction` (line 1591) は `!localMediaStreamValue || !soraValue` だが、`setCameraDeviceAction` (line 1663) は `!localMediaStreamValue && !soraValue && connectionStatusValue !== "connected"`。両者の意図すべき動作を確認し、統一する。論理的には `!localMediaStreamValue || !soraValue` が正しい（signal の更新だけ行って早期リターン）。

### 4. テスト戦略

- 共通化後も既存の E2E テスト (`tests/sendrecv.test.ts` 等) が pass すること
- `doConnect` の `retry=false` / `retry=true` の各経路をテストする（できれば browser mode で非 mock テスト）
