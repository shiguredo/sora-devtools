import type React from 'react'

import { setAudioInput, updateMediaStream } from '@/app/actions'
import { $audioInput, $audioInputDevices } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioInputForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setAudioInput(event.target.value)
    updateMediaStream()
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioInput">audioInput:</TooltipFormLabel>
      <select
        className="form-select"
        name="audioInput"
        value={$audioInput.value}
        onChange={onChange}
        disabled={$audioInputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {$audioInputDevices.value.map((deviceInfo) => {
          return (
            <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
              {deviceInfo.label}
            </option>
          )
        })}
      </select>
    </div>
  )
}
