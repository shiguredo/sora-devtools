# 0005 アラートメッセージの配列トリミングバグを修正する

Created: 2026-05-09
Completed: 2026-05-09
Model: deepseek-v4-pro

## 概要

`setAlertMessagesAndLogMessages` (`src/app/signals.ts:189-193`) の配列トリミングロジックにバグがある。ループ条件がループ中に変化する `currentAlertMessages.length` に依存しているため、期待する数だけ要素が削除されない。

```typescript
if (currentAlertMessages.length >= 10) {
  for (let i = 0; i <= currentAlertMessages.length - 5; i++) {
    currentAlertMessages.pop();
  }
}
```

## 再現手順

1. アラートメッセージが 10 件蓄積された状態を用意する
2. 11 件目のアラートを追加する
3. 期待: 5 件残る（6 件削除）、実際: 7 件残る（3 件しか削除されない）

初期長 10 の場合のループ推移:

- i=0: length=10, 0 <= 5 → pop → length=9
- i=1: length=9, 1 <= 4 → pop → length=8
- i=2: length=8, 2 <= 3 → pop → length=7
- i=3: length=7, 3 <= 2 → false → 終了
- 結果: 3 件削除 → unshift 後は 8 件

## 期待される動作

アラートが 10 件を超えた場合、古いものから適切にトリミングされる。例えば最大 10 件に制限する等、明確なポリシーに基づく。

## 修正方針

`src/app/signals.ts:189-193` を以下のように変更する。ループ前に目標長を固定し、`pop()` のたびに変動する `length` への依存を解消する:

```typescript
const MAX_ALERT_MESSAGES = 10;
if (currentAlertMessages.length >= MAX_ALERT_MESSAGES) {
  const targetLength = MAX_ALERT_MESSAGES - 1; // unshift 後の最大長
  while (currentAlertMessages.length > targetLength) {
    currentAlertMessages.pop();
  }
}
```

または `slice` を直接使う:

```typescript
const MAX_ALERT_MESSAGES = 10;
if (currentAlertMessages.length >= MAX_ALERT_MESSAGES) {
  currentAlertMessages = currentAlertMessages.slice(0, MAX_ALERT_MESSAGES - 1);
}
```

意図を明確にするため、マジックナンバーを定数化する。

## テスト戦略

- アラートメッセージが 10 件の状態で 11 件目を追加 → 最大 10 件（unshift 後で MAX_ALERT_MESSAGES 件）以下であること
- アラートメッセージが 9 件の状態ではトリミングが発生しないこと
- アラートメッセージが 20 件蓄積した状態でも正しくトリミングされること

## 解決方法

- `src/app/signals.ts` で `MAX_ALERT_MESSAGES = 10` 定数を定義し、`setAlertMessagesAndLogMessages` のトリミングを `slice(0, MAX_ALERT_MESSAGES - 1)` に書き換えた。
- `src/app/app.test.ts` に 9 件 / 10 件 / 20 件のテストケースを追加し、トリミングが期待どおり動作することを確認した。
