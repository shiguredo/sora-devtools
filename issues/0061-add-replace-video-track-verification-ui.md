# 0061-add-replace-video-track-verification-ui

- Priority: Medium
- Created: 2026-06-11
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/add-replace-video-track-verification-ui
- Polished: 2026-06-16
- Reporter: @voluntas

## 目的

shiguredo/sora-js-sdk リポジトリの pending issue `issues/pending/0013-bug-fix-replace-track-loses-simulcast-encodings.md` ( 別リポジトリ) で議論されている「`replaceVideoTrack` 後に simulcast の encodings ( rid / active 等) が保持されるか」という仮説を、実利用者が手元のブラウザで簡単に検証できる UI を sora-devtools に追加する。

仕様準拠ブラウザでは encodings は保持されるが、非準拠実装の有無は再現未確定で本番観測ログ・ユーザ報告も無い。 sora-devtools は実利用者が広いブラウザ・OS マトリクスで手動検証できるため、本仮説の再現報告を上げられる導線を作る。

### 既存実装との関係

`src/app/actions.ts:2085` の `setCameraDeviceAction` 内で既に `soraValue.replaceVideoTrack(localMediaStreamValue, mediaStream.getVideoTracks()[0])` が呼ばれており、 ユーザーがカメラデバイスを切り替えると `replaceVideoTrack` が実行される経路は存在する。 ただし以下の理由で「専用の検証 UI」が別途必要:

- 既存経路 (`setCameraDeviceAction`) はカメラ切替を主目的としており、 encodings 比較表示・連続実行・統計収集の UI を持たない
- 副作用 ( `setCameraDevice` signal 更新、 `setLocalMediaStream` 等) が多く、 検証ノイズが大きい
- 連続 replace ループや時系列統計を取る仕組みが無い
- 検証結果の構造化されたコピー機能が無い

本 issue は「`replaceVideoTrack` 実行 + 前後比較表示のみ」を Phase 1 として実装し、 連続ループ・時系列統計・クリップボードコピーは Phase 2 以降に分離する (詳細は下記「スコープと Phase 分割」を参照)。

## 優先度根拠

Medium。

- sora-js-sdk pending 0013 が pending 化されているため、 本 UI が無いと再現報告が上がらず該当 issue が永久 pending になる
- 一方で本番運用上の障害は未確認のため High ではない
- devtools の他機能と独立に追加できる検証ツールで、技術的リスクも低い

## 現状

sora-devtools の現状 UI には:

- simulcast 接続パラメータ ( `simulcast` / `simulcastRid` / `simulcastRequestRid` ) を設定する Form は揃っている ( `src/components/DevtoolsPane/` 配下、 `src/app/signals.ts` で `setSimulcast` / `setSimulcastRid` / `setSimulcastRequestRid` を export)
- 接続中の Stats / SignalingMessages 表示は DebugPane にある ( `src/components/DebugPane/Stats.tsx` 等)
- カメラ切替経由の `replaceVideoTrack` は `src/app/actions.ts:2085` で実行されるが、 専用検証 UI ( replace 前後 encodings 比較表示・連続実行ボタン等) は存在しない
- `Sora.connection` API の `replaceVideoTrack` のシグネチャは `replaceVideoTrack(stream: MediaStream, videoTrack: MediaStreamTrack): Promise<void>` で戻り値は void。 sender の取得は `soraValue.pc.getSenders()` 経由で行う必要がある ( `src/app/actions.ts:1892` で同じパターンを `updateMediaStream` 内で既に使用している。 `pc` プロパティは sora-js-sdk 公開 API)

## 設計方針

### スコープと Phase 分割

本 issue では Phase 1 のみを実装する。 Phase 2 以降は別 issue として後続で起票する。

**Phase 1 (本 issue)**:

- 新規コンポーネント `SimulcastVerificationPane.tsx` ( `src/components/DebugPane/` 配下) を追加
- 「Replace video track」ボタンと encodings 比較表 (replace 前後の rid / active / scaleResolutionDownBy / maxBitrate) を 1 つのパネルで完結させる
- `simulcast === true` かつ `role` が `sendonly` / `sendrecv` の接続中のみパネルを表示する

