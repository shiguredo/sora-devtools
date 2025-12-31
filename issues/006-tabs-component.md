# 006: Tabs コンポーネント実装

## 概要

react-bootstrap の Tab, Tabs を自前実装に置換する。

## 状態

- [ ] 未着手

## 対象ファイル

- `src/components/DebugPane/index.tsx`

## 実装方針

```tsx
export function Tabs({ activeKey, onSelect, children }) {
  // タブヘッダー + コンテンツの表示切り替え
}

export function Tab({ eventKey, title, children }) {
  // 個別タブのラッパー
}
```
