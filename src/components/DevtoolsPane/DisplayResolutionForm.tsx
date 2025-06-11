import type React from 'react'
import { Dropdown, DropdownButton, Form, FormGroup, InputGroup } from 'react-bootstrap'

import { setDisplayResolution } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

type DisplayResolutionData = {
  label: string
  value: string
}

const DISPLAY_RESOLUTION_DATA_LIST = new Array(
  { label: '未指定', value: '' },
  { label: '144p', value: '256x144' },
  { label: '240p', value: '320x240' },
  { label: '360p', value: '640x360' },
  { label: '480p', value: '720x480' },
  { label: '540p', value: '960x540' },
  { label: '720p', value: '1280x720' },
  { label: '1080p', value: '1920x1080' },
  { label: '1440p', value: '2560x1440' },
  { label: '2160p', value: '3840x2160' },
)

const DropdownItem = ({ label, value }: DisplayResolutionData) => {
    return (
    <Dropdown.Item as="button" onClick={() => setDisplayResolution(value)}>
      {label} {value !== '' && `(${value})`}
    </Dropdown.Item>
  )
}

export const DisplayResolutionForm: React.FC = () => {
  const displayResolution = useAppSelector((state) => state.displayResolution)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDisplayResolution(event.target.value)
  }
  return (
    <FormGroup className="form-inline" controlId="displayResolution">
      <TooltipFormLabel kind="displayResolution">displayResolution:</TooltipFormLabel>
      <InputGroup>
        <Form.Control
          className="form-display-resolution"
          type="text"
          value={displayResolution}
          onChange={onChange}
          placeholder="未指定"
        />
        <DropdownButton variant="outline-secondary form-template-dropdown" title="" align="end">
          {DISPLAY_RESOLUTION_DATA_LIST.map(({ label, value }) => {
            return <DropdownItem key={value} label={label} value={value} />
          })}
        </DropdownButton>
      </InputGroup>
    </FormGroup>
  )
}