**Phase 2 以降 (別 issue で起票)**:

- 連続 replace ループ (3 / 5 / 10 回) ボタン
- rid 別 outbound-rtp 時系列統計表示
- 検証結果のクリップボードコピー ( ブラウザ・OS・観測値の structured text 出力)
- 非 simulcast 接続向けの汎用 `replaceTrack` 検証 UI

理由: Phase 1 だけでも sora-js-sdk pending 0013 の最低限の再現報告が可能 ( replace 前後の rid 比較で encodings 維持確認ができる)。 Phase 2 以降は再現確度が必要になった段階で個別 issue として磨いて起票する方が、 各成果物の粒度を保てる。

### `SimulcastVerificationPane.tsx` の仕様

新規ファイル `src/components/DebugPane/SimulcastVerificationPane.tsx` を追加する。 DebugPane に新タブ `Replace Video Track` ( eventKey `"replaceVideoTrack"` ) として追加する ( `src/components/DebugPane/index.tsx` の `<Tabs>` に新 `<Tab>` を追加し、 `src/constants.ts` の `DEBUG_TYPES` にも `"replaceVideoTrack"` を追加する)。

```tsx
// src/components/DebugPane/SimulcastVerificationPane.tsx (新規)
// replaceVideoTrack 後の simulcast encodings 維持を検証するパネル。
// sora-js-sdk pending 0013 ( shiguredo/sora-js-sdk リポジトリ) の再現報告用 UI。
import { useSignal } from "@preact/signals";

import { Button } from "@/components/ui";
// 本パネルは多数の signal を参照・更新するため namespace import で signals.* 形式に統一する
// ( actions.ts と同じスタイル)。 named import との混在は避ける。
import * as signals from "@/app/signals";
import { getErrorMessage } from "@/utils";

// rid 別 encodings の表示用型 ( RTCRtpEncodingParameters の必要フィールドのみ抜粋)
interface EncodingSnapshot {
  rid: string | undefined;
  active: boolean | undefined;
  scaleResolutionDownBy: number | undefined;
  maxBitrate: number | undefined;
}

export function SimulcastVerificationPane() {
  // replace 前後の encodings を保持する。 undefined は「未取得」を意味する。
  const beforeEncodings = useSignal<EncodingSnapshot[] | undefined>(undefined);
  const afterEncodings = useSignal<EncodingSnapshot[] | undefined>(undefined);
  // 操作ガード: simulcast 接続中の sendonly / sendrecv のみ有効
  const canReplace =
    signals.simulcast.value === "true" &&
    (signals.role.value === "sendonly" || signals.role.value === "sendrecv") &&
    signals.connectionStatus.value === "connected" &&
    signals.sora.value !== null;

  const onClickReplace = async (): Promise<void> => {
    const soraValue = signals.sora.value;
    if (!soraValue?.pc) {
      return;
    }
    // 既存パターン ( actions.ts:1892) に倣い soraValue.pc.getSenders() から video sender を取得
    const videoSender = soraValue.pc.getSenders().find((s) => s.track?.kind === "video");
    if (!videoSender) {
      return;
    }
    // replace 前の encodings をスナップショット
    beforeEncodings.value = videoSender.getParameters().encodings.map((e) => ({
      rid: e.rid,
      active: e.active,
      scaleResolutionDownBy: e.scaleResolutionDownBy,
      maxBitrate: e.maxBitrate,
    }));
    // 新しい getUserMedia({ video: true }) を取得
    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const newTrack = newStream.getVideoTracks()[0];
    if (!newTrack) {
      return;
    }
    // 既存 localMediaStream を再利用し video track のみ差し替え (actions.ts:2085 と同じパターン)
    const localMediaStream = signals.localMediaStream.value;
    if (!localMediaStream) {
      return;
    }
    try {
      await soraValue.replaceVideoTrack(localMediaStream, newTrack);
    } catch (error) {
      // エラー時は after を更新せず early return (差分表示は before のみ残る)
      // 既存 actions.ts:2087-2090 と同じパターンで LogMessages に通知する
      signals.setLogMessages({
        title: "REPLACE_VIDEO_TRACK_VERIFICATION",
        description: getErrorMessage(error),
      });
      return;
    }
    // replace 後の sender を再取得する ( replaceVideoTrack 内部で removeTrack/addTrack が
    // 走る可能性があるため、 同一 sender インスタンスを前提にしない)
    const afterSender = soraValue.pc.getSenders().find((s) => s.track?.kind === "video");
    if (!afterSender) {
      return;
    }
    afterEncodings.value = afterSender.getParameters().encodings.map((e) => ({
      rid: e.rid,
      active: e.active,
      scaleResolutionDownBy: e.scaleResolutionDownBy,
      maxBitrate: e.maxBitrate,
    }));
  };

  return (
    <div>
      <Button onClick={onClickReplace} disabled={!canReplace}>
        Replace video track
      </Button>
      {/* before / after の encodings を 2 列で並べて表示する table */}
      {/* before / after で rid / active / scaleResolutionDownBy / maxBitrate が変化した行を視覚的にハイライトする */}
    </div>
  );
}
```

