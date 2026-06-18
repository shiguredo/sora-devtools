import type { ConnectionPublisher, ConnectionSubscriber } from "sora-js-sdk";

import { setRPCErrorAlertMessage, setRpcObject } from "@/app/actions";

interface RpcOptions {
  timeout?: number;
  notification?: boolean;
  showMethodAlert?: boolean;
}

const DEFAULT_RPC_OPTIONS: RpcOptions = { notification: true };

export async function rpc(
  conn: ConnectionPublisher | ConnectionSubscriber,
  method: string,
  params?: Record<string, unknown>,
  options: RpcOptions = DEFAULT_RPC_OPTIONS,
): Promise<void> {
  // Show alert if method is not in rpcMethods
  // sora-js-sdk のバージョン差で rpcMethods が undefined になり得るため型ガードする
  if (options.showMethodAlert) {
    const methods = (conn as { rpcMethods?: unknown }).rpcMethods;
    if (!Array.isArray(methods) || methods.length === 0) {
      setRPCErrorAlertMessage("rpc_methods in type: offer is empty");
    } else if (!methods.includes(method)) {
      setRPCErrorAlertMessage(`"${method}" is not in rpc_methods in type: offer`);
    }
  }

  const timestamp = Date.now();
  const startTime = performance.now();

  try {
    const result = await conn.rpc(method, params, options);
    const duration = performance.now() - startTime;

    setRpcObject({
      timestamp,
      method,
      params,
      options,
      result,
      duration,
    });
  } catch (error) {
    // クライアント側のエラー（Error インスタンス）はバルーンで通知
    if (error instanceof Error) {
      setRPCErrorAlertMessage(error.message);
      return;
    }
    // サーバーからの RPC エラー
    const duration = performance.now() - startTime;
    const rpcError = error as { code: number; message: string; data?: unknown };
    setRpcObject({
      timestamp,
      method,
      params,
      options,
      error: rpcError,
      duration,
    });
  }
}
