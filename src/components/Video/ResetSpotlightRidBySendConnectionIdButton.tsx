import type React from 'react'

import { $sora, $connectionStatus } from '@/app/store'
import { rpc } from '@/rpc'

type Props = {
  sendConnectionId: string
}
export const ResetSpotlightRidBySendConnectionIdButton: React.FC<Props> = (props) => {
  const onClick = async (): Promise<void> => {
    if (!$sora.value || $connectionStatus.value !== 'connected') {
      return
    }

    await rpc(
      $sora.value,
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
