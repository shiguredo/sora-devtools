import type React from 'react'

import { $connectionStatus, $forceStereoOutput, setForceStereoOutput } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForceStereoOutputForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setForceStereoOutput(event.target.checked)
  }
  return (
    <div className="row form-row">
      <div className="col-auto">
        <div className="form-inline form-switch">
          <TooltipFormCheck
            kind="forceStereoOutput"
            checked={$forceStereoOutput.value}
            onChange={onChangeSwitch}
            disabled={disabled}
          >
            forceStereoOutput
          </TooltipFormCheck>
        </div>
      </div>
    </div>
  )
}
