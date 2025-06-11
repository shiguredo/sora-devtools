import type React from 'react'

import { requestMedia } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

export const RequestMediaButton: React.FC = () => {
    const onClick = (): void => {
    requestMedia()
  }
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const sora = useAppSelector((state) => state.soraContents.sora)
  const role = useAppSelector((state) => state.role)
  const disabled = role === 'recvonly' || sora !== null || isFormDisabled(connectionStatus)
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-outline-secondary"
        type="button"
        name="media_access"
        defaultValue="request media"
        onClick={onClick}
        disabled={disabled}
      />
    </div>
  )
}
