import type React from 'react'

import { setBundleId, setEnabledBundleId } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const BundleIdForm: React.FC = () => {
  const enabledBundleId = useSoraDevtoolsStore((state) => state.enabledBundleId)
  const bundleId = useSoraDevtoolsStore((state) => state.bundleId)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledBundleId(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setBundleId(event.target.value)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="bundleId"
              checked={enabledBundleId}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              bundleId
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledBundleId ? (
        <div className="form-row">
          <div>
            <div className="flex items-center">
              <input
                className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed w-500"
                type="text"
                placeholder="bundleIdを指定"
                value={bundleId}
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
