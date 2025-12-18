import type React from 'react'

import { setReconnect } from '@/app/actions'
import { $connectionStatus, $reconnect } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ReconnectForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setReconnect(event.target.checked)
  }
  return (
    <div className="row form-row">
      <div className="col-auto">
        <div className="form-inline form-switch">
          <TooltipFormCheck
            kind="reconnect"
            checked={$reconnect.value}
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
