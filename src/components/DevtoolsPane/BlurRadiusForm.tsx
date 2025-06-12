import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setBlurRadius } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { BLUR_RADIUS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const BlurRadiusForm: React.FC = () => {
  const blurRadius = useSoraDevtoolsStore((state) => state.blurRadius)
  const mediaType = useSoraDevtoolsStore((state) => state.mediaType)
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
