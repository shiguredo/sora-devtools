# 0027-design-unify-set-device-actions

Created: 2026-05-10
Model: deepseek-v4-pro

## pending 理由

- `issues/pending/0018-enhance-actions-deduplicate.md` の「重複 2: setMicDeviceAction / setCameraDeviceAction」セクションと内容が重複しており、0018 のフェーズ 3 として統合する方が整理しやすい
- 0027 単独 (30 行) では「`buildPickedState(base, overrides)` ヘルパー」「単一の関数に統一」というレベルの曖昧な記述しかなく、具体的な設計案 (`type DeviceKind = "audio" | "video"`、signal map など) は pending 0018 にしか書かれていない
- 0018 のフェーズ分割計画 (フェーズ 1: 差分最小化、フェーズ 2: ガード条件先行修正、フェーズ 3: 統合) と整理が宙に浮かないよう、0018 と一緒に取り扱う
- Polished 日付・Priority・Completed フィールドがいずれも未設定で、AGENTS.md の issue 規約を満たしていない

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code 2 周目で検出。

`setMicDeviceAction` と `setCameraDeviceAction` はそれぞれ約 90 行あり、以下の同一構造を持つ:

1. `!localMediaStreamValue && !soraValue && connectionStatusValue !== "connected"` の早期 return
2. `pickedState` 構築（約 30 行）
3. `createMediaStream` 呼び出し
4. トラックが存在すれば `replaceTrack` or local swap、存在しなければ AudioContext close
5. else 側（デバイス無効化）で `removeTrack` or local stop

## 内容

異なるのは以下のみ:

- `micDevice` / `cameraDevice` 引数
- `audio: false` / `video: false` の打ち消し
- 呼び出す sora-js-sdk メソッド (`replaceAudioTrack` / `replaceVideoTrack`, `removeAudioTrack` / `removeVideoTrack`)
- ローカルトラック停止関数 (`stopLocalAudioTrack` / `stopLocalVideoTrack`)
- 末尾の信号更新 (`setMicDevice` / `setCameraDevice`)

## 期待される結果

単一の関数に統一し、差分を引数またはコールバックで制御する。`pickedState` 構築についても `buildPickedState(base, overrides)` のようなヘルパーで重複を解消する。
