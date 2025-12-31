# 009: Bootstrap クリーンアップ

## 概要

Bootstrap/react-bootstrap の完全削除。

## 状態

- [ ] 未着手

## 作業内容

### App.css

1. Bootstrap CSS 変数を置換:
   - `var(--bs-primary)` → `#0071bc`
   - `var(--bs-dark)` → `#1f2937`（gray-800）

2. `.form-inline` 等の Bootstrap 依存クラスを削除

3. Tailwind @theme でカスタムカラー定義:

```css
@theme {
  --color-sora: #0071bc;
}
```

### package.json

削除:

- `bootstrap`
- `react-bootstrap`

### vite.config.ts

`manualChunks` から `react-bootstrap` を削除

### main.tsx

削除:

```tsx
import "bootstrap/dist/css/bootstrap.min.css";
```
