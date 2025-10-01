import type React from 'react'

import { connectSora } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const ConnectButton: React.FC = () => {
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const connect = (): void => {
    connectSora()
  }
  return (
    <div className="w-auto mb-1">
      <button
        className="inline-block px-3 py-1.5 text-base font-normal text-center text-white align-middle cursor-pointer select-none bg-gray-custom-600 border border-gray-custom-600 rounded transition-colors hover:bg-gray-custom-700 hover:border-gray-custom-700 disabled:opacity-65 disabled:pointer-events-none"
        type="button"
        name="connect"
        onClick={connect}
        disabled={
          connectionStatus === 'disconnecting' ||
          connectionStatus === 'connecting' ||
          connectionStatus === 'initializing'
        }
      >
        connect
      </button>
    </div>
  )
}
