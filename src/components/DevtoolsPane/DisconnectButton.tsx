import type React from 'react'

import { disconnectSora } from '@/app/actions'
import { $connectionStatus } from '@/app/store'

export const DisconnectButton: React.FC = () => {
  const disconnect = (): void => {
    disconnectSora()
  }
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="disconnect"
        defaultValue="disconnect"
        onClick={disconnect}
        disabled={
          $connectionStatus.value === 'disconnecting' ||
          $connectionStatus.value === 'connecting' ||
          $connectionStatus.value === 'initializing'
        }
      />
    </div>
  )
}
