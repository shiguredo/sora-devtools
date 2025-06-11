import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { setFakeVolume } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const FakeVolumeForm: React.FC = () => {
  const mediaType = useSoraDevtoolsStore((state) => state.mediaType)
  const fakeVolume = useSoraDevtoolsStore((state) => state.fakeVolume)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFakeVolume(event.target.value)
  }
  if (mediaType !== 'fakeMedia') {
    return null
  }
  return (
    <FormGroup className="form-inline" controlId="fakeVolume">
      <TooltipFormLabel kind="fakeVolume">fakeVolume:</TooltipFormLabel>
      <Form.Range min="0" max="1" step="0.25" value={fakeVolume} onChange={onChange} />
    </FormGroup>
  )
}
