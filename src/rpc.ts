import type { ConnectionPublisher, ConnectionSubscriber } from "sora-js-sdk";

import { setRPCErrorAlertMessage, setRpcObject } from "@/app/actions";
import type { RpcObject } from "@/types";
import { getErrorMessage } from "@/utils";

interface RpcOptions {
  timeout?: number;
  notification?: boolean;
  showMethodAlert?: boolean;
}

const DEFAULT_RPC_OPTIONS: RpcOptions = { notification: true };

/**
 * サーバーが返した JSON-RPC エラーかどうかを判定する
 *
 * sora-js-sdk の ConnectionBase.rpc は、サーバーが JSON-RPC の error を返した場合に
 * JSON-RPC エラーオブジェクト ({ code, message, data }) を Error の cause に設定して reject する。
 * つまり cause がオブジェクトであればサーバーが返したエラーであり、クライアント側のエラー
 * (DataChannel 未接続、リクエストタイムアウト、notification 送信失敗) は cause を持たない。
 */
function isServerError(
  error: unknown,
): error is Error & { cause: NonNullable<RpcObject["error"]> } {
  if (!(error instanceof Error)) {
    return false;
  }
  const { cause } = error;
  return typeof cause === "object" && cause !== null && !Array.isArray(cause);
}

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
    const duration = performance.now() - startTime;

    // サーバーが返したエラーは cause に JSON-RPC エラーの code / message / data が入るため
    // RPC Results に失敗したリクエストとエラーの内容を記録する
    if (isServerError(error)) {
      // サーバーが返したエラーでもアラートを表示する
      // Video ペインの Spotlight / Simulcast ボタンは RPC Results を参照しないため、
      // アラートを出さないとサーバーエラー時に無反応に見える
      setRPCErrorAlertMessage(error.message);
      setRpcObject({
        timestamp,
        method,
        params,
        options,
        error: error.cause,
        duration,
      });
      return;
    }

    // クライアント側のエラー（DataChannel 未接続、リクエストタイムアウト、notification 送信失敗）は
    // RPC Results には記録せずアラートのみで通知する
    setRPCErrorAlertMessage(getErrorMessage(error));
  }
}
