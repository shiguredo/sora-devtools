# ブラウザ幅を狭めたときにフッターの GitHub リンクが表示されなくなる問題を修正する

- Created: 2026-09-14
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-footer-responsive
- Polished: {YYYY-MM-DD}
- Reporter: @tnamao

## 目的

ブラウザ幅を 1024px 未満に狭めると、フッターの GitHub リンクが表示されなくなる。フッターの Navbar の折りたたみ境界をヘッダーと独立に扱い、どの幅でもフッターが正しく表示されるようにする。

## 現状

- `src/components/ui/Navbar.tsx` の `NavbarCollapse` は折りたたみ時に `hidden lg:block` で、表示条件が 1024px (lg) 固定
- `src/components/Footer/index.tsx` の Navbar は `expand="md"` を指定しているが、`Navbar` の `expand` prop は未使用（`void expand`）。このため 768〜1023px ではフッターの GitHub リンクが NavbarCollapse によって非表示になる
- フッターの Navbar には `NavbarToggle` が無いため、非表示になった GitHub リンクを開く手段もない
- `src/components/DebugPane/DebugPane.module.css` の `@media (max-width: 768px)` では `.container` の高さを `calc(100vh - 56px - 10px)` とし、フッターの高さを 10px と見積もっているが、フッターの実高さと一致しておらず、モバイル幅でコンテンツがフッターに隠れる可能性がある

## 設計方針

- フッターの折りたたみはヘッダーと独立に扱い、1024px 未満でも GitHub リンクが表示されるようにする（フッター用 `NavbarToggle` の追加、常時表示、`expand` prop の実装のいずれかで実装時に確定する）
- `Navbar` の `expand` prop が未実装のまま Footer で `expand="md"` を使っている事実を解消する（prop を実装するか、Footer から削除する）
- モバイル幅のフッター高さの見積もり（10px）をフッターの実高さに合わせる

## 完了条件

- ブラウザ幅を 768〜1023px にしてもフッターの GitHub リンクが表示される
- 768px 未満でもフッターの GitHub リンクが表示され、コンテンツがフッターに隠れない
- Chrome / Safari / Firefox の実ブラウザで確認する
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/Footer/index.tsx` の Navbar の折りたたみ境界と開閉手段を修正する
- `src/components/ui/Navbar.tsx` の `expand` prop を実装するか、Footer から削除する
- `src/components/DebugPane/DebugPane.module.css` のモバイル幅の高さ計算をフッターの実高さに合わせる
- フッターの表示条件のテストを追加する

## 関連

- 0093 ヘッダーのレスポンシブメニューと右下 Debug ボタンの修正: `NavbarCollapse` の表示条件を変更する予定のため、フッター側の対処を切り分けて衝突を避ける
