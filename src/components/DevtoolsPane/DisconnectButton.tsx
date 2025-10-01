import type React from 'react'

import { disconnectSora } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const DisconnectButton: React.FC = () => {
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disconnect = (): void => {
    disconnectSora()
  }
  return (
    <div className="w-auto mb-1 mr-3">
      <button
        className="inline-block px-3 py-1.5 text-base font-normal text-center text-white align-middle cursor-pointer select-none bg-gray-custom-600 border border-gray-custom-600 rounded transition-colors hover:bg-gray-custom-700 hover:border-gray-custom-700 disabled:opacity-65 disabled:pointer-events-none"
        type="button"
        name="disconnect"
        onClick={disconnect}
        disabled={
          connectionStatus === 'disconnecting' ||
          connectionStatus === 'connecting' ||
          connectionStatus === 'initializing'
        }
      >
        disconnect
      </button>
    </div>
  )
}
