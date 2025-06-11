import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setAspectRatio } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { ASPECT_RATIO_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AspectRatioForm: React.FC = () => {
  const aspectRatio = useSoraDevtoolsStore((state) => state.aspectRatio)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ASPECT_RATIO_TYPES)) {
      setAspectRatio(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="aspectRatio">
      <TooltipFormLabel kind="aspectRatio">aspectRatio:</TooltipFormLabel>
      <FormSelect name="aspectRatio" value={aspectRatio} onChange={onChange}>
        {ASPECT_RATIO_TYPES.map((value) => {
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
