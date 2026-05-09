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

- sora-js-sdk に disconnect 時も stream を保持する正式なオプションや API が存在するか調査する
- 存在しない場合は sora-js-sdk に機能追加を依頼する issue を起票する
- 短期的には、このハックに依存せずに stream を再生成する方式に変更する
