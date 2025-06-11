import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

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
    <FormGroup className="form-inline" controlId="role">
      <TooltipFormLabel kind="role">role:</TooltipFormLabel>
      <FormSelect name="role" value={role} onChange={onChange} disabled={disabled}>
        {ROLES.map((value) => {
          return (
            <option key={value} value={value}>
              {value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}
