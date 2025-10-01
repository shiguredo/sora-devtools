import type React from 'react'

import { setReconnect } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ReconnectForm: React.FC = () => {
  const reconnect = useSoraDevtoolsStore((state) => state.reconnect)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setReconnect(event.target.checked)
  }
  return (
    <div className="form-row">
      <div>
        <div className="flex items-center">
          <TooltipFormCheck
            kind="reconnect"
            checked={reconnect}
            onChange={onChange}
            disabled={disabled}
          >
            reconnect
          </TooltipFormCheck>
        </div>
      </div>
    </div>
  )
}
