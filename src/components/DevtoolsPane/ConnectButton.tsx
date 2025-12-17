import type React from 'react'

import { connectSora } from '@/app/actions'
import { $connectionStatus } from '@/app/store'

export const ConnectButton: React.FC = () => {
  const connect = (): void => {
    connectSora()
  }
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="connect"
        defaultValue="connect"
        onClick={connect}
        disabled={
          $connectionStatus.value === 'disconnecting' ||
          $connectionStatus.value === 'connecting' ||
          $connectionStatus.value === 'initializing'
        }
      />
    </div>
  )
}
