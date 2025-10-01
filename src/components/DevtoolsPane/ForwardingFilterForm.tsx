import type React from 'react'

import { setEnabledForwardingFilter, setForwardingFilter } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFilterForm: React.FC = () => {
  const enabledForwardingFilter = useSoraDevtoolsStore((state) => state.enabledForwardingFilter)
  const forwardingFilter = useSoraDevtoolsStore((state) => state.forwardingFilter)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledForwardingFilter(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="forwardingFilter"
              checked={enabledForwardingFilter}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilter
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledForwardingFilter ? (
        <div className="form-row">
          <div>
            <JSONInputField
              controlId="forwardingFilter"
              placeholder="forwardingFilterを指定"
              value={forwardingFilter}
              setValue={(value) => setForwardingFilter(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
