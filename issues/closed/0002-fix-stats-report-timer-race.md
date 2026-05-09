# 0002 StatsReport タイマーの構造的問題を修正する

Created: 2026-05-09
Completed: 2026-05-09
Model: deepseek-v4-pro

## 概要

`startStatsReportTimer` (`src/app/actions.ts:1315-1324`) に以下の 3 つの構造的問題がある:

1. **並行呼び出し蓄積**: `setInterval` が async コールバックの完了を待たないため、`getStats()` が設定間隔より長くかかると複数の `getStats()` が並行して走る
2. **二重タイマー起動**: `connectSora` (line 1391) と `reconnectSora` (line 1471) で既存タイマーを停止せずに `startStatsReportTimer()` を呼ぶ。reconnect 時は `await soraValue.disconnect()` → disconnect callback が `setSora(null)` で旧タイマーを自滅させるが、その後に新 `sora` が設定され新タイマーが起動する。旧タイマーの最終 callback がこの新 `sora` を掴むと、同一 `sora` に対して複数タイマーが並走する
3. **即時停止手段の不在**: タイマー ID (`timerId`) が `startStatsReportTimer` のローカル変数であり、外部から `clearInterval` できない。`disconnectSora` はタイマーを一切停止せず、disconnect callback の `setSora(null)` による次回 tick での自滅に依存している。最大 1 秒間、切断済みの PeerConnection に対して無駄な `getStats()` が実行される。また `showStats` signal が false の間もタイマーは走り続ける

## 再現手順

1. Sora に接続する（タイマー 1 起動）
2. 切断 → 再接続する（旧タイマーが自滅する前に新タイマー 2 が起動し、2 つのタイマーが同時に走る）
3. さらに切断 → 再接続を繰り返す（タイマーが増殖する）
4. `disconnectSora` を呼ぶ（タイマーは即停止せず、最大 1 秒間走り続ける）

## 期待される動作

- `getStats()` 完了後に次の呼び出しをスケジュールする（並行呼び出しなし）
- 新しい StatsReport タイマーを起動する前に既存タイマーを確実に停止する
- `disconnectSora` で直ちにタイマーが停止する
- `showStats` が false の間はタイマーを走らせないか、走っていても UI に影響しないようにする

## 実際の動作

- `setInterval` + `async` により並行呼び出しが蓄積する
- reconnect のたびにタイマーが増殖する
- `disconnectSora` ではタイマーが即停止しない
- `showStats=false` でもタイマーが走り続ける

## 影響範囲

| ファイル                       | 変更内容                                                                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/actions.ts:1315-1324` | `startStatsReportTimer` を `setInterval` + async コールバックから `setTimeout` チェーンに書き換え。タイマー ID をモジュールスコープ変数（または signal）に保持し、外部から停止可能にする。`stopStatsReportTimer` 関数を新設する |
| `src/app/actions.ts:1391`      | `connectSora` で新しいタイマーを起動する前に既存タイマーを停止する                                                                                                                                                              |
| `src/app/actions.ts:1471`      | `reconnectSora` で同上。再接続のたびにタイマーをリセットする                                                                                                                                                                    |
| `src/app/actions.ts:1485-1493` | `disconnectSora` で `stopStatsReportTimer()` を呼ぶ                                                                                                                                                                             |
| `src/app/actions.ts:998-1001`  | disconnect コールバックでも念のため `stopStatsReportTimer()` を呼ぶ                                                                                                                                                             |
| `src/app/signals.ts:175-176`   | タイマー状態を signal に持つ場合の変更。必須ではないが、タイマー ID を signal で管理するのが Preact の方針に沿う                                                                                                                |

## エッジケース

| シナリオ                                                    | 確認事項                                                                                                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getStats()` が例外を投げた場合                             | `setTimeout` チェーンが止まらないよう catch で継続する                                                                                                          |
| `pc` が null / `iceConnectionState === "closed"`            | `setStatsReportInternal` 内部の既存ガード (L1133) で対応済み。タイマーは走り続けるが実害なし                                                                    |
| 短時間の connect → disconnect → connect                     | 毎回 `stopStatsReportTimer()` → `startStatsReportTimer()` の順でタイマーをリセットする                                                                          |
| reconnect と手動 disconnect の競合                          | `reconnectSora` のループ中に `reconnecting` signal が false になった場合、break 前にタイマーを停止する                                                          |
| `showStats` signal が false の間                            | タイマーを停止するか、`setStatsReportInternal` 内で skip する                                                                                                   |
| `getStats()` の直接呼び出しとタイマー初回 callback の重なり | `connectSora` / `reconnectSora` で `await setStatsReportInternal()` の直後にタイマーを起動している。`setTimeout` チェーンに変更することでこの重なりも解消される |

