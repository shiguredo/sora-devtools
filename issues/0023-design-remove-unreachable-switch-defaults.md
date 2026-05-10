# 0023-design-remove-unreachable-switch-defaults

Created: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code で検出。switch 文の `default` 節が到達不能であり、かつ `switch-exhaustiveness-check` を実質無効化している。

## 内容

### 1. TimelineMessages.tsx:90-93 — switch の default 節

```typescript
switch (logType) {
  case "websocket": { ... }
  case "datachannel": { ... }
  case "peerconnection": { ... }
  case "sora": { ... }
  case "sora-devtools": { ... }
  default: {
    labelComponent = undefined;  // 到達不能
    break;
  }
}
```

`logType` の型は `"websocket" | "datachannel" | "peerconnection" | "sora" | "sora-devtools"` で全 5 ケースを網羅済み。`default` 節を削除することで `switch-exhaustiveness-check` が正しく機能し、sora-js-sdk が新しい logType を追加した場合にコンパイルエラーで検出できる。

### 2. utils.ts:326-328 — getBlurRadiusNumber の default 節

```typescript
switch (blurRadius) {
  case "": {
    return 0;
  }
  case "weak": {
    return 5;
  }
  case "medium": {
    return 10;
  }
  case "strong": {
    return 15;
  }
  default: {
    throw new Error(`unexpected blurRadius value: ${blurRadius as string}`); // 到達不能
  }
}
```

`BLUR_RADIUS = ["", "weak", "medium", "strong"] as const` の全 4 ケースを網羅済み。ランタイム防衛を残す場合は `const _exhaustiveCheck: never = blurRadius;` の exhaustive check パターンを使用する。

## 期待される結果

- TimelineMessages.tsx: `default` 節を削除
- utils.ts: `default: throw Error` を `default: { const _: never = blurRadius; throw ...}` に変更
