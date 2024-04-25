import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { setResolution } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useRef } from 'react'
import { TooltipFormLabel } from './TooltipFormLabel'

type ResolutionData = {
  label: string
  value: string
}

const RESOLUTION_DATA_LIST = Array<ResolutionData>(
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

export const ResolutionForm: React.FC = () => {
  const textInputRef = useRef<HTMLInputElement>(null)
  const resolution = useAppSelector((state) => state.resolution)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setResolution(event.target.value))
  }
  const onClearClick = () => {
    dispatch(setResolution(''))
    if (textInputRef.current !== null) {
      textInputRef.current.value = ''
      textInputRef.current.focus()
      textInputRef.current.showPicker()
    }
  }
  return (
    <FormGroup className="form-inline" controlId="resolution">
      <TooltipFormLabel kind="resolution">resolution:</TooltipFormLabel>
      <Form.Control
        className="form-resolution"
        type="text"
        value={resolution}
        onChange={onChange}
        list="resolutionData"
        placeholder="未指定"
        ref={textInputRef}
      />
      <datalist id="resolutionData">
        {RESOLUTION_DATA_LIST.map((v) => {
          return <option key={v.label} value={v.value} label={v.label} />
        })}
      </datalist>
      <button type="button" className="btn btn-secondary" onClick={onClearClick}>
        Clear
      </button>
    </FormGroup>
  )
}
