# 005: Collapse コンポーネント実装

## 概要

react-bootstrap の Collapse を CSS transition ベースの自前実装に置換する。

## 状態

- [ ] 未着手

## 対象ファイル

- `src/components/DevtoolsPane/index.tsx`

## 実装方針

```tsx
export function Collapse({ in: isOpen, children }) {
  return (
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
      {children}
    </div>
  );
}
```
