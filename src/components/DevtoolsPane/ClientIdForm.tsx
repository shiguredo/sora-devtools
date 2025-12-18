import type React from 'react'

import { setClientId, setEnabledClientId } from '@/app/actions'
import { $clientId, $connectionStatus, $enabledClientId } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ClientIdForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledClientId(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setClientId(event.target.value)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="clientId"
              checked={$enabledClientId.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              clientId
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledClientId.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <div className="form-inline form-switch">
              <input
                className="form-control flex-fill w-500"
                type="text"
                placeholder="ClientIdを指定"
                value={$clientId.value}
                onChange={onChangeText}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
