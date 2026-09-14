# ブラウザ幅を狭めたときにフッターの GitHub リンクが表示されなくなる問題を修正する

- Created: 2026-09-14
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-footer-responsive
- Polished: 2026-09-14
- Reporter: @tnamao

## 目的

ブラウザ幅を 1024px 未満に狭めると、フッターの GitHub リンクが表示されなくなる。フッターの Navbar の折りたたみ境界をヘッダーと独立に扱い、どの幅でもフッターが正しく表示されるようにする。

## 現状

- `src/components/ui/Navbar.tsx` の `NavbarCollapse` は折りたたみ時に `hidden lg:block` で、表示条件が 1024px (lg) 固定
- `src/components/Footer/index.tsx` の Navbar は `expand="md"` を指定しているが、`Navbar` の `expand` prop は未使用（`void expand`）。このため 768〜1023px ではフッターの GitHub リンクが NavbarCollapse によって非表示になる
- フッターの Navbar には `NavbarToggle` が無いため、非表示になった GitHub リンクを開く手段もない
- `src/components/DebugPane/DebugPane.module.css` の `@media (max-width: 768px)` では `.container` の高さを `calc(100vh - 56px - 10px)` とし、フッターの高さを 10px と見積もっているが、フッターの実高さと一致しておらず、モバイル幅でコンテンツがフッターに隠れる可能性がある

## 設計方針

- フッターの GitHub リンクは常時表示にし、`NavbarCollapse` の折りたたみ境界（`hidden lg:block`）に依存しない。フッター用 `NavbarToggle` は追加しない（開閉操作なしで常時表示するため不要）
- `Navbar` の `expand` prop の実装は 0101 では行わず、Footer から `expand="md"` を削除することで事実を解消する（`Navbar` 側のレスポンシブ対応は 0093 のスコープ）
- モバイル幅のフッター高さの見積もり（10px）の撤廃は 0100 のフッター通常フロー化に委ね、0101 では扱わない

## 完了条件

- ブラウザ幅を 768〜1023px にしてもフッターの GitHub リンクが表示される
- 768px 未満でもフッターの GitHub リンクが表示される
- Chrome / Safari / Firefox の実ブラウザで確認する
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/Footer/index.tsx` の Navbar から `expand="md"` を削除し、`NavbarCollapse` を外して GitHub リンクを常時表示する
- フッターの GitHub リンクが 768px 未満と 768〜1023px で表示されるテストを追加する

## 関連

- 0093 ヘッダーのレスポンシブメニューと右下 Debug ボタンの修正: `NavbarCollapse` の表示条件を変更する予定のため、フッター側は `NavbarCollapse` に依存しない常時表示として対処し、衝突を避ける
- 0100 main と footer の間に隙間ができる問題を修正する: 0100 のフッター通常フロー化で `DebugPane.module.css` のモバイル幅の高さ計算からフッター分（10px 見積もり）を撤廃する方針のため、「コンテンツがフッターに隠れない」状態は 0100 が担保する。変更対象ファイル（`src/components/Footer/index.tsx`・`src/components/ui/Navbar.tsx`・`src/components/DebugPane/DebugPane.module.css`）が重なるため、**0100 を先に実装し、0101 は 0100 実装後の状態を前提とする**
