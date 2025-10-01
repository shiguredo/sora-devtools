import type React from 'react'

import { setAudioOutput } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioOutputForm: React.FC = () => {
  const audioOutput = useSoraDevtoolsStore((state) => state.audioOutput)
  const audioOutputDevices = useSoraDevtoolsStore((state) => state.audioOutputDevices)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setAudioOutput(event.target.value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="audioOutput">audioOutput:</TooltipFormLabel>
      <select
        name="audioOutput"
        value={audioOutput}
        onChange={onChange}
        disabled={audioOutputDevices.length === 0}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">未指定</option>
        {audioOutputDevices.map((deviceInfo) => {
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
