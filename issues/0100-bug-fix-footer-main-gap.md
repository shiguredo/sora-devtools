# main と footer の間に隙間ができる問題を修正する

- Created: 2026-09-14
- Completed: 2026-09-14
- Branch: feature/fix-footer-main-gap
- Polished: 2026-09-14
- Reporter: @tnamao

## 目的

理由: Preact + Tailwind 移行後のフッターの実高さが react-bootstrap 当時の 56px ではなくなったのに、画面高さの計算が 56px 前提のままのため、main と footer の間に隙間ができる。

## 現状

- `src/App.css` の `body` に `padding-bottom: 56px` が設定されている。これは react-bootstrap の固定 Navbar の高さが 56px だった当時の前提
- `src/components/DebugPane/DebugPane.module.css` と `src/components/DevtoolsPane/DevtoolsPane.module.css` の `.container` も `height: calc(100vh - 56px - 56px)` で 56px 前提
- Preact 版のフッター（`src/components/Footer/index.tsx`）は `py-0.5` の Navbar と `text-xs` の `GitHubLink` で構成され、実高さは 56px より小さい（25〜37px 程度）。`GitHubLink` は `text-xs`（12px）・`leading-tight`（行高 15px）・`py-0.5`（上下 2px）・`border`（上下 1px）で約 21px となり、そこに Navbar のパディング（`py-0.5` なら 4px、`py-2` なら 16px）を加えると 25〜37px になる。このため main の下端と bottom 固定のフッターとの間に隙間ができる
- `src/components/ui/Navbar.tsx` の Navbar は基底クラスに `py-2` を持ち、Footer の Navbar は `className` で `py-0.5` を渡している。同じプロパティの指定が競合しており、どちらの値が有効になるかが Tailwind のユーティリティ生成順に依存するため、フッターの高さが定まらない
- `src/components/Footer/index.tsx` の `<footer>` 要素は children が `fixed`（Navbar）と、デスクトップでは `hidden`（DebugButton）のみのため、要素自体の高さが 0 になり、ボックスの計算に寄与しない

## 設計方針

- フッターを通常フロー配置に変更し、アプリのルート要素を縦フレックス（`min-height: 100vh`）で構成して、コンテンツ領域を `flex: 1`、フッターをその末尾に置く。フッターの高さを余白計算に持ち込まず、隙間とフッター分のマジックナンバー（56px）を同時に排除する
- `body` の `padding-bottom` と各 pane の `.container` の高さ計算からフッター分の 56px を撤廃する
- ヘッダーは `fixed="top"` のまま維持し、ヘッダー分の 56px（`body` の `padding-top` と高さ計算の前置引数）は現状維持とする。ヘッダーは Navbar の `py-2`（上下 8px）と NavbarBrand の `py-[5px]`・`leading-[30px]` の合計が 56px と一致しているため、現状維持で整合する
- `Navbar` の基底クラスのパディングと `className` で渡すパディングの競合を一元化し、フッターの高さを一意に定める

## 完了条件

- main と footer の間に隙間ができない
- footer 要素が通常フローで配置され、レイアウトに寄与し、高さ 0 にならない
- デスクトップ表示でフッターが画面下端に正しく収まる
- フッターのレイアウトのテストを追加し、それが成功する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/App.css` の `body` を `height: 100vh` の縦フレックスにし、`padding-bottom: 56px` を撤廃する（ヘッダー分の `padding-top: 56px` は維持）。`#root` を `flex: 1` + `min-height: 0` の縦フレックスにして、フッターを通常フローで配置しても画面下端に収まるようにする
  - `body` の高さを固定するのはコンテンツ領域を内部スクロールにし、ページ全体のスクロールを発生させないため（`min-height` のみだとコンテンツの高さでページ自体が伸びる）
- `src/components/Footer/index.tsx` の Navbar から `fixed="bottom"` を外し、フッターを通常フローで #root の縦フレックスの末尾に配置する
- `src/DevTools.tsx` の main / `.container` / `.row` を `flex-1 min-h-0`（`.row` は `flex-nowrap`）にして、ペインをコンテンツ領域いっぱいにフィルする
- `src/components/DebugPane/DebugPane.module.css` と `src/components/DevtoolsPane/DevtoolsPane.module.css` の `.container` の高さ計算（`calc(100vh - 56px - 56px)` とモバイル幅の 10px 見積もり）を撤廃し、`height: 100%` + `min-height: 0` にする
- `src/components/ui/Navbar.tsx` の基底クラスのパディング（`py-2 px-0`）を撤廃し、呼び出し側の `className` で明示する（Header は `py-2`、Footer は `py-2 px-3`）。フッターの高さを一意に定める
- `src/routes/Sessions.tsx` の main を `flex-1 min-h-0 overflow-y-auto` にして内部スクロール化する（#root を `min-height: 0` で固定するため、省略するとコンテンツがフッターの裏に入り込む）
- `src/components/ui/Tabs.tsx` のタブヘッダーに `overflow-x-auto` を追加し、デバッグペインのタブ列が横幅を超えたときにページ全体の横スクロールバーを発生させないようにする
- `tests/footer-layout.test.ts` にフッターレイアウトの e2e テストを追加する（通常表示 / デバッグペイン表示 / セッションズページで、footer が固定配置でないこと・高さを持つこと・画面下端に収まること・ページの縦横スクロールが発生しないこと・main と footer の間に隙間がないことを検証）

## 関連

- `src/App.css` の 56px は react-bootstrap の Navbar 高さを前提とした値。Preact + Tailwind 移行（#634 / #636）で Navbar が独自実装になった
- 0101（`issues/0101-bug-fix-footer-responsive.md`、フッターの GitHub リンクのレスポンシブ表示）も `src/components/Footer/index.tsx`・`src/components/ui/Navbar.tsx`・`src/components/DebugPane/DebugPane.module.css` を変更するため、実装を進める前に 0101 と変更範囲を調整すること
