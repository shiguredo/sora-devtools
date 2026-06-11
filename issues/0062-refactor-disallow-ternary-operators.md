# 三項演算子を全面禁止する

- Priority: Medium
- Created: 2026-06-11
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/refactor-disallow-ternary
- Polished: 2026-06-11
- Reporter: @voluntas

## 目的

三項演算子 (`condition ? a : b`) を sora-devtools のコードベースから全廃し、`if` 文・論理演算子 (`&&` / `||` / `??`)・早期 return など明示的な構文に統一する。JSX や式の中で条件分岐の現れ方を一本化し、ネストや混在に起因する誤読を構造的に減らす。

合わせて oxlint の `eslint/no-ternary` ルールを `error` に有効化し、今後の混入を CI で防ぐ。

## 優先度根拠

Medium。

- 機能・運用への影響は無く、ユーザー視点では無風のため High ではない
- 一方で、本 issue 作成時点の develop HEAD (`db589fc0`、2026-06-11 計測) で違反が 158 件 / 57 ファイルあり、`src/components/ui/` 配下の共通コンポーネントから `src/app/actions.ts` まで広く分散している。新規コードでの混入も継続するため、放置すれば差分は単調増加する
- ルール有効化と既存違反の解消は不可分なため先送り不可。まとめて 1 ブランチで完結させる必要があるため Low ではなく Medium とする

## 現状

- `vite.config.ts:859` で `"no-ternary": "off"` (コメント: 「三項演算子は可読性が高い場合に有用」)
- `vite.config.ts:588-589` で `"unicorn/prefer-ternary": "off"` (コメント: 「三項演算子より if/else を推奨（多行の場合は三項演算子より可読性が高い）」)。今回の方針変更で多行三項を肯定するコメントは矛盾する
- `vite.config.ts:489` で `"unicorn/no-nested-ternary": "error"`、`vite.config.ts:559` で `"unicorn/prefer-logical-operator-over-ternary": "error"`。ただし後者は `cond ? cond : value` 形のみを検出するルールで、本 issue 作成時点で違反 0 件のため `--fix` での自動解消は期待しない
- 違反件数のスナップショット (本 issue 作成時点の develop HEAD, `pnpm exec vp lint -D no-ternary src`): 158 件 / 57 ファイル
- 既存の `// oxlint-disable-next-line` ディレクティブが 18 件存在 (`src/utils.ts` 6 件、`src/opfs.ts` 3 件、`src/app/actions.ts` 2 件、その他)。`vite.config.ts:49` で `reportUnusedDisableDirectives: "error"` が有効化されているため、置き換えによって未使用化したディレクティブは CI で検出される

## 設計方針

### lint 設定の変更 (`vite.config.ts`)

- 859 行目: `"no-ternary": "off"` を `"no-ternary": "error"` に変更する。コメントも禁止方針と整合する内容に書き換える
- 588 行目: `unicorn/prefer-ternary` 自体は `off` のまま維持する (`no-ternary` が先に違反を捕捉するため `prefer-ternary` は到達せず、有効化しても fire しない)。ただしコメント「（多行の場合は三項演算子より可読性が高い）」は禁止方針と矛盾するため削除する
- 897 行目: `eslint/no-nested-ternary` は `no-ternary` に内包されるため `off` のまま残す。コメントを「`no-ternary` で全面禁止するため off のまま (内包)」相当に書き換える

### 個別 disable の方針

`// oxlint-disable-next-line no-ternary` 等での個別許可は一切認めない。実装中に「三項演算子のほうが明らかに可読性が高い」と判断するケースが出ても、ローカル変数化・早期 return・ヘルパー関数化で必ず置き換える。

置き換えに伴って既存の `oxlint-disable-next-line` が `reportUnusedDisableDirectives` で未使用扱いになった場合は、同コミットで該当ディレクティブを削除する。事前の機械的判定はせず、`pnpm check` で検出されたものを削除する。

### コード置き換えパターン

