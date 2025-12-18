import type React from 'react'

import { setVideoInput, updateMediaStream } from '@/app/actions'
import { $videoInput, $videoInputDevices } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoInputForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setVideoInput(event.target.value)
    updateMediaStream()
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="videoInput">videoInput:</TooltipFormLabel>
      <select
        className="form-select"
        name="videoInput"
        value={$videoInput.value}
        onChange={onChange}
        disabled={$videoInputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {$videoInputDevices.value.map((deviceInfo) => {
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
