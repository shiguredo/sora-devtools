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

- `tsconfig.json` は共通の `compilerOptions` を持ち、`files` を空にして `references` で `tsconfig.app.json` と `tsconfig.worker.json` を参照する。共通設定はこのファイルに残し、各プロジェクトで必要な `compilerOptions` (`lib` / `types`) と `include` / `exclude` を各ファイルで指定し直す。
- `tsconfig.app.json` は `tsconfig.json` を `extends` し、`compilerOptions.lib` を `["dom", "esnext"]` に設定する。`include` は `["global.d.ts", "**/*.ts", "**/*.tsx"]`、`exclude` は `["node_modules", "src/workers/**"]` にする。`src/app/signals.ts` は `fakeVideo.worker.ts?worker` という Vite の仮想モジュール経由で import しているため、worker ファイルは app プログラムに含まれない。
- `tsconfig.worker.json` は `tsconfig.json` を `extends` し、`compilerOptions.lib` を `["webworker", "esnext"]` に設定する。`include` は `["src/workers/**/*.ts"]`、`exclude` は `["node_modules"]` にする。`extends` 元の `include` は継承されないため明示する。`exclude` は継承されるが、除外対象を読み取れるよう明示する。
- `tsconfig.worker.json` は `compilerOptions.types` を `[]` にする。共通設定の `types: ["vite-plus/test/globals"]` を継承すると worker にもテスト用のグローバル型が入るため。`types: []` で暗黙的な `@types/*` の取り込みを防ぐ方針にも合う。
- `tsconfig.worker.json` には `global.d.ts` を含めない。`global.d.ts` の `Window` 拡張と `AudioContext` / `Element` は `webworker` の型定義に存在せず、worker の型チェックで解決できないため。
- `tsconfig.worker.json` は `compilerOptions.paths` を上書きしない。共通設定の `@/*` は `src/` 全体に解決されるため、worker から `@/` で app 側のファイルを引くと、dom に依存した型エラーが worker の型チェックで発生する。worker からは `@/` を使わず、型を共有するときは実装を含まない共通ファイルを相対 import で参照する。誤用を防ぐ説明は `tsconfig.worker.json` のコメントに残す。
- `tsconfig.app.json` と `tsconfig.worker.json` の `lib` には `dom.iterable` / `webworker.iterable` を指定しない。TypeScript 7 の `lib.dom.iterable.d.ts` と `lib.webworker.iterable.d.ts` は中身が空で、反復可能の宣言はそれぞれ `lib.dom.d.ts` / `lib.webworker.d.ts` に取り込まれているため、これらの指定は効果を持たない。

分割後は `unicorn/prefer-global-this` を `error` に戻す。worker の `self` は `globalThis` に置き換える。`lib.webworker` により `globalThis.postMessage` / `globalThis.addEventListener` は worker のグローバル型として解決される。既存の `as unknown as number` は不要になり削除する。`vite.config.ts` の `lint.rules` のコメントも、分割後の前提に合わせて更新する。

`vp check` の type-aware lint は `tsconfig.json` の `references` をたどってファイルごとに tsconfig を解決する。`tsconfig.json` を solution 構成にしないと worker ファイルが app 側の `tsconfig` にマップされ、dom lib のまま型チェックされるため、`references` の設定は必須である。分割後は `src/workers/fakeVideo.worker.ts` が `tsconfig.worker.json` のプログラムとして型チェックされることを確認する。

ただし `vp check` にパスを指定すると、指定したファイルしか型チェックしない。また `exclude` は import による取り込みを防がないため、app 側から worker 本体を直接 import すると worker が app プログラムに巻き込まれ、dom lib のまま型チェックされる。app 側からは `?worker` の仮想モジュール経由でのみ worker を参照し、worker と型を共有する場合は実装を含まない共通ファイルへ切り出して双方から import する。この境界は `src/app/signals.ts` の import 付近のコメントにも残す。

CI と `prek` に型チェックのコマンドは追加しない。引数なしの `vp check` が設定に属するファイルをすべて型チェックし、分割後は worker も `tsconfig.worker.json` のプログラムとして解決されることを確認済みで、`tsc -b` を足すと `vp check` と検出範囲が重複して CI だけが長くなるため。`tsc` は引数なしでは `tsconfig.json` しか読まず solution 構成では何も型チェックしないが、`vp check` がその役割を果たしている限り追加は不要と判断する。`prek` は `pass_filenames = false` で引数なしのため現状は問題ないが、この値を変更してパスを渡すようにした場合は型チェックの範囲が狭まるため、その時点で `vp exec tsc -b` などの追加が必要かを判断する。

## 完了条件

- worker のコードが `lib.webworker` 相当の型定義で型チェックされる
- `src/workers/fakeVideo.worker.ts` のグローバル (`self` / `globalThis`) が `Window & typeof globalThis` ではなく worker のグローバル型として解決される
- `vite.config.ts` の `unicorn/prefer-global-this` が `error` に戻っている
- `vp check`、`vp build`、`vp test run`、`vp test run --config vitest.ct.config.ts` がすべて通る
- `vp check` が `src/workers/fakeVideo.worker.ts` を `tsconfig.worker.json` のプログラムとして型チェックしている
- `tsconfig.worker.json` の `types` が `[]` で、worker のコードから `test` / `expect` などのテスト用グローバルが参照できない
- `vp check` が `tsconfig.app.json` と `tsconfig.worker.json` の両方を対象に型チェックしている
- `tsconfig.app.json` の `lib` に `dom.iterable` が含まれず、`tsconfig.worker.json` の `lib` に `webworker.iterable` が含まれていない

## 解決方法

未着手。
