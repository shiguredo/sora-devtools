# 0031 disconnectSora の SDK 切断前ローカル track 停止の根拠を明記する

Created: 2026-06-03
Model: Opus 4.8
Branch: feature/fix-video-persists-after-disconnect
Polished: 2026-06-03
Completed: 2026-06-03

## 背景

issue 0030 の修正で `disconnectSora`（`src/app/actions.ts`）は冒頭で connectionStatus に関わらず `cleanupSoraMediaState()` を呼ぶようになった。`connected` だけでなく `connecting` / `preparing` でも `await soraValue.disconnect()` の前にローカル track を停止する（`disconnected` の場合は後続の `disconnect()` 自体が早期 return で走らない）。`stopLocalAudioTrack` は同期で即 `track.stop()` するため、送信ありの役割（sendonly / sendrecv）では SDK へ切断を通知する前に送信 audio track が ended になる。video は fire-and-forget（100ms sleep つき停止）のため、停止と `disconnect()` の前後関係は非決定的。

これは issue 0030 で導入した動作変更である。本 issue は 0030 のコメント補足であり、0030 と同じ `feature/fix-video-persists-after-disconnect` ブランチ上で対応する。コミット 1089d687 で `disconnectSora` の `cleanupSoraMediaState()` 呼び出し直前に次のコメントが追加済み。

> connected 時は SDK への切断通知前にローカル track を止めるが、UI を即座に消すための意図的な順序であり冪等で安全

このコメントは順序の意図（UI 即時消去）と冪等性には触れているが、「SDK の `disconnect()` がローカル track を触らないため切断前停止が無害」という技術的根拠には触れていない。さらに主語が「connected 時は」となっており、実装が `connected` / `connecting` / `preparing` を対象とすることと一致していない。

## 根拠

- sora-js-sdk 2025.2.0 の `disconnect()`（`node_modules/sora-js-sdk/dist/sora.mjs`）はローカル track を `stop()` せず、WebSocket と PeerConnection を `close()` するだけで renegotiation も行わない。呼び出し先は `disconnectWebSocket`（ws.close）/ `disconnectDataChannel`（DataChannel 経路。disconnect メッセージ送信と `forceCloseDataChannels`）/ `maybeClosePeerConnection`（未 close なら `pc.close()`）/ `initializeConnection`（`this.stream = null` の参照クリアのみで `track.stop()` なし）。`track.stop()` / `replaceTrack(null)` を持つのは別 API の `removeAudioTrack` / `removeVideoTrack` で、`disconnect()` の呼び出しグラフには含まれない。SDK の行番号は更新で変動するため、シンボル名で特定すること。
- recvonly では `localMediaStream` が無く `stopLocalAudioTrack` は no-op のため、この副作用自体が発生しない。送信ありの役割でも実害は「配信先の audio が接続 close より早く停止する」程度で、切断操作の文脈では許容範囲。
- SDK が stream を停止しない事実は closed issue 0014 / 0030 で既出だが、それを「`disconnectSora` で切断通知前にローカル track を止めても無害」という結論に結びつけた記述はコードにも issue にも無い。

## 内容

`disconnectSora` の `cleanupSoraMediaState()` 呼び出し直前のコメント（コミット 1089d687 で追加した行）を、(1) 主語を実装が対象とする 3 状態に揃え、(2) SDK が track を触らないため切断前停止が無害である根拠の 1 行を末尾に追記する形に直す。修正後のコメントは次のとおり（行頭インデントは既存と同じ）。

```
// disconnected 状態でも残留メディアを掃除する
// connected / connecting / preparing 時は SDK への切断通知前にローカル track を止めるが、UI を即座に消すための意図的な順序であり冪等で安全
// sora-js-sdk の disconnect() は WebSocket / PeerConnection を close するだけでローカル track を停止しないため、切断通知前に止めても例外や ICE エラーは起きない
```

順序を逆にする案（SDK 切断を先行させ `cleanupSoraMediaState()` をフォールバックに限定する）は採らない。0030 が解決した「切断後に UI から映像を即座に消す」効果を損ない、かつ SDK の `disconnect` コールバック未発火時にメディアが UI に残留する問題（0030 の問題 2 / 3）を再導入するため。

## テスト・CHANGES.md

- コメントの修正のみで動作は変わらないため、テストの追加・修正は不要。
- 動作不変のため `CHANGES.md` への記載も不要。

## 影響範囲

- `src/app/actions.ts` の `disconnectSora`（既存コメントの主語修正と根拠 1 行の追記のみ）

## 解決方法

`src/app/actions.ts` の `disconnectSora` の `cleanupSoraMediaState()` 呼び出し直前のコメントを修正した。

- 主語を「connected 時は」から「connected / connecting / preparing 時は」に変更し、実装が対象とする 3 状態に揃えた。
- 「sora-js-sdk の disconnect() は WebSocket / PeerConnection を close するだけでローカル track を停止しないため、切断通知前に止めても例外や ICE エラーは起きない」という SDK の無害根拠を 1 行追記した。

コメントの修正のみで動作は変わらないため、テストの追加・修正と `CHANGES.md` への記載は行っていない。既存 93 テストが通ることを確認した。
