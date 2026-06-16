# 三項演算子を全面禁止する

- Priority: Medium
- Created: 2026-06-11
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/refactor-disallow-ternary
- Polished: 2026-06-16
- Reporter: @voluntas

## 目的

三項演算子 (`condition ? a : b`) を sora-devtools のコードベースから全廃し、`if` 文・論理演算子 (`&&` / `||` / `??`)・早期 return など明示的な構文に統一する。JSX や式の中で条件分岐の現れ方を一本化し、ネストや混在に起因する誤読を構造的に減らす。

合わせて oxlint の `eslint/no-ternary` ルールを `error` に有効化し、今後の混入を CI で防ぐ。

## 優先度根拠

Medium。

- 機能・運用への影響は無く、ユーザー視点では無風のため High ではない
- 一方で本 issue 作成時点 (`pnpm exec vp lint -D no-ternary src` 計測) で違反が 158 件 / 約 57 ファイルあり、`src/components/ui/` 配下の共通コンポーネントから `src/app/actions.ts` まで広く分散している。新規コードでの混入も継続するため、放置すれば差分は単調増加する
- ルール有効化と既存違反の解消は不可分なため先送り不可。まとめて 1 ブランチで完結させる必要があるため Low ではなく Medium とする

## 現状

`vite.config.ts` 内の三項演算子関連ルールの状態:

- 859 行目: `"no-ternary": "off"` (コメント: 「三項演算子は可読性が高い場合に有用」)
- 589 行目: `"unicorn/prefer-ternary": "off"` (コメント: 「三項演算子より if/else を推奨（多行の場合は三項演算子より可読性が高い）」)
- 489 行目: `"unicorn/no-nested-ternary": "error"`
- 559 行目: `"unicorn/prefer-logical-operator-over-ternary": "error"` (本 issue 作成時点で違反 0 件)
- 897 行目: `"no-nested-ternary": "off"` (eslint 版。`unicorn/no-nested-ternary` で error 検出済み)

違反件数のスナップショット: 158 件 / 約 57 ファイル。実装着手時に `pnpm exec vp lint -D no-ternary src` を再実行して最新の違反一覧を取得し、作業対象とする。

既存の `// oxlint-disable-next-line` ディレクティブは 18 件あるが、いずれも `no-ternary` 以外のルール (`typescript/no-unnecessary-condition` / `promise/prefer-await-to-callbacks` / `import/default` / `react/button-has-type`) 対象で、`no-ternary` 限定の disable は 0 件。本変更で既存 disable が未使用化される可能性は無いと判断してよい。

## 設計方針

### lint 設定の変更 (`vite.config.ts`)

- 859 行目: `"no-ternary": "off"` を `"no-ternary": "error"` に変更し、コメントを禁止方針と整合する内容に書き換える
- 589 行目: `"unicorn/prefer-ternary": "off"` は `off` のまま維持する。コメント「（多行の場合は三項演算子より可読性が高い）」を削除し、`no-ternary` で全面禁止する旨に書き換える
- 489 行目: `"unicorn/no-nested-ternary": "error"` は `error` のまま維持する (`no-ternary` 有効化後はデッドルールになるが、ネスト三項禁止の意図を明示するため残す)
- 559 行目: `"unicorn/prefer-logical-operator-over-ternary": "error"` も `error` のまま維持する (同様にデッドルールだが意図明示のため残す)
- 897 行目: `"no-nested-ternary": "off"` は `off` のまま維持する。コメントを「`no-ternary` で全面禁止するため off のまま (内包)」相当に書き換える

### 個別 disable の方針

`// oxlint-disable-next-line no-ternary` 等での個別許可は一切認めない。実装中に置き換えが困難な箇所が出た場合は、`oxlint-disable` で逃げずに `issues/pending/` に新規 issue を起こして方針判断をユーザーに仰ぐ。

### コード置き換えパターン

