import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { updateMediaStream } from '@/app/actions'
import { useAppDispatch } from '@/app/hooks'
import { useStore } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoInputForm: React.FC = () => {
  const videoInput = useStore((state) => state.videoInput)
  const videoInputDevices = useStore((state) => state.videoInputDevices)
  const setVideoInput = useStore((state) => state.setVideoInput)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setVideoInput(event.target.value)
    dispatch(updateMediaStream())
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
