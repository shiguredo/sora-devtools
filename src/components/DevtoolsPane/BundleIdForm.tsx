import type React from 'react'

import { setBundleId, setEnabledBundleId } from '@/app/actions'
import { $bundleId, $connectionStatus, $enabledBundleId } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const BundleIdForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledBundleId(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setBundleId(event.target.value)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
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
          <div className="col-auto">
            <div className="form-inline form-switch">
              <input
                className="form-control flex-fill w-500"
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
