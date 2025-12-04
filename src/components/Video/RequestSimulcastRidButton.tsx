import type React from 'react'
import type { SimulcastRid } from 'sora-js-sdk'

import { useSoraDevtoolsStore } from '@/app/store'
import { rpc } from '@/rpc'

type SimulcastRequestRid = 'none' | SimulcastRid

type Props = {
  rid: SimulcastRequestRid
  sendConnectionId?: string
}

export const RequestSimulcastRidButton: React.FC<Props> = (props) => {
  const conn = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)

  const onClick = async (): Promise<void> => {
    if (!conn || connectionStatus !== 'connected') {
      return
    }

    const params: {
      rid: SimulcastRequestRid
      send_connection_id?: string
    } = {
      rid: props.rid,
    }
    if (props.sendConnectionId) {
      params.send_connection_id = props.sendConnectionId
    }

    await rpc(conn, '2025.2.0/RequestSimulcastRid', params, {
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
