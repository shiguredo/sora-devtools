import type { ConnectionPublisher, ConnectionSubscriber } from 'sora-js-sdk'

import { setRpcObject } from '@/app/actions'

type RpcOptions = {
  timeout?: number
  notification?: boolean
}

export async function rpc(
  conn: ConnectionPublisher | ConnectionSubscriber,
  method: string,
  params?: Record<string, unknown>,
  options: RpcOptions = { notification: true },
): Promise<void> {
  const timestamp = Date.now()
  const startTime = performance.now()

  try {
    const result = await conn.rpc(method, params, options)
    const duration = performance.now() - startTime

    setRpcObject({
      timestamp,
      method,
      params,
      options,
      result,
      duration,
    })
  } catch (error) {
    const duration = performance.now() - startTime

    let errorCode = -1
    let errorMessage = 'Unknown error'
    let errorData: unknown

    if (error && typeof error === 'object') {
      if ('code' in error && typeof error.code === 'number') {
        errorCode = error.code
      }
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      if ('data' in error) {
        errorData = error.data
      }
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    const errorObj: { code: number; message: string; data?: unknown } = {
      code: errorCode,
      message: errorMessage,
    }
    if (errorData !== undefined) {
      errorObj.data = errorData
    }

    setRpcObject({
      timestamp,
      method,
      params,
      options,
      error: errorObj,
      duration,
    })
  }
}
