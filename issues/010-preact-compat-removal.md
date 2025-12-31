# 010: preact/compat 削除

## 概要

react-bootstrap 削除後、preact/compat を削除して純粋な Preact 環境に移行する。

## 状態

- [ ] 未着手

## 前提条件

- 009（Bootstrap クリーンアップ）が完了していること

## 作業内容

### main.tsx

変更:

```tsx
// Before
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// After
import { render } from "preact";
```

### vite.config.ts

エイリアス削除:

```ts
// 削除対象
"react": "preact/compat",
"react-dom": "preact/compat",
"react/jsx-runtime": "preact/jsx-runtime",
```

### 期待される効果

- バンドルサイズ削減
- Preact ネイティブ API のみ使用でシンプル化
- `@preact/signals` との親和性向上
