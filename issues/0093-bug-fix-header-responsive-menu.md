# ウィンドウ幅を狭めたときにヘッダーメニューと Debug ボタンの表示がおかしい問題を修正する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-header-responsive-menu
- Polished: {YYYY-MM-DD}
- Reporter: @tnamao

## 目的

ウィンドウ幅を狭めたときのヘッダーメニューと Debug ボタンの表示を修正する。

現状はハンバーガーメニューを開くとヘッダーの中にボタンが展開され、幅 768〜1023px では右下の Debug ボタンが表示されない。旧バージョンのようにヘッダーの下へプルダウン表示し、ハンバーガーが表示される幅では常に右下の Debug ボタンを表示できるようにする。

## 現状

- `src/components/ui/Navbar.tsx` の `NavbarCollapse` は、折りたたみ時は `hidden lg:block`、展開時は `block` になる。展開時はヘッダーの `Navbar` 内にそのまま展開されるため、ヘッダーの高さが伸びて中にシグナリング URL / Debug / Copy URL などのボタンが並ぶ。旧バージョンはヘッダーの下にプルダウンで表示されていた
- ヘッダーの `Navbar` は `fixed="top"` のため、展開した内容がヘッダーごとコンテンツに重なる
- `Navbar` の `expand` prop は現在未使用で、 `NavbarToggle` は `lg:hidden`、 `NavbarCollapse` も `lg` 境界 (1024px) で切り替わる
- `src/components/Footer/DebugButton.tsx` は `hidden max-md:block` で 768px 未満のみ表示する。このため、ハンバーガーが表示される 768〜1023px では右下の Debug ボタンが出ず、ハンバーガーメニュー内の Debug ボタンだけになる
- `src/components/Header/DebugButton.tsx` は `NavbarCollapse` の中にあり、折りたたみ中は表示されない

## 設計方針

- ハンバーガーメニューの展開時は、ヘッダーの下にプルダウンする形でメニューを表示する（旧バージョン相当）
- ドロップダウンは画面幅が狭いとき (1024px 未満) だけ表示し、 `lg` 以上では従来どおりヘッダー内に横並びで表示する
- 右下の Debug ボタンの表示条件をハンバーガーと同じ `lg` 境界に合わせ、ハンバーガーが表示される幅では常に右下に Debug ボタンを表示する
- ハンバーガーメニュー内の Debug ボタンと右下の Debug ボタンが重複するため、メニュー内に残すか削除するかを実装時に決める
- ドロップダウンとヘッダーの重なり・z-index・背景色は実装時に確認する
- 768px 未満の右下 Debug ボタンの既存動作と、1024px 以上のデスクトップ表示は変更しない

## 完了条件

- ハンバーガーメニューを開くと、ヘッダーの下にプルダウンでメニューが表示される
- 幅 768〜1023px でも右下に Debug ボタンが表示される
- ハンバーガーが表示される幅 (1024px 未満) では常に右下に Debug ボタンが表示される
- 1024px 以上ではヘッダーの横並び表示が従来どおりになる
- ヘッダーの折りたたみ・展開の動作を Chrome / Safari / Firefox の実ブラウザで確認する
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/ui/Navbar.tsx` の `NavbarCollapse` を、折りたたみ時にヘッダーの下へドロップダウン表示する実装に変更する
- `src/components/Footer/DebugButton.tsx` の表示条件を `max-md:block` から `lg` 境界に合わせた条件へ変更する
- ドロップダウンの開閉と Debug ボタンの表示条件のテストを追加する

## 関連

- 起票元の確認は react-bootstrap を削除したバージョンで行われている。 `src/components/ui/Navbar.tsx` は react-bootstrap の Navbar 互換として実装されている
- CHANGES.md の React / react-bootstrap 削除と Preact 移行の変更
