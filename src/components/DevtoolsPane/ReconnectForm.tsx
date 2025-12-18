import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setReconnect } from '@/app/actions'
import { $connectionStatus, $reconnect } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ReconnectForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setReconnect(event.currentTarget.checked)
  }
  return (
    <div className="row form-row">
      <div className="flex-none pr-4 pb-2">
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
