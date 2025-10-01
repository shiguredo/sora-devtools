import type React from 'react'

import { requestMedia } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

export const RequestMediaButton: React.FC = () => {
  const onClick = (): void => {
    requestMedia()
  }
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const role = useSoraDevtoolsStore((state) => state.role)
  const disabled = role === 'recvonly' || sora !== null || isFormDisabled(connectionStatus)
  return (
    <div className="w-auto mb-1">
      <button
        className="inline-block px-3 py-1.5 text-base font-normal text-center text-gray-custom-600 align-middle cursor-pointer select-none bg-transparent border border-gray-custom-600 rounded transition-all hover:bg-gray-custom-600 hover:text-white disabled:opacity-65 disabled:pointer-events-none"
        type="button"
        name="media_access"
        onClick={onClick}
        disabled={disabled}
      >
        request media
      </button>
    </div>
  )
}
