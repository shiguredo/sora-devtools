import type React from 'react'

import { setEnabledForwardingFilters, setForwardingFilters } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFiltersForm: React.FC = () => {
  const enabledForwardingFilters = useSoraDevtoolsStore((state) => state.enabledForwardingFilters)
  const forwardingFilters = useSoraDevtoolsStore((state) => state.forwardingFilters)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledForwardingFilters(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="forwardingFilters"
              checked={enabledForwardingFilters}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilters
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledForwardingFilters ? (
        <div className="form-row">
          <div>
            <JSONInputField
              controlId="forwardingFilters"
              placeholder="forwardingFiltersを指定"
              value={forwardingFilters}
              setValue={(value) => setForwardingFilters(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
