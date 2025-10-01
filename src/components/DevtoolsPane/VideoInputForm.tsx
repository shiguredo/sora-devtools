import type React from 'react'

import { setVideoInput, updateMediaStream } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoInputForm: React.FC = () => {
  const videoInput = useSoraDevtoolsStore((state) => state.videoInput)
  const videoInputDevices = useSoraDevtoolsStore((state) => state.videoInputDevices)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setVideoInput(event.target.value)
    updateMediaStream()
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="videoInput">videoInput:</TooltipFormLabel>
      <select
        name="videoInput"
        value={videoInput}
        onChange={onChange}
        disabled={videoInputDevices.length === 0}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">未指定</option>
        {videoInputDevices.map((deviceInfo) => {
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
