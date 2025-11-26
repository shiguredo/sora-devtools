import type React from 'react'

import { useSoraDevtoolsStore } from '@/app/store'
import { rpc } from '@/rpc'

export const ResetSpotlightRidButton: React.FC = () => {
  const conn = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)

  const onClick = async (): Promise<void> => {
    if (!conn || connectionStatus !== 'connected') {
      return
    }

    await rpc(conn, '2025.2.0/ResetSpotlightRid', {}, { notification: false })
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
