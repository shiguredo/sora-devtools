# 0056-bug-fix-media-type-form-synthetic-event

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-media-type-form-synthetic-event
- Polished: 2026-06-16

## カテゴリ・命名の補足

本 issue の実作業は「内部実装の置き換え + 型 narrowing 移行」で挙動不変のリファクタリングであり、 `shiguredo-git` 規約に照らすと bug-fix カテゴリと branch prefix `feature/fix-` の選択は実態と矛盾している。マージ前にユーザー判断で以下のリネーム作業を行うのが望ましい (リネームの是非はユーザーが決める)。リネームを採用する場合は次の 4 ステップを必ず実施する:

1. `git mv issues/0056-bug-fix-media-type-form-synthetic-event.md issues/0056-refactor-media-type-form-synthetic-event.md` (履歴は引き継がれる)
2. リネーム後の issue ファイル冒頭 H1 を `# 0056-refactor-media-type-form-synthetic-event` に書き換える
3. リネーム後の issue ファイルの `Branch:` 行を `feature/refactor-media-type-form-synthetic-event` に書き換える
4. 関連 issue (0053 / 0054 / その他) からの `[[0056-bug-fix-media-type-form-synthetic-event]]` 参照リンクを `[[0056-refactor-media-type-form-synthetic-event]]` に書き換える ( `grep -rln 'bug-fix-media-type-form-synthetic-event' issues/` で対象を特定する)

## 目的

`MediaTypeForm` (`src/components/DevtoolsPane/MediaTypeForm.tsx`) は radio クリック時に `new Event("change")` を生成して `Object.defineProperty(syntheticEvent, "target", { value: { value: label } })` で「偽の `target.value`」を貼り、その合成イベントを `onChange` に渡すという DOM 仕様の意図から外れた経路で動かしている。 `Event.target` の上書きは現状全モダンブラウザで動作するが、「合成 Event の生成」と「偽の `target.value` を貼る」の 2 段重ねで読みづらく、将来 `FormCheck` の API 変更や型強化が入ると即座に壊れる脆い設計。

合成 Event の生成と偽の `target.value` 注入は撤廃し、`FormRadio` の `onChange` シグネチャを `(value: (typeof MEDIA_TYPES)[number]) => void` に変えて `MEDIA_TYPES` のリテラル値を直接渡す形に統一する。型 narrowing で `checkFormValue` 経由のランタイム検証も不要になるため一緒に削除する。

なお、上記の 2 段とは別軸として「 `FormCheck` の `onChange` シグネチャが `(event: Event) => void` のため、 子の `onChange` 内で `target.checked` を判定するための `event.target as HTMLInputElement` キャスト 1 段」は本 issue でも残る。これは修正前から存在するキャストで、合成 Event 撤廃と直交した別の課題 ( `FormCheck` の API 拡張) で扱うべきため本 issue のスコープ外。

## 優先度根拠

- 現状クロスブラウザで動作するため即時クラッシュではない（High ではない）。
- 「`FormCheck` (`src/components/ui/FormCheck.tsx`) の `<input>` に `value` 属性が伝搬されない」という別件（`FormCheck` の API 不足）を踏み台にした暗黙の依存があり、`FormCheck` の API が変わると即座に二重実装になる。型は `as HTMLInputElement` キャストで誤魔化されており、型システムも問題を検知できない。Low ではない。
- 修正は `src/components/DevtoolsPane/MediaTypeForm.tsx` 1 ファイル / 数行で完結する（共通 `FormCheck` には触らない）。
- 関連する 0053 / 0054 と DevtoolsPane ファミリーで揃ってマージする想定のため Medium。

## 現状の問題

行番号は陳腐化するため記載しない。各箇所はコンポーネント名（`MediaTypeForm` / `FormRadio`）および関数名（`setMediaType` / `checkFormValue`）で特定する。

### `FormCheck` の `<input>` に `value` 属性が無い（真の根本原因）

