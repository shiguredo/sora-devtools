import type React from 'react'

import { setClientId, setEnabledClientId } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ClientIdForm: React.FC = () => {
  const enabledClientId = useSoraDevtoolsStore((state) => state.enabledClientId)
  const clientId = useSoraDevtoolsStore((state) => state.clientId)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledClientId(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setClientId(event.target.value)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="clientId"
              checked={enabledClientId}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              clientId
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledClientId ? (
        <div className="form-row">
          <div>
            <div className="flex items-center">
              <input
                className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed w-500"
                type="text"
                placeholder="ClientIdを指定"
                value={clientId}
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
