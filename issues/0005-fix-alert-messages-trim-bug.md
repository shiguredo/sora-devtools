# 0005 アラートメッセージの配列トリミングバグを修正する

Created: 2026-05-09
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

ループ前に目標長を固定する。例: `const target = 5; while (currentAlertMessages.length > target) { currentAlertMessages.pop(); }` または `slice` を使用する。
