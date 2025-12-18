import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { $connectionStatus, $forceStereoOutput, setForceStereoOutput } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForceStereoOutputForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setForceStereoOutput(event.currentTarget.checked)
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
