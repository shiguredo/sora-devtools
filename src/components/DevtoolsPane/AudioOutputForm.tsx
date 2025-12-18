import type React from 'react'

import { setAudioOutput } from '@/app/actions'
import { $audioOutput, $audioOutputDevices } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioOutputForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setAudioOutput(event.target.value)
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioOutput">audioOutput:</TooltipFormLabel>
      <select
        className="form-select"
        name="audioOutput"
        value={$audioOutput.value}
        onChange={onChange}
        disabled={$audioOutputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {$audioOutputDevices.value.map((deviceInfo) => {
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
