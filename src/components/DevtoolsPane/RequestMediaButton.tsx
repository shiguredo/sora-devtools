import type React from 'react'

import { requestMedia } from '@/app/actions'
import { $connectionStatus, $role, $sora } from '@/app/store'
import { isFormDisabled } from '@/utils'

export const RequestMediaButton: React.FC = () => {
  const onClick = (): void => {
    requestMedia()
  }
  const disabled =
    $role.value === 'recvonly' || $sora.value !== null || isFormDisabled($connectionStatus.value)
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
