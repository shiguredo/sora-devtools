import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setRole } from '@/app/actions'
import { $connectionStatus, $localMediaStream, $role } from '@/app/store'
import { ROLES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const RoleForm: FunctionComponent = () => {
  const disabled = $localMediaStream.value !== null || isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, ROLES)) {
      setRole(event.currentTarget.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="role">role:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        name="role"
        value={$role.value}
        onChange={onChange}
        disabled={disabled}
      >
        {ROLES.map((value) => {
          return (
            <option key={value} value={value}>
              {value}
            </option>
          )
        })}
      </select>
    </div>
  )
}
