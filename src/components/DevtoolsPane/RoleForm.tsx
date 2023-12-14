import React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setRole } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ROLES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel'

export const RoleForm: React.FC = () => {
  const role = useAppSelector((state) => state.role)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const localMediaStream = useAppSelector((state) => state.soraContents.localMediaStream)
  const disabled = localMediaStream !== null || isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ROLES)) {
      dispatch(setRole(event.target.value))
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
