import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { setFakeVolume } from '@/app/actions'
import { $fakeVolume, $mediaType } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const FakeVolumeForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFakeVolume(event.target.value)
  }
  if ($mediaType.value !== 'fakeMedia') {
    return null
  }
  return (
    <FormGroup className="form-inline" controlId="fakeVolume">
      <TooltipFormLabel kind="fakeVolume">fakeVolume:</TooltipFormLabel>
      <Form.Range min="0" max="1" step="0.25" value={$fakeVolume.value} onChange={onChange} />
    </FormGroup>
  )
}
