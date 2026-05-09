# 0011 rpc.ts の conn.rpcMethods への型安全でないアクセスを修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`rpc.ts:21-23` で `conn.rpcMethods.length` および `conn.rpcMethods.includes(method)` を参照しているが、`ConnectionPublisher | ConnectionSubscriber` 型に `rpcMethods` プロパティが定義されているか型安全でない。`sora-js-sdk` の型定義次第ではランタイムエラーになる可能性がある。

```typescript
if (conn.rpcMethods.length === 0) {
  setRPCErrorAlertMessage("rpc_methods in type: offer is empty");
} else if (!conn.rpcMethods.includes(method)) {
  setRPCErrorAlertMessage(`"${method}" is not in rpc_methods in type: offer`);
}
```

## 再現手順

1. `rpcMethods` プロパティを持たない sora-js-sdk のバージョンを使用する
2. `showMethodAlert: true` で RPC を呼び出す
3. `rpcMethods` が `undefined` のため `.length` アクセスでエラーになる

## 期待される動作

`rpcMethods` が存在しない場合も安全に処理される（`options.showMethodAlert` が無視される等）。

## 修正方針

- `Array.isArray(conn.rpcMethods)` でガードする
- または `(conn as Record<string, unknown>).rpcMethods` として安全にアクセスする
- エラーメッセージは小文字始まりに修正する（#0012 と合わせて対応）
