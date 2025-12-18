import type { FunctionComponent } from 'preact'

import { setAudioInput, updateMediaStream } from '@/app/actions'
import { $audioInput, $audioInputDevices } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioInputForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    setAudioInput((event.target as HTMLSelectElement).value)
    updateMediaStream()
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioInput">audioInput:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
