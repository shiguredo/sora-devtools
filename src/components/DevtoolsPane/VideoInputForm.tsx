import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setVideoInput, updateMediaStream } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoInputForm: React.FC = () => {
  const videoInput = useAppSelector((state) => state.videoInput)
  const videoInputDevices = useAppSelector((state) => state.videoInputDevices)
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setVideoInput(event.target.value)
    updateMediaStream()
  }
  return (
    <FormGroup className="form-inline" controlId="videoInput">
      <TooltipFormLabel kind="videoInput">videoInput:</TooltipFormLabel>
      <FormSelect
        name="videoInput"
        value={videoInput}
        onChange={onChange}
        disabled={videoInputDevices.length === 0}
      >
        <option value="">未指定</option>
        {videoInputDevices.map((deviceInfo) => {
          return (
            <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
              {deviceInfo.label}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}
