import type React from 'react'

import { connectSora } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const ConnectButton: React.FC = () => {
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
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
          connectionStatus === 'disconnecting' ||
          connectionStatus === 'connecting' ||
          connectionStatus === 'initializing'
        }
      />
    </div>
  )
}
