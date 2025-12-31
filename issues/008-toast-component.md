# 008: Toast コンポーネント実装

## 概要

react-bootstrap の Toast を自前実装に置換する。

## 状態

- [ ] 未着手

## 対象ファイル

- `src/components/AlertMessages.tsx`

## 実装方針

自動非表示 + フェードアニメーション付きの通知コンポーネント。

```tsx
export function Toast({ show, autohide, delay, onClose, children }) {
  // useEffect で delay 後に onClose を呼び出す
  // CSS transition でフェードアニメーション
}
```