設計上の注意:

- `soraValue.pc.getSenders()` を直接参照するのは既存パターン ( `src/app/actions.ts:1892` の `updateMediaStream` 内) と同じ手法。 `pc` プロパティは sora-js-sdk が公開する PeerConnection 参照で、 SDK バージョンアップ時に破壊的変更がないか PR 時に確認する
- replace 用の新 stream は `getUserMedia({ video: true })` のみ呼び、 audio は変更しない ( audio simulcast は不在のため対象外)
- replace 失敗は既存パターン ( `actions.ts:2087-2090` ) に倣い `setLogMessages({ title: "REPLACE_VIDEO_TRACK_VERIFICATION", description: getErrorMessage(error) })` で LogMessages タブに通知する。 `setAlertMessages` 系には流さない (検証用の操作のため、 接続失敗等の重大エラーと分けて DebugPane 内で確認する)
- encodings 比較表は table の 2 列レイアウトで `rid` / `active` / `scaleResolutionDownBy` / `maxBitrate` を並べ、 差分のあるセルを背景色等で視覚的にハイライトする
- タブヘッダー ( `<Tab title="Replace Video Track">` ) は他タブと同様に常時表示する ( DebugPane の既存タブは条件付きレンダリングを行わない設計のため踏襲する)。 タブの中身 ( `SimulcastVerificationPane` ) 側で表示条件を判定し、 `connectionStatus !== "connected"` または `simulcast !== "true"` または `role` が `recvonly` の場合は「Simulcast 接続中に切り替えると本パネルが有効化されます」のような案内テキストのみを表示してボタンは disabled (またはレンダリングしない) にする ( `resetSimulcastSpotlightState` で `simulcastRid` がリセットされた状態でも、 本 UI は `signals.simulcast.value === "true"` を見るため影響なし)
- `replaceVideoTrack` 検証時に渡す MediaStream は **既存 `signals.localMediaStream.value` をそのまま渡す** ( 既存 `actions.ts:2085` パターンと同じ)。 検証実行後の `localMediaStream` の video track は新 track に置き換わるが、 これは検証 UI 自体の意図 ( ユーザーが手動で track 入れ替えを起こして encodings を観測する) と一致する。 「元の track に戻す」処理は本 issue では行わない (検証完了後は通常の `setCameraDeviceAction` 等で元の状態に戻せるため別 issue で扱う)。 `setCameraDevice` 等の signal は本 UI から触らない (純粋に sender encodings を比較する観測 UI に責務を限定する)
- `videoSender` インスタンスは replace 前後で **再取得する** ( `replaceVideoTrack` 内部で `pc.removeTrack` / `pc.addTrack` が走る可能性があるため、 同一 sender インスタンスを前提にしない)。 after 取得時に `soraValue.pc.getSenders().find((s) => s.track?.kind === "video")` を再度呼ぶ。 同一 sender が返ることが多いが、 仕様で保証されていないため再取得で防御する
- encodings 取得タイミング: `await soraValue.replaceVideoTrack(...)` の Promise が resolve した直後に `getParameters()` を呼ぶ。 `getParameters()` は同期 API で「reapply 後の状態を返すか」は実装依存だが、 `replaceVideoTrack` の resolve 後は SDK 側で reapply 完了している前提とする ( `sora-js-sdk` の実装挙動)。 もし `replaceVideoTrack` 直後の `getParameters().encodings` が空配列を返すブラウザがあれば、 それ自体が pending 0013 の再現候補となるため検証結果として記録する

