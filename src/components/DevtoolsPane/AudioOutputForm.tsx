import type { FunctionComponent } from 'preact'

import { setAudioOutput } from '@/app/actions'
import { $audioOutput, $audioOutputDevices } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioOutputForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    setAudioOutput((event.target as HTMLSelectElement).value)
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioOutput">audioOutput:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
