import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSimulcastRidAuto } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SIMULCAST_RID_AUTO } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SimulcastRidAutoForm: React.FC = () => {
  const simulcastRidAuto = useSoraDevtoolsStore((state) => state.simulcastRidAuto)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SIMULCAST_RID_AUTO)) {
      setSimulcastRidAuto(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="simulcastRidAuto">
      <TooltipFormLabel kind="simulcastRidAuto">simulcastRidAuto:</TooltipFormLabel>
      <FormSelect
        name="simulcastRidAuto"
        value={simulcastRidAuto}
        onChange={onChange}
        disabled={disabled}
      >
        {SIMULCAST_RID_AUTO.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}
