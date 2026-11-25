# tsconfig を app と worker で分割し worker に lib.webworker を適用する

- Created: 2026-11-25
- Completed: {YYYY-MM-DD}
- Branch: feature/refactor-split-tsconfig-for-worker
- Polished: {YYYY-MM-DD}

## 目的

Web Worker のコードを Worker 用の型定義で型チェックできるようにする。

現在は単一の `tsconfig.json` で `lib` に `dom` を指定しているため、`src/workers/fakeVideo.worker.ts` の `self` が `Window & typeof globalThis` 型として解釈される。型の上では「window 宛の送信」になり、実際の worker の意味 (host への送信) と食い違ったまま型チェックが通ってしまう。

この食い違いの回避として `unicorn/prefer-global-this` を無効化しているため、lint の規約も緩めた状態になっている。

## 現状

`tsconfig.json` は単一ファイルで、次のように設定している。

- `compilerOptions.lib` は `["dom", "dom.iterable", "esnext"]`
- `compilerOptions.include` は `["global.d.ts", "**/*.ts", "**/*.tsx", "vitest.config.ts"]`

そのため window で動くアプリ本体 (`src/app/signals.ts` など) と worker (`src/workers/fakeVideo.worker.ts`) が同じ `lib` で型チェックされる。

型定義側の制約は次のとおり。

- `lib.dom.d.ts` の `self` は `declare var self: Window & typeof globalThis` と宣言されている
- `lib.dom.d.ts` に `WorkerGlobalScope` インターフェースが存在しない
- `DedicatedWorkerGlobalScope` は `lib.webworker.d.ts` にあり、`lib.dom` とは `self` や `EventTarget` などのグローバル宣言が衝突するため併用できない
- `lib.webworker.d.ts` には `document` と `window` の宣言が含まれないため、全体に適用するとアプリ本体が型エラーになる

`vite.config.ts` の `lint.options` では、この制約を理由に `unicorn/prefer-global-this` を `off` にしている。

## 設計方針

worker に対応するファイル群だけ別の `tsconfig` を当てる。

- 共通設定を `tsconfig.json` に残す
- window で動くアプリ本体向けの設定と、worker 向けの設定をそれぞれ用意する
- worker 向けの設定では `lib` に `webworker` を指定する

分割後は `unicorn/prefer-global-this` を `error` に戻し、worker では `globalThis` もしくは worker 用の型で解決する。

`vite.config.ts` の `lint.options` と `vp check` が分割後の設定を読めるかを確認する必要がある。`tsc` は引数なしでは `tsconfig.json` しか読まないため、CI と `prek` の検証コマンドも分割に追従させる。

あわせて、`tsconfig.json` の `lib` にある `dom.iterable` の扱いも見直す。TypeScript 7 の `lib.dom.iterable.d.ts` は中身が空で、反復可能の宣言は `lib.dom.d.ts` に取り込まれているため、この指定は現在効果を持たない。

## 完了条件

- worker のコードが `lib.webworker` 相当の型定義で型チェックされる
- `src/workers/fakeVideo.worker.ts` の `self` が worker の型として解釈される
- `vite.config.ts` の `unicorn/prefer-global-this` が `error` に戻っている
- `vp check`、`vp build`、`vp test run`、`vp test run --config vitest.ct.config.ts` がすべて通る
- CI と `prek` の検証が分割後の設定をすべて対象にしている

## 解決方法

未着手。
