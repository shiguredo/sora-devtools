import type React from 'react'
import type { SimulcastRid } from 'sora-js-sdk'

import { setRpcObject } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

type SimulcastRequestRid = 'none' | SimulcastRid

type Props = {
  rid: SimulcastRequestRid
  sendConnectionId?: string
}

export const RequestSimulcastRidButton: React.FC<Props> = (props) => {
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)

  const onClick = async (): Promise<void> => {
    if (!sora || connectionStatus !== 'connected') {
      return
    }

    const method = '2025.2.0/RequestSimulcastRid'
    const params: {
      rid: SimulcastRequestRid
      send_connection_id?: string
    } = {
      rid: props.rid,
    }
    if (props.sendConnectionId) {
      params.send_connection_id = props.sendConnectionId
    }

    const timestamp = Date.now()
    const startTime = performance.now()

    try {
      const result = await sora.rpc(method, params)
      const endTime = performance.now()
      const duration = endTime - startTime
      setRpcObject({
        timestamp,
        method,
        params,
        result,
        duration,
      })
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      let errorCode = -1
      let errorMessage = 'Unknown error'

      if (error && typeof error === 'object') {
        if ('code' in error && typeof error.code === 'number') {
          errorCode = error.code
        }
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if (error instanceof Error) {
          errorMessage = error.message
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      setRpcObject({
        timestamp,
        method,
        params,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        duration,
      })
    }
  }

  return (
    <input
      className="btn btn-secondary btn-sm mx-1"
      type="button"
      name={`requestSimulcastRidTo${props.rid.charAt(0).toUpperCase() + props.rid.slice(1)}`}
      defaultValue={props.rid}
      onClick={onClick}
    />
  )
}
