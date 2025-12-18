import type React from 'react'

import { setEnabledForwardingFilter, setForwardingFilter } from '@/app/actions'
import { $connectionStatus, $enabledForwardingFilter, $forwardingFilter } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFilterForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledForwardingFilter(event.target.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline">
            <TooltipFormCheck
              kind="forwardingFilter"
              checked={$enabledForwardingFilter.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilter
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledForwardingFilter.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="forwardingFilter"
              placeholder="forwardingFilterを指定"
              value={$forwardingFilter.value}
              setValue={(value) => setForwardingFilter(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
