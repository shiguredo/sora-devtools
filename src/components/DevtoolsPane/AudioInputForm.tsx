import type React from 'react'

import { setAudioInput, updateMediaStream } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioInputForm: React.FC = () => {
  const audioInput = useSoraDevtoolsStore((state) => state.audioInput)
  const audioInputDevices = useSoraDevtoolsStore((state) => state.audioInputDevices)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setAudioInput(event.target.value)
    updateMediaStream()
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="audioInput">audioInput:</TooltipFormLabel>
      <select
        name="audioInput"
        value={audioInput}
        onChange={onChange}
        disabled={audioInputDevices.length === 0}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">未指定</option>
        {audioInputDevices.map((deviceInfo) => {
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
