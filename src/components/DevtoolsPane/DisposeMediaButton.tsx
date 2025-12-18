import type { FunctionComponent } from 'preact'

import { disposeMedia } from '@/app/actions'
import { $connectionStatus, $role, $sora } from '@/app/store'
import { isFormDisabled } from '@/utils'

export const DisposeMediaButton: FunctionComponent = () => {
  const onClick = (): void => {
    disposeMedia()
  }
  const disabled =
    $role.value === 'recvonly' || $sora.value !== null || isFormDisabled($connectionStatus.value)
  return (
    <div className="flex-none mb-1">
      <input
        className="px-4 py-2 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        name="media_access"
        defaultValue="dispose media"
        onClick={onClick}
        disabled={disabled}
      />
    </div>
  )
}
