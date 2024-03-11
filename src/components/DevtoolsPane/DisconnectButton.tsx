import type React from 'react'

import { disconnectSora } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

export const DisconnectButton: React.FC = () => {
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const dispatch = useAppDispatch()
  const disconnect = (): void => {
    dispatch(disconnectSora())
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
          connectionStatus === 'disconnecting' ||
          connectionStatus === 'connecting' ||
          connectionStatus === 'initializing'
        }
      />
    </div>
  )
}
