# Safari で配信側のカメラ OFF 時に受信した音声が再生されない問題を修正する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-safari-audio-playback
- Polished: {YYYY-MM-DD}
- Reporter: @miosakuma

## 目的

Safari で受信した音声が再生されない問題を修正する。

配信側が mic のみ（camera OFF）で配信を開始したとき、Safari の recvonly 受信では音量ゲージが反応するのにスピーカーから音声が出ない。音声が聞こえないと Safari での受信検証ができない。

## 現状

以下の手順で問題が再現する。受信側が Mac Safari の場合に発生する。

1. Safari で `recvonly` を選択して接続する
2. 別のクライアントで `Enable camera device` を OFF にし、mic を ON のまま接続する
3. Safari の音量ゲージは動くが、スピーカーから音声が聞こえない

- 配信側が camera ON の場合は音声が聞こえる。最初は camera ON で接続し、接続後に camera を OFF にした場合も音声が聞こえる
- 受信側が Mac Chrome の場合は音声が聞こえる
- 接続直後（数秒以内）に配信側が接続すると再生されることがある。接続から時間が経過すると、デバイスやトラックの状態によらず自動再生されない
- 過去の調査では Safari の自動再生制限が原因と判断されている。`connect` 押下時に無音ファイルを再生してアンロックする案が出たが、Safari 専用の対応になるため見送られた経緯がある

コード上の現状は以下のとおり。

- `src/components/Video/Video.tsx` の `VideoElement` は `autoPlay` と `controls` を持つ `video` 要素を描画する。`play()` の失敗（`NotAllowedError` など）を検知してユーザーに通知したり、ユーザー操作を契機に再生を再試行したりする処理はない
- `src/components/Video/VolumeVisualizer.tsx` の `Visualizer` は専用の `AudioContext` で `MediaStream` を直接解析する。`video` 要素の再生状態とは独立しているため、再生がブロックされていても音量ゲージは反応する。音量ゲージが動くことと音声が再生されていることは一致しない
- タブが非アクティブであることやウィンドウの前後関係は動作に影響しないことを確認済み

## 設計方針

- Safari の自動再生制限はブラウザ仕様であり自動再生を強制しない。ユーザー操作で再生を開始できる導線を用意する
- `video` 要素の `play()` の失敗または `paused` を検知し、自動再生がブロックされたことを UI で分かるようにする
- 通知または再生ボタンから `play()` を呼び出し、ユーザー操作を契機に再生を再開できるようにする
- 音声のみのストリームでも再生を開始できる手段が表示されるようにする
- 自動再生が許可されている環境では従来どおり自動で再生する
- 接続時の無音再生によるアンロックは Safari 専用のハックであるため、採用する場合は最新の Safari で検証したうえで理由を明確にする
- 最新の Safari で再現するかを実装時に確認し、通知 / 再生ボタン / ユーザー操作での再試行のどれを採用するかを決める
- Chrome / Edge / Firefox の自動再生の挙動は変更しない
- `issues/0086-bug-safari-volume-meter-not-working.md` の音量ゲージ (`AudioContext` の `suspended`) の修正とは対象が別である（本 issue は実再生の修正）

## 完了条件

- Safari で配信側が camera OFF の音声のみの配信を受信したとき、ユーザー操作で音声を再生できる
- 自動再生がブロックされた場合、ユーザーが再生を開始できる手段が UI に表示される
- 自動再生が許可されている環境では従来どおり自動で再生される
- 受信側が Chrome / Edge / Firefox の場合の挙動が変わらない
- Safari の実ブラウザで手動確認を実施する（E2E テストは Chromium のみで実行するため Safari の自動テストは対象外とする）
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/Video/Video.tsx` の `VideoElement` で `play()` の結果または `paused` を監視し、ブロックを検知する
- ブロックを検知したら、既存の通知の仕組みまたは `video` 要素上の再生ボタンでユーザーに再生を促す
- 再生を促す UI からのユーザー操作で `play()` を再試行する
- Safari で再現手順を実行して修正を確認し、Chrome / Edge / Firefox で退行がないことを確認する

## 関連

- `issues/0086-bug-safari-volume-meter-not-working.md`: Safari の音量ゲージが動作しない問題。`AudioContext` の `suspended` が原因で、本 issue は音声の実再生が対象
- [Autoplay guide for media and Web Audio APIs - MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [HTMLMediaElement: play() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)
