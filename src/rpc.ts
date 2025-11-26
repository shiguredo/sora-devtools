import type { ConnectionPublisher, ConnectionSubscriber } from 'sora-js-sdk'

import { setRpcObject } from '@/app/actions'

type RpcOptions = {
  notification?: boolean
}

export async function rpc(
  conn: ConnectionPublisher | ConnectionSubscriber,
  method: string,
  params?: Record<string, unknown>,
  options: RpcOptions = { notification: true },
): Promise<void> {
  const timestamp = Date.now()

  await conn.rpc(method, params, options)

  setRpcObject({
    timestamp,
    method,
    params,
    options,
  })
}
