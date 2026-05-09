# 0006 getValueByAspectRatio の "21:9" に対する誤った数値を修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`getValueByAspectRatio` (`src/utils.ts:297-298`) で、ラベル `"21:9"` に対して `20 / 9` (≈2.222) を返している。正しくは `21 / 9` (≈2.333) である。

```typescript
case "21:9": {
  return 20 / 9;  // ← 21 / 9 が正しい
}
```

## 再現手順

1. `aspectRatio` に `"21:9"` を設定する
2. 指定したアスペクト比と実際に適用されるアスペクト比が異なる

## 期待される動作

`"21:9"` は `21 / 9` を返す。

## 実際の動作

`20 / 9` を返す。

## 修正方針

`src/utils.ts:298` の `return 20 / 9;` を `return 21 / 9;` に変更する。

## テスト戦略

- `getValueByAspectRatio("21:9")` が `21 / 9` (≈2.333) を返すこと
- `getValueByAspectRatio("4:3")`, `getValueByAspectRatio("16:9")` も同様に正しい値を返すことの確認
- 無効な入力で `Number.NaN` が返ることの確認（既存テスト未カバー）
