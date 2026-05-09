# 0001 FakeMedia 生成時の AudioContext リソースリークを修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`createFakeMediaStream` (`src/utils.ts:586-601`) が呼ばれるたびに新しい `AudioContext` と `OscillatorNode` が生成されるが、古いものは `close()` も `stop()` もされない。fakeMedia の設定変更（解像度変更等）のたびに `createFakeMediaStreamFromState` (`src/app/actions.ts:702`) を通じて新しい AudioContext が生成され、Chrome の AudioContext 上限（約 6 個）に達するとクラッシュする。

## 再現手順

1. mediaType を fakeMedia に設定して接続
2. 解像度やフレームレートを繰り返し変更する（3〜4 回）
3. 5 回目以降で AudioContext 生成に失敗し、fakeMedia が動作しなくなる

## 期待される動作

`createFakeMediaStream` で生成した AudioContext は、再度呼ばれたときに前回のものを適切に `close()` してから新しいものを生成する。または AudioContext を再利用する。

## 実際の動作

古い AudioContext / OscillatorNode / GainNode が解放されず蓄積される。

## 影響範囲

`src/utils.ts:586-601` の `createFakeMediaStream` 関数内の Web Audio API 使用箇所。fakeMedia を利用する全ケースに影響する。

## 修正方針

- 前回の AudioContext を保持し、新規生成前に `close()` する
- `oscillator.stop()` を新規生成前に呼ぶ
- または AudioContext をシングルトン的に再利用する
