# 0003 createDisplayMediaStream の cameraDevice 誤チェックを修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`createDisplayMediaStream` (`src/app/actions.ts:660-662`) は画面共有（`getDisplayMedia`）用の関数だが、ガード条件に `cameraDevice` のチェックが含まれている。`cameraDevice` はカメラ利用フラグであり、画面共有とは無関係。

```typescript
if (!state.video || !state.cameraDevice) {
  return [new MediaStream(), null];
}
```

## 再現手順

1. `cameraDevice` を false に設定する
2. `mediaType` を `getDisplayMedia` に設定する
3. Sora に接続する
4. 空の MediaStream が返り、画面共有が行われない

## 期待される動作

`cameraDevice` の状態にかかわらず `getDisplayMedia` が実行される。

## 実際の動作

`cameraDevice` が false の場合、`getDisplayMedia` が呼ばれず空の MediaStream が返る。

## 修正方針

`src/app/actions.ts:660` の条件を `if (!state.video || !state.cameraDevice)` から `if (!state.video)` に変更する。

`cameraDevice` はカメラ利用フラグであり、画面共有（`getDisplayMedia`）ではカメラを使わない。画面共有には `createDisplayMediaStream` が使われるため、このガード条件に `cameraDevice` を含めるのは誤り。

## テスト戦略

- `createDisplayMediaStream` に `state.cameraDevice=false, state.video=true` を渡したとき、空の MediaStream ではなく `getDisplayMedia` が呼ばれること
- `state.video=false` のときは引き続き空の MediaStream が返ること
