import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSimulcastRid } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SIMULCAST_RID } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SimulcastRidForm: React.FC = () => {
  const simulcastRid = useSoraDevtoolsStore((state) => state.simulcastRid)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SIMULCAST_RID)) {
      setSimulcastRid(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="simulcastRid">
      <TooltipFormLabel kind="simulcastRid">simulcastRid:</TooltipFormLabel>
      <FormSelect name="simulcastRid" value={simulcastRid} onChange={onChange} disabled={disabled}>
        {SIMULCAST_RID.map((value) => {
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
