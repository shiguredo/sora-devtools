# 002: TooltipFormLabel 置換

## 概要

OverlayTrigger + Popover を使用している TooltipFormLabel を CSS ベースのツールチップに置換する。

## 状態

- [ ] 未着手

## 対象ファイル

- `src/components/DevtoolsPane/TooltipFormLabel.tsx`
- `src/components/DevtoolsPane/TooltipFormCheck.tsx`

## 実装方針

CSS の `group` + `group-hover:visible` を使用したホバーツールチップ。

```tsx
<label className="group relative cursor-help">
  {children}
  <div className="invisible group-hover:visible absolute ...">
    {tooltip}
  </div>
</label>
```