`src/components/ui/FormCheck.tsx` の `<input type="radio">` / `<input type="checkbox">` は `value` props を受け取らず `<input>` にも `value` 属性を伝搬しない。 HTML Living Standard の「The input element」節配下では、 `value` IDL 属性の挙動は「Common input element APIs」節の `value` IDL アルゴリズムで mode 別に分岐する。 `type=checkbox` / `type=radio` は `default/on` モードに該当し、 Checkbox state / Radio Button state の各 type 別 state 節で `value` content attribute の missing value default が `"on"` と規定されている (節番号は HTML Living Standard の版で変動するため引用しない)。 結果として `value` content attribute が無いラジオ要素の `value` IDL は `"on"` を返し、 Chromium / Gecko / WebKit すべてでこの挙動。 よって `event.target.value` を読むと常に `"on"` が返り、 `MEDIA_TYPES` ( `"getUserMedia" | "getDisplayMedia" | "fakeMedia" | "mp4Media"` ) のいずれともマッチしない。

### `FormRadio` の合成 Event 偽装

`src/components/DevtoolsPane/MediaTypeForm.tsx` の `FormRadio`:

```tsx
interface FormRadioProps {
  label: string;
  mediaTypeValue: string;
  disabled: boolean;
  onChange: (event: Event) => void;
}
function FormRadio(props: FormRadioProps) {
  const { label, disabled, onChange, mediaTypeValue } = props;
  return (
    <FormCheck
      type="radio"
      id={label}
      label={label}
      checked={mediaTypeValue === label}
      onChange={(e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          const syntheticEvent = new Event("change");
          Object.defineProperty(syntheticEvent, "target", { value: { value: label } });
          onChange(syntheticEvent);
        }
      }}
      disabled={disabled}
    />
  );
}
```

`new Event("change")` を生成 → `Object.defineProperty` で偽の `target.value` を貼る → 親の `onChange` に渡す。 DOM Standard の `Event` interface には `[Unforgeable]` 拡張属性が付かないため、 WebIDL の Attributes 規定 ( `[Unforgeable]` 非適用の attribute は対応する accessor property の `[[Configurable]]` が true となる) により `target` accessor property の `[[Configurable]]` は true となり、 どのブラウザでも `Object.defineProperty` による上書きは成功する (節番号は WebIDL Living Standard の版で変動するため引用しない)。

### `MediaTypeForm` 親側の `onChange`

```tsx
const onChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  if (checkFormValue(target.value, MEDIA_TYPES)) {
    setMediaType(target.value);
  }
};
```

偽の `target.value` から `label` を取り出して `checkFormValue` 経由で `MEDIA_TYPES` と照合してから `setMediaType` を呼ぶ。`FormRadio` 側で `label` がハードコード 4 値で `MEDIA_TYPES` と完全一致しているため、`checkFormValue` は実質的に冗長（必ず true）。

### `setMediaType` の型

```ts
export const setMediaType = (value: SoraDevtoolsState["mediaType"]): void => {
  mediaType.value = value;
};
```

`SoraDevtoolsState["mediaType"]` は `(typeof MEDIA_TYPES)[number]` に解決される。

### `MEDIA_TYPES` の定義

```ts
export const MEDIA_TYPES = ["getUserMedia", "getDisplayMedia", "fakeMedia", "mp4Media"] as const;
```

`as const` で `("getUserMedia" | "getDisplayMedia" | "fakeMedia" | "mp4Media")[]` のリテラル union に narrow される。

## 設計方針

### `FormRadioProps` の型変更

**before**:

```tsx
interface FormRadioProps {
  label: string;
  mediaTypeValue: string;
  disabled: boolean;
  onChange: (event: Event) => void;
}
```

**after**:

```tsx
// label は MEDIA_TYPES のリテラル union に narrow する。
// MediaTypeForm 側の <FormRadio label="getUserMedia" ... /> 等は as const で
// narrow されているため呼び出し側で as キャスト不要。onChange も同型を受け取る。
interface FormRadioProps {
  label: (typeof MEDIA_TYPES)[number];
  mediaTypeValue: (typeof MEDIA_TYPES)[number];
  disabled: boolean;
  onChange: (value: (typeof MEDIA_TYPES)[number]) => void;
}
```

