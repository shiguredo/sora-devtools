# main と footer の間に隙間ができる問題を修正する

- Created: 2026-09-14
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-footer-main-gap
- Polished: {YYYY-MM-DD}
- Reporter: @tnamao

## 目的

理由: Preact + Tailwind 移行後のフッターの実高さが react-bootstrap 当時の 56px ではなくなったのに、画面高さの計算が 56px 前提のままのため、main と footer の間に隙間ができる。

## 現状

- `src/App.css` の `body` に `padding-bottom: 56px` が設定されている。これは react-bootstrap の固定 Navbar の高さが 56px だった当時の前提
- `src/components/DebugPane/DebugPane.module.css` と `src/components/DevtoolsPane/DevtoolsPane.module.css` の `.container` も `height: calc(100vh - 56px - 56px)` で 56px 前提
- Preact 版のフッター（`src/components/Footer/index.tsx`）は `py-0.5` の Navbar と `text-xs` の `GitHubLink` で構成され、実高さは 56px より小さい（25〜37px 程度）。このため main の下端と bottom 固定のフッターとの間に隙間ができる
- `src/components/ui/Navbar.tsx` の Navbar は基底クラスに `py-2` を持ち、Footer の Navbar は `className` で `py-0.5` を渡している。同じプロパティの指定が競合しており、フッターの高さが定まらない
- `src/components/Footer/index.tsx` の `<footer>` 要素は children が `fixed`（Navbar）+ `hidden`（DebugButton のデスクトップ表示時）のみのため、要素自体の高さが 0 になり、ボックスの計算に寄与しない

## 設計方針

- フッターの実高さを唯一の根拠とし、`body` の `padding-bottom` と各 pane の `.container` の高さ計算を整合させる
- 画面高さ依存のマジックナンバー（`56px`）を廃止する方向とし、main をフレックスレイアウトにしてフッターを通常フロー配置にすることも選択肢とする
- `Navbar` の基底クラス `py-2` と Footer の `py-0.5` のパディング競合を一元化する

## 完了条件

- main と footer の間に隙間ができない
- footer 要素がレイアウトに寄与し、高さ 0 にならない
- デスクトップ表示でフッターが画面下端に正しく収まる
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/App.css` と各 pane の `.container` の高さ計算・パディングをフッターの実高さに合わせる
- `src/components/ui/Navbar.tsx` のパディング競合を解消する
- フッターのレイアウトのテストを追加する

## 関連

- `src/App.css` の 56px は react-bootstrap の Navbar 高さを前提とした値。Preact + Tailwind 移行（#634 / #636）で Navbar が独自実装になった
