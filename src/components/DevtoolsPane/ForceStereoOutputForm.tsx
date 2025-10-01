import type React from 'react'

import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForceStereoOutputForm: React.FC = () => {
  const forceStereoOutput = useSoraDevtoolsStore((state) => state.forceStereoOutput)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    useSoraDevtoolsStore.getState().setForceStereoOutput(event.target.checked)
  }
  return (
    <div className="form-row">
      <div>
        <div className="flex items-center">
          <TooltipFormCheck
            kind="forceStereoOutput"
            checked={forceStereoOutput}
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