### `FormRadio` 内部 `onChange` の書き換え

**before**:

```tsx
onChange={(e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.checked) {
    const syntheticEvent = new Event("change");
    Object.defineProperty(syntheticEvent, "target", { value: { value: label } });
    onChange(syntheticEvent);
  }
}}
```

**after**:

```tsx
// FormCheck の <input> に value 属性が伝搬されないため、event.target.value からは
// ラジオの選択値を取れない（HTML 仕様で未指定時は "on" が返る）。
// 代わりに props.label をクロージャ捕捉して直接 onChange に渡す。
// target.checked の判定のみ残す。
onChange={(event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    onChange(label);
  }
}}
```

### `MediaTypeForm.onChange` の置き換え + `checkFormValue` 削除

**before**:

```tsx
const onChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  if (checkFormValue(target.value, MEDIA_TYPES)) {
    setMediaType(target.value);
  }
};
```

**after**:

```tsx
// FormRadio から MEDIA_TYPES[number] 型の値が直接渡るため、checkFormValue は不要。
const onChange = (value: (typeof MEDIA_TYPES)[number]): void => {
  setMediaType(value);
};
```

加えて import 文 `import { checkFormValue } from "@/utils";` を削除する（`MediaTypeForm.tsx` 内で他に使用箇所はない）。

### `mp4Media` 条件分岐との整合

`MediaTypeForm.tsx` 内 `mountClient.value && <FormRadio label="mp4Media" ... disabled={disabled || !isMp4MediaAvailable} ... />` は `"mp4Media"` が `MEDIA_TYPES` に含まれている前提で新型に適合する。`mountClient` / `isMp4MediaAvailable` ガード自体は本 issue では触らない（SSR / CSR 不一致回避のため必要）。

## テスト戦略

本修正は `FormRadio` の props 型変更と `MediaTypeForm` 内 closure 関数の書き換えに留まり、新規ロジック追加は無い（むしろ `checkFormValue` 経路の削除でロジックは減る）。

- **単体テスト**: 0053 / 0054 と同様、Preact コンポーネントの render 結果から radio の onChange 挙動を読み取る単体テスト基盤は現状本リポジトリには無い。本 issue のために基盤を立ち上げるコストは過大。追加なし。
- **PBT**: `MEDIA_TYPES` のリテラル union (4 値) に対する property test は意味が薄い（4 ケース全網羅は通常テストで十分）。追加なし。
- **e2e (Playwright)**: 既存 e2e (`tests/sendrecv.test.ts` 等) は `MediaTypeForm` の選択遷移を踏むシナリオを持たない。本 issue では追加しない。
- **手動検証**: 後述「検証手順」で 4 つの mediaType それぞれが反映されることを Chrome / Firefox / Safari で確認する。

## CHANGES.md エントリ

本修正は現状クロスブラウザで動作している既存挙動の **リファクタリング** であり、ユーザーから見える挙動は変わらない。 `MediaTypeForm` というプロダクトコード本体の挙動 (内部実装) 変更であり、 `### misc` の前例 ( Preact / Tailwind / Vite+ 移行などツール・ビルド基盤の入れ替え) と性質が異なる。 `CHANGES.md` の `## develop` 直下に並ぶ `[CHANGE] connectSora の soraConnection.stream = null ハックを削除する` のような「プロダクトコード本体の内部実装変更」と同じ位置付けが妥当と判断し、 本 issue は `## develop` 直下の `[CHANGE]` 群末尾に追記する ( `### misc` には入れない)。

```
- [CHANGE] `MediaTypeForm` の `FormRadio` から `new Event` + `Object.defineProperty` の合成イベント生成を撤廃する
  - `onChange` シグネチャを `(value: (typeof MEDIA_TYPES)[number]) => void` に変更し、 `checkFormValue` 経由のランタイム検証も型 narrowing で代替する
  - @voluntas
```

