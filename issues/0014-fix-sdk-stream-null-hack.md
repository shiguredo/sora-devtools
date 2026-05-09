# 0014 soraConnection.stream = null の SDK 内部状態直接改変を調査する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`src/app/actions.ts:1393` で、切断時の MediaStream 停止を防ぐために SDK の内部プロパティを直接 null に上書きしている。

```typescript
// disconnect 時に stream を止めないためのハック
soraConnection.stream = null;
```

## 問題点

- SDK の内部実装に依存しており、sora-js-sdk のバージョンアップで破綻する可能性がある
- コード中に `// ハック` と明記されていること自体が技術的負債であることを示している

## 修正方針

1. sora-js-sdk のソースコードまたは型定義を確認し、`stream` プロパティが public API か内部プロパティかを調査する
2. public API であれば利用を継続し、コメントから `ハック` の文言を削除する
3. 内部プロパティの場合:
   - sora-js-sdk の該当バージョンの disconnect 実装を確認し、`stream` へのアクセスが実際に必要か検証する
   - 必要なければ `soraConnection.stream = null` の行を削除する
   - 必要であれば、disconnect 前に `MediaStream` の参照を退避し、disconnect 後に再設定する方式に変更する:
     ```typescript
     const savedStream = soraConnection.stream;
     await soraValue.disconnect();
     // ... クリーンアップ ...
     // 再接続時などに savedStream を利用
     ```
4. sora-js-sdk 側に「disconnect 時に stream を自動停止しない」オプションの追加を提案する（上流 issue の起票）

## 調査手順

- `node_modules/sora-js-sdk/` 内の型定義ファイル（`.d.ts`）で `stream` プロパティの有無と可視性を確認する
- 同ディレクトリ内の disconnect 実装を grep し、`stream` への操作（`stream.getTracks()` や `track.stop()` 等）の有無を確認する

## テスト戦略

- ハック解除後、通常の connect → disconnect サイクルでエラーが発生しないこと
- 再接続シナリオで stream が正しく引き継がれること
