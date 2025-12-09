import type React from 'react'

import { useSoraDevtoolsStore } from '@/app/store'
import { rpc } from '@/rpc'

type Props = {
  sendConnectionId: string
}
export const ResetSpotlightRidBySendConnectionIdButton: React.FC<Props> = (props) => {
  const conn = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)

  const onClick = async (): Promise<void> => {
    if (!conn || connectionStatus !== 'connected') {
      return
    }

    await rpc(
      conn,
      '2025.2.0/ResetSpotlightRid',
      {
        send_connection_id: props.sendConnectionId,
      },
      { notification: false, showMethodAlert: true },
    )
  }

  return (
    <input
      className="btn btn-secondary mx-1"
      type="button"
      name="resetSpotlightRid"
      defaultValue="resetSpotlightRid"
      onClick={onClick}
    />
  )
}
