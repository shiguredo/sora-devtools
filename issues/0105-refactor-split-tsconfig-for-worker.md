# tsconfig を app と worker で分割し worker に lib.webworker を適用する

- Created: 2026-11-25
- Completed: {YYYY-MM-DD}
- Branch: feature/refactor-split-tsconfig-for-worker
- Polished: 2026-11-25

## 目的

Web Worker のコードを Worker 用の型定義で型チェックできるようにする。

現在は単一の `tsconfig.json` で `lib` に `dom` を指定しているため、`src/workers/fakeVideo.worker.ts` の `self` が `Window & typeof globalThis` 型として解釈される。型の上では window の `postMessage` として扱われ、実際の worker の意味 (host への送信) と食い違ったまま型チェックが通ってしまう。

この食い違いにより、worker の `self` を `globalThis` に置き換えても dom lib では `postMessage` / `addEventListener` が window の意味のままになるため、`unicorn/prefer-global-this` を無効化して `self` のままにしている。lint の規約も緩めた状態になっている。

## 現状

`tsconfig.json` は単一ファイルで、次のように設定している。

- `compilerOptions.lib` は `["dom", "dom.iterable", "esnext"]`
- `include` は `["global.d.ts", "**/*.ts", "**/*.tsx", "vitest.config.ts"]`

そのため window で動くアプリ本体 (`src/app/signals.ts` など) と worker (`src/workers/fakeVideo.worker.ts`) が同じ `lib` で型チェックされる。

型定義側の制約は次のとおり。

- `lib.dom.d.ts` の `self` は `declare var self: Window & typeof globalThis` と宣言されている
- `lib.dom.d.ts` に `WorkerGlobalScope` インターフェースが存在しない
- `DedicatedWorkerGlobalScope` は `lib.webworker.d.ts` にあり、`lib.dom` と同時に指定すると `self` や `EventTarget` などのグローバル宣言が重複する。`skipLibCheck: true` のため lib 側の重複エラーは抑止されるが、`self` は `lib.dom` の `Window & typeof globalThis` として解決されるため、worker の型にはならない
- `lib.webworker.d.ts` には `document` と `window` の宣言が含まれないため、全体に適用するとアプリ本体が型エラーになる
- `lib.webworker.d.ts` には `AudioContext` / `Element` などの DOM 型が含まれないため、`global.d.ts` を worker プロジェクトに含めると `skipLibCheck` を無効にしたときに `AudioContext` や `Element` が未定義になる

`vite.config.ts` の `lint.rules` では、この制約を理由に `unicorn/prefer-global-this` を `off` にしている。コメントには「tsconfig の lib が dom のみで WorkerGlobalScope 型を提供しないため、Web Worker では globalThis 経由だと postMessage / addEventListener の意味が Window のままになる」とある。

## 設計方針

`tsconfig.json` を solution 構成 (`files` を空にし、`references` で各プロジェクトを参照する構成) にし、アプリ本体と worker の 2 つのプロジェクトに分割する。

- `tsconfig.json` は共通の `compilerOptions` を持ち、`files` を空にして `references` で `tsconfig.app.json` と `tsconfig.worker.json` を参照する。共通設定 (`lib` 以外の `compilerOptions`) はこのファイルに残す。
- `tsconfig.app.json` は `tsconfig.json` を `extends` し、`compilerOptions.lib` を `["dom", "esnext"]` に設定する。`include` は `["global.d.ts", "**/*.ts", "**/*.tsx"]`、`exclude` は `["node_modules", "src/workers/**"]` にする。`src/app/signals.ts` は `fakeVideo.worker.ts?worker` という Vite の仮想モジュール経由で import しているため、worker ファイルは app プログラムに含まれない。
- `tsconfig.worker.json` は `tsconfig.json` を `extends` し、`compilerOptions.lib` を `["webworker", "esnext"]` に設定する。`include` は `["src/workers/**/*.ts"]`、`exclude` は `["node_modules"]` にする。`extends` 元の `include` / `exclude` を継承しないよう、両方を明示する。
- `tsconfig.worker.json` には `global.d.ts` を含めない。`global.d.ts` は `AudioContext` / `Element` など DOM 型を参照しており、`skipLibCheck` を無効にすると worker の lib では解決できないため。
- `tsconfig.app.json` と `tsconfig.worker.json` の `lib` には `dom.iterable` / `webworker.iterable` を指定しない。TypeScript 7 の `lib.dom.iterable.d.ts` と `lib.webworker.iterable.d.ts` は中身が空で、反復可能の宣言はそれぞれ `lib.dom.d.ts` / `lib.webworker.d.ts` に取り込まれているため、これらの指定は効果を持たない。

分割後は `unicorn/prefer-global-this` を `error` に戻す。worker の `self` は `globalThis` に置き換える。`lib.webworker` により `globalThis.postMessage` / `globalThis.addEventListener` は worker のグローバル型として解決される。`globalThis.setTimeout` は worker の lib では `number` を返すため、既存の `as unknown as number` は不要になり削除する。`vite.config.ts` の `lint.rules` のコメントも、分割後の前提に合わせて更新する。

`vp check` の type-aware lint は `tsconfig.json` の `references` をたどってファイルごとに tsconfig を解決する。`tsconfig.json` を solution 構成にしないと worker ファイルが app 側の `tsconfig` にマップされ、dom lib のまま型チェックされるため、`references` の設定は必須である。分割後は `src/workers/fakeVideo.worker.ts` が `tsconfig.worker.json` のプログラムとして型チェックされることを確認する。

CI と `prek` は現在 `tsc` を実行していない (CI は `vp check` のみ、`prek` は `vp check` と `vp test run`)。`tsc` は引数なしでは `tsconfig.json` しか読まず、solution 構成では `files` が空のため何も型チェックしない。CI と `prek` に `vp exec tsc --noEmit -p tsconfig.app.json` と `vp exec tsc --noEmit -p tsconfig.worker.json` を追加し、両方の設定をプログラム全体で型チェックする。

## 完了条件

- worker のコードが `lib.webworker` 相当の型定義で型チェックされる
- `src/workers/fakeVideo.worker.ts` のグローバル (`self` / `globalThis`) が `Window & typeof globalThis` ではなく worker のグローバル型として解決される
- `vite.config.ts` の `unicorn/prefer-global-this` が `error` に戻っている
- `vp check`、`vp build`、`vp test run`、`vp test run --config vitest.ct.config.ts` がすべて通る
- `vp check` が `src/workers/fakeVideo.worker.ts` を `tsconfig.worker.json` のプログラムとして型チェックしている
- CI と `prek` の検証が `tsconfig.app.json` と `tsconfig.worker.json` の両方を対象にしている
- `tsconfig.app.json` の `lib` に `dom.iterable` が含まれず、`tsconfig.worker.json` の `lib` に `webworker.iterable` が含まれていない

## 解決方法

未着手。
