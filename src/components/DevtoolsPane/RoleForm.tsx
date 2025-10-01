import type React from 'react'

import { setRole } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { ROLES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const RoleForm: React.FC = () => {
  const role = useSoraDevtoolsStore((state) => state.role)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const localMediaStream = useSoraDevtoolsStore((state) => state.soraContents.localMediaStream)
  const disabled = localMediaStream !== null || isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ROLES)) {
      setRole(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="role">role:</TooltipFormLabel>
      <select name="role" value={role} onChange={onChange} disabled={disabled} className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
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
