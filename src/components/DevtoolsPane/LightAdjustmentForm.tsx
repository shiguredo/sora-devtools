import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setLightAdjustment } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'
import { LIGHT_ADJUSTMENT } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const LightAdjustmentForm: React.FC = () => {
  const lightAdjustment = useAppSelector((state) => state.lightAdjustment)
  const mediaType = useAppSelector((state) => state.mediaType)
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, LIGHT_ADJUSTMENT)) {
      setLightAdjustment(event.target.value)
    }
  }
  const disabled = mediaType !== 'getUserMedia'
  return (
    <FormGroup className="form-inline" controlId="lightAdjustment">
      <TooltipFormLabel kind="lightAdjustment">lightAdjustment:</TooltipFormLabel>
      <FormSelect value={lightAdjustment} onChange={onChange} disabled={disabled}>
        {LIGHT_ADJUSTMENT.map((value) => {
          return (
            <option suppressHydrationWarning={true} key={value} value={value}>
              {value === '' || disabled ? '未指定' : value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}
