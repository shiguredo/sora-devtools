import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setBundleId, setEnabledBundleId } from '@/app/actions'
import { $bundleId, $connectionStatus, $enabledBundleId } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const BundleIdForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledBundleId(event.currentTarget.checked)
  }
  const onChangeText = (event: TargetedEvent<HTMLInputElement>): void => {
    setBundleId(event.currentTarget.value)
  }
  return (
    <>
      <div className="row form-row">
        <div className="flex-none pr-4 pb-2">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="bundleId"
              checked={$enabledBundleId.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              bundleId
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledBundleId.value ? (
        <div className="row form-row">
          <div className="flex-none pr-4 pb-2">
            <div className="form-inline form-switch">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed flex-fill w-500"
                type="text"
                placeholder="bundleIdを指定"
                value={$bundleId.value}
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
