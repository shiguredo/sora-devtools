import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { setDisplayResolution } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { TooltipFormLabel } from './TooltipFormLabel'

type DisplayResolutionData = {
  label: string
  value: string
}

const DISPLAY_RESOLUTION_DATA_LIST = Array<DisplayResolutionData>(
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

export const DisplayResolutionForm: React.FC = () => {
  const displayResolution = useAppSelector((state) => state.displayResolution)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDisplayResolution(event.target.value))
  }
  return (
    <FormGroup className="form-inline" controlId="displayResolution">
      <TooltipFormLabel kind="displayResolution">displayResolution:</TooltipFormLabel>
      <Form.Control
        type="text"
        value={displayResolution}
        onChange={onChange}
        list="displayResolutionDataList"
      />
      <datalist id="displayResolutionDataList">
        {DISPLAY_RESOLUTION_DATA_LIST.map((v) => {
          return <option key={v.label} value={v.value} label={v.label} />
        })}
      </datalist>
    </FormGroup>
  )
}
