import type { FunctionComponent } from 'preact'

import { connectSora } from '@/app/actions'
import { $connectionStatus } from '@/app/store'

export const ConnectButton: FunctionComponent = () => {
  const connect = (): void => {
    connectSora()
  }
  return (
    <div className="flex-none mb-1">
      <input
        className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