| 入力パターン                                                                                                                        | 置き換え方針                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSX 子要素 `cond ? <X /> : null`                                                                                                    | `cond && <X />`。`cond` が確実に `boolean` / `string` / `null` / `undefined` のみを取るならラップ不要。`number` を取りうる式 (`array.length` 等) のみ `Boolean(cond) && <X />` でラップする (Preact は `0` / `NaN` をそのまま描画してしまうため)                                            |
| JSX 子要素 `cond ? <X /> : <Y />`                                                                                                   | 型注釈なしの `let element; if (cond) { element = <X />; } else { element = <Y />; }` 形でローカル変数に組み立てて埋め込む (TypeScript が union 型として推論する)。既存 `useMemo` 内の三項 (`JsonTree.tsx`) も `useMemo` 本体は残しつつ内部だけ同方針で置換する。新規 `useMemo` は導入しない |
| JSX 子要素 `{value === "" ? "literal" : value}` (空文字フォールバック逆形)                                                          | `value \|\| "literal"`。`value` の型が `string` で空文字以外の falsy (0, NaN) を取らない場合に限る。フォーム系の `value === "" ? "未指定" : value` (`AudioBitRateForm.tsx` 等) はこのパターン                                                                                               |
| JSX の属性値 `style={cond ? a : b}` / `className={cond ? a : b}` / `id={cond ? "x" : undefined}` / 文字列補間 \``${cond ? a : b}`\` | JSX の前で `let style = b; if (cond) style = a;` 形のローカル変数を組み立て、属性には変数を渡す。同じ JSX ブロック内で複数の属性値三項が同一の `cond` を共有する場合 (`ConnectionStatusBar.tsx:49, 56`) は、関数の冒頭で 1 度だけ変数を組み立てて両方で参照する                             |
| オブジェクトリテラル `{ key: cond ? value : undefined }`                                                                            | 後述の `enabledOrUndefined` ヘルパーで吸収できる完全同型パターンのみ自動置換。それ以外 (配列 `length > 0` 判定、`mediaType === "X"` 等のモード判定、否定 enabled、boolean 値) はローカル変数として `const params: Partial<T> = {}; if (cond) params.key = value;` 形に展開する              |
| `cond ? value : ""` (空文字列フォールバック)                                                                                        | `if/else` で組み立てる。`undefined` フォールバックとは挙動が異なるため、置き換え時に既存挙動を変えないこと                                                                                                                                                                                  |
| `x !== null ? x : y` / `x !== undefined ? x : y`                                                                                    | `x ?? y`。ただし `x` が `0` や `""` の場合に falsy で y にしたいケースは `??` だと意味が変わるため、必ず元の比較式を確認してから置き換える                                                                                                                                                  |
| ネスト三項 (`cond1 ? a : cond2 ? b : c`)                                                                                            | 早期 return か `switch` で分割。`unicorn/no-nested-ternary` で既に error になっているため新規発生はしないはずだが、置き換え時にネスト形を新たに作らない                                                                                                                                     |

否定 enabled パターン (`actions.ts:511-513` の `signals.mediaType.value === "fakeMedia" && !signals.fakeVideoShowChannelId.value ? false : undefined`) のような複合条件 + 偽値返却は、上記オブジェクトリテラル方針に従い以下のように展開する:

```typescript
let fakeVideoShowChannelId: false | undefined = undefined;
if (signals.mediaType.value === "fakeMedia" && !signals.fakeVideoShowChannelId.value) {
  fakeVideoShowChannelId = false;
}
```

### 既存ヘルパーと新規ヘルパー

既存ヘルパー `nonEmptyOrUndefined` は `src/app/actions.ts:353` の private 関数。引数 1 つ (`value`) で空文字列を `undefined` に変換するシグニチャ。enabled フラグ付きパターンには形が合わないため、以下の手順で整備する:

1. `nonEmptyOrUndefined` を `src/utils.ts` へ移動し `export` する。`actions.ts` 内の既存呼び出しを `import` 経由 (`from "@/utils"`、`actions.ts` の既存 `import` パターンに準拠) に切り替える
2. `src/utils.ts` に新規ヘルパー `enabledOrUndefined` を追加する。シグネチャは以下で確定する:

   ```typescript
   // enabled が true かつ value が空文字列でない場合に value を返し、そうでなければ undefined を返す
   export function enabledOrUndefined<T>(enabled: boolean, value: T): T | undefined {
     if (!enabled) {
       return undefined;
     }
     if (typeof value === "string" && value === "") {
       return undefined;
     }
     return value;
   }
   ```

   `enabled` は `Signal<boolean>` の `.value` 想定で `boolean` 固定。`value` はジェネリックで、`string` の場合のみ空文字を `undefined` 化する

3. `enabledOrUndefined` で吸収できるのは `signals.foo.value !== "" && signals.enabledFoo.value ? signals.foo.value : undefined` の完全に同型なパターンのみ。`actions.ts` 内の `buildConnectionUrlParameters` / `buildDeviceUrlParameters` 等と、`DevtoolsPane/*Form.tsx` の `enabled<X>.value ? signals.<X>.value : undefined` 系が該当する (件数は実装着手時に grep で確定する)
4. それ以外のパターン (配列 `length > 0` 判定、モード判定 `=== "X"`、否定 enabled、boolean 値、`""` フォールバック) は置き換えパターン表に従って個別に if 文展開する

### `complexity` / `max-statements` への配慮

`vite.config.ts:147-149` で `complexity: ["error", { max: 20 }]` / `"max-statements": ["error", { max: 50 }]` が設定されている。`actions.ts` の `buildConnectionUrlParameters` / `buildDeviceUrlParameters` / `copyURL` のような 10 件以上の `cond ? value : undefined` を含む関数を素朴に `if` 文へ展開すると閾値に抵触する可能性がある。

`enabledOrUndefined` で吸収すれば 1 関数あたりの分岐は元のオブジェクトリテラルとほぼ同等になるため抵触は回避できる想定。それでも閾値を超える場合は機能単位 (シグナリング系 / メディア系 / コーデック系) で関数を分割する。

## 完了条件

- `vite.config.ts:859` が `"no-ternary": "error"`、588 / 897 のコメントが禁止方針と整合する内容に書き換えられている
- `pnpm check` (`vp check`、lint + format + typecheck) が pass する。新規の `oxlint-disable-next-line` 追加は 0 で、既存 disable のうち本変更で未使用化したものは同コミットで削除されている
- `pnpm test` (`vp test run`) が全件 pass する。`src/utils.prop.ts` の置き換え (`audio ? "true" : "false"` → `String(audio)`) は決定論的なため fast-check のフレーキー化リスクは無い
- e2e (`pnpm test:e2e`) は `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` / `E2E_TEST_SORA_CHANNEL_ID_PREFIX` / `E2E_TEST_ACCESS_TOKEN` を設定したローカル環境で全件 pass、または `.github/workflows/e2e-test.yml` の CI 結果が green。手元に Sora 環境を持たない実装者は CI green を以て代替してよい
- 手動確認 (`pnpm dev --port 3333`): `tests/sendrecv.test.ts` と同等の URL パラメータ (`channelId` / `signalingUrlCandidates` / `multistream` / `role` / `videoCodecType` / `metadata`) を `http://localhost:3333/devtools/?<params>` で開き、sendrecv 接続 → ローカル映像表示 → ConnectionStatusBar 表示 → URL コピー (`CopyUrlButton`) → 切断、までを実機操作で確認する。e2e が踏まない `JsonTree` (`DebugPane` 配下) / `SignalingUrlModal` / `Filter` / `TimelineMessages` は debug パネルを開いて表示が崩れないことを確認する。比較基準は着手時の develop HEAD で同じ操作をした際の表示と差分が無いこと
- `CHANGES.md` の `## develop` 配下 `### misc` サブセクションに以下を追記する。タグは `[UPDATE]` (sora-devtools は内部開発ツールでエンドユーザー向け機能・URL パラメータ・出力フォーマットに変化が無いリファクタのため):

  ```
  - [UPDATE] `oxlint` の `no-ternary` を `error` に有効化し、三項演算子を全廃するという形に変更する
    - @voluntas
  - [UPDATE] `nonEmptyOrUndefined` を `src/utils.ts` に移動し `enabledOrUndefined` ヘルパーを追加する
    - @voluntas
  ```

## 違反箇所概要

本 issue 作成時点の develop HEAD 計測の `pnpm exec vp lint -D no-ternary src` 出力に基づく件数の多い順 (5 件以上):

- `src/app/actions.ts`: 35 件 (`buildConnectionUrlParameters` / `buildDeviceUrlParameters` / `copyURL` / `pickConnectionOptionsState` 等に集中)
- `src/components/Video/LocalVideo.tsx`: 7 件
- `src/utils.ts`: 6 件
- `src/components/ui/FormCheck.tsx`: 6 件
- `src/components/Header/SignalingUrlModal.tsx`: 6 件
- `src/components/DevtoolsPane/index.tsx`: 6 件
- `src/components/Video/ConnectionStatusBar.tsx`: 5 件
- `src/components/DebugPane/JsonTree.tsx`: 5 件

`src/components/ui/` 配下 (FormCheck.tsx / FormSwitch.tsx / Dropdown.tsx / Tabs.tsx / Navbar.tsx / Button.tsx / Collapse.tsx) は共通 UI コンポーネントで合計 24 件。波及範囲が広いため、`enabledOrUndefined` の整備後にここから着手するのが望ましい。

`src/components/DevtoolsPane/*Form.tsx` 系は同型のフォーム群で `enabled フラグ + value` のパターンが大半 (各 1 〜 3 件)。一部 (`enabledOrUndefined` で吸収できる完全同型) と一部 (`""` フォールバックで個別 if 展開) に分かれる。
