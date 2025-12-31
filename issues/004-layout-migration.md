# 004: レイアウト移行（Row, Col → Flexbox）

## 概要

react-bootstrap の Row, Col を Tailwind の Flexbox/Grid ユーティリティに置換する。

## 状態

- [ ] 未着手

## 対象ファイル

- `src/components/DevtoolsPane/index.tsx`

## 移行パターン

**Before:**

```tsx
<Row className="form-row" xs="auto">
  <Col xs="12" sm="12">...</Col>
</Row>
```

**After:**

```tsx
<div className="flex flex-wrap gap-2">
  <div className="w-full sm:w-full">...</div>
</div>
```
