# Preact を 11.0.0 に更新する

- Priority: Medium
- Created: 2026-08-06
- Completed: YYYY-MM-DD
- Model: DeepSeek V4 Flash
- Branch: feature/change-upgrade-preact-11
- Polished: YYYY-MM-DD

## 目的

Preact 11.0.0 の RC がリリースされ、メジャーアップデートへの移行時期が近づいている。正式リリース前に RC で動作確認し、breaking changes の影響を早期に把握することで、正式リリース時にスムーズに移行できるようにする。Preact 10 系の最新は 10.29.8 であり、11 系への移行が完了すれば今後の Preact 10 系のサポート終了にも追従できる。

## 優先度根拠

Medium。依存ライブラリのメジャーアップデートであり、正式リリース前の RC 対応のため緊急性は高くない。ただし、vitest-browser-preact の peerDependencies が `preact: ^10.0.0` のままであり、コンポーネントテストへの影響を早期に確認する価値がある。

## 現状

- 依存している Preact 関連パッケージは以下の通り
  - preact 10.29.7
  - @preact/signals 2.9.4
  - preact-iso 2.12.1
  - @preact/preset-vite 2.10.5 (devDependencies)
  - @preact/signals-agent-vite 0.1.2 (devDependencies)
  - vitest-browser-preact 1.0.0 (devDependencies)
- npm に公開されている最新の Preact 11 系は 11.0.0-beta.2 (2026-07-15 リリース) であり、RC タグはまだ npm に公開されていない
- Preact 11 の breaking changes (11.0.0-beta.0 リリースノート) のうち、本プロジェクトへの影響を確認した結果
  - 自動 px suffix の削除 → 影響なし (style は全て文字列で指定している)
  - `useRef` の initial value 必須化 → 影響なし (全て initial value を指定している)
  - `defaultProps` の preact/compat への移動 → 影響なし (defaultProps は使用していない)
  - `component.base` の削除 → 影響なし (使用していない)
  - `SuspenseList` の削除 → 影響なし (使用していない)
  - preact/compat は `createPortal` のみ使用 (src/components/Sessions/SessionsDeleteConfirmPanel.tsx / src/components/Header/SignalingUrlModal.tsx)
- 関連ライブラリの Preact 11 対応状況
  - @preact/signals は peerDependencies が `>= 10.25.0 || >= 11.0.0-0` で対応済み (最新 2.11.0)
  - preact-iso は peerDependencies が `>= 10 || >= 11.0.0-0` で対応済み (最新 2.12.1)
  - vitest-browser-preact は peerDependencies が `preact: ^10.0.0` のため Preact 11 非対応の可能性がある (最新 1.0.0)

## 設計方針

- package.json の preact を 11.0.0-beta.2 に更新する
- 関連ライブラリを最新版に更新する
  - @preact/signals 2.9.4 → 2.11.0
  - @preact/preset-vite 2.10.5 → 2.10.6
  - @preact/signals-agent-vite 0.1.2 → 0.1.3
  - preact-iso は 2.12.1 のまま (Preact 11 対応済み)
- vitest-browser-preact 1.0.0 は peerDependencies が `preact: ^10.0.0` のため、pnpm install で peer dependency の警告が出る可能性がある。コンポーネントテストが Preact 11 で動作するかを確認し、動かない場合は Preact 11 対応版のリリースを待つ (その場合は本 issue を pending にする)
- npm に正式リリース (11.0.0) が公開されたら、11.0.0-beta.2 から更新する

## 完了条件

- package.json の preact が 11.0.0 系 (11.0.0-beta.2 以上) に更新されていること
- `pnpm check` / `pnpm test` / `pnpm test:ct` / `pnpm test:e2e` / `pnpm build` がすべて成功すること
- CHANGES.md の `## develop` に `[UPDATE] Preact を 11.0.0 に更新する` の変更履歴が記載されていること

## 解決方法

1. package.json の preact を 11.0.0-beta.2 に更新し、関連ライブラリ (@preact/signals / @preact/preset-vite / @preact/signals-agent-vite) も最新版に更新する
2. `pnpm install` を実行し、peer dependency の警告を確認する (vitest-browser-preact の `preact: ^10.0.0`)
3. `pnpm check` で型チェック・lint を確認する
4. `pnpm test` / `pnpm test:ct` / `pnpm test:e2e` でテストを実行し、breaking changes の影響がないか確認する
5. `pnpm build` でビルドが成功することを確認する
6. 問題があればソースコードを修正する (現時点の調査では修正不要と予想される)
7. CHANGES.md を更新する (shiguredo-changelog スキル参照)

## テスト方針

- 既存のユニットテスト (`pnpm test`) / コンポーネントテスト (`pnpm test:ct`) / E2E テスト (`pnpm test:e2e`) がすべて成功すること
- 特に vitest-browser-preact を使用するコンポーネントテスト (src/components/ui/FormLabel.ct.tsx / src/components/DebugPane/DebugPane.ct.tsx / src/components/Header/SessionsButton.ct.tsx / src/components/Header/CopyUrlButton.ct.tsx) が Preact 11 で動作することを確認する
- コード変更が必要になった場合は、テストを先に修正する (CODEBASE.md 参照)

## リスクと対策

| リスク                                                                                   | 対策                                                                   |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| vitest-browser-preact 1.0.0 が Preact 11 非対応でコンポーネントテストが動かない          | Preact 11 対応版のリリースを待つ。その場合は本 issue を pending にする |
| preact-iso / @preact/signals の内部で Preact 11 の breaking changes に未対応の箇所がある | 最新版に更新して確認する。対応待ちの場合は pending にする              |
| 11.0.0-beta.2 と正式リリース (11.0.0) で挙動が変わる                                     | 正式リリース後に改めて更新する (別 issue または追従対応)               |
