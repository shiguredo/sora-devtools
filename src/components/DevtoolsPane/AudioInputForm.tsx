import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { useStore } from '@/app/store2'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioInputForm: React.FC = () => {
  const audioInput = useStore((state) => state.audioInput)
  const audioInputDevices = useStore((state) => state.audioInputDevices)
  const setAudioInput = useStore((state) => state.setAudioInput)
  const updateMediaStream = useStore((state) => state.updateMediaStream)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setAudioInput(event.target.value)
    updateMediaStream()
  }
  return (
    <FormGroup className="form-inline" controlId="audioInput">
      <TooltipFormLabel kind="audioInput">audioInput:</TooltipFormLabel>
      <FormSelect
        name="audioInput"
        value={audioInput}
        onChange={onChange}
        disabled={audioInputDevices.length === 0}
      >
        <option value="">未指定</option>
        {audioInputDevices.map((deviceInfo) => {
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
