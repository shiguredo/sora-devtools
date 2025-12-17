import type React from 'react'

import { disposeMedia } from '@/app/actions'
import { $connectionStatus, $role, $sora } from '@/app/store'
import { isFormDisabled } from '@/utils'

export const DisposeMediaButton: React.FC = () => {
  const onClick = (): void => {
    disposeMedia()
  }
  const disabled =
    $role.value === 'recvonly' || $sora.value !== null || isFormDisabled($connectionStatus.value)
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
