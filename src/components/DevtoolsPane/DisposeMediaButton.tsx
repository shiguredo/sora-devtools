import type React from 'react'

import { disposeMedia } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

export const DisposeMediaButton: React.FC = () => {
    const onClick = (): void => {
    disposeMedia()
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
        defaultValue="dispose media"
        onClick={onClick}
        disabled={disabled}
      />
    </div>
  )
}
