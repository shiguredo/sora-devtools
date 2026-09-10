# Safari で fakeMedia 配信中に音声をミュートしても音声が送信され続ける問題を修正する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-safari-fake-media-mic-off
- Polished: {YYYY-MM-DD}
- Reporter: @sile

## pending 理由 (2026-09-10)

- 起票時の再現環境は DevTools 2024.1.4 / Safari 17.5 で、当時は `MicDeviceForm` が `src/app/signals.ts` の `setMicDevice` (状態を更新するだけの setter) を呼んでいたため、 mic を OFF にしても音声トラックが停止・削除されなかった
- この問題は `issues/closed/0077-bug-enable-mic-device-toggle.md` で修正済みで、現行実装の `MicDeviceForm` は `getUserMedia` / `fakeMedia` のときに `setMicDeviceAction` を呼び、 mic OFF 時に `stopLocalAudioTrack` で音声トラックを停止・削除し、 `closeFakeContentsAudio` で `AudioContext` を閉じ、 `removeAudioTrack` で Sora から削除する
- ただし、 Safari + fakeMedia の組み合わせでこの修正が効いているかは実機で確認できていない。再現しない可能性が高い
- Safari は E2E テストの対象外 (Chromium のみ) のため、 Safari 固有の WebAudio / MediaStream の挙動に依存する場合は自動テストで押さえられない
- 優先度は 不急で、確認には Safari 実機が必要。再現確認の結果、再現しなければコード変更なしで closed にする
- 上記の確認が取れるまで実装に着手しないため `issues/pending/` に置く

## 目的

Safari で fakeMedia を使って配信しているときに、途中で mic を OFF にしても音声が送信され続ける問題を修正する。

## 現状

以下の手順で問題が再現すると報告されている (DevTools 2024.1.4 / Safari 17.5)。

1. Safari で DevTools を開き、 fake media を使って配信する (sendonly / fakeMedia / audio=true / video=true / fakeVolume=0.25)
2. 配信を開始し、最初はミュートせずに配信する
3. 途中で `Enable mic device` を OFF にする。配信側の音量ゲージはゼロになり停止する
4. 別のブラウザで同じチャネルに接続して視聴すると、ミュートされているはずなのに音声が聞こえる

なお、 fake 以外では再現していないと報告されている。当時の実装では `MicDeviceForm` が `setMicDevice` を呼ぶだけで、音声トラックを停止・削除していなかった。

現行実装は `src/components/DevtoolsPane/MicDeviceForm.tsx` から `setMicDeviceAction` を呼び、 `src/app/actions.ts` の `setMicDeviceAction` が mic OFF 時に以下を行う。

- `stopLocalAudioTrack` でローカル音声トラックを停止して `MediaStream` から削除する
- `closeFakeContentsAudio` で fakeMedia の `AudioContext` を閉じる
- `sora.removeAudioTrack` で Sora から音声トラックを削除する

この実装が Safari + fakeMedia の本件にも効いているかは未確認。

## 設計方針

- まず現行の Safari で再現するかを確認する。再現しない場合は確認結果を issue に記録して closed にする
- 再現した場合は、 Safari で fakeMedia の音声トラックが停止・削除されない原因を調査する。 `AudioContext` の close や oscillator / `GainNode` の停止方法、 `MediaStreamTrack.stop()` の挙動を候補とする
- 修正する場合も getUserMedia と Chrome / Edge の既存動作は変更しない
- fakeMedia は Chrome / Edge を主対象とし、 Safari は偶然動作している部分があるため、 Safari 固有の対応が必要な場合は範囲と優先度を実装時に決める

## 完了条件

- Safari + fakeMedia で mic を OFF にした後、別のクライアントで音声が受信されない
- 再現しない場合は Safari 実機での確認結果を issue に記録して closed にする
- getUserMedia と Chrome / Edge の `Enable mic device` の既存動作が変わらない
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

再現確認が先。再現した場合に `setMicDeviceAction` の fakeMedia 経路と `closeFakeContentsAudio` を調査して修正する。

## 関連

- `issues/closed/0077-bug-enable-mic-device-toggle.md`: mic OFF 時に音声トラックを停止・削除する修正
- `issues/closed/0049-bug-fix-fake-contents-audio-close.md`: fakeMedia の `AudioContext` の解放に関する調査
- `issues/0083-bug-preserve-fake-media-audio-on-camera-toggle.md`: fakeMedia のカメラ切り替えと音声状態の issue
- `src/app/actions.ts` の `setMicDeviceAction` / `stopLocalAudioTrack` / `closeFakeContentsAudio`
