import type React from 'react'

import { setRole } from '@/app/actions'
import { $role, $connectionStatus, $localMediaStream } from '@/app/store'
import { ROLES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const RoleForm: React.FC = () => {
  const disabled = $localMediaStream.value !== null || isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ROLES)) {
      setRole(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="role">role:</TooltipFormLabel>
      <select
        className="form-select"
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
