import type { FunctionComponent } from 'preact'

import { setVideoInput, updateMediaStream } from '@/app/actions'
import { $videoInput, $videoInputDevices } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoInputForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    setVideoInput((event.target as HTMLSelectElement).value)
    updateMediaStream()
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="videoInput">videoInput:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
