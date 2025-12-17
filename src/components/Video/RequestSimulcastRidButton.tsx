import type React from 'react'
import type { SimulcastRid } from 'sora-js-sdk'

import { $sora, $connectionStatus } from '@/app/store'
import { rpc } from '@/rpc'

type SimulcastRequestRid = 'none' | SimulcastRid

type Props = {
  rid: SimulcastRequestRid
  sendConnectionId?: string
}

export const RequestSimulcastRidButton: React.FC<Props> = (props) => {
  const onClick = async (): Promise<void> => {
    if (!$sora.value || $connectionStatus.value !== 'connected') {
      return
    }

    const params: {
      rid: SimulcastRequestRid
      sender_connection_id?: string
    } = {
      rid: props.rid,
    }
    if (props.sendConnectionId) {
      params.sender_connection_id = props.sendConnectionId
    }

    await rpc($sora.value, '2025.2.0/RequestSimulcastRid', params, {
      notification: false,
      showMethodAlert: true,
    })
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
