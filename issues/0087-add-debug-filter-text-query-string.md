# デバッグパネルのフィルター文字列を URL パラメータで保持できるようにする

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-debug-filter-text-query-string
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

デバッグパネルの `Filter` に入力した文字列を URL パラメータとして保持し、 `Copy URL` や URL のコピペでフィルター状態もセットで渡せるようにする。

フィルターはデバッグ表示を絞り込むために使うため、不具合調査の依頼や引き継ぎでフィルター条件を含めて共有したい場合がある。

## 現状

- `src/app/signals.ts` の `debugFilterText` がデバッグパネルの `Filter` の入力値を持つ
- `src/types.ts` の `QueryStringParameters` は `Omit` で `debugFilterText` を除外している。このため `src/utils.ts` の `parseQueryString` は URL パラメータから `debugFilterText` を読み取らない
- `src/app/actions.ts` の `copyURL` は `debug` / `debugType` / `debugApiUrl` を URL パラメータに含めるが、 `debugFilterText` は含めない
- `src/components/DebugPane/index.tsx` のタブ切り替えは `debugType` だけを URL に反映する
- `src/app/signals.ts` の `setDebugType` はタブ切り替え時に `debugFilterText` を空文字へリセットする

## 設計方針

- `debugFilterText` を `QueryStringParameters` に含め、起動時に URL パラメータから復元する
- `copyURL` では `debug` が `true` かつ `debugFilterText` が空文字でない場合のみ `debugFilterText` を含める。デフォルト値（空文字）は URL の長さを抑えるため含めない
- `applyMiscParameters` では `setDebugType` が `debugFilterText` をリセットするため、 `debugType` の適用より後に `debugFilterText` を適用する
- タブ切り替えでは `setDebugType` によりフィルターがクリアされるため、 URL に残っている `debugFilterText` も削除して URL と state を一致させる
- フィルター文字列は `buildQueryStrings` の `encodeURIComponent` の経路をそのまま使い、空白や記号を含んでも復元できるようにする
- フィルターの絞り込みロジック（`debugFilterText.split(" ")` による AND 検索）は変更しない

## 完了条件

- `debug=true` かつフィルター文字列が設定されている状態で `Copy URL` を押すと、コピーされる URL に `debugFilterText` が含まれる
- コピーした URL を開くとデバッグパネルの `Filter` に文字列が復元され、絞り込みが適用される
- フィルターが空文字の場合は URL に `debugFilterText` を含めない
- タブを切り替えるとフィルターがクリアされ、URL からも `debugFilterText` が削除される
- `debugFilterText` に空白や `&` などの記号を含んでも URL 経由で正しく復元される
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルド、E2E テストが成功する

## 解決方法

- `src/types.ts` の `QueryStringParameters` から `debugFilterText` の `Omit` を削除する
- `src/utils.ts` の `parseQueryString` に `debugFilterText: parseStringParameter(searchParams, "debugFilterText")` を追加する
- `src/app/actions.ts` の `applyMiscParameters` で `qsParams.debugFilterText` を `signals.setDebugFilterText` に適用する（`setDebugType` の後）
- `src/app/actions.ts` の `copyURL` で `debug` が `true` かつ値が空文字でない場合に `debugFilterText` を追加する
- `src/components/DebugPane/index.tsx` の `onSelect` で `searchParams.delete("debugFilterText")` を呼ぶ
- `src/app/app.test.ts` に URL パラメータからの復元テストを追加する
- `src/components/Header/CopyUrlButton.ct.tsx` に `debugFilterText` がコピーされる URL に含まれるテストを追加する
- `src/utils.prop.ts` の `parseQueryString` テストに `debugFilterText` を追加する
