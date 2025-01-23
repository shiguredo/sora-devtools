import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { useStore } from '@/app/store2'
import { BLUR_RADIUS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const BlurRadiusForm: React.FC = () => {
  const blurRadius = useStore((state) => state.blurRadius)
  const mediaType = useStore((state) => state.mediaType)
  const setBlurRadius = useStore((state) => state.setBlurRadius)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, BLUR_RADIUS)) {
      setBlurRadius(event.target.value)
    }
  }
  const disabled = mediaType !== 'getUserMedia'
  return (
    <FormGroup className="form-inline" controlId="blurRadius">
      <TooltipFormLabel kind="blurRadius">blurRadius:</TooltipFormLabel>
      <FormSelect value={blurRadius} onChange={onChange} disabled={disabled}>
        {BLUR_RADIUS.map((value) => {
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