## 修正方針

### 1. タイマー ID をモジュールスコープ変数に保持する

```typescript
let statsReportTimerId: ReturnType<typeof setTimeout> | null = null;
```

`signals.ts` に signal として持つことも可能だが、UI に表示する値ではないためモジュールスコープ変数で十分。

### 2. `startStatsReportTimer` を `setTimeout` チェーンに書き換える

```typescript
function startStatsReportTimer(): void {
  const schedule = async () => {
    const soraValue = signals.sora.value;
    if (!soraValue) {
      return; // 停止: schedule しない
    }
    try {
      await setStatsReportInternal(soraValue);
    } catch {
      // getStats のエラーは握りつぶし、タイマーは継続する
    }
    if (signals.sora.value) {
      statsReportTimerId = setTimeout(schedule, 1000);
    }
  };
  schedule();
}
```

`setInterval` のような厳密な 1000ms 間隔ではなく、前回の `getStats()` 完了から 1000ms 後に次をスケジュールする。

### 3. `stopStatsReportTimer` を新設する

```typescript
function stopStatsReportTimer(): void {
  if (statsReportTimerId !== null) {
    clearTimeout(statsReportTimerId);
    statsReportTimerId = null;
  }
}
```

### 4. 停止ポイント

- `startStatsReportTimer()` の先頭で既存タイマーを `clearTimeout` する（二重起動防止）
- `disconnectSora` で `stopStatsReportTimer()` を呼ぶ
- disconnect コールバックで `stopStatsReportTimer()` を呼ぶ

### 5. 呼び出し規則

常に `stopStatsReportTimer()` → `startStatsReportTimer()` の順で呼ぶ。

## テスト戦略

- Vitest の `vi.useFakeTimers()` でタイマーを制御し、以下をテストする:
  - `startStatsReportTimer` が `getStats` (mock) を 1 回呼んだ後、1000ms 後に 2 回目を呼ぶこと
  - `stopStatsReportTimer` が 2 回目の呼び出しをキャンセルすること
  - `startStatsReportTimer` を連続で呼んでもタイマーが増殖しないこと
  - `getStats` が reject してもタイマーが継続すること
  - `sora` が null になったら次回 schedule が行われないこと

## 解決方法

- `src/app/actions.ts` の `startStatsReportTimer` を `setInterval` + async コールバックから `setTimeout` チェーンに書き換えた。`getStats` 完了後に次回をスケジュールするため並行呼び出しが蓄積しない。
- モジュールスコープに `statsReportTimerId` を保持し、`stopStatsReportTimer` で `clearTimeout` できるようにした。
- `startStatsReportTimer` の先頭で既存タイマーを停止し、再接続時のタイマー増殖を防いだ。
- disconnect コールバックと `disconnectSora` で `stopStatsReportTimer` を呼び、即時停止するようにした。
- `getStats` が例外を投げてもタイマーが継続するよう `try/catch` で握りつぶす。

備考: ユニットテストはモック禁止のため追加せず、e2e (sendonly / recvonly / sendrecv) で接続〜切断の動作を確認した。