### 操作ガード

- パネル表示条件: `simulcast.value === "true"` ( `simulcast` signal の値は文字列リテラル "true" / "false" / "" のいずれかで管理されている。 `src/app/signals.ts` の `setSimulcast` 参照)
- Replace ボタン有効化条件: `simulcast === "true" && (role === "sendonly" || role === "sendrecv") && connectionStatus === "connected" && sora !== null`
- recvonly では `sender` が存在しないため非表示 (パネル自体を表示しない判定の方が UX 上は親切)

### 機密情報の取り扱い

本 Phase では encodings の値 ( rid / active 等の数値) のみを UI 上に表示する。 `connectionId` / `channelId` / `sessionId` 等のユーザー識別情報はパネル上で表示しない (Phase 2 のクリップボードコピー機能で別途検討する際に、 ホワイトリスト形式で「コピーに含める情報」を限定する)。

## 影響範囲

- 新規: `src/components/DebugPane/SimulcastVerificationPane.tsx`
- 修正: `src/components/DebugPane/index.tsx` ( `<Tabs>` に新 `<Tab eventKey="replaceVideoTrack" title="Replace Video Track">` を追加。 加えて同ファイルの `onSelect` ハンドラ内の `key === "log" || key === "notify" || ...` 文字列リテラル白リストに `key === "replaceVideoTrack"` を追加する。 これを忘れるとタブクリック時に `setDebugType` も URL の `?debugType=replaceVideoTrack` 反映も発火しない)
- 修正: `src/constants.ts` ( `DEBUG_TYPES` に `"replaceVideoTrack"` を追加)
- 修正: `CHANGES.md` の `## develop` 内 `[ADD]` セクション末尾に以下を追記 ( `shiguredo-changelog` 規約に従う):
  ```
  - [ADD] simulcast 接続中の `replaceVideoTrack` 前後で encodings ( rid / active 等) を比較表示する DebugPane タブ ( Replace Video Track ) を追加する
    - sora-js-sdk pending 0013 の再現報告 UI として利用する
    - @voluntas
  ```

## テスト戦略

- 単体テスト追加なし: Preact コンポーネントの単体テスト基盤は本リポジトリに無い (0053 / 0054 / 0056 と同じ判断、 jsdom + モック禁止規約と両立しない)
- Playwright e2e: simulcast 接続 + replaceVideoTrack の e2e 検証は別 issue で扱う ( `?simulcast=true&role=sendrecv` で Sora 接続が必要)
- 手動検証: 後述「検証手順」で Chrome / Firefox / Safari の最新版での挙動を確認する

## 検証手順

### A. 修正前の確認 ( develop ブランチで実施)

1. `pnpm dev` で起動し `?role=sendrecv&simulcast=true&debug=true&debugType=timeline` で Sora 接続する。
2. DebugPane のタブ一覧に `Replace Video Track` タブが存在しないことを確認する。

### B. 修正後の確認 ( Phase 1 のスコープ)

