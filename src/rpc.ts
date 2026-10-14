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
 * sora-js-sdk 2026.2.0-canary.0 の ConnectionBase.rpc は、サーバーが JSON-RPC の error を
 * 返した場合に JSONRPCErrorResponse["error"] ({ code, message, data }) を cause に設定して
 * reject する (rpc() の TSDoc)。cause が設定されていればサーバーが返したエラーと判別できる。
 * SDK 側の契約が変わった場合は本判定も見直すこと。
 *
 * これは片方向の契約である。SDK の TSDoc どおり、cause が無いことがクライアント側のエラーを
 * 意味するわけではない。サーバーがオブジェクト以外の error を返した場合は cause が付かず、
 * アラートのみで RPC Results には記録されない。
 *
 * 配列は JSON-RPC の error としては非準拠なため、表示に使う RpcObject の error の型に
 * 合わせて除外する。code / message の型までは検証しない (非準拠な応答でも詳細を捨てないため)。
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
    // サーバーが返したエラーは cause に JSON-RPC エラーが入るため、RPC Results に記録する
    if (isServerError(error)) {
      const duration = performance.now() - startTime;

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

    // cause を持たないエラーは RPC Results には記録せずアラートのみで通知する
    // クライアント側のエラー (RPC DataChannel 未接続、リクエストタイムアウト、
    // notification 送信失敗) のほか、オブジェクト以外の error を返したサーバーエラーも含む
    setRPCErrorAlertMessage(getErrorMessage(error));
  }
}