| 入力パターン                                                                                                                                                       | 置き換え方針                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSX 子要素 `cond ? <X /> : null`                                                                                                                                   | `cond && <X />`。`cond` が `boolean` / `string` / `null` / `undefined` のみを取るならラップ不要。`number` を取りうる式 (`array.length` 等) のみ `Boolean(cond) && <X />` でラップする                                                                                     |
| JSX 子要素 `cond ? <X /> : <Y />` または `cond ? <X /> : "literal"` (片方以上が VNode)                                                                             | JSX の前で `let element: ComponentChild; if (cond) element = <X />; else element = <Y />;` 形でローカル変数に組み立てる (`import type { ComponentChild } from "preact"` で型注釈)。両方 VNode で `ComponentChild` 注釈が型エラーになる場合のみ `JSX.Element` 等へ調整する |
| JSX 子要素 `cond ? "a" : "b"` (両方文字列リテラル)                                                                                                                 | JSX の前で `let label = "b"; if (cond) label = "a";` 形でローカル変数を組み立てる。`ComponentChild` 型注釈は不要 (型推論で `string`)                                                                                                                                      |
| JSX 子要素 `{value === "" ? "literal" : value}` (空文字フォールバック逆形)                                                                                         | `value \|\| "literal"`。`value` が `string` で空文字以外の falsy (0, NaN) を取らない場合に限る。`*Form.tsx` の `value === "" ? "未指定" : value` 系がこのパターン                                                                                                         |
| JSX 属性値 `style={cond ? a : b}` / `className={cond ? a : b}` / `id={cond ? "x" : undefined}` / 文字列補間 \``${cond ? a : b}`\`                                  | JSX の前で `let style = b; if (cond) style = a;` 形のローカル変数を組み立て、属性には変数を渡す                                                                                                                                                                           |
| 同一の `cond` で複数の属性値がそれぞれ異なる場合 (`localVideo ? "local-video-connection-id" : undefined` と `localVideo ? "local-video-client-id" : undefined` 等) | 値ごとに独立したローカル変数を作る (`let connectionIdAttr; if (localVideo) connectionIdAttr = "local-video-connection-id";` を別 2 本)                                                                                                                                    |
| JSX 外の `const` 代入 (`const wsProtocol = cond ? "wss://" : "ws://";` 等)                                                                                         | `let wsProtocol = "ws://"; if (cond) wsProtocol = "wss://";` 形のローカル変数で組み立てる                                                                                                                                                                                 |
| 関数本体の単行 return (`return error instanceof Error ? error.message : String(error);` 等)                                                                        | 関数本体を block 化し、`if (cond) return a; return b;` の早期 return 形に書き換える                                                                                                                                                                                       |
| 型ガードの値 / 代替値 (`Array.isArray(x) ? x : undefined`、`x ? x() : null`、`typeof x === "string" ? x : JSON.stringify(x)` 等)                                   | `if (typeGuard) { return x; } return alt;` 形か、`let result; if (typeGuard) result = x; else result = alt;` で組み立てる                                                                                                                                                 |
| 数値フォールバック (`Number.isNaN(x) ? default : x` 等)                                                                                                            | `let result = default; if (!Number.isNaN(x)) result = x;` 形で組み立てる (`x ?? default` だと `null` / `undefined` のみ吸収し、`NaN` を吸収しないため別物)                                                                                                                |
| `useMemo(() => cond ? a : b, [deps])` / `arr.map((x) => cond ? a : b)` / `arr.filter((x) => cond ? a : b)` 等のアロー関数式 + 暗黙 return 内の三項                 | アロー関数を block 化し、`(...) => { let value; if (cond) value = a; else value = b; return value; }` の形に置換する。`useMemo` 自体は維持し、新規 `useMemo` 等の hooks は導入しない                                                                                      |
| オブジェクトリテラルのキー値 `{ key: cond ? value : undefined }` (空文字判定 + 単一 enabled の同型パターン)                                                        | 後述の `enabledOrUndefined` で吸収する。吸収できない例外パターン (配列 `length > 0` 判定、モード判定 `=== "X"`、否定 enabled、boolean 値、特定文字列との比較) は `return` の前で `let key: T \| undefined; if (cond) key = value;` 形に展開する                           |
| オブジェクトリテラルのキー値 `{ key: cond ? true : undefined }` / `{ key: cond ? false : undefined }` (boolean トグル)                                             | `return` の前で `let key: boolean \| undefined; if (cond) key = true;` (または `if (cond) key = false;`) 形に展開する。型は `boolean \| undefined` でよい                                                                                                                 |
| オブジェクトリテラルのキー値 `{ key: cond ? value : "" }` (空文字フォールバック型、`pickConnectionOptionsState:1304` の `dataChannels` 等)                         | フィールド型が `string` (空文字を取りうる) のため `undefined` 吸収不可。`return` の前で `let dataChannels = ""; if (cond) dataChannels = value;` 形で展開し、`return { ..., dataChannels, ... }` で含める                                                                 |
| 関数呼び出しの引数値 `cond ? expr(x) : undefined` (条件式の対象と返値式の対象が同じで返値側に加工が入る)                                                           | 式の前で `let value: T \| undefined; if (cond) value = expr(x);` 形に展開する                                                                                                                                                                                             |
| `cond ? value : ""` または `cond ? "" : value` (空文字フォールバックの両方向)                                                                                      | `if/else` で組み立てる。`undefined` フォールバックとは挙動が異なるため、置き換え時に既存挙動を変えないこと                                                                                                                                                                |
| `x !== null ? x : y` / `x !== undefined ? x : y`                                                                                                                   | `x ?? y`                                                                                                                                                                                                                                                                  |
| ネスト三項 (`cond1 ? a : cond2 ? b : c`)                                                                                                                           | 早期 return か `switch` で分割する。置き換え時にネスト形を新たに作らない                                                                                                                                                                                                  |
| `bool ? "true" : "false"` (両方が `String(bool)` と等価な文字列リテラル)                                                                                           | `String(bool)` に置換する。 `*.prop.ts` の URL クエリ値生成や、 boolean を URL 文字列化する箇所で発生する ( 例: `utils.prop.ts:224-225` の `audio ? "true" : "false"` )。 `let` 展開で冗長に書き換えない                                                                  |

複数パターンが同時に該当する場合は、JSX 子要素 → JSX 属性値 → 高階関数コールバック内のアロー暗黙 return → オブジェクトリテラル → JSX 外 `const` 代入 → 関数本体・式 の順で適用判定する (`const bracketOpen = isArray(data) ? "[" : "{";` のような型ガード + const 代入は「JSX 外 const 代入」行の方針に従い、「型ガードの値 / 代替値」行は関数本体・式系に限定する)。JSX 系のパターンは `enabledOrUndefined` の対象外 (値返却専用ヘルパーのため)。

置換時のコメントは `CLAUDE.md` 規約に従い末尾コメントを使わず、直前行に行コメントとして書く。

### 既存ヘルパーと新規ヘルパー

既存ヘルパー `nonEmptyOrUndefined` は `src/app/actions.ts:353` の private 関数。引数 1 つ (`value`) で空文字列を `undefined` に変換するシグニチャ。`enabled` フラグ付きパターンには形が合わないため、以下の手順で整備する:

1. `nonEmptyOrUndefined` を `src/utils.ts` へ移動し `export` する。`actions.ts` 内の既存呼び出しを `import` 経由に切り替える。`actions.ts` の既存 import スタイル (相対パス + `.ts` 拡張子) に準拠する
2. `src/utils.ts` に新規ヘルパー `enabledOrUndefined` を追加する。シグネチャは以下で確定する:

   ```typescript
   // enabled が true かつ value が空文字列でない場合に value を返し、そうでなければ undefined を返す
   // 本ヘルパーは文字列値の空文字判定吸収専用 (T を string 系に制約する)。
   // boolean トグル (cond ? true : undefined) や null を取りうる signal (apiUrl: string | null 等) には使わない
   export function enabledOrUndefined<T extends string>(enabled: boolean, value: T): T | undefined {
     if (!enabled) {
       return undefined;
     }
     if (value === "") {
       return undefined;
     }
     return value;
   }
   ```

   `enabled` は `boolean` 固定。呼び出し側で複数条件を AND 合成して渡す。`value` は `string` 系に制約し、`number` や `object` を渡すと型エラーで弾く

3. `enabledOrUndefined` の利用例 (Before / After):

   ```typescript
   // Before: buildBitrateCodecUrlParameters 内、2 条件パターン (audioBitRate)
   audioBitRate:
     appendAudioVideoParams && signals.audioBitRate.value !== ""
       ? signals.audioBitRate.value
       : undefined,

   // After
   audioBitRate: enabledOrUndefined(appendAudioVideoParams, signals.audioBitRate.value),
   ```

   ```typescript
   // Before: buildBitrateCodecUrlParameters 内、3 条件パターン (audioStreamingLanguageCode)
   audioStreamingLanguageCode:
     appendAudioVideoParams &&
     signals.audioStreamingLanguageCode.value !== "" &&
     signals.enabledAudioStreamingLanguageCode.value
       ? signals.audioStreamingLanguageCode.value
       : undefined,

   // After
   audioStreamingLanguageCode: enabledOrUndefined(
     appendAudioVideoParams && signals.enabledAudioStreamingLanguageCode.value,
     signals.audioStreamingLanguageCode.value,
   ),
   ```

   `!== ""` 判定はヘルパー側に任せ、それ以外の AND 条件は呼び出し側で合成する

4. `enabledOrUndefined` の適用対象は `actions.ts` の `buildBitrateCodecUrlParameters` (361-388) / `buildVideoCodecParamsUrlParameters` (391-420) / `buildConnectionUrlParameters` (454-494) 内の上記同型パターン。同関数内の例外 (配列長判定 `signalingUrlCandidates`、`null` 取りうる `apiUrl`、否定 enabled、boolean トグル) は対象外として個別 `let` 展開する。 `buildDeviceUrlParameters` (497-514) は `audioInput` / `videoInput` の mode 判定 + 空文字フォールバック、 `fakeVolume` の mode 判定、 `fakeVideoShowChannelId` の `mediaType === "fakeMedia" && !signals.fakeVideoShowChannelId.value ? false : undefined` のような mode 判定 + 否定 boolean トグルが主で、 `enabledOrUndefined` の適用対象ではない (mode 判定は文字列等値比較で空文字フォールバックと結合しないため、 シグネチャに合わない)。 `buildDeviceUrlParameters` 内の三項はすべて `let` 展開対象として個別に処置する
5. `DevtoolsPane/*Form.tsx` 系の `enabled<X>.value ? <JSX> : null` は JSX 条件レンダリングで `enabledOrUndefined` の対象外。置き換えパターン表の `cond ? <X /> : null` 行に従う

### `copyURL` 内の三項 12 件の扱い

`actions.ts` の `copyURL` (533-586) は現状 12 件の三項を含み、内訳は以下のとおり全件 `enabledOrUndefined` で吸収できないパターンのため、`return { ... }` の前で `let` 展開する:

- `debugType` (544-546): `signals.debug.value && signals.debugType.value !== "timeline"` のフォールバック (`"timeline"` 文字列除外)
- `debugApiUrl` (549-551): `signals.debug.value && signals.debugApiUrl.value !== "http://localhost:3000"` のフォールバック (特定文字列除外)
- `mediaType` (553): モード判定 (`!== "getUserMedia"`)
- `forceStereoOutput` (556) / `mediaStats` (561) / `reconnect` (564) / `mediaProcessorsNoiseSuppression` (565-567) / `mute` (574): `cond ? true : undefined` boolean トグル
- `micDevice` (569) / `cameraDevice` (570) / `audioTrack` (571) / `videoTrack` (572): `!cond ? false : undefined` 否定 boolean トグル

### `complexity` / `max-statements` への配慮

`vite.config.ts:147-149` で `complexity: ["error", { max: 20 }]` / `"max-statements": ["error", { max: 50 }]` が設定されている。`copyURL` を素朴に `let` 展開しても上限内に収まる試算 (statements 約 34、complexity 約 14) だが、想定が外れて `pnpm check` で違反検出された場合は機能単位 (boolean フラグ系 / モード判定系 / debug 系) で `buildBooleanFlagUrlParameters` のような小関数に分割する。事前の分割は強制しない。

## 完了条件

- `vite.config.ts:859` が `"no-ternary": "error"`、589 / 897 のコメントが禁止方針と整合する内容に書き換えられている
- 158 件すべての三項演算子が全廃され、新規 `oxlint-disable-next-line no-ternary` の追加は 0 件
- `pnpm check` (`vp check`、lint + format + typecheck) が pass する。`complexity` / `max-statements` 違反も `pnpm check` 内の lint で検出されるため 0 件で pass
- `pnpm test` (`vp test run`) が全件 pass する。`src/utils.prop.ts:224-225` の `audio ? "true" : "false"` → `String(audio)` 等の置き換えは `boolean` 値の文字列化として等価
- e2e (`pnpm test:e2e`) は `.env.local` に必要な環境変数 (`E2E_TEST_SORA_SIGNALING_URL` / `E2E_TEST_SORA_CHANNEL_ID_PREFIX` / `E2E_TEST_ACCESS_TOKEN`) を設定したローカル環境で全件 pass、または CI green を以て代替する
- URL クエリパラメータの名前・値・有無条件は本 issue で一切変更しない (リファクタ範囲は構文のみ)。`copyURL` の `let` 展開・関数分割は内部実装の組み立て手順のみで、出力 URL が完全に同一であることを担保する。担保手段として、着手前に `pnpm dev --port 3333` で `tests/sendrecv.test.ts` 相当のパラメータ (`channelId` / `signalingUrlCandidates` / `multistream` / `role` / `videoCodecType` / `metadata`) を `http://localhost:3333/devtools/?<params>` で開き「Copy URL」で得た URL を控え、置き換え後の URL と完全一致することを目視確認する
- 手動確認 (`pnpm dev --port 3333`): 上記 URL での sendrecv 接続 → ローカル映像表示 → ConnectionStatusBar 表示 → URL コピー → 切断、までを実機操作で確認する。e2e が踏まない `JsonTree` (`DebugPane` 配下) / `SignalingUrlModal` / `Filter` / `TimelineMessages` は debug パネルを開いて表示が崩れないことを確認する
- `CHANGES.md` の `## develop` 配下の **既存** `### misc` サブセクション (`## develop` セクション末尾に存在) へ以下を追記する。既存エントリ群はタグ順序 `[CHANGE]` → `[ADD]` → `[UPDATE]` で並んでおり、本 issue の追記は最後の `[CHANGE]` エントリ (現状 `[CHANGE] 対応 Node.js のバージョンを 26 以上にする`) の直後に挿入して順序を維持する:

  追記する 2 件は記載順 (1 件目 → 2 件目) で連続して挿入する:

  ```
  - [CHANGE] `oxlint` の `no-ternary` を `error` に有効化し、ソースコードから三項演算子を全廃する
    - `vite.config.ts` の `no-ternary` を `off` から `error` に切り替える
    - 既存 158 箇所の三項演算子を `if` 文 / 論理演算子 / 早期 return / ヘルパー関数で置き換える
    - 個別の `oxlint-disable-next-line no-ternary` は一切許可しない
    - @voluntas
  - [CHANGE] `nonEmptyOrUndefined` を `src/utils.ts` に移動し `enabledOrUndefined` ヘルパーを追加する
    - @voluntas
  ```

## 違反箇所概要

本 issue 作成時点の上位ファイル (件数の多い順、5 件以上):

- `src/app/actions.ts`: 35 件 (`buildBitrateCodecUrlParameters` / `buildVideoCodecParamsUrlParameters` / `buildConnectionUrlParameters` / `buildDeviceUrlParameters` / `copyURL` に集中。`pickConnectionOptionsState:1304` は 1 件 (`dataChannels: ... ? value : ""` の空文字フォールバック))
- `src/components/Video/LocalVideo.tsx`: 7 件
- `src/utils.ts`: 6 件 (関数本体 1 行 return / `Array.isArray` 型ガード / 関数呼び出しフォールバック / 数値フォールバック / JSX 外 const 代入が混在)
- `src/components/ui/FormCheck.tsx`: 6 件
- `src/components/Header/SignalingUrlModal.tsx`: 6 件
- `src/components/DevtoolsPane/index.tsx`: 6 件
- `src/components/Video/ConnectionStatusBar.tsx`: 5 件
- `src/components/DebugPane/JsonTree.tsx`: 5 件 (126 行目 `useMemo` 内三項以外に 171 / 198 / 199 / 226 行目にも三項が残るため、いずれも置換パターン表に従って処置する)

`src/components/DevtoolsPane/*Form.tsx` 系は同型のフォーム群で、`enabled<X>.value ? <JSX> : null` (JSX 条件レンダリング) と `value === "" ? "未指定" : value` (空文字フォールバック逆形) の 2 パターンが大半を占める。

上記以外の約 49 ファイル (`utils.prop.ts` などのテストファイル、各 `*Form.tsx`、`*.tsx` 等) に残り 82 件が 1-4 件単位で分散している。`utils.prop.ts:224-225` のように `*.prop.ts` も `src/` 配下のため `no-ternary` 検査対象になる。
