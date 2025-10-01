import type React from 'react'

import { setDisplayResolution } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

type DisplayResolutionData = {
  label: string
  value: string
}

const DISPLAY_RESOLUTION_DATA_LIST = [
  { label: '未指定', value: '' },
  { label: '144p', value: '256x144' },
  { label: '240p', value: '320x240' },
  { label: '360p', value: '640x360' },
  { label: '480p', value: '720x480' },
  { label: '540p', value: '960x540' },
  { label: '720p', value: '1280x720' },
  { label: '1080p', value: '1920x1080' },
  { label: '1440p', value: '2560x1440' },
  { label: '2160p', value: '3840x2160' },
]

export const DisplayResolutionForm: React.FC = () => {
  const displayResolution = useSoraDevtoolsStore((state) => state.displayResolution)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDisplayResolution(event.target.value)
  }
  const onTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setDisplayResolution(event.target.value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="displayResolution">displayResolution:</TooltipFormLabel>
      <select
        onChange={onTemplateChange}
        value=""
        className="form-template-select px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed form-display-resolution"
      >
        <option value="">未指定</option>
        {DISPLAY_RESOLUTION_DATA_LIST.map(({ label, value }) => {
          return (
            <option key={value} value={value}>
              {label} {value !== '' && `(${value})`}
            </option>
          )
        })}
      </select>
    </div>
  )
}
