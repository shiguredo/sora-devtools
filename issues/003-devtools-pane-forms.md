# 003: DevtoolsPane フォーム移行

## 概要

DevtoolsPane 配下の 61 個のフォームコンポーネントを react-bootstrap から自前 UI コンポーネントに移行する。

## 状態

- [ ] 未着手

## 対象ディレクトリ

`src/components/DevtoolsPane/`

## 移行パターン

**Before:**

```tsx
import { FormGroup, FormSelect } from "react-bootstrap";

<FormGroup className="form-inline" controlId="role">
  <FormSelect ...>
```

**After:**

```tsx
import { FormGroup, FormSelect } from "@/components/ui";

<FormGroup className="flex items-center gap-2" controlId="role">
  <FormSelect ...>
```

## 移行順序

1. Select 系（20+ ファイル）
2. Input 系（10+ ファイル）
3. Switch 系（15+ ファイル）
4. 複合系（5 ファイル）
