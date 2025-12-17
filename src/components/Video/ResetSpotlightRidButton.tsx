import type React from 'react'

import { $sora, $connectionStatus } from '@/app/store'
import { rpc } from '@/rpc'

export const ResetSpotlightRidButton: React.FC = () => {
  const onClick = async (): Promise<void> => {
    if (!$sora.value || $connectionStatus.value !== 'connected') {
      return
    }

    await rpc(
      $sora.value,
      '2025.2.0/ResetSpotlightRid',
      {},
      { notification: false, showMethodAlert: true },
    )
  }

  return (
    <div className="mx-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="resetAllSpotlightRid"
        defaultValue="resetSpotlightRid"
        onClick={onClick}
      />
    </div>
  )
}