3. 同じ URL で Sora 接続する。
4. DebugPane のタブ一覧に `Replace Video Track` タブが追加され、 タブを開くと「Replace video track」ボタンが有効化されていることを確認する。
5. ボタンを押下 → 新しい `getUserMedia({ video: true })` が走り、 video track が差し替わる。 UI のローカル映像が一瞬切り替わる。
6. 比較表 ( before / after 2 列) が表示され、 replace 前後の rid / active / scaleResolutionDownBy / maxBitrate を視覚的に比較できることを確認する。
7. 仕様準拠ブラウザ ( Chrome / Firefox 最新版) では before と after で encodings ( rid 配列、 active) が一致することを確認する。 判定基準:
   - **期待値 (準拠)**: before / after ともに `encodings.length >= 1` で、 各 entry の `rid` が `"r0"` / `"r1"` / `"r2"` のような simulcast 用識別子で一致し、 `active` フラグも一致する
   - **異常値 (非準拠)**: after で `encodings.length === 0` になる、 または `rid` が `undefined` になる、 または `active` の値が before と一致しない
   - **異常値を観測した場合**は sora-js-sdk pending 0013 の再現候補として、 該当ブラウザ ( name + version + OS) と encodings の before / after 値を `shiguredo/sora-js-sdk` リポジトリの該当 issue にコメントする

### C. 操作ガード

8. `?role=recvonly` で接続 → `Replace Video Track` タブが非表示 (または案内テキストのみ表示) であることを確認する。
9. `?role=sendrecv&simulcast=false` で接続 → 同上。
10. 切断状態 → 同上。

### D. 非準拠実装の検出 ( Phase 1 のクライマックス)

11. Chrome 旧版 / Firefox 旧版 / Safari ( デスクトップ / モバイル) で B の手順を実行し、 encodings が変化するブラウザがあれば sora-js-sdk pending 0013 の再現報告として `shiguredo/sora-js-sdk` リポジトリの該当 issue にコメントする。

### E. テスト

12. `pnpm test` が pass すること。
13. 既存 Playwright e2e ( `pnpm test:e2e` ) が pass すること。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- DebugPane に `Replace Video Track` タブが追加され、 simulcast 接続中の sendonly / sendrecv role のみで有効化されること。
- replace 前後の sender encodings ( rid / active / scaleResolutionDownBy / maxBitrate) を UI 上で並べて比較できること。
- 差分のあるセルが視覚的にハイライトされること。
- `CHANGES.md` の `## develop` の `[ADD]` セクション末尾に上記エントリが追記され、 担当者行が付いていること。
- 既存テスト ( `pnpm test` ) および既存 Playwright e2e が pass すること。

## スコープ外 ( Phase 2 以降で扱う)

- 連続 replace ループ (3 / 5 / 10 回) ボタン: 別 issue で扱う
- rid 別 outbound-rtp 時系列統計表示 ( `bytesSent` / `packetsSent` / `framesEncoded`): 別 issue で扱う
- 検証結果のクリップボードコピー: 別 issue で扱う。 機密情報 ( `connectionId` / `channelId` / `sessionId`) を含まないことを明示するためのホワイトリスト設計が必要
- sora-js-sdk pending 0013 の修正そのもの: 本 UI は検証のみで、 修正は sora-js-sdk 側 issue で扱う
- `replaceAudioTrack` 系: audio simulcast が不在のため対象外
- 非 simulcast 接続での `replaceVideoTrack` 検証 UI: 本 issue は simulcast 検証用に絞る。 汎用 replaceTrack 検証は別 issue が必要なら別途切る
- sora-js-sdk pending 0013 ( `shiguredo/sora-js-sdk` リポジトリ) への「本 UI を参照する旨」の追記: 別リポジトリへの編集 PR となるため本 issue のスコープ外。 本 issue マージ後、 sora-js-sdk リポジトリで別 PR として作業する

## 関連 issue

- `shiguredo/sora-js-sdk` リポジトリの `issues/pending/0013-bug-fix-replace-track-loses-simulcast-encodings.md` ( 別リポジトリ): 本 UI の検証対象となる pending issue
- closed/0010-fix-copy-clipboard-failure: 既存のクリップボードコピーパターン ( `navigator.clipboard.writeText` + `setAPIErrorAlertMessage` フォールバック)。 Phase 2 のクリップボードコピー実装時に踏襲する