## スコープ外（および採用しないアプローチ）

- **`FormCheck` への `value` props 追加案（不採用）**: `FormCheck` (`src/components/ui/FormCheck.tsx`) に `value?: string` props を追加し `<input value={value}>` で伝搬すれば、`MediaTypeForm` 側は `event.target.value` をそのまま読めて合成 Event が不要になる。ただし:
  - `FormCheck` は他コンポーネント (`AudioForm` / `VideoForm` / `DataChannelForm` 等) からも使われており、影響範囲が広い。
  - `event.target.value` 経由は string 型で戻るため `checkFormValue` 経由が再び必要になり、`MEDIA_TYPES[number]` 型 narrowing の利点を失う。
  - radio の `name` グルーピングや `value` 衝突など Bootstrap 互換層の副作用検証が必要。

  以上から本 issue では採用せず、`MediaTypeForm.tsx` 内 `FormRadio` 局所で `(value: (typeof MEDIA_TYPES)[number]) => void` シグネチャに統一する。`FormCheck` の API 拡張が必要になった時点で別 issue として起票する。

- **他のラジオ系フォーム**: 現状本リポジトリで `FormCheck` を 4 値以上のラジオ群で使うコンポーネントは `MediaTypeForm` のみ（grep 確認）。同種の合成 Event パターンも `MediaTypeForm.tsx` の 1 箇所のみ。同種パターンが他に出てきた場合は別 issue で扱う。
- **`MediaTypeForm` の `mountClient` ハック**: SSR / CSR 不一致回避のため必要で、本 issue では触らない。

## 関連 issue

- [[0053-bug-fix-request-media-button-disabled]] / [[0054-bug-fix-update-media-stream-button-disabled]]: 同じ DevtoolsPane ファミリー。0053 / 0054 は「button の disabled 整合性」、本 issue は「radio form の合成 Event 撤廃」で別系統だが、DevtoolsPane の UI 健全化として揃ってマージする想定。

## 検証手順

### A. 修正前の挙動確認（develop ブランチで実施）

1. `pnpm dev` で起動。
2. DevTools console で `setMediaType` の呼び出しに breakpoint を仕込む（または `console.log` を仮挿入）。
3. `MediaTypeForm` で radio をクリックし、`setMediaType` が `"getUserMedia"` / `"getDisplayMedia"` / `"fakeMedia"` / `"mp4Media"` のいずれかで呼ばれることを Chrome で確認（現状の合成 Event 経路で動作している事実の確認）。

### B. 修正後の確認

4. 修正後、4 つの radio すべてをクリックし、上部 DevtoolsPane の関連フォーム (`AudioInputForm` / `VideoInputForm` / `FrameRateForm` 等) の表示が `mediaType` 状態に追従して切り替わることを確認する。
5. `?mediaType=fakeMedia` などの URL クエリ反映 (`setMediaType` 経路) が壊れていないことを確認する。

### C. クロスブラウザ

6. Chrome 最新版で B を全件確認。
7. Firefox 最新版で B を全件確認。
8. Safari 最新版で B を全件確認。

### D. テスト

9. `pnpm test` が pass すること（`MEDIA_TYPES` を扱う既存テストの非退行）。
10. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること。

## 完了条件

- 検証手順 A-D すべてが通過すること。
- `MediaTypeForm.tsx` から `new Event` / `Object.defineProperty` / `checkFormValue` の呼び出しがすべて削除されていること（grep で確認）。
- `FormRadioProps.label` および `onChange` が `(typeof MEDIA_TYPES)[number]` で型付けされていること。
- `CHANGES.md` の `## develop` 直下の `[CHANGE]` 群末尾に上記エントリが追記され、担当者行が付いていること ( `### misc` ではなく `## develop` 直下に配置する)。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が pass すること。
